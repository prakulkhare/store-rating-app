const express = require('express');
const db = require('../config/database');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

router.get('/', (req, res) => {
  const { name, address, sortBy = 'name', order = 'asc' } = req.query;
  
  let query = `
    SELECT s.id, s.name, s.email, s.address, s.owner_id, 
           u.name as owner_name, 
           AVG(r.rating) as average_rating,
           COUNT(r.id) as rating_count
    FROM stores s
    LEFT JOIN users u ON s.owner_id = u.id
    LEFT JOIN ratings r ON s.id = r.store_id
    WHERE 1=1
  `;
  let params = [];

  if (name) {
    query += ' AND s.name LIKE ?';
    params.push(`%${name}%`);
  }
  if (address) {
    query += ' AND s.address LIKE ?';
    params.push(`%${address}%`);
  }
  
  query += ' GROUP BY s.id';

  const validSortColumns = ['name', 'email', 'address', 'average_rating'];
  const sortColumn = validSortColumns.includes(sortBy) ? sortBy : 'name';
  const sortOrder = order.toLowerCase() === 'desc' ? 'DESC' : 'ASC';
  query += ` ORDER BY ${sortColumn} ${sortOrder}`;
  
  db.query(query, params, (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(results);
  });
});

router.post('/', authenticateToken, authorizeRoles(['admin']), (req, res) => {
  const { name, email, address, owner_id } = req.body;

  if (!name || !email || !address) {
    return res.status(400).json({ error: 'Name, email, and address are required' });
  }

  db.query('SELECT id FROM stores WHERE email = ?', [email], (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (results.length > 0) return res.status(400).json({ error: 'Store already exists' });

    db.query(
      'INSERT INTO stores (name, email, address, owner_id) VALUES (?, ?, ?, ?)',
      [name, email, address, owner_id || null],
      (err, results) => {
        if (err) return res.status(500).json({ error: 'Error creating store' });
        res.status(201).json({ message: 'Store created', id: results.insertId });
      }
    );
  });
});

router.get('/:id', (req, res) => {
  const storeId = req.params.id;
  
  db.query(
    `SELECT s.id, s.name, s.email, s.address, s.owner_id, 
            u.name as owner_name,
            AVG(r.rating) as average_rating,
            COUNT(r.id) as rating_count
     FROM stores s
     LEFT JOIN users u ON s.owner_id = u.id
     LEFT JOIN ratings r ON s.id = r.store_id
     WHERE s.id = ?
     GROUP BY s.id`,
    [storeId],
    (err, results) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      if (results.length === 0) return res.status(404).json({ error: 'Store not found' });
      
      res.json(results[0]);
    }
  );
});

module.exports = router;