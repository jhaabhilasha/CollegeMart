const mongoose = require('mongoose');
const MONGO_URI = process.env.MONGO_URI || 'mongodb://192.168.131.64:27017/CollegeConnect';

mongoose.connect(MONGO_URI).then(async () => {
  try {
    const result = await mongoose.connection.db.collection('users').dropIndex('username_1');
    console.log('Drop index result:', result);
  } catch (e) {
    console.error('Error dropping index:', e.message);
  }
  process.exit(0);
});
