import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { initSocket, disconnectSocket, getSocket, API_URL } from '../socket/socket';
import { useAuth } from './AuthContext';

const ChatContext = createContext(null);

export const ChatProvider = ({ children }) => {
  const { user, token } = useAuth();
  const [connected, setConnected]     = useState(false);
  const [rooms, setRooms]             = useState([]);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [messages, setMessages]       = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const typingRef = useRef(null);

  useEffect(() => {
    if (!user || !token) return;
    const s = initSocket(token);
    s.on('connect',       ()              => setConnected(true));
    s.on('disconnect',    ()              => setConnected(false));
    s.on('chatHistory',   ({ messages: h }) => setMessages(h));
    s.on('chatMessage',   (msg)           => setMessages(p => [...p, msg]));
    s.on('systemMessage', (msg)           => setMessages(p => [...p, { ...msg, _id: String(Date.now()), messageType: 'system', sender: 'System' }]));
    s.on('onlineUsers',   ({ users })     => setOnlineUsers(users));
    s.on('typing',        ({ username, isTyping }) => setTypingUsers(p => isTyping ? [...new Set([...p, username])] : p.filter(u => u !== username)));
    return () => { disconnectSocket(); setConnected(false); };
  }, [user, token]);

  const fetchRooms  = useCallback(async () => { try { const r = await axios.get(`${API_URL}/rooms`); setRooms(r.data); } catch(e){} }, []);
  const createRoom  = useCallback(async (name, desc = '') => { const r = await axios.post(`${API_URL}/rooms`, { name, description: desc }); setRooms(p => [r.data, ...p]); return r.data; }, []);

  const joinRoom = useCallback((roomName) => {
    const s = getSocket(); if (!s) return;
    setMessages([]); setOnlineUsers([]); setTypingUsers([]);
    setCurrentRoom(roomName);
    s.emit('joinRoom', { room: roomName });
  }, []);

  const sendMessage = useCallback((content) => {
    const s = getSocket();
    if (!s || !currentRoom || !content.trim()) return;
    s.emit('chatMessage', { room: currentRoom, content: content.trim() });
  }, [currentRoom]);

  const emitTyping = useCallback((isTyping) => {
    const s = getSocket(); if (!s || !currentRoom) return;
    s.emit('typing', { room: currentRoom, isTyping });
    if (isTyping) {
      if (typingRef.current) clearTimeout(typingRef.current);
      typingRef.current = setTimeout(() => s.emit('typing', { room: currentRoom, isTyping: false }), 3000);
    }
  }, [currentRoom]);

  return (
    <ChatContext.Provider value={{ connected, rooms, currentRoom, messages, onlineUsers, typingUsers, fetchRooms, createRoom, joinRoom, sendMessage, emitTyping }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext);
