const io = require('socket.io')(3000);

// Store users and rooms
const users = {};
const rooms = {};

// Handle user joining a room
io.on('connection', (socket) => {
    socket.on('join_room', (room, username) => {
        socket.join(room);
        users[socket.id] = username;
        rooms[room] = rooms[room] || [];
        rooms[room].push(socket.id);
        io.to(room).emit('user_online_status', `${username} has joined the room`);
    });

    // Handle message sending
    socket.on('send_message', (room, message) => {
        io.to(room).emit('receive_message', { message, user: users[socket.id] });
    });

    // Handle typing indicator
    socket.on('typing_indicator', (room) => {
        socket.to(room).emit('typing_indicator', users[socket.id]);
    });

    // Handle user disconnect
    socket.on('disconnect', () => {
        const username = users[socket.id];
        for (const room in rooms) {
            if (rooms[room].includes(socket.id)) {
                rooms[room] = rooms[room].filter(id => id !== socket.id);
                io.to(room).emit('user_online_status', `${username} has left the room`);
            }
        }
        delete users[socket.id];
    });
});

module.exports = io;