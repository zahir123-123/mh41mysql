const express = require('express');
const router = express.Router();

module.exports = (db, authenticateToken) => {
  router.get('/', async (req, res) => {
    try {
      const [rows] = await db.query('SELECT * FROM services WHERE is_active = TRUE ORDER BY created_at DESC');
      res.json(rows);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  router.get('/:id', async (req, res) => {
    try {
      const [rows] = await db.query('SELECT * FROM services WHERE id = ?', [req.params.id]);
      if (rows.length === 0) return res.status(404).json({ error: 'Not found' });
      res.json(rows[0]);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  router.post('/', authenticateToken, async (req, res) => {
    const { name, description, price, duration, features, image_url, type, category_id, is_active } = req.body;
    try {
      const id = require('crypto').randomUUID();
      await db.query('INSERT INTO services (id, name, description, price, duration, features, image_url, type, category_id, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [id, name, description, price, duration, JSON.stringify(features || []), image_url, type, category_id, is_active !== false]);
      res.status(201).json({ id });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  router.put('/:id', authenticateToken, async (req, res) => {
    const { name, description, price, duration, features, image_url, type, category_id, is_active } = req.body;
    try {
      await db.query('UPDATE services SET name=?, description=?, price=?, duration=?, features=?, image_url=?, type=?, category_id=?, is_active=? WHERE id=?', [name, description, price, duration, JSON.stringify(features || []), image_url, type, category_id, is_active, req.params.id]);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  router.delete('/:id', authenticateToken, async (req, res) => {
    try {
      await db.query('DELETE FROM services WHERE id = ?', [req.params.id]);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  return router;
}; 