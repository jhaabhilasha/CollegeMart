const mongoose = require('mongoose');
const MONGO_URI = process.env.MONGO_URI || 'mongodb://192.168.131.64:27017/CollegeConnect';

mongoose.connect(MONGO_URI).then(async () => {
  try {
    const emailResult = await mongoose.connection.db.collection('users').dropIndex('email_1').catch(e => e.message);
    const mobileResult = await mongoose.connection.db.collection('users').dropIndex('mobile_1').catch(e => e.message);
    console.log('Drop email_1 index result:', emailResult);
    console.log('Drop mobile_1 index result:', mobileResult);
  } catch (e) {
    console.error('Error dropping indexes:', e.message);
  }
  process.exit(0);
});
