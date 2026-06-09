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