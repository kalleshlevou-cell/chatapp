import React from 'react';

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

const OnlineUsersList = ({ users, currentUser }) => {
  return (
    <aside className="online-users-panel">
      <div className="online-users-header">
        <span className="online-dot-indicator" />
        ONLINE — {users.length}
      </div>
      <ul className="online-users-list">
        {users.map((u) => (
          <li key={u.socketId || u.username} className="online-user-item">
            <div className="online-user-avatar" style={{ backgroundColor: getAvatarColor(u.username) }}>
              {u.username?.[0]?.toUpperCase()}
            </div>
            <div className="online-user-info">
              <span className="online-user-name">
                {u.username}
                {u.username === currentUser && (
                  <span className="you-badge"> (you)</span>
                )}
              </span>
              {u.isGuest && <span className="guest-tag">guest</span>}
            </div>
            <span className="online-status-dot" title="Online" />
          </li>
        ))}
        {users.length === 0 && (
          <li className="no-users">No users online</li>
        )}
      </ul>
    </aside>
  );
};

export default OnlineUsersList;
