const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const authController = require('../controllers/authController');
const { 
  signupValidator, 
  loginValidator, 
  resetPasswordValidator, 
  verifyResetValidator 
} = require('../middleware/validators');

// Rate limiter for login - 5 attempts per 15 minutes per IP
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts
  message: { message: 'Too many login attempts. Please try again after 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter for signup - 3 signups per hour per IP
const signupLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 attempts
  message: { message: 'Too many accounts created. Please try again after an hour.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter for password reset - 3 attempts per 15 minutes per IP
const resetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // 3 attempts
  message: { message: 'Too many password reset attempts. Please try again after 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter for email verification - 5 attempts per 15 minutes per IP
const verifyEmailLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts
  message: { message: 'Too many verification attempts. Please try again after 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/login', loginLimiter, loginValidator, authController.login);
router.post('/signup', signupLimiter, signupValidator, authController.signup);
router.post('/verify-email', verifyEmailLimiter, authController.verifyEmail);
router.post('/resend-verification', verifyEmailLimiter, authController.resendVerificationEmail);
router.post('/request-reset', resetLimiter, resetPasswordValidator, authController.requestPasswordReset);
router.post('/verify-reset', resetLimiter, verifyResetValidator, authController.verifyOtpAndResetPassword);

module.exports = router;
