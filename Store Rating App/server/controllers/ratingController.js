const db = require('../db/config');
const { validationResult } = require('express-validator');

exports.submitOrUpdateRating = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  const userId = req.user.id;
  const { store_id, rating } = req.body;
  
  // Check if store exists
  db.get('SELECT id FROM stores WHERE id = ?', [store_id], (err, store) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (!store) {
      return res.status(404).json({ error: 'Store not found' });
    }
    
    // Check if user already rated this store
    db.get('SELECT id FROM ratings WHERE user_id = ? AND store_id = ?', [userId, store_id], (err, existingRating) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      
      if (existingRating) {
        // Update existing rating
        db.run('UPDATE ratings SET rating = ? WHERE user_id = ? AND store_id = ?', 
          [rating, userId, store_id], (err) => {
          if (err) {
            return res.status(500).json({ error: 'Failed to update rating', details: err.message });
          }
          res.json({ message: 'Rating updated successfully', rating });
        });
      } else {
        // Insert new rating
        db.run('INSERT INTO ratings (user_id, store_id, rating) VALUES (?, ?, ?)', 
          [userId, store_id, rating], function(err) {
          if (err) {
            return res.status(500).json({ error: 'Failed to submit rating', details: err.message });
          }
          res.status(201).json({ message: 'Rating submitted successfully', rating });
        });
      }
    });
  });
};

exports.getUserRatingForStore = async (req, res) => {
  const userId = req.user.id;
  const { store_id } = req.params;
  
  db.get('SELECT rating FROM ratings WHERE user_id = ? AND store_id = ?', [userId, store_id], (err, rating) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json({ rating: rating ? rating.rating : null });
  });
}; 