const express = require('express');
const db = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.post('/', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const { store_id, rating } = req.body;

  if (!store_id || !rating || rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'Store ID and rating (1-5) are required' });
  }

  db.query(
    'SELECT id FROM ratings WHERE user_id = ? AND store_id = ?',
    [userId, store_id],
    (err, results) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      
      if (results.length > 0) {
        db.query(
          'UPDATE ratings SET rating = ? WHERE user_id = ? AND store_id = ?',
          [rating, userId, store_id],
          (err, results) => {
            if (err) return res.status(500).json({ error: 'Database error' });
            res.json({ message: 'Rating updated' });
          }
        );
      } else {
        
        db.query(
          'INSERT INTO ratings (user_id, store_id, rating) VALUES (?, ?, ?)',
          [userId, store_id, rating],
          (err, results) => {
            if (err) return res.status(500).json({ error: 'Database error' });
            res.status(201).json({ message: 'Rating submitted' });
          }
        );
      }
    }
  );
});

router.get('/user/:storeId', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const storeId = req.params.storeId;
  
  db.query(
    'SELECT rating FROM ratings WHERE user_id = ? AND store_id = ?',
    [userId, storeId],
    (err, results) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      res.json({ rating: results.length > 0 ? results[0].rating : null });
    }
  );
});

router.get('/store/:storeId', authenticateToken, (req, res) => {
  const storeId = req.params.storeId;
  const userId = req.user.id;
  
  db.query(
    'SELECT id FROM stores WHERE id = ? AND owner_id = ?',
    [storeId, userId],
    (err, results) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      if (results.length === 0) return res.status(403).json({ error: 'Access denied' });
      
      db.query(
        `SELECT r.rating, r.created_at, u.name, u.email 
         FROM ratings r 
         JOIN users u ON r.user_id = u.id 
         WHERE r.store_id = ? 
         ORDER BY r.created_at DESC`,
        [storeId],
        (err, results) => {
          if (err) return res.status(500).json({ error: 'Database error' });
          res.json(results);
        }
      );
    }
  );
});

module.exports = router;