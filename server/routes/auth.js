const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');
const { 
  signupValidator, 
  loginValidator, 
  resetPasswordValidator, 
  verifyResetValidator 
} = require('../middleware/validators');

// Rate limiter for login - configurable with sensible defaults (20 attempts in dev)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_LOGIN_MAX, 10) || 20,
  message: { message: 'Too many login attempts. Please try again after 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter for signup - configurable (10 signups per hour)
const signupLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: parseInt(process.env.RATE_LIMIT_SIGNUP_MAX, 10) || 10,
  message: { message: 'Too many accounts created. Please try again after an hour.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter for password reset
const resetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_RESET_MAX, 10) || 10,
  message: { message: 'Too many password reset attempts. Please try again after 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter for email verification
const verifyEmailLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: { message: 'Too many verification attempts. Please try again after 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Session & User profile
router.get('/me', auth, authController.getCurrentUser);

// Login & Signup
router.post('/login', loginLimiter, loginValidator, authController.login);
router.post('/signup', signupLimiter, signupValidator, authController.signup);

// OTP Login
router.post('/send-otp', resetLimiter, authController.sendLoginOtp);
router.post('/login-otp', loginLimiter, authController.loginWithOtp);

// Email Verification
router.post('/verify-email', verifyEmailLimiter, authController.verifyEmail);
router.post('/resend-verification', verifyEmailLimiter, authController.resendVerificationEmail);

// Password Reset
router.post('/request-reset', resetLimiter, resetPasswordValidator, authController.requestPasswordReset);
router.post('/verify-reset', resetLimiter, verifyResetValidator, authController.verifyOtpAndResetPassword);

module.exports = router;
