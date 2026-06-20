require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');

const app = express();

connectDB();

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/bookings', require('./routes/facilityRoutes'));

app.get('/', (req, res) => res.json({ status: 'Facility Service Online' }));

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => console.log(`[SOA] Facility Service running on port ${PORT}`));