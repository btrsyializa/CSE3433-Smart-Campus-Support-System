require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');

const app = express();

connectDB();

// Robust CORS for cross-origin SOA communication
app.use(cors({
    origin: '*', 
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/auth', require('./routes/authRoutes'));

app.get('/', (req, res) => res.json({ status: 'Auth Service Online' }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`[SOA] Auth Service running on port ${PORT}`));