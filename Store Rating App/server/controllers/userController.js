const db = require('../db/config');
const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');

exports.addUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  const { name, email, address, password, role } = req.body;
  
  // Check if user already exists
  db.get('SELECT id FROM users WHERE email = ?', [email], async (err, row) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (row) {
      return res.status(400).json({ error: 'Email already registered' });
    }
    
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      db.run(
        'INSERT INTO users (name, email, address, password, role) VALUES (?, ?, ?, ?, ?)',
        [name, email, address, hashedPassword, role],
        function(err) {
          if (err) {
            return res.status(500).json({ error: 'Failed to add user', details: err.message });
          }
          res.status(201).json({ 
            message: 'User added successfully',
            user: { id: this.lastID, name, email, address, role }
          });
        }
      );
    } catch (err) {
      res.status(500).json({ error: 'Failed to add user', details: err.message });
    }
  });
};

exports.listUsers = async (req, res) => {
  const { name, email, role } = req.query;
  let query = 'SELECT id, name, email, address, role, created_at FROM users WHERE 1=1';
  const params = [];
  
  if (name) {
    query += ' AND name LIKE ?';
    params.push(`%${name}%`);
  }
  if (email) {
    query += ' AND email LIKE ?';
    params.push(`%${email}%`);
  }
  if (role) {
    query += ' AND role = ?';
    params.push(role);
  }
  
  query += ' ORDER BY name ASC';
  
  db.all(query, params, (err, users) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch users', details: err.message });
    }
    res.json(users);
  });
};

exports.getUserDetails = async (req, res) => {
  const { id } = req.params;
  
  db.get('SELECT id, name, email, address, role, created_at FROM users WHERE id = ?', [id], (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // If user is a store owner, get their store rating
    if (user.role === 'owner') {
      db.get(`
        SELECT s.name as store_name, s.address as store_address, 
               AVG(r.rating) as average_rating, COUNT(r.id) as total_ratings
        FROM stores s 
        LEFT JOIN ratings r ON s.id = r.store_id 
        WHERE s.owner_id = ?
        GROUP BY s.id
      `, [id], (err, storeData) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }
        res.json({ ...user, store: storeData });
      });
    } else {
      res.json(user);
    }
  });
}; 