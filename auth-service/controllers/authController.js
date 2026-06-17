const User = require('../models/User');
const bcrypt = require('bcryptjs');

exports.register = async (req, res) => {
    try {
        const { name, email, matricNo, password } = req.body;
        
        // Input validation
        if (!name || !email || !matricNo || !password) {
            return res.status(400).json({ error: 'All fields are required' });
        }
        
        if (password.length < 8) {
            return res.status(400).json({ error: 'Password must be at least 8 characters' });
        }
        
        // Check if the student used an email or matric number that already exists
        let existingUser = await User.findOne({ $or: [{ email }, { matricNo }] });
        if (existingUser) {
            return res.status(400).json({ error: "Email or Matric Number is already registered!" });
        }

        // Hash password before saving
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Create and save the new student
        const user = new User({ 
            name, 
            email, 
            matricNo, 
            password: hashedPassword,
            role: 'student'
        });
        await user.save();
        
        res.status(201).json({ 
            message: "Registration successful!", 
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                matricNo: user.matricNo,
                role: user.role
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Input validation
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }
        
        // Find student by Email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ error: "Invalid Email or Password." });
        }

        // Verify Password using bcrypt
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: "Invalid Email or Password." });
        }

        // Success - return user data WITHOUT password
        res.status(200).json({ 
            message: "Login successful!", 
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                matricNo: user.matricNo,
                role: user.role
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};