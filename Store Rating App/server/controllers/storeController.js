const db = require('../db/config');
const { validationResult } = require('express-validator');

exports.addStore = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  const { name, email, address, owner_id } = req.body;
  
  // Check if store already exists
  db.get('SELECT id FROM stores WHERE email = ?', [email], (err, row) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (row) {
      return res.status(400).json({ error: 'Store with this email already exists' });
    }
    
    db.run(
      'INSERT INTO stores (name, email, address, owner_id) VALUES (?, ?, ?, ?)',
      [name, email, address, owner_id || null],
      function(err) {
        if (err) {
          return res.status(500).json({ error: 'Failed to add store', details: err.message });
        }
        res.status(201).json({ 
          message: 'Store added successfully',
          store: { id: this.lastID, name, email, address, owner_id }
        });
      }
    );
  });
};

exports.listStores = async (req, res) => {
  const { name, address } = req.query;
  let query = `
    SELECT s.*, 
           AVG(r.rating) as average_rating, 
           COUNT(r.id) as total_ratings
    FROM stores s 
    LEFT JOIN ratings r ON s.id = r.store_id 
    WHERE 1=1
  `;
  const params = [];
  
  if (name) {
    query += ' AND s.name LIKE ?';
    params.push(`%${name}%`);
  }
  if (address) {
    query += ' AND s.address LIKE ?';
    params.push(`%${address}%`);
  }
  
  query += ' GROUP BY s.id ORDER BY s.name ASC';
  
  db.all(query, params, (err, stores) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch stores', details: err.message });
    }
    res.json(stores);
  });
};

exports.getStoreDetails = async (req, res) => {
  const { id } = req.params;
  
  db.get(`
    SELECT s.*, 
           AVG(r.rating) as average_rating, 
           COUNT(r.id) as total_ratings
    FROM stores s 
    LEFT JOIN ratings r ON s.id = r.store_id 
    WHERE s.id = ?
    GROUP BY s.id
  `, [id], (err, store) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (!store) {
      return res.status(404).json({ error: 'Store not found' });
    }
    res.json(store);
  });
};

exports.getOwnerStoreRatings = async (req, res) => {
  const userId = req.user.id;
  
  // Get store owned by this user
  db.get('SELECT * FROM stores WHERE owner_id = ?', [userId], (err, store) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (!store) {
      return res.status(404).json({ error: 'No store found for this user' });
    }
    
    // Get ratings for this store
    db.all(`
      SELECT r.*, u.name as user_name
      FROM ratings r
      JOIN users u ON r.user_id = u.id
      WHERE r.store_id = ?
      ORDER BY r.created_at DESC
    `, [store.id], (err, ratings) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      
      // Calculate average rating
      const totalRating = ratings.reduce((sum, r) => sum + r.rating, 0);
      const averageRating = ratings.length > 0 ? totalRating / ratings.length : 0;
      
      res.json({
        store: { ...store, average_rating: averageRating },
        ratings: ratings
      });
    });
  });
}; 