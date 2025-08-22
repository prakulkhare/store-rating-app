const express = require('express');
const bcrypt = require('bcryptjs');
const { validateUser } = require('../middleware/validation');
const jwt = require('jsonwebtoken');
const { authenticateToken } = require('../middleware/auth');
const db = require('../config/database');

const router = express.Router();

// Register endpoint
router.post('/register', validateUser, async (req, res) => {
  const { name, email, password, address, role } = req.body; // accept role if sent
  try {
    const rows = await db.execute('SELECT id FROM users WHERE email = ?', [email]);
    if (rows.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    // Default role to 'user' if not provided
    const userRole = role || 'user';
    await db.execute(
      'INSERT INTO users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)',
      [name, email, hashedPassword, address, userRole]
    );
    // Fetch inserted user to get id
    const inserted = await db.execute('SELECT id, name, email, address, role FROM users WHERE email = ?', [email]);
    const user = inserted[0];
    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );
    res.status(201).json({ 
      message: 'User registered successfully',
      token,
      user: { id: user.id, name: user.name, email: user.email, address: user.address, role: user.role }
    });
  } catch (err) {
    console.error('Register DB error:', err);
    res.status(500).json({ error: 'Database error', details: err.message, sql: err.sqlMessage });
  }
});

// Login endpoint
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const rows = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
    console.log('Login query result:', rows); // Debug log
    if (!rows || !Array.isArray(rows) || rows.length === 0) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }
    const user = rows[0];
    if (!user || !user.password) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }
    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );
    res.json({ message: 'Login successful', token, user: { id: user.id, name: user.name, email: user.email, address: user.address, role: user.role } });
  } catch (err) {
    console.error('Login DB error:', err);
    res.status(500).json({ error: 'Database error', details: err.message, sql: err.sqlMessage });
  }
});

// Verify token and return current user
router.get('/verify', authenticateToken, async (req, res) => {
  try {
    const rows = await db.execute('SELECT id, name, email, address, role FROM users WHERE id = ?', [req.user.id]);
    if (!rows || rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ user: rows[0] });
  } catch (err) {
    console.error('Verify error:', err);
    res.status(500).json({ error: 'Database error', details: err.message, sql: err.sqlMessage });
  }
});

module.exports = router;