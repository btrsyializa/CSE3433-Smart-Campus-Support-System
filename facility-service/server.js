require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');

const app = express();

// Connect to DB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Serve the HTML UI explicitly
app.use(express.static(path.join(__dirname, 'public')));

// Mount the API
app.use('/api/bookings', require('./routes/facilityRoutes'));

const PORT = process.env.PORT || 3002;
// THIS line is what keeps the terminal running and stops the "clean exit"
app.listen(PORT, () => console.log(`[Architecture] Facility Service running on port ${PORT}`));