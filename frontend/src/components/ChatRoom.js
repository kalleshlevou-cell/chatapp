import React, { useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import MessageItem from './MessageItem';
import MessageInput from './MessageInput';
import OnlineUsersList from './OnlineUsersList';
import TypingIndicator from './TypingIndicator';

const ChatRoom = () => {
  const { user } = useAuth();
  const { currentRoom, messages, onlineUsers, typingUsers } = useChat();
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typingUsers]);

  return (
    <div className="chat-room">
      {/* Room header */}
      <div className="room-header">
        <div className="room-header-left">
          <span className="room-header-hash">#</span>
          <h2 className="room-header-name">{currentRoom}</h2>
          <span className="room-member-count">
            {onlineUsers.length} online
          </span>
        </div>
        <div className="room-header-right">
          <span className="header-icon" title="Online users">👥</span>
        </div>
      </div>

      <div className="chat-body">
        {/* Messages panel */}
        <div className="messages-panel">
          <div className="messages-list">
            {messages.length === 0 && (
              <div className="no-messages">
                <span>🎉</span>
                <p>No messages yet. Say hello!</p>
              </div>
            )}
            {messages.map((msg, idx) => (
              <MessageItem
                key={msg._id || idx}
                message={msg}
                isOwnMessage={msg.sender === user?.username}
              />
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Typing indicator */}
          <TypingIndicator typingUsers={typingUsers} currentUser={user?.username} />

          {/* Message input */}
          <MessageInput />
        </div>

        {/* Online users panel */}
        <OnlineUsersList users={onlineUsers} currentUser={user?.username} />
      </div>
    </div>
  );
};

export default ChatRoom;
