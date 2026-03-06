const socket = io();

// Get DOM elements
const messageForm = document.getElementById('message-form');
const messageInput = document.getElementById('message-input');
const messagesContainer = document.getElementById('messages');
const typingIndicator = document.getElementById('typing-indicator');
const usersList = document.getElementById('users-list');

// Extract username from URL query parameters (e.g. ?username=Ali)
const urlParams = new URLSearchParams(window.location.search);
const username = urlParams.get('username');

// Redirect to login if no username
if (!username) {
    window.location.href = 'index.html';
}

// Keep track of our own ID once connected
let myId = null;
socket.on('connect', () => {
    myId = socket.id;
});

// Join the chat
socket.emit('join', username, (error) => {
    if (error) {
        alert(error);
        window.location.href = 'index.html';
    }
});

// Automatically scroll to the bottom of the messages container
function scrollToBottom() {
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Listen for incoming messages
socket.on('receiveMessage', (message) => {
    const isMyMessage = message.userId === myId;

    const messageEl = document.createElement('div');
    messageEl.classList.add('message');
    if (isMyMessage) {
        messageEl.classList.add('my-message');
    }

    messageEl.innerHTML = `
    <div class="message-meta">${message.username} • ${message.timestamp}</div>
    <div class="message-content">${message.message}</div>
  `;

    messagesContainer.appendChild(messageEl);
    scrollToBottom();
});

// Listen for system messages
socket.on('systemMessage', (message) => {
    const messageEl = document.createElement('div');
    messageEl.classList.add('system-message');
    messageEl.textContent = `${message.text} (${message.timestamp})`;

    messagesContainer.appendChild(messageEl);
    scrollToBottom();
});

// Update the online users list
socket.on('updateUsers', (users) => {
    usersList.innerHTML = '';
    users.forEach((user) => {
        const li = document.createElement('li');
        li.textContent = user.username;
        usersList.appendChild(li);
    });
});

// Handle form submission to send a message
messageForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = messageInput.value.trim();

    if (text) {
        socket.emit('sendMessage', text, () => {
            // Clear input and refocus
            messageInput.value = '';
            messageInput.focus();
        });
    }
});

// Typing indicator functionality
let typingTimer;
messageInput.addEventListener('input', () => {
    socket.emit('typing');

    clearTimeout(typingTimer);
});

socket.on('userTyping', ({ username }) => {
    typingIndicator.textContent = `${username} is typing...`;

    clearTimeout(typingTimer);
    typingTimer = setTimeout(() => {
        typingIndicator.textContent = '';
    }, 2000);
});
