const express = require('express');
const router = express.Router();

module.exports = (db, authenticateToken) => {
  // List all products
  router.get('/', async (req, res) => {
    try {
      const [rows] = await db.query('SELECT * FROM products WHERE is_active = TRUE ORDER BY created_at DESC');
      res.json(rows);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Get product by id
  router.get('/:id', async (req, res) => {
    try {
      const [rows] = await db.query('SELECT * FROM products WHERE id = ?', [req.params.id]);
      if (rows.length === 0) return res.status(404).json({ error: 'Not found' });
      res.json(rows[0]);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Create product (auth required)
  router.post('/', authenticateToken, async (req, res) => {
    const { name, description, price, stock_quantity, image_url, gallery_images, category, category_id, is_active } = req.body;
    try {
      const id = require('crypto').randomUUID();
      await db.query(
        'INSERT INTO products (id, name, description, price, stock_quantity, image_url, gallery_images, category, category_id, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [id, name, description, price, stock_quantity, image_url, JSON.stringify(gallery_images || []), category, category_id, is_active !== false]
      );
      res.status(201).json({ id });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Update product (auth required)
  router.put('/:id', authenticateToken, async (req, res) => {
    const { name, description, price, stock_quantity, image_url, gallery_images, category, category_id, is_active } = req.body;
    try {
      await db.query(
        'UPDATE products SET name=?, description=?, price=?, stock_quantity=?, image_url=?, gallery_images=?, category=?, category_id=?, is_active=? WHERE id=?',
        [name, description, price, stock_quantity, image_url, JSON.stringify(gallery_images || []), category, category_id, is_active, req.params.id]
      );
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Delete product (auth required)
  router.delete('/:id', authenticateToken, async (req, res) => {
    try {
      await db.query('DELETE FROM products WHERE id = ?', [req.params.id]);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  return router;
}; 