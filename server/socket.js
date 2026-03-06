const { Server } = require('socket.io');
const { addUser, removeUser, getUser, getUsers } = require('./users');

function setupSocket(server) {
    const io = new Server(server);

    // Handle socket connections
    io.on('connection', (socket) => {
        console.log(`New WebSocket connection: ${socket.id}`);

        // Handle user joining
        socket.on('join', (username, callback) => {
            const { error, user } = addUser({ id: socket.id, username });

            if (error) {
                if (callback) callback(error);
                return;
            }

            // Welcome message to the user
            socket.emit('systemMessage', {
                text: 'Welcome to the chat!',
                timestamp: new Date().toLocaleTimeString()
            });

            // Broadcast to everyone else that a new user joined
            socket.broadcast.emit('systemMessage', {
                text: `${user.username} joined the chat`,
                timestamp: new Date().toLocaleTimeString()
            });

            // Send updated users list to all clients
            io.emit('updateUsers', getUsers());

            if (callback) callback();
        });

        // Handle incoming chat messages
        socket.on('sendMessage', (messageText, callback) => {
            const user = getUser(socket.id);

            if (user) {
                const message = {
                    userId: user.id,
                    username: user.username,
                    message: messageText,
                    timestamp: new Date().toLocaleTimeString()
                };

                // Broadcast the message to all clients
                io.emit('receiveMessage', message);
            }

            if (callback) callback();
        });

        // Handle typing indicator
        socket.on('typing', () => {
            const user = getUser(socket.id);
            if (user) {
                socket.broadcast.emit('userTyping', {
                    username: user.username
                });
            }
        });

        // Handle user disconnect
        socket.on('disconnect', () => {
            const user = removeUser(socket.id);

            if (user) {
                // Broadcast that user has left
                io.emit('systemMessage', {
                    text: `${user.username} left the chat`,
                    timestamp: new Date().toLocaleTimeString()
                });

                // Send updated users list to all clients
                io.emit('updateUsers', getUsers());
            }
        });
    });
}

module.exports = setupSocket;
