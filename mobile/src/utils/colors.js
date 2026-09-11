export const COLORS = {
  bg:            '#1a1d23',
  bgSecondary:   '#22262e',
  bgSidebar:     '#1e2128',
  bgInput:       '#2a2f3a',
  bgHover:       '#2d323d',
  bgActive:      '#3a3f4b',
  accent:        '#5865f2',
  accentLight:   '#7983f5',
  green:         '#3ba55d',
  red:           '#ed4245',
  yellow:        '#faa61a',
  textPrimary:   '#e3e5e8',
  textSecondary: '#a3a8b2',
  textMuted:     '#72767d',
  border:        '#2e3240',
  white:         '#ffffff',
};

const AVATAR_COLORS = [
  '#e74c3c','#3498db','#2ecc71','#9b59b6',
  '#f39c12','#1abc9c','#e67e22','#e91e63',
];

export const getAvatarColor = (username = '') => {
  let hash = 0;
  for (let i = 0; i < username.length; i++) hash += username.charCodeAt(i);
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
};

export const formatTime = (dateStr) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};
