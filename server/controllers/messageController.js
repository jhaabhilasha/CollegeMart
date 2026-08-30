const Message = require('../models/Message');

// Get all messages involving the logged-in user, across all listings/conversations
exports.getAllMessages = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const messages = await Message.find({
      $or: [{ senderId: userId }, { receiverId: userId }]
    }).sort({ createdAt: 1 });
    res.json(messages);
  } catch (err) {
    next(err);
  }
};

exports.getMessages = async (req, res, next) => {
  try {
    const messages = await Message.find({ listingId: req.params.listingId });
    res.json(messages);
  } catch (err) {
    next(err);
  }
};

exports.sendMessage = async (req, res, next) => {
  try {
    // Always use listingId from params, not from body
    const { text, receiverId } = req.body;
    const senderId = req.user.id;
    const listingId = req.params.listingId;
    if (!text || !receiverId || !listingId) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    const message = await Message.create({ text, receiverId, listingId, senderId });
    res.status(201).json(message);
  } catch (err) {
    next(err);
  }
};
