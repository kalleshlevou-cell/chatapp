import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ChatProvider } from './context/ChatContext';
import AuthPage from './pages/AuthPage';
import ChatPage from './pages/ChatPage';
import './styles/globals.css';

const AppContent = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#1a1d23',
        color: '#e3e5e8',
        fontSize: '18px',
        gap: '14px',
      }}>
        <span style={{
          width: 28,
          height: 28,
          border: '3px solid rgba(255,255,255,0.2)',
          borderTop: '3px solid #5865f2',
          borderRadius: '50%',
          display: 'inline-block',
          animation: 'spin 0.7s linear infinite',
        }} />
        Loading...
      </div>
    );
  }

  if (!user) return <AuthPage />;

  return (
    <ChatProvider>
      <ChatPage />
    </ChatProvider>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
