const express = require('express');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');

// Store users in memory
const users = [];

// Predefined rooms
const rooms = ['General Chat', 'Web Development', 'Gaming', 'Friends'];

// Add a new user to the chat
function addUser({ id, username, room = null }) {
    // Clean the data
    username = username.trim();

    // Validate the data
    if (!username) {
        return { error: 'Username is required' };
    }

    // Check if username is already taken in the room
    const existingUser = users.find((user) => user.username === username && user.room === room);
    if (existingUser) {
        return { error: 'Username is already taken in this room' };
    }

    // Store user
    const user = { id, username, room };
    users.push(user);
    return { user };
}

// Update user's room
function updateUserRoom(id, room) {
    const user = users.find((user) => user.id === id);
    if (user) {
        user.room = room;
        return user;
    }
    return null;
}

// Remove a user by their socket ID
function removeUser(id) {
    const index = users.findIndex((user) => user.id === id);

    if (index !== -1) {
        return users.splice(index, 1)[0];
    }
}

// Get a specific user by their socket ID
function getUser(id) {
    return users.find((user) => user.id === id);
}

// Get all currently connected users in a room
function getUsersInRoom(room) {
    return users.filter((user) => user.room === room);
}

// Get room counts
function getRoomCounts() {
    return rooms.map(room => ({
        name: room,
        count: getUsersInRoom(room).length
    }));
}

// Create Express app
const app = express();

// Create HTTP server
const server = http.createServer(app);

// Serve static files from the public directory
const publicPath = path.join(__dirname, 'public');
app.use(express.static(publicPath));

// Initialize Socket.IO
const io = new Server(server);

// Handle socket connections
io.on('connection', (socket) => {
    console.log(`New WebSocket connection: ${socket.id}`);

    // Handle user joining with username
    socket.on('join', (username, callback) => {
        const { error, user } = addUser({ id: socket.id, username });

        if (error) {
            if (callback) callback(error);
            return;
        }

        // Send available rooms with counts
        socket.emit('roomInfo', getRoomCounts());

        // Auto-join General Chat
        socket.emit('autoJoin', 'General Chat');

        if (callback) callback();
    });

    // Handle user joining a room
    socket.on('joinRoom', (roomName, callback) => {
        const user = getUser(socket.id);
        if (!user) {
            if (callback) callback('User not found');
            return;
        }

        if (!rooms.includes(roomName)) {
            if (callback) callback('Invalid room');
            return;
        }

        // Leave current room if any
        if (user.room) {
            socket.leave(user.room);
            // Notify others in old room
            socket.to(user.room).emit('systemMessage', {
                text: `${user.username} left ${user.room}`,
                timestamp: new Date().toISOString()
            });
            socket.to(user.room).emit('updateUsers', getUsersInRoom(user.room));
            socket.to(user.room).emit('roomCounts', getRoomCounts());
        }

        // Update user's room
        updateUserRoom(socket.id, roomName);
        socket.join(roomName);

        // Notify others in new room
        socket.to(roomName).emit('systemMessage', {
            text: `${user.username} joined ${roomName}`,
            timestamp: new Date().toISOString()
        });

        // Send updated users list to the room
        io.to(roomName).emit('updateUsers', getUsersInRoom(roomName));

        // Send updated room counts to all
        io.emit('roomCounts', getRoomCounts());

        // Send room joined confirmation
        socket.emit('roomJoined', roomName);

        if (callback) callback();
    });

    // Handle incoming chat messages
    socket.on('sendMessage', (messageText, callback) => {
        const user = getUser(socket.id);

        if (user && user.room) {
            const message = {
                userId: user.id,
                username: user.username,
                message: messageText,
                timestamp: new Date().toISOString()
            };

            // Broadcast the message to the room
            io.to(user.room).emit('receiveMessage', message);
        }

        if (callback) callback();
    });

    // Handle typing indicator
    socket.on('typing', () => {
        const user = getUser(socket.id);
        if (user && user.room) {
            socket.to(user.room).emit('userTyping', {
                username: user.username
            });
        }
    });

    // Handle voice message recording
    socket.on('send-voice-message', (voiceData, callback) => {
        const user = getUser(socket.id);

        if (user && user.room) {
            const voiceMessage = {
                userId: user.id,
                username: user.username,
                audioData: voiceData.audioData, // Base64 encoded audio
                duration: voiceData.duration || 0,
                mimeType: voiceData.mimeType,
                timestamp: new Date().toISOString()
            };

            // Broadcast the voice message to the room
            io.to(user.room).emit('receiveVoiceMessage', voiceMessage);
        }

        if (callback) callback();
    });

    // Handle user disconnect
    socket.on('disconnect', () => {
        const user = removeUser(socket.id);

        if (user && user.room) {
            // Broadcast that user has left
            io.to(user.room).emit('systemMessage', {
                text: `${user.username} left ${user.room}`,
                timestamp: new Date().toISOString()
            });

            // Send updated users list to the room
            io.to(user.room).emit('updateUsers', getUsersInRoom(user.room));

            // Send updated room counts
            io.emit('roomCounts', getRoomCounts());
        }
    });
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
