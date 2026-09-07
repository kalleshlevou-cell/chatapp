import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { initSocket, disconnectSocket, getSocket } from '../socket/socket';
import { useAuth } from './AuthContext';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const ChatContext = createContext(null);

export const ChatProvider = ({ children }) => {
  const { user, token } = useAuth();
  const [socket, setSocket] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const [connected, setConnected] = useState(false);
  const typingTimeoutRef = useRef(null);

  // Initialize socket when user logs in
  useEffect(() => {
    if (user && token) {
      const s = initSocket(token);
      setSocket(s);

      s.on('connect', () => setConnected(true));
      s.on('disconnect', () => setConnected(false));

      s.on('chatHistory', ({ messages: history }) => {
        setMessages(history);
      });

      s.on('chatMessage', (message) => {
        setMessages((prev) => [...prev, message]);
      });

      s.on('systemMessage', (msg) => {
        setMessages((prev) => [
          ...prev,
          { ...msg, _id: Date.now().toString(), messageType: 'system', sender: 'System' },
        ]);
      });

      s.on('onlineUsers', ({ users }) => {
        setOnlineUsers(users);
      });

      s.on('typing', ({ username, isTyping }) => {
        setTypingUsers((prev) =>
          isTyping ? [...new Set([...prev, username])] : prev.filter((u) => u !== username)
        );
      });

      return () => {
        disconnectSocket();
        setConnected(false);
        setSocket(null);
      };
    }
  }, [user, token]);

  // Fetch all rooms
  const fetchRooms = useCallback(async () => {
    try {
      const res = await axios.get(`${API_URL}/rooms`);
      setRooms(res.data);
    } catch (err) {
      console.error('Error fetching rooms:', err);
    }
  }, []);

  // Create a room
  const createRoom = useCallback(async (name, description = '') => {
    const res = await axios.post(`${API_URL}/rooms`, { name, description });
    setRooms((prev) => [res.data, ...prev]);
    return res.data;
  }, []);

  // Join a room
  const joinRoom = useCallback(
    (roomName) => {
      const s = getSocket();
      if (!s) return;
      setMessages([]);
      setOnlineUsers([]);
      setTypingUsers([]);
      setCurrentRoom(roomName);
      s.emit('joinRoom', { room: roomName });
    },
    []
  );

  // Send a message
  const sendMessage = useCallback(
    (content) => {
      const s = getSocket();
      if (!s || !currentRoom || !content.trim()) return;
      s.emit('chatMessage', { room: currentRoom, content: content.trim() });
    },
    [currentRoom]
  );

  // Emit typing
  const emitTyping = useCallback(
    (isTyping) => {
      const s = getSocket();
      if (!s || !currentRoom) return;
      s.emit('typing', { room: currentRoom, isTyping });

      if (isTyping) {
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
          s.emit('typing', { room: currentRoom, isTyping: false });
        }, 3000);
      }
    },
    [currentRoom]
  );

  return (
    <ChatContext.Provider
      value={{
        socket,
        connected,
        rooms,
        currentRoom,
        messages,
        onlineUsers,
        typingUsers,
        fetchRooms,
        createRoom,
        joinRoom,
        sendMessage,
        emitTyping,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext);
