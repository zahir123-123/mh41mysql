const express = require('express');
const router = express.Router();

module.exports = (db, authenticateToken) => {
  router.get('/', async (req, res) => {
    try {
      const [rows] = await db.query('SELECT id, email, full_name, phone, role, created_at, updated_at FROM profiles ORDER BY created_at DESC');
      res.json(rows);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  router.get('/:id', async (req, res) => {
    try {
      const [rows] = await db.query('SELECT id, email, full_name, phone, role, created_at, updated_at FROM profiles WHERE id = ?', [req.params.id]);
      if (rows.length === 0) return res.status(404).json({ error: 'Not found' });
      res.json(rows[0]);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  router.post('/', authenticateToken, async (req, res) => {
    const { email, full_name, phone, role } = req.body;
    try {
      const id = require('crypto').randomUUID();
      await db.query('INSERT INTO profiles (id, email, full_name, phone, role) VALUES (?, ?, ?, ?, ?)', [id, email, full_name, phone, role || 'user']);
      res.status(201).json({ id });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  router.put('/:id', authenticateToken, async (req, res) => {
    const { full_name, phone, role } = req.body;
    try {
      await db.query('UPDATE profiles SET full_name=?, phone=?, role=? WHERE id=?', [full_name, phone, role, req.params.id]);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  router.delete('/:id', authenticateToken, async (req, res) => {
    try {
      await db.query('DELETE FROM profiles WHERE id = ?', [req.params.id]);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  return router;
}; 