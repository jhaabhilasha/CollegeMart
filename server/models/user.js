const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: [true, 'Username is required'] },
  password: { type: String, required: [true, 'Password is required'] },
  email: { type: String, required: [true, 'Email is required'], unique: [true, 'Email already exists'] },
  mobile: { type: String, required: [true, 'Mobile number is required'], unique: [true, 'Mobile number already exists'] },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  profileImage: { type: String, default: null },
  bio: { type: String, default: '' },
  college: { type: String, default: '' },
  studentId: { type: String, default: '' },
  year: { type: String, default: '' },
  department: { type: String, default: '' },
  isEmailVerified: { type: Boolean, default: false },
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  resetOtp: String,
  resetOtpExpires: Date,
  loginOtp: String,
  loginOtpExpires: Date,
});

// Hash password before saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Sanitize mobile before saving (store only digits)
UserSchema.pre('save', function (next) {
  if (this.isModified('mobile') && this.mobile) {
    this.mobile = String(this.mobile).replace(/\D/g, '');
  }
  next();
});

// Compare password method
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Generate email verification token
UserSchema.methods.generateVerificationToken = function () {
  const token = crypto.randomBytes(32).toString('hex');
  this.emailVerificationToken = crypto.createHash('sha256').update(token).digest('hex');
  this.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
  return token;
};

module.exports = mongoose.models.User || mongoose.model('User', UserSchema);