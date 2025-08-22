const express = require('express');
const db = require('../config/database');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

router.get('/', async (req, res) => {
  const { name, address, sortBy = 'name', order = 'asc' } = req.query;
  
  try {
    let query = `
      SELECT s.id, s.name, s.email, s.address, s.owner_id,
             u.name AS owner_name,
             agg.average_rating,
             agg.rating_count
      FROM stores s
      LEFT JOIN users u ON s.owner_id = u.id
      LEFT JOIN (
        SELECT store_id, AVG(rating) AS average_rating, COUNT(id) AS rating_count
        FROM ratings
        GROUP BY store_id
      ) agg ON agg.store_id = s.id
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

    const validSortColumns = ['name', 'email', 'address', 'average_rating'];
    const sortColumn = validSortColumns.includes(sortBy) ? sortBy : 'name';
    const sortOrder = String(order).toLowerCase() === 'desc' ? 'DESC' : 'ASC';
    query += ` ORDER BY ${sortColumn} ${sortOrder}`;

    const results = await db.query(query, params);
    return res.json(results);
  } catch (err) {
    console.error('Stores list error:', err);
    return res.status(500).json({ error: 'Database error' });
  }
});

router.post('/', authenticateToken, authorizeRoles(['admin']), async (req, res) => {
  const { name, email, address, owner_id } = req.body;

  if (!name || !email || !address) {
    return res.status(400).json({ error: 'Name, email, and address are required' });
  }

  if (!owner_id) {
    return res.status(400).json({ error: 'Store owner is required' });
  }

  try {
    const existing = await db.query('SELECT id FROM stores WHERE email = ?', [email]);
    if (existing && existing.length > 0) {
      return res.status(400).json({ error: 'Store already exists' });
    }

    const ownerCheck = await db.query('SELECT id, role FROM users WHERE id = ?', [owner_id]);
    if (!ownerCheck || ownerCheck.length === 0) {
      return res.status(400).json({ error: 'Invalid store owner' });
    }
    if (ownerCheck[0].role !== 'store_owner') {
      return res.status(400).json({ error: 'Owner must have role store_owner' });
    }

    const insertResult = await db.query(
      'INSERT INTO stores (name, email, address, owner_id) VALUES (?, ?, ?, ?)',
      [name, email, address, owner_id]
    );

    return res.status(201).json({ message: 'Store created', id: insertResult.insertId });
  } catch (err) {
    console.error('Create store error:', err);
    return res.status(500).json({ error: 'Error creating store' });
  }
});

router.get('/:id', async (req, res) => {
  const storeId = req.params.id;
  
  try {
    const results = await db.query(
      `SELECT s.id, s.name, s.email, s.address, s.owner_id,
              u.name AS owner_name,
              agg.average_rating,
              agg.rating_count
       FROM stores s
       LEFT JOIN users u ON s.owner_id = u.id
       LEFT JOIN (
         SELECT store_id, AVG(rating) AS average_rating, COUNT(id) AS rating_count
         FROM ratings
         GROUP BY store_id
       ) agg ON agg.store_id = s.id
       WHERE s.id = ?`,
      [storeId]
    );

    if (!results || results.length === 0) {
      return res.status(404).json({ error: 'Store not found' });
    }

    return res.json(results[0]);
  } catch (err) {
    console.error('Get store error:', err);
    return res.status(500).json({ error: 'Database error' });
  }
});

module.exports = router;