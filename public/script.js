const socket = io();

// Get DOM elements
const messageForm = document.getElementById('message-form');
const messageInput = document.getElementById('message-input');
const messagesContainer = document.getElementById('messages-container');
const messagesList = document.getElementById('messages');
const typingIndicator = document.getElementById('typing-indicator');
const roomsList = document.getElementById('rooms-list');
const usersList = document.getElementById('users-list');
const currentRoomHeader = document.getElementById('current-room');
const themeToggle = document.getElementById('theme-toggle');

// Mobile Menu Elements
const menuToggle = document.getElementById('menu-toggle');
const sidebar = document.getElementById('sidebar');
const sidebarOverlay = document.getElementById('sidebar-overlay');
const closeSidebar = document.getElementById('close-sidebar');

// Extract username from URL query parameters
const urlParams = new URLSearchParams(window.location.search);
const username = urlParams.get('username');

if (!username) {
    window.location.href = 'index.html';
}

// ================================
// THEME MANAGEMENT
// ================================

function initializeTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.body.classList.remove('light-mode', 'dark-mode');
    document.body.classList.add(savedTheme + '-mode');
    updateThemeToggle(savedTheme === 'dark');
}

function updateThemeToggle(isDark) {
    themeToggle.textContent = isDark ? '☀️' : '🌙';
}

themeToggle.addEventListener('click', () => {
    const isDark = document.body.classList.contains('dark-mode');
    const newTheme = isDark ? 'light' : 'dark';
    document.body.classList.remove('light-mode', 'dark-mode');
    document.body.classList.add(newTheme + '-mode');
    localStorage.setItem('theme', newTheme);
    updateThemeToggle(newTheme === 'dark');
});

initializeTheme();

// ================================
// MOBILE NAVIGATION
// ================================

function toggleSidebar(show) {
    sidebar.classList.toggle('active', show);
    sidebarOverlay.classList.toggle('active', show);
}

menuToggle.addEventListener('click', () => toggleSidebar(true));
closeSidebar.addEventListener('click', () => toggleSidebar(false));
sidebarOverlay.addEventListener('click', () => toggleSidebar(false));

// Close sidebar on room select (mobile)
function handleMobileRoomSelect() {
    if (window.innerWidth <= 768) {
        toggleSidebar(false);
    }
}

// ================================
// UTILITIES
// ================================

function generateAvatar(name) {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
}

function getAvatarColor(name) {
    const colors = ['#667eea', '#f5576c', '#4facfe', '#43e97b', '#fa709a', '#30cfd0'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
}

function scrollToBottom() {
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function formatTimestamp(isoString) {
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
}

// ================================
// SOCKET LOGIC
// ================================

let myId = null;
let currentRoom = null;

socket.on('connect', () => {
    myId = socket.id;
});

socket.emit('join', username, (error) => {
    if (error) {
        alert(error);
        window.location.href = 'index.html';
    }
});

socket.on('roomInfo', (rooms) => {
    roomsList.innerHTML = '';
    rooms.forEach((room, index) => {
        const li = document.createElement('li');
        const button = document.createElement('button');
        button.type = 'button';
        button.innerHTML = `<span>${room.name}</span><span class="room-count">${room.count}</span>`;
        button.addEventListener('click', () => {
            joinRoom(room.name, button);
            handleMobileRoomSelect();
        });
        li.appendChild(button);
        roomsList.appendChild(li);
        if (index === 0 && !currentRoom) joinRoom(room.name, button);
    });
});

socket.on('roomCounts', (rooms) => {
    rooms.forEach(room => {
        const buttons = Array.from(roomsList.querySelectorAll('button'));
        const button = buttons.find(b => b.textContent.includes(room.name));
        if (button) {
            const countSpan = button.querySelector('.room-count');
            if (countSpan) countSpan.textContent = room.count;
        }
    });
});

function joinRoom(roomName, button) {
    if (currentRoom === roomName) return;
    socket.emit('joinRoom', roomName, (error) => {
        if (error) return alert(error);
        messagesList.innerHTML = '';
        currentRoom = roomName;
        currentRoomHeader.textContent = roomName;
        document.querySelectorAll('#rooms-list button').forEach(b => b.classList.remove('active'));
        button.classList.add('active');
    });
}

socket.on('receiveMessage', (message) => {
    const isMyMessage = message.userId === myId;
    const messageEl = document.createElement('div');
    messageEl.className = `message ${isMyMessage ? 'my-message' : ''}`;

    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.style.background = getAvatarColor(message.username);
    avatar.textContent = generateAvatar(message.username);

    const bubble = document.createElement('div');
    bubble.className = 'message-bubble';
    bubble.innerHTML = `
        <div class="message-meta">${message.username} • ${formatTimestamp(message.timestamp)}</div>
        <div class="message-content">${message.message}</div>
    `;

    messageEl.appendChild(avatar);
    messageEl.appendChild(bubble);
    messagesList.appendChild(messageEl);
    scrollToBottom();
});

socket.on('systemMessage', (message) => {
    const el = document.createElement('div');
    el.className = 'system-message';
    el.textContent = `${message.text} (${formatTimestamp(message.timestamp)})`;
    messagesList.appendChild(el);
    scrollToBottom();
});

socket.on('updateUsers', (users) => {
    usersList.innerHTML = '';
    users.forEach((user) => {
        const li = document.createElement('li');
        li.innerHTML = `
            <div class="user-item">
                <div class="user-avatar" style="background:${getAvatarColor(user.username)}">
                    ${generateAvatar(user.username)}
                    <div class="online-indicator"></div>
                </div>
                <div class="user-name">${user.username}</div>
            </div>
        `;
        usersList.appendChild(li);
    });
});

messageForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = messageInput.value.trim();
    if (text && currentRoom) {
        socket.emit('sendMessage', text, () => {
            messageInput.value = '';
            messageInput.focus();
            if (window.innerWidth <= 768) {
                setTimeout(scrollToBottom, 100);
            }
        });
    }
});

messageInput.addEventListener('focus', () => {
    if (window.innerWidth <= 768) {
        setTimeout(scrollToBottom, 300);
    }
});

let typingTimer;
messageInput.addEventListener('input', () => {
    socket.emit('typing');
});

socket.on('userTyping', (data) => {
    typingIndicator.innerHTML = '<div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>';
    clearTimeout(typingTimer);
    typingTimer = setTimeout(() => { typingIndicator.innerHTML = ''; }, 1500);
});

// ================================
// VOICE MESSAGING
// ================================

const voiceBtn = document.getElementById('voice-message-btn');
const recordIndicator = document.getElementById('recording-indicator');
const recordTime = document.getElementById('recording-time');

let mediaRecorder = null;
let chunks = [];
let recordStart = null;
let timerInt = null;

async function startRecording() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(stream);
        chunks = [];
        mediaRecorder.ondataavailable = e => chunks.push(e.data);
        mediaRecorder.onstop = sendVoiceMessage;
        mediaRecorder.start();

        voiceBtn.classList.add('recording');
        recordIndicator.classList.remove('hidden');
        recordStart = Date.now();
        timerInt = setInterval(() => {
            const s = Math.floor((Date.now() - recordStart) / 1000);
            recordTime.textContent = `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;
        }, 1000);
    } catch (e) { alert('Mic access denied'); }
}

function stopRecording() {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
        mediaRecorder.stop();
        mediaRecorder.stream.getTracks().forEach(t => t.stop());
    }
    voiceBtn.classList.remove('recording');
    recordIndicator.classList.add('hidden');
    clearInterval(timerInt);
}

async function sendVoiceMessage() {
    const blob = new Blob(chunks, { type: 'audio/webm' });
    if (blob.size < 1000) return;
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onloadend = () => {
        socket.emit('send-voice-message', {
            audioData: reader.result,
            duration: Math.floor((Date.now() - recordStart) / 1000),
            mimeType: 'audio/webm'
        });
    };
}

voiceBtn.addEventListener('mousedown', startRecording);
document.addEventListener('mouseup', stopRecording);

// Touch support for mobile voice messaging
voiceBtn.addEventListener('touchstart', (e) => {
    e.preventDefault();
    startRecording();
}, { passive: false });

voiceBtn.addEventListener('touchend', (e) => {
    e.preventDefault();
    stopRecording();
}, { passive: false });

socket.on('receiveVoiceMessage', (msg) => {
    const isMy = msg.userId === myId;
    const el = document.createElement('div');
    el.className = `message ${isMy ? 'my-message' : ''}`;

    const bubble = document.createElement('div');
    bubble.className = 'message-bubble';

    const voiceHtml = `
        <div class="message-meta">${msg.username} • ${formatTimestamp(msg.timestamp)}</div>
        <div class="message-content">
            <div class="voice-message">
                <button class="voice-playback-btn">▶️</button>
                <div class="voice-progress-bar"><div class="voice-progress-fill"></div></div>
                <span class="voice-duration">${msg.duration}s</span>
            </div>
        </div>
    `;
    bubble.innerHTML = voiceHtml;

    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.style.background = getAvatarColor(msg.username);
    avatar.textContent = generateAvatar(msg.username);

    el.appendChild(avatar);
    el.appendChild(bubble);
    messagesList.appendChild(el);
    scrollToBottom();

    setupPlayback(el.querySelector('.voice-playback-btn'), el.querySelector('.voice-progress-fill'), msg.audioData);
});

function setupPlayback(btn, fill, data) {
    const audio = new Audio(data);
    audio.onended = () => { btn.textContent = '▶️'; fill.style.width = '0%'; };
    audio.ontimeupdate = () => { fill.style.width = `${(audio.currentTime / audio.duration) * 100}%`; };
    btn.onclick = () => {
        if (audio.paused) { audio.play(); btn.textContent = '⏸️'; }
        else { audio.pause(); btn.textContent = '▶️'; }
    };
}