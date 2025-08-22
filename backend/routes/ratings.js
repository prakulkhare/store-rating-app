const express = require('express');
const db = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.post('/', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const { store_id, rating, comment } = req.body;

  if (!store_id || !rating || rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'Store ID and rating (1-5) are required' });
  }

  try {
    const existing = await db.query(
      'SELECT id FROM ratings WHERE user_id = ? AND store_id = ?',
      [userId, store_id]
    );
    
    if (existing && existing.length > 0) {
      await db.query(
        'UPDATE ratings SET rating = ?, comment = ? WHERE user_id = ? AND store_id = ?',
        [rating, comment || null, userId, store_id]
      );
      return res.json({ message: 'Rating updated' });
    } else {
      await db.query(
        'INSERT INTO ratings (user_id, store_id, rating, comment) VALUES (?, ?, ?, ?)',
        [userId, store_id, rating, comment || null]
      );
      return res.status(201).json({ message: 'Rating submitted' });
    }
  } catch (err) {
    console.error('Rating submission error:', err);
    return res.status(500).json({ error: 'Database error' });
  }
});

router.get('/user/:storeId', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const storeId = req.params.storeId;
  
  try {
    const results = await db.query(
      'SELECT rating, comment FROM ratings WHERE user_id = ? AND store_id = ?',
      [userId, storeId]
    );
    
    return res.json({ 
      rating: results.length > 0 ? results[0].rating : null,
      comment: results.length > 0 ? results[0].comment : null
    });
  } catch (err) {
    console.error('Get user rating error:', err);
    return res.status(500).json({ error: 'Database error' });
  }
});

router.get('/store/:storeId', authenticateToken, async (req, res) => {
  const storeId = req.params.storeId;
  const userId = req.user.id;
  
  try {
    const storeCheck = await db.query(
      'SELECT id FROM stores WHERE id = ? AND owner_id = ?',
      [storeId, userId]
    );
    
    if (!storeCheck || storeCheck.length === 0) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const results = await db.query(
      `SELECT r.rating, r.comment, r.created_at, u.name, u.email 
       FROM ratings r 
       JOIN users u ON r.user_id = u.id 
       WHERE r.store_id = ? 
       ORDER BY r.created_at DESC`,
      [storeId]
    );
    
    return res.json(results);
  } catch (err) {
    console.error('Get store ratings error:', err);
    return res.status(500).json({ error: 'Database error' });
  }
});

module.exports = router;