const express = require('express');
const router = express.Router();
const ratingController = require('../controllers/ratingController');
const { body } = require('express-validator');
const { authenticate, authorize } = require('../middleware/auth');

// Submit or update rating (normal user)
router.post('/', authenticate, authorize(['user']), [
  body('store_id').isInt(),
  body('rating').isInt({ min: 1, max: 5 })
], ratingController.submitOrUpdateRating);

// Get user's rating for a store
router.get('/user/:store_id', authenticate, authorize(['user']), ratingController.getUserRatingForStore);

module.exports = router; 