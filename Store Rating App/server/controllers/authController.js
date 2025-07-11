const db = require('../db/config');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

exports.register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { name, email, address, password } = req.body;
  
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
        [name, email, address, hashedPassword, 'user'],
        function(err) {
          if (err) {
            return res.status(500).json({ error: 'Registration failed', details: err.message });
          }
          
          const token = jwt.sign({ id: this.lastID, role: 'user' }, process.env.JWT_SECRET, { expiresIn: '1d' });
          res.status(201).json({ 
            user: { id: this.lastID, name, email, address, role: 'user' }, 
            token 
          });
        }
      );
    } catch (err) {
      res.status(500).json({ error: 'Registration failed', details: err.message });
    }
  });
};

exports.login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { email, password } = req.body;
  
  db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }
    
    try {
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ error: 'Invalid credentials' });
      }
      
      const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
      res.json({ 
        user: { 
          id: user.id, 
          name: user.name, 
          email: user.email, 
          address: user.address, 
          role: user.role 
        }, 
        token 
      });
    } catch (err) {
      res.status(500).json({ error: 'Login failed', details: err.message });
    }
  });
};

exports.updatePassword = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const userId = req.user.id;
  const { oldPassword, newPassword } = req.body;
  
  db.get('SELECT password FROM users WHERE id = ?', [userId], async (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    try {
      const isMatch = await bcrypt.compare(oldPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ error: 'Old password is incorrect' });
      }
      
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      db.run('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, userId], (err) => {
        if (err) {
          return res.status(500).json({ error: 'Password update failed', details: err.message });
        }
        res.json({ message: 'Password updated successfully' });
      });
    } catch (err) {
      res.status(500).json({ error: 'Password update failed', details: err.message });
    }
  });
}; 