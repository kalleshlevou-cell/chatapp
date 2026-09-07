import React, { useState } from 'react';
import { useChat } from '../context/ChatContext';

const CreateRoomModal = ({ onClose }) => {
  const { createRoom, joinRoom, fetchRooms } = useChat();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (name.trim().length < 3) {
      setError('Room name must be at least 3 characters');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const room = await createRoom(name.trim(), description.trim());
      await fetchRooms();
      joinRoom(room.name);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create room');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Create a Room</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Room Name *</label>
            <input
              type="text"
              placeholder="e.g. design-talk"
              value={name}
              onChange={(e) => { setName(e.target.value); setError(''); }}
              minLength={3}
              maxLength={30}
              required
              autoFocus
            />
          </div>
          <div className="form-group">
            <label>Description (optional)</label>
            <input
              type="text"
              placeholder="What's this room about?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={100}
            />
          </div>
          {error && <div className="auth-error">{error}</div>}
          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? 'Creating...' : 'Create Room'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateRoomModal;
