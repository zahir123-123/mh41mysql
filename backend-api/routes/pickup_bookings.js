const express = require('express');
const router = express.Router();

module.exports = (db, authenticateToken) => {
  router.get('/', async (req, res) => {
    try {
      const [rows] = await db.query('SELECT * FROM pickup_bookings ORDER BY created_at DESC');
      res.json(rows);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  router.get('/:id', async (req, res) => {
    try {
      const [rows] = await db.query('SELECT * FROM pickup_bookings WHERE id = ?', [req.params.id]);
      if (rows.length === 0) return res.status(404).json({ error: 'Not found' });
      res.json(rows[0]);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  router.post('/', async (req, res) => {
    const { user_id, name, phone, location, service_needed, pickup_time, latitude, longitude, status, tag } = req.body;
    try {
      const id = require('crypto').randomUUID();
      await db.query('INSERT INTO pickup_bookings (id, user_id, name, phone, location, service_needed, pickup_time, latitude, longitude, status, tag) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [id, user_id, name, phone, location, service_needed, pickup_time, latitude, longitude, status || 'pending', tag || 'pickup']);
      res.status(201).json({ id });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  router.put('/:id', authenticateToken, async (req, res) => {
    const { status } = req.body;
    try {
      await db.query('UPDATE pickup_bookings SET status=? WHERE id=?', [status, req.params.id]);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  router.delete('/:id', authenticateToken, async (req, res) => {
    try {
      await db.query('DELETE FROM pickup_bookings WHERE id = ?', [req.params.id]);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  return router;
}; 