import React from 'react';

const formatTime = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const getAvatarColor = (username) => {
  if (!username) return '#888';
  const colors = [
    '#e74c3c', '#3498db', '#2ecc71', '#9b59b6',
    '#f39c12', '#1abc9c', '#e67e22', '#e91e63',
  ];
  let hash = 0;
  for (let i = 0; i < username.length; i++) hash += username.charCodeAt(i);
  return colors[hash % colors.length];
};

const MessageItem = ({ message, isOwnMessage }) => {
  if (message.messageType === 'system') {
    return (
      <div className="message-system">
        <span>{message.content}</span>
      </div>
    );
  }

  return (
    <div className={`message-item ${isOwnMessage ? 'own' : 'other'}`}>
      {!isOwnMessage && (
        <div
          className="message-avatar"
          style={{ backgroundColor: getAvatarColor(message.sender) }}
        >
          {message.sender?.[0]?.toUpperCase()}
        </div>
      )}
      <div className="message-content">
        {!isOwnMessage && (
          <span className="message-sender" style={{ color: getAvatarColor(message.sender) }}>
            {message.sender}
          </span>
        )}
        <div className="message-bubble">
          <span className="message-text">{message.content}</span>
          <span className="message-time">{formatTime(message.createdAt)}</span>
        </div>
      </div>
      {isOwnMessage && (
        <div
          className="message-avatar own-avatar"
          style={{ backgroundColor: getAvatarColor(message.sender) }}
        >
          {message.sender?.[0]?.toUpperCase()}
        </div>
      )}
    </div>
  );
};

export default MessageItem;
