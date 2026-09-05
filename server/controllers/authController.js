const User = require('../models/user');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { sendMail, sendOtpEmail, sendAccountVerificationEmail } = require('../utils/mailer');

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
    
    // Send verification email safely
    try {
      const verifyUrl = `${getFrontendUrl()}/verify-email?token=${verificationToken}`;
      await sendAccountVerificationEmail(email, verifyUrl);
    } catch (emailErr) {
      console.warn('Could not send verification email on signup (account created successfully):', emailErr.message);
    }
    
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    // Return user object with id, name, email, role, and profileImage
    res.status(201).json({
      user: {
        id: user._id,
        name: user.username,
        email: user.email,
        role: user.role || 'user',
        mobile: user.mobile,
        bio: user.bio || '',
        college: user.college || '',
        year: user.year || '',
        department: user.department || '',
        isEmailVerified: user.isEmailVerified,
        profileImage: user.profileImage || null,
      },
      token,
      message: 'Account created! Please verify your email.'
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
    const { email, mobile, password, rememberMe } = req.body;
    // Sanitize mobile: allow only digits if provided
    const sanitizedMobile = mobile ? String(mobile).replace(/\D/g, '') : undefined;
    let user = null;
    if (sanitizedMobile) {
      user = await User.findOne({ mobile: sanitizedMobile });
    } else if (email) {
      user = await User.findOne({ email });
    }
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials. Please check your email/mobile and password.' });
    }
    const expiresIn = rememberMe ? '30d' : '7d';
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn });
    res.json({
      user: {
        id: user._id,
        name: user.username,
        email: user.email,
        role: user.role || 'user',
        mobile: user.mobile,
        bio: user.bio || '',
        college: user.college || '',
        year: user.year || '',
        department: user.department || '',
        isEmailVerified: user.isEmailVerified,
        profileImage: user.profileImage || null,
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
    await sendAccountVerificationEmail(email, verifyUrl);
    
    res.json({ message: 'Verification email sent!' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to send verification email' });
  }
};

exports.requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email address is required' });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'No account found with this email address' });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetOtp = otp;
    user.resetOtpExpires = Date.now() + 10 * 60 * 1000; // 10 min
    await user.save();

    try {
      await sendOtpEmail(email, otp, 'Password Reset');
    } catch (mailErr) {
      console.warn('Failed to send reset OTP email via SendGrid:', mailErr.message);
    }

    res.json({ message: 'OTP sent to your email. Please enter the OTP to reset your password.' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to process password reset request' });
  }
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

// Get current authenticated user profile
exports.getCurrentUser = async (req, res) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ message: 'Not authenticated' });
    res.json({
      user: {
        id: user._id,
        name: user.username,
        email: user.email,
        role: user.role || 'user',
        mobile: user.mobile,
        isEmailVerified: user.isEmailVerified,
        profileImage: user.profileImage || null,
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to retrieve current user profile' });
  }
};

// Send OTP for Login
exports.sendLoginOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email address is required' });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'No account found with this email address' });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.loginOtp = otp;
    user.loginOtpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();

    try {
      await sendOtpEmail(email, otp, 'Login');
    } catch (err) {
      console.warn('Failed to send login OTP email:', err.message);
    }

    res.json({ message: 'OTP sent to your email' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to send login OTP' });
  }
};

// Login with OTP
exports.loginWithOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ message: 'Email and OTP are required' });

    const user = await User.findOne({
      email,
      loginOtp: otp,
      loginOtpExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    user.loginOtp = undefined;
    user.loginOtpExpires = undefined;
    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({
      user: {
        id: user._id,
        name: user.username,
        email: user.email,
        role: user.role || 'user',
        mobile: user.mobile,
        bio: user.bio || '',
        college: user.college || '',
        year: user.year || '',
        department: user.department || '',
        isEmailVerified: user.isEmailVerified,
        profileImage: user.profileImage || null,
      },
      token
    });
  } catch (err) {
    res.status(500).json({ message: 'OTP login failed' });
  }
};

// Get Current User (Session / Profile check)
exports.getCurrentUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id || req.user._id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({
      user: {
        id: user._id,
        name: user.username,
        email: user.email,
        role: user.role || 'user',
        mobile: user.mobile,
        bio: user.bio || '',
        college: user.college || '',
        year: user.year || '',
        department: user.department || '',
        isEmailVerified: user.isEmailVerified,
        profileImage: user.profileImage || null,
      }
    });
  } catch (err) {
    next(err);
  }
};

