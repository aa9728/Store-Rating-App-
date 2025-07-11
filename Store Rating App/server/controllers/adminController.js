const db = require('../db/config');

exports.dashboardStats = async (req, res) => {
  // Get total users
  db.get('SELECT COUNT(*) as totalUsers FROM users', (err, userCount) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    // Get total stores
    db.get('SELECT COUNT(*) as totalStores FROM stores', (err, storeCount) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      
      // Get total ratings
      db.get('SELECT COUNT(*) as totalRatings FROM ratings', (err, ratingCount) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }
        
        res.json({
          totalUsers: userCount.totalUsers,
          totalStores: storeCount.totalStores,
          totalRatings: ratingCount.totalRatings
        });
      });
    });
  });
};

exports.listStores = async (req, res) => {
  const { name, email, address } = req.query;
  let query = `
    SELECT s.*, 
           AVG(r.rating) as average_rating, 
           COUNT(r.id) as total_ratings,
           u.name as owner_name
    FROM stores s 
    LEFT JOIN ratings r ON s.id = r.store_id 
    LEFT JOIN users u ON s.owner_id = u.id
    WHERE 1=1
  `;
  const params = [];
  
  if (name) {
    query += ' AND s.name LIKE ?';
    params.push(`%${name}%`);
  }
  if (email) {
    query += ' AND s.email LIKE ?';
    params.push(`%${email}%`);
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