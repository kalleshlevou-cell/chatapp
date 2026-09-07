import { io } from 'socket.io-client';

// Change this to your machine's LAN IP when running on a physical device
// e.g., 'http://192.168.1.100:5000'
// For Android emulator use: 'http://10.0.2.2:5000'
export const BACKEND_URL = 'http://10.0.2.2:5000';
export const API_URL = `${BACKEND_URL}/api`;

let socket = null;

export const getSocket = () => socket;

export const initSocket = (token) => {
  if (socket) {
    socket.disconnect();
  }
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
