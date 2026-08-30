const mongoose = require('mongoose');
const MONGO_URI = process.env.MONGO_URI || 'mongodb://192.168.131.64:27017/CollegeConnect';

mongoose.connect(MONGO_URI).then(async () => {
  try {
    const indexes = await mongoose.connection.db.collection('users').indexes();
    console.log('User collection indexes:', indexes);
  } catch (e) {
    console.error('Error getting indexes:', e.message);
  }
  process.exit(0);
});
