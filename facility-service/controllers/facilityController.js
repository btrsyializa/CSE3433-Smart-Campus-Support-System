const Booking = require('../models/Booking');

// GET: Fetch all bookings
exports.getAllBookings = async (req, res) => {
    try {
        const bookings = await Booking.find().sort({ _id: -1 });
        res.status(200).json(bookings);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// POST: Create a new booking
exports.createBooking = async (req, res) => {
    try {
        const { facilityName, date, timeSlot, studentName, matricNo } = req.body;
        
        // Validation: Check required fields
        if (!facilityName || !date || !timeSlot || !studentName || !matricNo) {
            return res.status(400).json({ error: "All booking fields are required" });
        }
        
        // Anti-Collision Check: Prevent double booking the exact same slot
        const conflict = await Booking.findOne({ facilityName, date, timeSlot });
        if (conflict) {
            return res.status(400).json({ error: "Time slot already booked!" });
        }

        const newBooking = new Booking({ facilityName, date, timeSlot, studentName, matricNo });
        await newBooking.save();
        res.status(201).json(newBooking);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// PUT: Block a facility (called by Request Service during SOA communication)
exports.blockFacility = async (req, res) => {
    try {
        const { facilityName, reason } = req.body;
        
        // Validation: Check required fields
        if (!facilityName || !reason) {
            return res.status(400).json({ 
                error: 'facilityName and reason are required' 
            });
        }

        // Create a blocked booking entry (marks facility as unavailable)
        const blockedBooking = new Booking({
            facilityName: facilityName.trim(),
            date: new Date().toISOString().split('T')[0], // Today
            timeSlot: '00:00 - 23:59', // All day
            studentName: 'SYSTEM_BLOCK',
            matricNo: 'ADMIN_OVERRIDE',
            status: `BLOCKED - ${reason.trim()}`
        });
        
        await blockedBooking.save();
        
        res.status(200).json({ 
            message: `Facility '${facilityName}' has been blocked.`,
            reason: reason,
            booking: blockedBooking
        });
    } catch (err) {
        console.error(`[SOA ERROR] Failed to block facility:`, err.message);
        res.status(500).json({ error: 'Failed to block facility', details: err.message });
    }
};