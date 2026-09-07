const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    room: {
      type: String,
      required: [true, 'Room is required'],
      index: true,
    },
    sender: {
      type: String,
      required: [true, 'Sender is required'],
    },
    senderId: {
      type: String,
      default: '',
    },
    content: {
      type: String,
      required: [true, 'Message content is required'],
      trim: true,
      maxlength: [1000, 'Message cannot exceed 1000 characters'],
    },
    messageType: {
      type: String,
      enum: ['text', 'system'],
      default: 'text',
    },
    readBy: [
      {
        type: String,
      },
    ],
  },
  { timestamps: true }
);

// Index for efficient room-based queries
messageSchema.index({ room: 1, createdAt: -1 });

module.exports = mongoose.model('Message', messageSchema);
