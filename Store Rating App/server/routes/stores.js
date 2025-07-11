const express = require('express');
const router = express.Router();
const storeController = require('../controllers/storeController');
const { body } = require('express-validator');
const { authenticate, authorize } = require('../middleware/auth');

// Admin: Add new store
router.post('/', authenticate, authorize(['admin']), [
  body('name').isLength({ min: 1, max: 60 }),
  body('email').isEmail(),
  body('address').isLength({ max: 400 }),
  body('owner_id').optional().isInt()
], storeController.addStore);

// List/search/filter stores (all users)
router.get('/', authenticate, storeController.listStores);

// Store details (with ratings)
router.get('/:id', authenticate, storeController.getStoreDetails);

// Store owner: View ratings for their store
router.get('/owner/ratings', authenticate, authorize(['owner']), storeController.getOwnerStoreRatings);

module.exports = router; 