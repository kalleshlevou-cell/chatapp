import React, { useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import ChatRoom from '../components/ChatRoom';
import { useChat } from '../context/ChatContext';
import '../styles/Chat.css';

const ChatPage = () => {
  const { fetchRooms, currentRoom } = useChat();

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  return (
    <div className="chat-page">
      <Sidebar />
      <main className="chat-main">
        {currentRoom ? (
          <ChatRoom />
        ) : (
          <div className="chat-welcome">
            <div className="welcome-icon">💬</div>
            <h2>Welcome to ChatApp</h2>
            <p>Select a room from the sidebar or create a new one to start chatting.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default ChatPage;
