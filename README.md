# 💬 ChatApp — Real-Time Chat Application

A full-stack real-time chat application built with **Node.js**, **React**, **Socket.io**, and **MongoDB**.  
Includes an optional **React Native CLI** Android mobile app.

---

## 📁 Project Structure

```
chat-app/
├── backend/          # Node.js + Express + Socket.io API
├── frontend/         # React.js web app (CRA)
├── mobile/           # React Native CLI Android app
└── package.json      # Root convenience scripts
```

---

## ✨ Features

| Feature | Web | Mobile |
|---|---|---|
| Register / Login / Guest mode | ✅ | ✅ |
| Create & join chat rooms | ✅ | ✅ |
| Real-time messaging | ✅ | ✅ |
| Chat history (MongoDB) | ✅ | ✅ |
| Online users list | ✅ | ✅ |
| Typing indicator | ✅ | ✅ |
| System messages (join/leave) | ✅ | ✅ |
| Default rooms (General/Tech/Random) | ✅ | ✅ |

---

## 🚀 Quick Start

### 1. Prerequisites

- Node.js ≥ 18
- MongoDB Atlas account (or local MongoDB)
- Git

---

### 2. Backend Setup

```bash
cd backend
npm install
```

The **`backend/.env`** is already configured with the MongoDB URI. Just verify it looks like:

```env
PORT=5000
MONGO_URI=mongodb+srv://<user>:<password>@cluster0.nvjhtvt.mongodb.net/chatapp?retryWrites=true&w=majority
JWT_SECRET=supersecretjwtkey_changeme_in_production
CLIENT_URL=http://localhost:3000
```

Start the server:

```bash
# Development (auto-reload)
npm run dev

# Production
npm start
```

Server runs on **http://localhost:5000**

---

### 3. Frontend (Web) Setup

```bash
cd frontend
npm install
npm start
```

Web app runs on **http://localhost:3000**

---

### 4. Mobile (React Native CLI — Android)

#### Prerequisites
- Android Studio with Android SDK
- JDK 17+
- An Android emulator (API 23+) or physical device

```bash
cd mobile
npm install
```

**For Android Emulator** — the backend URL in `src/socket/socket.js` is already set to `http://10.0.2.2:5000` (Android emulator loopback for localhost).

**For Physical Device** — change `BACKEND_URL` in `mobile/src/socket/socket.js`:

```js
// e.g., your machine's LAN IP
export const BACKEND_URL = 'http://192.168.1.100:5000';
```

Start Metro bundler in one terminal:

```bash
npx react-native start
```

Run on Android in another terminal:

```bash
npx react-native run-android
```

---

## 🔧 Environment Variables

### Backend (`backend/.env`)

| Variable | Description | Default |
|---|---|---|
| `PORT` | Server port | `5000` |
| `MONGO_URI` | MongoDB connection string | — |
| `JWT_SECRET` | JWT signing secret | — |
| `CLIENT_URL` | Frontend URL (CORS) | `http://localhost:3000` |

### Frontend (`frontend/.env`)

| Variable | Description | Default |
|---|---|---|
| `REACT_APP_API_URL` | Backend API base URL | `http://localhost:5000/api` |
| `REACT_APP_SOCKET_URL` | Socket.io server URL | `http://localhost:5000` |

---

## 📡 API Endpoints

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/guest` | Join as guest (no password) |
| GET  | `/api/auth/me` | Get current user |
| POST | `/api/auth/logout` | Logout |

### Rooms
| Method | Endpoint | Description |
|---|---|---|
| GET  | `/api/rooms` | Get all rooms |
| POST | `/api/rooms` | Create a room |
| GET  | `/api/rooms/:name` | Get room by name |
| DELETE | `/api/rooms/:id` | Delete a room |

### Messages
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/messages/:room` | Get chat history for a room |

---

## 🔌 Socket.io Events

### Client → Server
| Event | Payload | Description |
|---|---|---|
| `joinRoom` | `{ room }` | Join a chat room |
| `chatMessage` | `{ room, content }` | Send a message |
| `typing` | `{ room, isTyping }` | Typing status |
| `getOnlineUsers` | `{ room }` | Request online users list |

### Server → Client
| Event | Payload | Description |
|---|---|---|
| `joinedRoom` | `{ room, username }` | Confirmed room join |
| `chatHistory` | `{ room, messages[] }` | Historical messages on join |
| `chatMessage` | Message object | New incoming message |
| `systemMessage` | `{ content, room }` | User joined/left notification |
| `onlineUsers` | `{ room, users[] }` | Updated online users list |
| `typing` | `{ username, isTyping }` | Typing notification |

---

## 🗄️ MongoDB Models

### User
```
username, email, password (bcrypt), isOnline, lastSeen, avatar
```

### Room
```
name, description, createdBy, members[], isPrivate
```

### Message
```
room, sender, senderId, content, messageType (text|system), readBy[]
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Backend | Node.js, Express, Socket.io, Mongoose |
| Database | MongoDB Atlas |
| Web Frontend | React.js (CRA), Context API |
| Mobile | React Native CLI 0.73, React Navigation |
| Auth | JWT + bcryptjs |
| HTTP Client | Axios |

---

## ⚠️ Important Notes

1. **MongoDB URI** — paste your connection string into `backend/.env` before starting the server.
2. **CORS** — `CLIENT_URL` in `.env` must match your frontend origin exactly.
3. **Mobile network** — Android emulator uses `10.0.2.2` to reach host `localhost`. Physical devices need the host LAN IP.
4. **Guest mode** — tokens expire after 24 h; registered user tokens last 7 days.
