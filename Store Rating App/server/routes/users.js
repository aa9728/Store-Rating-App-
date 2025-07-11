const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { body } = require('express-validator');
const { authenticate, authorize } = require('../middleware/auth');

// Admin: Add new user (admin or normal)
router.post('/', authenticate, authorize(['admin']), [
  body('name').isLength({ min: 20, max: 60 }),
  body('email').isEmail(),
  body('address').isLength({ max: 400 }),
  body('password').isLength({ min: 8, max: 16 }).matches(/[A-Z]/).matches(/[^A-Za-z0-9]/),
  body('role').isIn(['admin', 'user', 'owner'])
], userController.addUser);

// Admin: List/filter users
router.get('/', authenticate, authorize(['admin']), userController.listUsers);

// Admin: View user details
router.get('/:id', authenticate, authorize(['admin']), userController.getUserDetails);

module.exports = router; 