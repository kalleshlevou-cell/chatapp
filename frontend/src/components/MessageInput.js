import React, { useState, useRef } from 'react';
import { useChat } from '../context/ChatContext';

const MessageInput = () => {
  const { sendMessage, emitTyping, currentRoom } = useChat();
  const [text, setText] = useState('');
  const typingRef = useRef(false);

  const handleChange = (e) => {
    setText(e.target.value);
    if (!typingRef.current) {
      typingRef.current = true;
      emitTyping(true);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    sendMessage(text);
    setText('');
    typingRef.current = false;
    emitTyping(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
    if (e.key === 'Escape') {
      setText('');
      typingRef.current = false;
      emitTyping(false);
    }
  };

  const handleBlur = () => {
    if (typingRef.current) {
      typingRef.current = false;
      emitTyping(false);
    }
  };

  return (
    <form className="message-input-form" onSubmit={handleSubmit}>
      <div className="message-input-wrapper">
        <textarea
          className="message-input"
          placeholder={`Message #${currentRoom}`}
          value={text}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          rows={1}
          maxLength={1000}
          aria-label="Message input"
        />
        <button
          type="submit"
          className="send-btn"
          disabled={!text.trim()}
          aria-label="Send message"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
          </svg>
        </button>
      </div>
      <span className="char-count">{text.length}/1000</span>
    </form>
  );
};

export default MessageInput;
