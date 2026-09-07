import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { initSocket, disconnectSocket, getSocket } from '../socket/socket';
import { useAuth } from './AuthContext';
import { API_URL } from '../socket/socket';

const ChatContext = createContext(null);

export const ChatProvider = ({ children }) => {
  const { user, token } = useAuth();
  const [connected, setConnected]   = useState(false);
  const [rooms, setRooms]           = useState([]);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [messages, setMessages]     = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    if (!user || !token) return;

    const s = initSocket(token);

    s.on('connect',    () => setConnected(true));
    s.on('disconnect', () => setConnected(false));

    s.on('chatHistory', ({ messages: hist }) => setMessages(hist));

    s.on('chatMessage', (msg) =>
      setMessages((prev) => [...prev, msg])
    );

    s.on('systemMessage', (msg) =>
      setMessages((prev) => [
        ...prev,
        { ...msg, _id: String(Date.now()), messageType: 'system', sender: 'System' },
      ])
    );

    s.on('onlineUsers', ({ users }) => setOnlineUsers(users));

    s.on('typing', ({ username, isTyping }) =>
      setTypingUsers((prev) =>
        isTyping
          ? [...new Set([...prev, username])]
          : prev.filter((u) => u !== username)
      )
    );

    return () => {
      disconnectSocket();
      setConnected(false);
    };
  }, [user, token]);

  const fetchRooms = useCallback(async () => {
    try {
      const res = await axios.get(`${API_URL}/rooms`);
      setRooms(res.data);
    } catch (e) {
      console.error('fetchRooms error', e);
    }
  }, []);

  const createRoom = useCallback(async (name, description = '') => {
    const res = await axios.post(`${API_URL}/rooms`, { name, description });
    setRooms((prev) => [res.data, ...prev]);
    return res.data;
  }, []);

  const joinRoom = useCallback((roomName) => {
    const s = getSocket();
    if (!s) return;
    setMessages([]);
    setOnlineUsers([]);
    setTypingUsers([]);
    setCurrentRoom(roomName);
    s.emit('joinRoom', { room: roomName });
  }, []);

  const sendMessage = useCallback((content) => {
    const s = getSocket();
    if (!s || !currentRoom || !content.trim()) return;
    s.emit('chatMessage', { room: currentRoom, content: content.trim() });
  }, [currentRoom]);

  const emitTyping = useCallback((isTyping) => {
    const s = getSocket();
    if (!s || !currentRoom) return;
    s.emit('typing', { room: currentRoom, isTyping });
    if (isTyping) {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        s.emit('typing', { room: currentRoom, isTyping: false });
      }, 3000);
    }
  }, [currentRoom]);

  return (
    <ChatContext.Provider value={{
      connected, rooms, currentRoom, messages,
      onlineUsers, typingUsers,
      fetchRooms, createRoom, joinRoom, sendMessage, emitTyping,
    }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext);
