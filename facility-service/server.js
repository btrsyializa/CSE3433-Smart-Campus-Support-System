require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');

const app = express();

// Connect to DB
connectDB();

// Security Headers Middleware
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
});

// Middleware
app.use(cors());
app.use(express.json());

// Serve the HTML UI explicitly
app.use(express.static(path.join(__dirname, 'public')));

// Health check
app.get('/', (req, res) => {
    res.json({ status: 'Facility Service is running' });
});

// Mount the API
app.use('/api/bookings', require('./routes/facilityRoutes'));

// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: "Internal Server Error" });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => console.log(`[Architecture] Facility Service running on port ${PORT}`));