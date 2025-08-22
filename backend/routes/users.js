const express = require('express');
const db = require('../config/database');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const bcrypt = require('bcryptjs');

const router = express.Router();

router.get('/', authenticateToken, authorizeRoles(['admin']), async (req, res) => {
  const { name, email, address, role, sortBy = 'name', order = 'asc' } = req.query;
  
  try {
    let query = `
      SELECT id, name, email, address, role, created_at 
      FROM users 
      WHERE 1=1
    `;
    const params = [];
    
    if (name) {
      query += ' AND name LIKE ?';
      params.push(`%${name}%`);
    }
    if (email) {
      query += ' AND email LIKE ?';
      params.push(`%${email}%`);
    }
    if (address) {
      query += ' AND address LIKE ?';
      params.push(`%${address}%`);
    }
    if (role) {
      query += ' AND role = ?';
      params.push(role);
    }
    
    const validSortColumns = ['name', 'email', 'address', 'role', 'created_at'];
    const sortColumn = validSortColumns.includes(sortBy) ? sortBy : 'name';
    const sortOrder = String(order).toLowerCase() === 'desc' ? 'DESC' : 'ASC';
    query += ` ORDER BY ${sortColumn} ${sortOrder}`;
    
    const results = await db.query(query, params);
    return res.json(results);
  } catch (err) {
    console.error('Get users error:', err);
    return res.status(500).json({ error: 'Database error' });
  }
});

router.post('/', authenticateToken, authorizeRoles(['admin']), async (req, res) => {
  const { name, email, password, address, role } = req.body;

  if (!name || !email || !password || !address) {
    return res.status(400).json({ error: 'Name, email, password, and address are required' });
  }

  if (name.length < 20) {
    return res.status(400).json({ error: 'Name must be at least 20 characters' });
  }

  if (name.length > 60) {
    return res.status(400).json({ error: 'Name must be no more than 60 characters' });
  }

  if (address.length > 400) {
    return res.status(400).json({ error: 'Address must be less than 400 characters' });
  }

  const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,16}$/;
  if (!passwordRegex.test(password)) {
    return res.status(400).json({ 
      error: 'Password must be 8-16 characters with at least one uppercase letter and one special character' 
    });
  }

  try {
    const existing = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing && existing.length > 0) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const insertResult = await db.query(
      'INSERT INTO users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)',
      [name, email, hashedPassword, address, role || 'user']
    );

    return res.status(201).json({ message: 'User created successfully', id: insertResult.insertId });
  } catch (err) {
    console.error('Create user error:', err);
    return res.status(500).json({ error: 'Error creating user' });
  }
});

router.get('/:id', authenticateToken, authorizeRoles(['admin']), async (req, res) => {
  const userId = req.params.id;
  
  try {
    const results = await db.query(
      `SELECT u.id, u.name, u.email, u.address, u.role, 
              AVG(r.rating) as average_rating
       FROM users u
       LEFT JOIN stores s ON u.id = s.owner_id
       LEFT JOIN ratings r ON s.id = r.store_id
       WHERE u.id = ?
       GROUP BY u.id`,
      [userId]
    );
    
    if (!results || results.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    return res.json(results[0]);
  } catch (err) {
    console.error('Get user error:', err);
    return res.status(500).json({ error: 'Database error' });
  }
});

router.put('/password', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const { currentPassword, newPassword } = req.body;
  
  try {
    const results = await db.query('SELECT password FROM users WHERE id = ?', [userId]);
    if (!results || results.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const user = results[0];
    const isValidPassword = await bcrypt.compare(currentPassword, user.password);
    
    if (!isValidPassword) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }
    
    const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,16}$/;
    if (!newPassword || !passwordRegex.test(newPassword)) {
      return res.status(400).json({ 
        error: 'New password must be 8-16 characters with at least one uppercase letter and one special character' 
      });
    }
    
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    
    await db.query(
      'UPDATE users SET password = ? WHERE id = ?',
      [hashedPassword, userId]
    );
    
    return res.json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error('Update password error:', err);
    return res.status(500).json({ error: 'Database error' });
  }
});

module.exports = router;