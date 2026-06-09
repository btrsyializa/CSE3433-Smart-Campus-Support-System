require('dotenv').config(); // Load the .env variables
const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        // This line grabs the MONGO_URI from your .env file
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected successfully to:', process.env.MONGO_URI);
    } catch (err) {
        console.error('Database connection error:', err.message);
        process.exit(1);
    }
};

module.exports = connectDB;