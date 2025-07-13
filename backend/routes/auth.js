const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

module.exports = (db) => {
  // Register
  router.post('/register', async (req, res) => {
    const { email, password, full_name, phone } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    try {
      const [rows] = await db.query('SELECT * FROM profiles WHERE email = ?', [email]);
      if (rows.length > 0) {
        return res.status(409).json({ error: 'Email already registered' });
      }

      const hash = await bcrypt.hash(password, 10);
      const id = require('crypto').randomUUID();

      await db.query(
        'INSERT INTO profiles (id, email, full_name, phone, role) VALUES (?, ?, ?, ?, ?)',
        [id, email, full_name || '', phone || '', 'user']
      );

      await db.query('INSERT INTO user_passwords (user_id, password_hash) VALUES (?, ?)', [id, hash]);

      const token = jwt.sign({ id, email, role: 'user' }, JWT_SECRET, { expiresIn: '7d' });
      res.json({ token });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Login
  router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    try {
      const [users] = await db.query('SELECT * FROM profiles WHERE email = ?', [email]);
      if (users.length === 0) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const user = users[0];
      const [pwRows] = await db.query('SELECT * FROM user_passwords WHERE user_id = ?', [user.id]);
      if (pwRows.length === 0) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const valid = await bcrypt.compare(password, pwRows[0].password_hash);
      if (!valid) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
      res.json({ token });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Auth middleware
  function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.sendStatus(401);

    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (err) return res.sendStatus(403);
      req.user = user;
      next();
    });
  }

  router.authenticateToken = authenticateToken;

  // Get profile (protected)
  router.get('/profile', authenticateToken, async (req, res) => {
    try {
      const [rows] = await db.query(
        'SELECT id, email, full_name, phone, role, created_at, updated_at FROM profiles WHERE id = ?',
        [req.user.id]
      );

      if (rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json(rows[0]);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Update profile (protected)
  router.put('/profile', authenticateToken, async (req, res) => {
    const { full_name, phone } = req.body;

    try {
      await db.query(
        'UPDATE profiles SET full_name = ?, phone = ?, updated_at = NOW() WHERE id = ?',
        [full_name || '', phone || '', req.user.id]
      );
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  return router;
};
