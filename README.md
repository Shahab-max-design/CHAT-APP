# Real-Time Chat Application

A complete, real-time chat application built for beginners to understand WebSockets logic. It allows users to join a chat room, send real-time messages, see who is online, and view typing indicators.

## Tech Stack

**Backend:**
- Node.js
- Express.js
- Socket.IO
- UUID

**Frontend:**
- HTML5
- CSS3 (Clean, responsive layout with modern chat bubbles)
- Vanilla JavaScript

**Development Tools:**
- Nodemon (for auto-restarting the server during development)

## How to Install & Run

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   ```

3. **Open the application:**
   Navigate into your browser and open `http://localhost:3000`

## Server Architecture

The server consists of three main components:

1. **`server.js`:** The core entry point. It sets up the Express application, creates an HTTP server using Node's built-in `http` module, and links Socket.IO to this HTTP server. Finally, it serves our static HTML/CSS/JS frontend files.
2. **`socket.js`:** This manages all real-time events. By abstracting Socket.IO logic into its own file, the project stays clean and maintainable.
3. **`users.js`:** A simple state management module that tracks users stored in memory. It has helper functions to add, remove, and get users based on their Socket IDs.

## Socket.IO Explanation & Event Flow

Socket.IO enables bi-directional, real-time communication between the client (browser) and the server. It handles connection persistence, reconnects automatically, and provides an easy-to-use API for emitting and listening to custom events.

**Example Communications Flow:**

1. **User Joins:**
   - User enters name → Client: `socket.emit("join", username)`
   - Server receives → Registers user, broadcasts: `io.emit("systemMessage", "Ali joined the chat")`
   - Server sends user list update → `io.emit("updateUsers", [...])`

2. **Sending a Message:**
   - User A types and clicks "Send" 
   - Client sends message to server: `socket.emit("sendMessage", "Hello!")`
   - Server receives message, looks up User A's profile.
   - Server broadcasts to EVERYONE: `io.emit("receiveMessage", { ...messageDetails })`
   - User B (and User A) receives event and renders it to the screen.

3. **Typing Indicator:**
   - User types → `socket.emit("typing")`
   - Server receives → `socket.broadcast.emit("userTyping", { username })` (Sends to everyone *except* sender)

## Developer Perspectives
- **Why `broadcast.emit`?** Used when you want everyone *else* in the chat to see an event, like "User is typing..."
- **Why `io.emit`?** Used when *everyone* (including the sender) needs to see the update, such as when sending the complete active users list.
- **Client.js DOM updates:** We use standard Vanilla JS methods (`document.createElement`) connected directly to our Socket event handlers to dynamically build the UI without page reloads.
