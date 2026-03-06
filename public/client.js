// Initialize connection to server with production-ready transports configuration
const socket = io({
    transports: ['websocket', 'polling']
});

// Grab elements correctly
const messageForm = document.getElementById('message-form');
const messageInput = document.getElementById('message-input');
const messagesContainer = document.getElementById('messages');
const typingIndicator = document.getElementById('typing-indicator');
const usersList = document.getElementById('users-list');

// Authentication parameter check
const urlParams = new URLSearchParams(window.location.search);
const username = urlParams.get('username');

if (!username) {
    window.location.href = 'index.html';
}

let myId = null;

socket.on('connect', () => {
    myId = socket.id;
});

// Join the room
socket.emit('join', username, (error) => {
    if (error) {
        alert(error);
        window.location.href = 'index.html';
    }
});

/**
 * Super dependable auto-scrolling function to keep chat at the bottom
 */
function scrollToBottom() {
    // Relying on native assignment over .scrollTo() supports max legacy mobile devices
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

/**
 * Converts server timestamp (ISO string) to the user's local time zone.
 * Fallbacks directly to the string if the server sends legacy string formats.
 */
function formatTime(timestamp) {
    const dateObj = new Date(timestamp);
    if (isNaN(dateObj.getTime())) {
        return timestamp; // Fallback for raw strings
    }
    return dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// Handler: When a chat message arrives
socket.on('receiveMessage', (message) => {
    const isMyMessage = message.userId === myId;
    const messageEl = document.createElement('div');

    messageEl.classList.add('message');
    if (isMyMessage) {
        messageEl.classList.add('my-message');
    }

    messageEl.innerHTML = `
    <div class="message-meta">${message.username} • ${formatTime(message.timestamp)}</div>
    <div class="message-content">${message.message}</div>
  `;

    messagesContainer.appendChild(messageEl);
    scrollToBottom();
});

// Handler: When server sends status events ("joined" or "left")
socket.on('systemMessage', (message) => {
    const messageEl = document.createElement('div');
    messageEl.classList.add('system-message');
    messageEl.textContent = `${message.text} (${formatTime(message.timestamp)})`;

    messagesContainer.appendChild(messageEl);
    scrollToBottom();
});

// Handler: Synchronize active members panel instantly
socket.on('updateUsers', (users) => {
    // Completely empty list and redraw
    usersList.innerHTML = '';

    users.forEach((user) => {
        const li = document.createElement('li');
        li.textContent = user.username;
        usersList.appendChild(li);
    });
});

// User interactions: Submitting chat message
messageForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const text = messageInput.value.trim();
    if (text) {
        socket.emit('sendMessage', text, () => {
            // Callback confirming server processed: reset UI
            messageInput.value = '';
            messageInput.focus();
        });
    }
});

// User interactions: Typing Indicator logic
messageInput.addEventListener('input', () => {
    socket.emit('typing');
});

// Listen globally for typing
let displayTypingTimer;

socket.on('userTyping', ({ username }) => {
    typingIndicator.textContent = `${username} is typing...`;

    // Clear any existing active timer so successive typings renew the counter
    clearTimeout(displayTypingTimer);

    displayTypingTimer = setTimeout(() => {
        typingIndicator.textContent = '';
    }, 2000);

    // Make sure to bounce screen to bottom so we see the typing pop up perfectly
    scrollToBottom();
});
