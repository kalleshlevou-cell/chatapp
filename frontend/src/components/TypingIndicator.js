import React from 'react';

const TypingIndicator = ({ typingUsers, currentUser }) => {
  const others = typingUsers.filter((u) => u !== currentUser);
  if (others.length === 0) return null;

  const label =
    others.length === 1
      ? `${others[0]} is typing`
      : others.length === 2
      ? `${others[0]} and ${others[1]} are typing`
      : `${others[0]} and ${others.length - 1} others are typing`;

  return (
    <div className="typing-indicator" aria-live="polite">
      <div className="typing-dots">
        <span />
        <span />
        <span />
      </div>
      <span className="typing-text">{label}...</span>
    </div>
  );
};

export default TypingIndicator;
