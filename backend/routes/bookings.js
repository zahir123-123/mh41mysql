const express = require('express');
const router = express.Router();

module.exports = (db, authenticateToken) => {
  router.get('/', async (req, res) => {
    try {
      const [rows] = await db.query('SELECT * FROM bookings ORDER BY created_at DESC');
      res.json(rows);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  router.get('/:id', async (req, res) => {
    try {
      const [rows] = await db.query('SELECT * FROM bookings WHERE id = ?', [req.params.id]);
      if (rows.length === 0) return res.status(404).json({ error: 'Not found' });
      res.json(rows[0]);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  router.post('/', async (req, res) => {
    const { user_id, car_id, product_id, service_id, booking_type, service_name, booking_date, booking_time, location, total_amount, status, customer_notes, admin_notes } = req.body;
    try {
      const id = require('crypto').randomUUID();
      await db.query('INSERT INTO bookings (id, user_id, car_id, product_id, service_id, booking_type, service_name, booking_date, booking_time, location, total_amount, status, customer_notes, admin_notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [id, user_id, car_id, product_id, service_id, booking_type, service_name, booking_date, booking_time, location, total_amount, status || 'pending', customer_notes, admin_notes]);
      res.status(201).json({ id });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  router.put('/:id', authenticateToken, async (req, res) => {
    const { status, admin_notes } = req.body;
    try {
      await db.query('UPDATE bookings SET status=?, admin_notes=? WHERE id=?', [status, admin_notes, req.params.id]);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  router.delete('/:id', authenticateToken, async (req, res) => {
    try {
      await db.query('DELETE FROM bookings WHERE id = ?', [req.params.id]);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  return router;
}; 