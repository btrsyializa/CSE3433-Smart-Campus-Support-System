const User = require('../models/User'); // Maps to your 'students' collection
const Admin = require('../models/Admin'); // Maps to your separate 'admins' collection
const bcrypt = require('bcryptjs');

exports.register = async (req, res) => {
    try {
        const { name, email, matricNo, password } = req.body;
        
        // Input validation with whitespace trim safety
        if (!name || !email || !matricNo || !password) {
            return res.status(400).json({ error: 'All fields are required' });
        }
        
        const trimmedEmail = email.trim();
        const trimmedMatric = matricNo.trim();

        // RELAXED SECURITY CONSTRAINT: Allows short passwords like "123"
        if (password.length < 3) {
            return res.status(400).json({ error: 'Password must be at least 3 characters long!' });
        }
        
        // Check if the student used an email or matric number that already exists
        let existingUser = await User.findOne({ 
            $or: [
                { email: trimmedEmail }, 
                { matricNo: trimmedMatric }
            ] 
        });
        
        if (existingUser) {
            return res.status(400).json({ error: "Email or Matric Number is already registered!" });
        }

        // Hash password before saving
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Create and save the new student into the students collection exclusively
        const user = new User({ 
            name: name.trim(), 
            email: trimmedEmail, 
            matricNo: trimmedMatric, 
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
        
        const trimmedEmail = email.trim();
        let foundUser = null;
        let assignedRole = 'student';

        // 1. Cross-query isolation logic boundary: Inspect separate students collection first
        foundUser = await User.findOne({ email: trimmedEmail });

        // 2. Fallback execution pattern: Inspect separate admins collection if missing from students
        if (!foundUser) {
            foundUser = await Admin.findOne({ email: trimmedEmail });
            assignedRole = 'admin';
        }

        // If the credentials don't match an account in either collection, reject immediately
        if (!foundUser) {
            return res.status(401).json({ error: "Invalid Email or Password." });
        }

        // Verify Password using cryptographically decoupled validation
        const isPasswordValid = await bcrypt.compare(password, foundUser.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: "Invalid Email or Password." });
        }

        // 3. SOA Session ticket generation logic payload orchestration
        // Packs identity contexts securely along with collection metadata flags
        const sessionPayload = {
            id: foundUser._id,
            name: foundUser.name,
            email: foundUser.email,
            role: assignedRole,
            matricNo: foundUser.matricNo || 'N/A'
        };

        // Base64 string ticket package assembly (Single Sign-On SSO payload pass)
        const sessionToken = btoa(JSON.stringify(sessionPayload));

        // Success response delivering role directions up the landing channel pipeline
        res.status(200).json({ 
            message: "Login successful!", 
            token: sessionToken,
            role: assignedRole, // Frontend reads this to split navigation to hub.html or admin.html
            user: sessionPayload
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};