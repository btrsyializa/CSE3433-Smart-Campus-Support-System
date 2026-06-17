// Load environment variables (Must be at the top)
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');

const app = express();

// Middleware Layer
app.use(cors()); 
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Connect to Database
connectDB();

// ========================================================
// THIS IS THE MISSING LINK! 
// It tells the server to route traffic to your layered files
// ========================================================
app.use('/api/requests', require('./routes/requestRoutes'));

const FACILITY_SERVICE_URL = process.env.FACILITY_SERVICE_URL || 'http://localhost:3002';

// Health check endpoint
app.get('/', (req, res) => {
    res.send("Request Service is online and connected to Database.");
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error('[ERROR]', err.stack);
    res.status(err.status || 500).json({ 
        message: "Internal Server Error",
        error: process.env.NODE_ENV === 'development' ? err.message : 'An error occurred'
    });
});

// 404 Handler (If frontend asks for a URL that doesn't exist)
app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
});

// Start the Server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`[Architecture] Request Service running on port ${PORT}`);
    console.log(`[Configuration] Facility Service URL: ${FACILITY_SERVICE_URL}`);
});