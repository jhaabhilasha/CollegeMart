const express = require('express');
const router = express.Router();
const { getMessages, sendMessage, getAllMessages, getUnreadCount, markAsRead } = require('../controllers/messageController');
const auth = require('../middleware/auth');

router.get('/', auth, getAllMessages);
router.get('/unread', auth, getUnreadCount);
router.post('/mark-read', auth, markAsRead);
router.post('/', auth, sendMessage);
router.get('/:listingId', auth, getMessages);
router.post('/:listingId', auth, sendMessage);

module.exports = router;
