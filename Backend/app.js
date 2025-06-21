const express = require('express');
const app = express();
const cors = require('cors');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
dotenv.config();
const connectToDb = require('./db/db');
const userRoutes = require('./routes/user.routes');
const excelRoutes = require('./routes/excel.routes');
const adminRoutes = require('./routes/admin.routes');

connectToDb();

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));

app.use(cookieParser());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// API routes
app.use('/api/users', userRoutes);
app.use('/api/excel', excelRoutes);
app.use('/api/admin', adminRoutes);

module.exports = app;