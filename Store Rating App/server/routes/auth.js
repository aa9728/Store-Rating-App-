const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { body } = require('express-validator');

// Register (Normal User)
router.post('/register', [
  body('name').isLength({ min: 20, max: 60 }),
  body('email').isEmail(),
  body('address').isLength({ max: 400 }),
  body('password').isLength({ min: 8, max: 16 }).matches(/[A-Z]/).matches(/[^A-Za-z0-9]/)
], authController.register);

// Login (All roles)
router.post('/login', [
  body('email').isEmail(),
  body('password').exists()
], authController.login);

// Update password (Authenticated)
router.post('/update-password', [
  body('oldPassword').exists(),
  body('newPassword').isLength({ min: 8, max: 16 }).matches(/[A-Z]/).matches(/[^A-Za-z0-9]/)
], authController.updatePassword);

module.exports = router; 