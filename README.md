# Professional Multi-Room Chat Application

A beautiful, modern, real-time multi-room chat application with text and voice chat, built with Node.js, Express, and Socket.IO. Features a professional UI similar to Discord or WhatsApp Web with dark/light mode support.

## ✨ Features

### Text Chat
- **Multiple Rooms:** 4 predefined rooms (General Chat, Web Development, Gaming, Friends)
- **Real-Time Messaging:** Instant message delivery using Socket.IO
- **Modern Message Bubbles:** Beautiful chat bubbles with avatars and timestamps
- **Room-Based Isolation:** Messages only visible to users in the same room
- **User Avatars:** Colorful generated avatars for each user with initials
- **Active User Count:** Real-time user count per room
- **Join/Leave Notifications:** Get notified when users join or leave
- **Typing Indicators:** See when others are typing with animated dots

### Voice Chat
- **WebRTC Voice Streaming:** Peer-to-peer voice communication within rooms
- **Mute/Unmute Controls:** Control microphone without leaving chat
- **Active Speakers List:** See who is currently in voice chat
- **Room Isolation:** Voice streams isolated per room

### Modern UI/UX
- **Dark/Light Mode:** Beautiful theme toggle with localStorage persistence
- **Responsive Design:** Works on desktop, tablet, and mobile
- **Smooth Animations:** Professional transitions and animations
- **Professional Layout:** Sidebar with rooms/users, main chat area
- **Beautiful Bubbles:** Modern chat message display
- **Online Indicators:** Green online status dots for users
- **Hover Effects:** Interactive and responsive buttons

## Tech Stack

**Backend:**
- Node.js
- Express.js
- Socket.IO

**Frontend:**
- HTML5
- CSS3 (CSS Variables for theming)
- Vanilla JavaScript
- WebRTC for voice

## Project Structure

```
/project
├── public/
│   ├── index.html     # Modern login page with gradient
│   ├── chat.html      # Main chat interface
│   ├── script.js      # Client logic (avatars, dark mode, voice)
│   └── style.css      # Modern responsive styling
├── server.js          # Express + Socket.IO server
├── package.json
└── README.md
```

## Installation & Running

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the server:**
   ```bash
   node server.js
   ```
   Or for development with auto-reload:
   ```bash
   npm run dev
   ```

3. **Open browser:**
   Visit `http://localhost:3000`

## UI Features

### 🎨 Modern Design Elements

**Login Page:**
- Purple gradient background
- Smooth slide-up animation
- Rounded form inputs
- Professional typography
- Responsive for all devices

**Chat Interface:**

**LEFT SIDEBAR (280px):**
- App logo (💬 Chat)
- Theme toggle button (🌙/☀️)
- Rooms section with active counts
- Active room highlighting
- Online users list with avatars
- Online status indicators (green dot)
- Smooth hover effects

**RIGHT MAIN AREA:**
- Chat header with room name
- Beautiful scrollable message area
- Modern message bubbles with avatars
- Typing indicator animation
- Voice controls (Join/Leave, Mute/Unmute)
- Voice users widget
- Message input bar

### 🌓 Dark/Light Mode

**Light Mode (Default):**
- White backgrounds
- Dark text (#000000)
- Light gray accents
- Blue accent color (#0084ff)
- Professional appearance

**Dark Mode:**
- Dark gray backgrounds (#1a1a1a)
- Light text (#ffffff)
- Dark accents
- Same blue highlights
- Easy on eyes

Both modes are smooth transitions with CSS variables.

### 💬 Message Display

- Rounded chat bubbles
- Light gray for received messages
- Blue for sent messages
- Sender avatars with colorful initials
- Timestamps for each message
- Smooth fade-in animation
- Max width for readability

### 🎤 Voice Controls

- **Join Voice:** Green button to join voice chat
- **Leave Voice:** Red button to leave voice chat
- **Mute/Unmute:** Yellow button to toggle microphone
- **Active Speakers:** Show list of voice chat users
- **Visual Feedback:** Buttons change state based on status

### 👥 User Avatars

- Colorful gradient backgrounds
- User initials (2 characters max)
- 6 different gradient color schemes
- Consistent colors per user
- Online/offline indicators
- Clean and professional

## 🔄 Message Flow

### Text Chat Flow:
```
User → Enter Username → Auto-join General Chat → 
Select Room → Send Message → Server Broadcast → 
All Users in Room Receive
```

### Voice Chat Flow:
```
User → Join Voice → getUserMedia → 
WebRTC Signaling via Socket.IO → 
Peer Connections Established → 
Audio Streaming → User Leaves/Mutes
```

### Theme Flow:
```
App Load → Check localStorage for saved theme → 
Apply Light or Dark Mode → 
User Clicks Toggle → Update Theme → 
Save to localStorage → Keep on reload
```

## 📡 Socket.IO Events

**Client to Server:**
- `join`: User join with username
- `joinRoom`: Join specific room
- `sendMessage`: Send chat message
- `typing`: User typing
- `join-voice`: Join voice chat
- `leave-voice`: Leave voice chat
- `voice-offer`: WebRTC offer
- `voice-answer`: WebRTC answer
- `voice-candidate`: ICE candidate

**Server to Client:**
- `roomInfo`: Room list with counts
- `roomCounts`: Updated user counts
- `roomJoined`: Room join confirmation
- `receiveMessage`: Incoming message
- `systemMessage`: System notifications
- `updateUsers`: User list update
- `userTyping`: Typing notification
- `voice-joined`: User joined voice
- `voice-left`: User left voice
- `voice-users`: Active voice users

## 📱 Responsive Breakpoints

- **Desktop (1200px+):** Full sidebar + chat area
- **Tablet (768px+):** Adjusted layouts
- **Mobile (480px+):** Single column

## 🌐 Browser Support

- Chrome/Chromium ✅
- Firefox ✅
- Safari (11+) ✅
- Edge ✅

**Note:** Voice requires HTTPS in production. Works on localhost for testing.

## 🎯 Key Implementation Details

### Avatar Generation
- Generate from username initials
- Color consistency per user
- 6 gradient variations
- Used in messages and sidebars

### Dark Mode Implementation
- CSS Variables for all colors
- localStorage for persistence
- Smooth transitions between modes
- 🌙/☀️ toggle button

### Message Bubbles
- Flexbox layout
- Different styles for sent/received
- Avatar display for others only
- Timestamp below username
- Max width for readability

### Voice Chat
- WebRTC with STUN server
- Peer connections via signaling
- Audio-only for simplicity
- Room-based isolation

## ✅ Features Implemented

- ✅ 4 predefined chat rooms
- ✅ Real-time text messaging
- ✅ WebRTC voice chat per room
- ✅ Modern responsive UI
- ✅ Dark/Light mode toggle
- ✅ User avatars with colors
- ✅ Active user counts
- ✅ Join/leave notifications
- ✅ Responsive design
- ✅ Auto-join to General Chat
- ✅ Typing indicators
- ✅ Online indicators
- ✅ Professional layout
- ✅ Smooth animations
