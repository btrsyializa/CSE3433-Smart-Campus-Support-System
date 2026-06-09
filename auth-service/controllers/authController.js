const User = require('../models/User');

exports.register = async (req, res) => {
    try {
        const { name, email, matricNo, password } = req.body;
        
        // Check if the student used an email or matric number that already exists
        let existingUser = await User.findOne({ $or: [{ email }, { matricNo }] });
        if (existingUser) {
            return res.status(400).json({ error: "Email or Matric Number is already registered!" });
        }

        // Create and save the new student
        const user = new User({ name, email, matricNo, password });
        await user.save();
        res.status(201).json({ message: "Registration successful!", user });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // 1. Find student by Email
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ error: "Invalid Email or Password." });

        // 2. Verify Password
        if (user.password !== password) {
            return res.status(400).json({ error: "Invalid Email or Password." });
        }

        // 3. Success
        res.status(200).json({ message: "Login successful!", user });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};