const db = require('./config');
const fs = require('fs');
const path = require('path');

// Read the schema file
const schemaPath = path.join(__dirname, 'schema.sql');
const schema = fs.readFileSync(schemaPath, 'utf8');

// Split the schema into individual statements
const statements = schema.split(';').filter(stmt => stmt.trim());

// Execute each statement
statements.forEach(statement => {
  if (statement.trim()) {
    db.run(statement, (err) => {
      if (err) {
        console.error('Error executing statement:', err.message);
        console.error('Statement:', statement);
      } else {
        console.log('Successfully executed:', statement.substring(0, 50) + '...');
      }
    });
  }
});

// Create a default admin user
const bcrypt = require('bcryptjs');
const defaultAdminPassword = 'Admin@123'; // Change this in production

bcrypt.hash(defaultAdminPassword, 10, (err, hashedPassword) => {
  if (err) {
    console.error('Error hashing password:', err);
    return;
  }

  const adminUser = {
    name: 'System Administrator',
    email: 'admin@storeapp.com',
    password: hashedPassword,
    address: 'System Address',
    role: 'admin'
  };

  db.run(`
    INSERT OR IGNORE INTO users (name, email, password, address, role)
    VALUES (?, ?, ?, ?, ?)
  `, [adminUser.name, adminUser.email, adminUser.password, adminUser.address, adminUser.role], (err) => {
    if (err) {
      console.error('Error creating admin user:', err.message);
    } else {
      console.log('Default admin user created or already exists');
      console.log('Email: admin@storeapp.com');
      console.log('Password: Admin@123');
    }
  });
});

console.log('Database initialization completed!'); 