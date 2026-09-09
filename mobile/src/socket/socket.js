import { io } from 'socket.io-client';

// Android emulator: 10.0.2.2 maps to host machine localhost
// Physical device: replace with your machine's LAN IP e.g. http://192.168.1.x:5000
// Production: use your Render URL
export const BACKEND_URL = 'https://chatapp-hqgv.onrender.com';
export const API_URL = `${BACKEND_URL}/api`;

let socket = null;

export const getSocket = () => socket;

export const initSocket = (token) => {
  if (socket) socket.disconnect();
  socket = io(BACKEND_URL, {
    auth: { token },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
