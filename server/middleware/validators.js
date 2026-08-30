const { body, param, validationResult } = require('express-validator');

// Middleware to check validation results
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }
  next();
};

// Auth validators
const signupValidator = [
  body('username')
    .trim()
    .notEmpty().withMessage('Username is required')
    .isLength({ min: 3, max: 30 }).withMessage('Username must be 3-30 characters'),
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('mobile')
    .trim()
    .notEmpty().withMessage('Mobile number is required')
    .matches(/^\d{10,15}$/).withMessage('Mobile must be 10-15 digits'),
  validate
];

const loginValidator = [
  body('password')
    .notEmpty().withMessage('Password is required'),
  body()
    .custom((value, { req }) => {
      if (!req.body.email && !req.body.mobile) {
        throw new Error('Email or mobile number is required');
      }
      return true;
    }),
  body('email')
    .optional()
    .isEmail().withMessage('Invalid email format')
    .normalizeEmail(),
  body('mobile')
    .optional()
    .matches(/^\d{10,15}$/).withMessage('Mobile must be 10-15 digits'),
  validate
];

const resetPasswordValidator = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format')
    .normalizeEmail(),
  validate
];

const verifyResetValidator = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format')
    .normalizeEmail(),
  body('otp')
    .trim()
    .notEmpty().withMessage('OTP is required')
    .isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits'),
  body('newPassword')
    .notEmpty().withMessage('New password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  validate
];

// Listing validators
const createListingValidator = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ min: 3, max: 100 }).withMessage('Title must be 3-100 characters'),
  body('description')
    .trim()
    .notEmpty().withMessage('Description is required')
    .isLength({ min: 10, max: 2000 }).withMessage('Description must be 10-2000 characters'),
  body('price')
    .notEmpty().withMessage('Price is required')
    .isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('category')
    .trim()
    .notEmpty().withMessage('Category is required'),
  body('condition')
    .trim()
    .notEmpty().withMessage('Condition is required')
    .isIn(['New', 'Like New', 'Good', 'Fair', 'Poor']).withMessage('Invalid condition value'),
  body('location')
    .trim()
    .notEmpty().withMessage('Location is required'),
  body('images')
    .optional()
    .isArray().withMessage('Images must be an array'),
  validate
];

const updateListingValidator = [
  param('id')
    .isMongoId().withMessage('Invalid listing ID'),
  body('title')
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 }).withMessage('Title must be 3-100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ min: 10, max: 2000 }).withMessage('Description must be 10-2000 characters'),
  body('price')
    .optional()
    .isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('condition')
    .optional()
    .trim()
    .isIn(['New', 'Like New', 'Good', 'Fair', 'Poor']).withMessage('Invalid condition value'),
  body('status')
    .optional()
    .trim()
    .isIn(['active', 'sold', 'archived']).withMessage('Invalid status value'),
  validate
];

const listingIdValidator = [
  param('id')
    .isMongoId().withMessage('Invalid listing ID'),
  validate
];

module.exports = {
  signupValidator,
  loginValidator,
  resetPasswordValidator,
  verifyResetValidator,
  createListingValidator,
  updateListingValidator,
  listingIdValidator
};
