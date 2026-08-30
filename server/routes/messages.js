const express = require('express');
const router = express.Router();
const { getMessages, sendMessage, getAllMessages } = require('../controllers/messageController');
const auth = require('../middleware/auth');

router.get('/', auth, getAllMessages);
router.get('/:listingId', auth, getMessages);
router.post('/:listingId', auth, sendMessage);

module.exports = router;
