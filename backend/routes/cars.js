const express = require('express');
const router = express.Router();

module.exports = (db, authenticateToken) => {
  router.get('/', async (req, res) => {
    try {
      const [rows] = await db.query('SELECT * FROM cars WHERE is_available = TRUE ORDER BY created_at DESC');
      res.json(rows);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  router.get('/:id', async (req, res) => {
    try {
      const [rows] = await db.query('SELECT * FROM cars WHERE id = ?', [req.params.id]);
      if (rows.length === 0) return res.status(404).json({ error: 'Not found' });
      res.json(rows[0]);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  router.post('/', authenticateToken, async (req, res) => {
    const { name, model, year, price_per_day, capacity, condition_status, description, ac, transmission, fuel_type, engine_size, steering, tank_capacity, type, number, rating, review_count, location, image_url, gallery_images, features, driver, original_price, is_available, status } = req.body;
    try {
      const id = require('crypto').randomUUID();
      await db.query('INSERT INTO cars (id, name, model, year, price_per_day, capacity, condition_status, description, ac, transmission, fuel_type, engine_size, steering, tank_capacity, type, number, rating, review_count, location, image_url, gallery_images, features, driver, original_price, is_available, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [id, name, model, year, price_per_day, capacity, condition_status, description, ac, transmission, fuel_type, engine_size, steering, tank_capacity, type, number, rating, review_count, location, image_url, JSON.stringify(gallery_images || []), JSON.stringify(features || []), JSON.stringify(driver || {}), original_price, is_available !== false, status]);
      res.status(201).json({ id });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  router.put('/:id', authenticateToken, async (req, res) => {
    const { name, model, year, price_per_day, capacity, condition_status, description, ac, transmission, fuel_type, engine_size, steering, tank_capacity, type, number, rating, review_count, location, image_url, gallery_images, features, driver, original_price, is_available, status } = req.body;
    try {
      await db.query('UPDATE cars SET name=?, model=?, year=?, price_per_day=?, capacity=?, condition_status=?, description=?, ac=?, transmission=?, fuel_type=?, engine_size=?, steering=?, tank_capacity=?, type=?, number=?, rating=?, review_count=?, location=?, image_url=?, gallery_images=?, features=?, driver=?, original_price=?, is_available=?, status=? WHERE id=?', [name, model, year, price_per_day, capacity, condition_status, description, ac, transmission, fuel_type, engine_size, steering, tank_capacity, type, number, rating, review_count, location, image_url, JSON.stringify(gallery_images || []), JSON.stringify(features || []), JSON.stringify(driver || {}), original_price, is_available, status, req.params.id]);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  router.delete('/:id', authenticateToken, async (req, res) => {
    try {
      await db.query('DELETE FROM cars WHERE id = ?', [req.params.id]);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  return router;
}; 