const mongoose = require('mongoose');
const Message = require('../models/Message');

// Get total count of unread messages for logged in user
exports.getUnreadCount = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const count = await Message.countDocuments({
      receiverId: userId,
      isRead: false
    });
    res.json({ count });
  } catch (err) {
    next(err);
  }
};

// Mark conversation messages as read
exports.markAsRead = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { senderId, listingId } = req.body;
    const filter = { receiverId: userId, isRead: false };
    if (senderId && mongoose.Types.ObjectId.isValid(senderId)) {
      filter.senderId = senderId;
    }
    if (listingId && mongoose.Types.ObjectId.isValid(listingId)) {
      filter.listingId = listingId;
    }
    await Message.updateMany(filter, { isRead: true });
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};

// Get all messages involving the logged-in user, across all listings/conversations
exports.getAllMessages = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const messages = await Message.find({
      $or: [{ senderId: userId }, { receiverId: userId }]
    })
      .populate('senderId', 'username profileImage')
      .populate('receiverId', 'username profileImage')
      .sort({ createdAt: 1 });
    res.json(messages);
  } catch (err) {
    next(err);
  }
};

// Get messages for a specific listing or conversation
exports.getMessages = async (req, res, next) => {
  try {
    const { listingId } = req.params;
    const userId = req.user.id;
    
    let filter = {};
    if (listingId && mongoose.Types.ObjectId.isValid(listingId)) {
      filter = {
        listingId,
        $or: [{ senderId: userId }, { receiverId: userId }]
      };
    } else {
      filter = {
        $or: [{ senderId: userId }, { receiverId: userId }]
      };
    }
    
    const messages = await Message.find(filter)
      .populate('senderId', 'username profileImage')
      .populate('receiverId', 'username profileImage')
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (err) {
    next(err);
  }
};

// Send a new message
exports.sendMessage = async (req, res, next) => {
  try {
    const { text, receiverId } = req.body;
    const senderId = req.user.id;
    let listingId = req.params.listingId || req.body.listingId;

    if (!text || !text.trim()) {
      return res.status(400).json({ message: 'Message text cannot be empty' });
    }

    if (!receiverId) {
      return res.status(400).json({ message: 'Receiver ID is required' });
    }

    if (!mongoose.Types.ObjectId.isValid(receiverId)) {
      return res.status(400).json({ message: 'Invalid receiver ID' });
    }

    // Treat invalid or 'undefined'/'direct' listingId as null
    if (!listingId || !mongoose.Types.ObjectId.isValid(listingId)) {
      listingId = null;
    }

    const message = await Message.create({
      text: text.trim(),
      receiverId,
      listingId,
      senderId,
      isRead: false
    });

    res.status(201).json(message);
  } catch (err) {
    next(err);
  }
};
