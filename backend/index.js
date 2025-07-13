require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 4000;

// MySQL connection pool
const db = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME || 'autohub_service_center',
});

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, 'uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});
const upload = multer({ storage });



const authRouterModule = require('./routes/auth');
const authRouter = authRouterModule(db);
app.use('/api/auth', authRouter);
const authenticateToken = authRouter.authenticateToken;
const productsRouter = require('./routes/products')(db, authenticateToken);
app.use('/api/products', productsRouter);
const engineOilRouter = require('./routes/engine_oil_services')(db, authenticateToken);
app.use('/api/engine-oil-services', engineOilRouter);
const foglightsRouter = require('./routes/foglights')(db, authenticateToken);
app.use('/api/foglights', foglightsRouter);
const washingRouter = require('./routes/washing_services')(db, authenticateToken);
app.use('/api/washing-services', washingRouter);
const detailingRouter = require('./routes/detailing_services')(db, authenticateToken);
app.use('/api/detailing-services', detailingRouter);
const detailingGalleryRouter = require('./routes/detailing_gallery')(db, authenticateToken);
app.use('/api/detailing-gallery', detailingGalleryRouter);
const addressesRouter = require('./routes/addresses')(db, authenticateToken);
app.use('/api/addresses', addressesRouter);
const profilesRouter = require('./routes/profiles')(db, authenticateToken);
app.use('/api/profiles', profilesRouter);
// NOTE: You must create a user_passwords table:
// CREATE TABLE user_passwords (user_id VARCHAR(36) PRIMARY KEY, password_hash VARCHAR(255));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Image upload endpoint
app.post('/api/upload', upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  const url = `/uploads/${req.file.filename}`;
  res.json({ url });
});

// TODO: Add CRUD endpoints for all entities, auth endpoints, etc.

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
}); 