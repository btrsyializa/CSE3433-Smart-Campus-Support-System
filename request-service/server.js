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

app.use('/api/requests', require('./routes/requestRoutes'));

// Dynamic Service URL for SOA inter-service requests
const FACILITY_SERVICE_URL = process.env.FACILITY_SERVICE_URL || 'http://localhost:3002';

app.get('/', (req, res) => res.send("Request Service Online."));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`[SOA] Request Service running on port ${PORT}`);
    console.log(`[Discovery] Facility Service URL: ${FACILITY_SERVICE_URL}`);
});