const jwt = require('jsonwebtoken');
const Message = require('../models/Message');
const Room = require('../models/Room');

// Track online users per room: { roomName: Map<socketId, { username, userId }> }
const roomUsers = {};

/**
 * Get array of user objects for a room
 */
const getRoomUserList = (room) => {
  if (!roomUsers[room]) return [];
  return Array.from(roomUsers[room].values());
};

/**
 * Main socket event handler
 */
const handleSocketEvents = (io) => {
  // Middleware: authenticate socket connection
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;
    if (!token) {
      return next(new Error('Authentication token missing'));
    }
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded;
      next();
    } catch (err) {
      next(new Error('Invalid authentication token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`🔌 User connected: ${socket.user.username} (${socket.id})`);

    // ─────────────────────────────────────────────
    // JOIN ROOM
    // ─────────────────────────────────────────────
    socket.on('joinRoom', async ({ room }) => {
      if (!room) return;

      // Leave previous rooms (keep socket.rooms excluding socket.id)
      const previousRooms = Array.from(socket.rooms).filter((r) => r !== socket.id);
      previousRooms.forEach((prevRoom) => {
        socket.leave(prevRoom);
        if (roomUsers[prevRoom]) {
          roomUsers[prevRoom].delete(socket.id);
          // Notify remaining users
          io.to(prevRoom).emit('onlineUsers', {
            room: prevRoom,
            users: getRoomUserList(prevRoom),
          });
          // System message
          io.to(prevRoom).emit('systemMessage', {
            content: `${socket.user.username} left the room`,
            room: prevRoom,
            timestamp: new Date(),
          });
        }
      });

      // Join new room
      socket.join(room);

      // Track user in room
      if (!roomUsers[room]) roomUsers[room] = new Map();
      roomUsers[room].set(socket.id, {
        socketId: socket.id,
        username: socket.user.username,
        userId: socket.user.id,
        isGuest: socket.user.isGuest || false,
      });

      // Send updated online users list to everyone in room
      io.to(room).emit('onlineUsers', {
        room,
        users: getRoomUserList(room),
      });

      // System message: user joined
      socket.to(room).emit('systemMessage', {
        content: `${socket.user.username} joined the room`,
        room,
        timestamp: new Date(),
      });

      // Load and send chat history
      try {
        const history = await Message.find({ room })
          .sort({ createdAt: -1 })
          .limit(50)
          .lean();
        socket.emit('chatHistory', { room, messages: history.reverse() });
      } catch (err) {
        console.error('Error loading chat history:', err);
      }

      socket.emit('joinedRoom', { room, username: socket.user.username });
      console.log(`👤 ${socket.user.username} joined room: ${room}`);
    });

    // ─────────────────────────────────────────────
    // CHAT MESSAGE
    // ─────────────────────────────────────────────
    socket.on('chatMessage', async ({ room, content }) => {
      if (!room || !content || !content.trim()) return;

      const messageData = {
        room,
        sender: socket.user.username,
        senderId: socket.user.id,
        content: content.trim(),
        messageType: 'text',
      };

      try {
        const savedMessage = await Message.create(messageData);

        const payload = {
          _id: savedMessage._id,
          room,
          sender: socket.user.username,
          senderId: socket.user.id,
          content: content.trim(),
          createdAt: savedMessage.createdAt,
          messageType: 'text',
        };

        // Broadcast to everyone in the room (including sender)
        io.to(room).emit('chatMessage', payload);
        console.log(`💬 [${room}] ${socket.user.username}: ${content.trim()}`);
      } catch (err) {
        console.error('Error saving message:', err);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // ─────────────────────────────────────────────
    // TYPING INDICATOR
    // ─────────────────────────────────────────────
    socket.on('typing', ({ room, isTyping }) => {
      if (!room) return;
      socket.to(room).emit('typing', {
        username: socket.user.username,
        isTyping,
        room,
      });
    });

    // ─────────────────────────────────────────────
    // DISCONNECT
    // ─────────────────────────────────────────────
    socket.on('disconnect', () => {
      console.log(`❌ User disconnected: ${socket.user.username} (${socket.id})`);

      // Remove user from all rooms they were in
      Object.keys(roomUsers).forEach((room) => {
        if (roomUsers[room] && roomUsers[room].has(socket.id)) {
          roomUsers[room].delete(socket.id);

          // Update online users for remaining room members
          io.to(room).emit('onlineUsers', {
            room,
            users: getRoomUserList(room),
          });

          // System message
          io.to(room).emit('systemMessage', {
            content: `${socket.user.username} left the room`,
            room,
            timestamp: new Date(),
          });

          // Clean up empty rooms from tracking
          if (roomUsers[room].size === 0) {
            delete roomUsers[room];
          }
        }
      });
    });

    // ─────────────────────────────────────────────
    // GET ONLINE USERS (on demand)
    // ─────────────────────────────────────────────
    socket.on('getOnlineUsers', ({ room }) => {
      if (!room) return;
      socket.emit('onlineUsers', {
        room,
        users: getRoomUserList(room),
      });
    });
  });
};

module.exports = { handleSocketEvents };
