import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_URL } from '../socket/socket';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [token, setToken]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    restoreSession();
  }, []);

  const restoreSession = async () => {
    try {
      const stored = await AsyncStorage.getItem('chat_token');
      if (stored) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${stored}`;
        const res = await axios.get(`${API_URL}/auth/me`);
        setToken(stored);
        setUser(res.data);
      }
    } catch {
      await AsyncStorage.removeItem('chat_token');
    } finally {
      setLoading(false);
    }
  };

  const saveAuth = async ({ token: t, user: u }) => {
    await AsyncStorage.setItem('chat_token', t);
    axios.defaults.headers.common['Authorization'] = `Bearer ${t}`;
    setToken(t);
    setUser(u);
  };

  const register = async (username, email, password) => {
    const res = await axios.post(`${API_URL}/auth/register`, { username, email, password });
    await saveAuth(res.data);
    return res.data;
  };

  const login = async (email, password) => {
    const res = await axios.post(`${API_URL}/auth/login`, { email, password });
    await saveAuth(res.data);
    return res.data;
  };

  const guestLogin = async (username) => {
    const res = await axios.post(`${API_URL}/auth/guest`, { username });
    await saveAuth(res.data);
    return res.data;
  };

  const logout = async () => {
    await AsyncStorage.removeItem('chat_token');
    delete axios.defaults.headers.common['Authorization'];
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, register, login, guestLogin, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
