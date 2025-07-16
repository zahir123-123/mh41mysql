const express = require('express');
const router = express.Router();

module.exports = (db, authenticateToken) => {
  router.get('/', async (req, res) => {
    try {
      const [rows] = await db.query('SELECT * FROM detailing_services ORDER BY id DESC');
      res.json(rows);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  router.get('/:id', async (req, res) => {
    try {
      const [rows] = await db.query('SELECT * FROM detailing_services WHERE id = ?', [req.params.id]);
      if (rows.length === 0) return res.status(404).json({ error: 'Not found' });
      res.json(rows[0]);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  router.post('/', authenticateToken, async (req, res) => {
    const { name, description, duration, price, features, photo, uuid, service_uuid } = req.body;
    try {
      await db.query('INSERT INTO detailing_services (name, description, duration, price, features, photo, uuid, service_uuid) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [name, description, duration, price, JSON.stringify(features || []), photo, uuid, service_uuid]);
      res.status(201).json({ success: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  router.put('/:id', authenticateToken, async (req, res) => {
    const { name, description, duration, price, features, photo, uuid, service_uuid } = req.body;
    try {
      await db.query('UPDATE detailing_services SET name=?, description=?, duration=?, price=?, features=?, photo=?, uuid=?, service_uuid=? WHERE id=?', [name, description, duration, price, JSON.stringify(features || []), photo, uuid, service_uuid, req.params.id]);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  router.delete('/:id', authenticateToken, async (req, res) => {
    try {
      await db.query('DELETE FROM detailing_services WHERE id = ?', [req.params.id]);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  return router;
}; 