const express = require('express');
const router = express.Router();
const { getUser, updateUser } = require('../controllers/userController');
const auth = require('../middleware/auth');

// Add endpoint to get all users (for chat modal)
router.get('/', async (req, res, next) => {
  try {
    const User = require('../models/user');
    // Only return id, username, email, and profileImage for privacy
    const users = await User.find({}, '_id username email profileImage');
    res.json(users);
  } catch (err) {
    next(err);
  }
});

router.get('/:id', getUser);
router.put('/:id', auth, updateUser);

module.exports = router;
