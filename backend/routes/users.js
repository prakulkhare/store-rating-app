const express = require('express');
const db = require('../config/database');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticateToken, authorizeRoles(['admin']), (req, res) => {
  const { name, email, address, role, sortBy = 'name', order = 'asc' } = req.query;
  
  let query = `
    SELECT id, name, email, address, role, created_at 
    FROM users 
    WHERE 1=1
  `;
  let params = [];
  
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
  const sortOrder = order.toLowerCase() === 'desc' ? 'DESC' : 'ASC';
  query += ` ORDER BY ${sortColumn} ${sortOrder}`;
  
  db.query(query, params, (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(results);
  });
});


router.get('/:id', authenticateToken, authorizeRoles(['admin']), (req, res) => {
  const userId = req.params.id;
  
  db.query(
    `SELECT u.id, u.name, u.email, u.address, u.role, 
            AVG(r.rating) as average_rating
     FROM users u
     LEFT JOIN stores s ON u.id = s.owner_id
     LEFT JOIN ratings r ON s.id = r.store_id
     WHERE u.id = ?
     GROUP BY u.id`,
    [userId],
    (err, results) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      if (results.length === 0) return res.status(404).json({ error: 'User not found' });
      
      res.json(results[0]);
    }
  );
});

router.put('/password', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const { currentPassword, newPassword } = req.body;
  
  db.query('SELECT password FROM users WHERE id = ?', [userId], async (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (results.length === 0) return res.status(404).json({ error: 'User not found' });
    
    const user = results[0];
    const bcrypt = require('bcryptjs');
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
    
    db.query(
      'UPDATE users SET password = ? WHERE id = ?',
      [hashedPassword, userId],
      (err, results) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        res.json({ message: 'Password updated successfully' });
      }
    );
  });
});

module.exports = router;