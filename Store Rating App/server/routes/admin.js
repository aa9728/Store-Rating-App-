const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticate, authorize } = require('../middleware/auth');

// Dashboard stats
router.get('/dashboard', authenticate, authorize(['admin']), adminController.dashboardStats);

// List stores with filters
router.get('/stores', authenticate, authorize(['admin']), adminController.listStores);

// List users with filters
router.get('/users', authenticate, authorize(['admin']), adminController.listUsers);

module.exports = router; 