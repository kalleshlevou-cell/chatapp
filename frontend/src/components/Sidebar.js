import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import CreateRoomModal from './CreateRoomModal';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const { rooms, currentRoom, joinRoom, connected } = useChat();
  const [showCreate, setShowCreate] = useState(false);
  const [search, setSearch] = useState('');

  const filteredRooms = rooms.filter((r) =>
    r.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <aside className="sidebar">
      {/* Header */}
      <div className="sidebar-header">
        <div className="brand">💬 ChatApp</div>
        <div className={`connection-dot ${connected ? 'online' : 'offline'}`}
          title={connected ? 'Connected' : 'Disconnected'}
        />
      </div>

      {/* User info */}
      <div className="sidebar-user">
        <div className="user-avatar">{user?.username?.[0]?.toUpperCase()}</div>
        <div className="user-info">
          <span className="username">{user?.username}</span>
          {user?.isGuest && <span className="guest-badge">Guest</span>}
        </div>
        <button className="logout-btn" onClick={logout} title="Logout">⎋</button>
      </div>

      {/* Room search */}
      <div className="sidebar-search">
        <input
          type="text"
          placeholder="Search rooms..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Rooms header */}
      <div className="sidebar-section-header">
        <span>ROOMS ({rooms.length})</span>
        <button className="create-room-btn" onClick={() => setShowCreate(true)} title="New Room">
          +
        </button>
      </div>

      {/* Room list */}
      <ul className="room-list">
        {filteredRooms.length === 0 && (
          <li className="no-rooms">
            {search ? 'No rooms found' : 'No rooms yet. Create one!'}
          </li>
        )}
        {filteredRooms.map((room) => (
          <li
            key={room._id}
            className={`room-item ${currentRoom === room.name ? 'active' : ''}`}
            onClick={() => joinRoom(room.name)}
          >
            <span className="room-hash">#</span>
            <span className="room-name">{room.name}</span>
          </li>
        ))}
      </ul>

      {/* Default rooms shortcut */}
      <div className="sidebar-section-header" style={{ marginTop: '8px' }}>
        <span>DEFAULT</span>
      </div>
      <ul className="room-list">
        {['General', 'Tech', 'Random'].map((name) => (
          <li
            key={name}
            className={`room-item ${currentRoom === name ? 'active' : ''}`}
            onClick={() => joinRoom(name)}
          >
            <span className="room-hash">#</span>
            <span className="room-name">{name.toLowerCase()}</span>
          </li>
        ))}
      </ul>

      {showCreate && <CreateRoomModal onClose={() => setShowCreate(false)} />}
    </aside>
  );
};

export default Sidebar;
