const path = require('path');
const http = require('http');
const express = require('express');
const socketIO = require('socket.io');

const { generateMessage, generateLocationMessage } = require('./utils/message.js');
const { isRealString } = require('./utils/validation.js');

const publicPath = path.join(__dirname, '../public');
const port = process.env.PORT || 3000;

const app = express();
const server = http.createServer(app);
const io = socketIO(server);
/*
    socket.emit will emit to a single connection.
    io.emit will emit to everyone's connection.
*/

app.use(express.static(publicPath));

io.on('connection', (socket) => {
    console.log(`New user connected`);

    socket.on(`join`, (params, callback) => {
        if (!isRealString(params.name) || !isRealString(params.room)) {
            callback(`Proper name and room name are required`);
        }

        socket.join(params.room);
        // socket.leave(params.room); how you leave a room.
        
        socket.emit(`newMessage`, generateMessage(`Admin`, `Welcome to the chat app!`));

        socket.broadcast.to(params.room).emit(`newMessage`, generateMessage(`Admin`, `${params.name} has joined the room!`));

        callback();
    });

    socket.on('createMessage', (message, callback) => {
        io.emit(`newMessage`, generateMessage(message.from, message.text));
        callback(`This is from the server.`);
    });

    socket.on(`createLocationMessage`, (coords) => {
        io.emit(`newLocationMessage`, generateLocationMessage(`Admin`, coords.latitude, coords.longitude));
    });

    socket.on('disconnect', () => {
        socket.broadcast.emit(`newMessage`, generateMessage(`Admin`, `A user has left the session!`));
    });
});

server.listen(port, () => {
    console.log(`Server is up on port ${port}`);
});
