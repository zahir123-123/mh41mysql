const express = require('express');
const router = express.Router();

module.exports = (db, authenticateToken) => {
  router.get('/', async (req, res) => {
    try {
      const [rows] = await db.query('SELECT * FROM engine_oil_services ORDER BY created_at DESC');
      res.json(rows);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  router.get('/:id', async (req, res) => {
    try {
      const [rows] = await db.query('SELECT * FROM engine_oil_services WHERE id = ?', [req.params.id]);
      if (rows.length === 0) return res.status(404).json({ error: 'Not found' });
      res.json(rows[0]);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  router.post('/', authenticateToken, async (req, res) => {
    const { name, description, price, features, rating, reviews, image_url } = req.body;
    try {
      const id = require('crypto').randomUUID();
      await db.query('INSERT INTO engine_oil_services (id, name, description, price, features, rating, reviews, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [id, name, description, price, JSON.stringify(features || []), rating, reviews, image_url]);
      res.status(201).json({ id });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  router.put('/:id', authenticateToken, async (req, res) => {
    const { name, description, price, features, rating, reviews, image_url } = req.body;
    try {
      await db.query('UPDATE engine_oil_services SET name=?, description=?, price=?, features=?, rating=?, reviews=?, image_url=? WHERE id=?', [name, description, price, JSON.stringify(features || []), rating, reviews, image_url, req.params.id]);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  router.delete('/:id', authenticateToken, async (req, res) => {
    try {
      await db.query('DELETE FROM engine_oil_services WHERE id = ?', [req.params.id]);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  return router;
}; 