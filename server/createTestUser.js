const mongoose = require('mongoose');
const User = require('./models/user');
const MONGO_URI = process.env.MONGO_URI || 'mongodb://192.168.131.64:27017/CollegeConnect';

async function run() {
  await mongoose.connect(MONGO_URI);
  try {
    const user = await User.create({
      username: 'testuser',
      password: 'TestPass123!',
      email: 'testuser' + Math.floor(Math.random()*10000) + '@example.com',
      mobile: '99999' + Math.floor(Math.random()*10000),
      role: 'user'
    });
    console.log('Created user:', user);
  } catch (e) {
    console.error('Error creating user:', e.message);
  }
  process.exit(0);
}
run();
