const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
    facilityName: { type: String, required: true },
    date: { type: String, required: true },
    timeSlot: { type: String, required: true },
    studentName: { type: String, required: true },
    matricNo: { type: String, required: true },
    status: { type: String, default: 'Confirmed' }
}, { collection: 'bookings' });

module.exports = mongoose.model('Booking', BookingSchema);