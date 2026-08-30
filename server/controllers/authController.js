const User = require('../models/user');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { sendMail } = require('../utils/mailer');

// Get frontend URL for email links
const getFrontendUrl = () => process.env.FRONTEND_URL || 'http://localhost:5173';

exports.signup = async (req, res, next) => {
  try {
    const { username, email, password, mobile } = req.body;
    // Sanitize mobile: allow only digits if provided
    const sanitizedMobile = mobile ? String(mobile).replace(/\D/g, '') : undefined;
    const user = await User.create({ username, email, password, mobile: sanitizedMobile });
    
    // Generate email verification token
    const verificationToken = user.generateVerificationToken();
    await user.save();
    
    // Send verification email
    const verifyUrl = `${getFrontendUrl()}/verify-email?token=${verificationToken}`;
    await sendMail(
      email,
      'Verify Your Email - CollegeConnect',
      `Welcome to CollegeConnect!\n\nPlease verify your email by clicking the link below:\n\n${verifyUrl}\n\nThis link will expire in 24 hours.\n\nIf you didn't create an account, please ignore this email.`
    );
    
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    // Return user object with id, name, email, and role
    res.status(201).json({
      user: {
        id: user._id,
        name: user.username,
        email: user.email,
        role: user.role || 'user',
        mobile: user.mobile,
        isEmailVerified: user.isEmailVerified,
      },
      token,
      message: 'Account created! Please check your email to verify your account.'
    });
  } catch (err) {
    // Handle duplicate key error (email, username, or mobile)
    if (err.code === 11000) {
      const dupField = Object.keys(err.keyValue)[0];
      return res.status(400).json({ message: `${dupField.charAt(0).toUpperCase() + dupField.slice(1)} already exists` });
    }
    // Handle validation errors
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(e => e.message).join(', ');
      return res.status(400).json({ message: messages });
    }
    // Fallback to generic error
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, mobile, password } = req.body;
    // Sanitize mobile: allow only digits if provided
    const sanitizedMobile = mobile ? String(mobile).replace(/\D/g, '') : undefined;
    let user = null;
    if (sanitizedMobile) {
      user = await User.findOne({ mobile: sanitizedMobile });
    } else if (email) {
      user = await User.findOne({ email });
    }
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({
      user: {
        id: user._id,
        name: user.username,
        email: user.email,
        role: user.role || 'user',
        mobile: user.mobile,
        isEmailVerified: user.isEmailVerified,
      },
      token
    });
  } catch (err) {
    next(err);
  }
};

exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({ message: 'Verification token is required' });
    }
    
    // Hash the token to compare with stored hash
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    
    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpires: { $gt: Date.now() }
    });
    
    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired verification token' });
    }
    
    // Mark email as verified
    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();
    
    res.json({ message: 'Email verified successfully!' });
  } catch (err) {
    res.status(500).json({ message: 'Email verification failed' });
  }
};

exports.resendVerificationEmail = async (req, res) => {
  try {
    const { email } = req.body;
    
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (user.isEmailVerified) {
      return res.status(400).json({ message: 'Email is already verified' });
    }
    
    // Generate new verification token
    const verificationToken = user.generateVerificationToken();
    await user.save();
    
    // Send verification email
    const verifyUrl = `${getFrontendUrl()}/verify-email?token=${verificationToken}`;
    await sendMail(
      email,
      'Verify Your Email - CollegeConnect',
      `Please verify your email by clicking the link below:\n\n${verifyUrl}\n\nThis link will expire in 24 hours.`
    );
    
    res.json({ message: 'Verification email sent!' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to send verification email' });
  }
};

exports.requestPasswordReset = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: 'User not found' });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  user.resetOtp = otp;
  user.resetOtpExpires = Date.now() + 10 * 60 * 1000; // 10 min
  await user.save();

  await sendMail(email, 'Your OTP', `Your OTP is: ${otp}`);
  res.json({ message: 'OTP sent to email' });
};

exports.verifyOtpAndResetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;
  const user = await User.findOne({
    email,
    resetOtp: otp,
    resetOtpExpires: { $gt: Date.now() }
  });
  if (!user) return res.status(400).json({ message: 'Invalid or expired OTP' });

  user.password = newPassword;
  user.resetOtp = undefined;
  user.resetOtpExpires = undefined;
  await user.save();

  res.json({ message: 'Password reset successful' });
};
