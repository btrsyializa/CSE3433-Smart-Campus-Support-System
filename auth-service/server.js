require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path'); // 1. IMPORT THE BUILT-IN PATH MODULE
const connectDB = require('./config/db');

const app = express();

// Connect to DB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// 2. UPDATE THIS LINE TO USE PATH.JOIN WITH __DIRNAME
// This forces Express to look inside the 'public' folder relative to this server.js file location.
app.use(express.static(path.join(__dirname, 'public'))); 

// Routes
app.use('/api/auth', require('./routes/authRoutes'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`[Architecture] Auth Service running on port ${PORT}`));