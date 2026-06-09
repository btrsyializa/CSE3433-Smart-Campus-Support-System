// 1. Load environment variables (Must be at the top)
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db'); // Your database connection function
const requestRoutes = require('./routes/requestRoutes'); // Your route handlers

const app = express();

// 2. Middleware Layer
// CORS: Allows frontend/other services to talk to this API
app.use(cors()); 
// JSON Parser: Allows the server to understand JSON sent in requests
app.use(express.json());
// Static Files: Serves your index.html automatically from the 'public' folder
app.use(express.static('public'));

// 3. Connect to Database
connectDB();

// 4. Routes Layer
// This maps all requests starting with /requests to your requestRoutes file
app.use('/requests', requestRoutes);

// Simple Health Check (Good for architectural documentation)
app.get('/', (req, res) => {
    res.send("Request Service is online and connected to Database.");
});

// 5. Global Error Handler (Good for architectural robustness)
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: "Internal Server Error" });
});

// 6. Start the Server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`[Architecture] Request Service running on port ${PORT}`);
});