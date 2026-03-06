const express = require('express');
const http = require('http');
const path = require('path');
const setupSocket = require('./socket');

// Create Express app
const app = express();

// Create HTTP server
const server = http.createServer(app);

// Serve static files from the public directory
const publicPath = path.join(__dirname, '../public');
app.use(express.static(publicPath));

// Initialize Socket.IO
setupSocket(server);

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
