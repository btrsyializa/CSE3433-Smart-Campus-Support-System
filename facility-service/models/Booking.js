const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
    facilityName: { 
        type: String, 
        required: true,
        trim: true 
    },
    date: { 
        type: String, 
        required: true 
    },
    timeSlot: { 
        type: String, 
        required: true 
    },
    studentName: { 
        type: String, 
        required: true,
        trim: true 
    },
    matricNo: { 
        type: String, 
        required: true 
    },
    status: { 
        type: String, 
        enum: ['Confirmed', 'BLOCKED - Under Maintenance', 'BLOCKED - System Error'],
        default: 'Confirmed' 
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
}, { collection: 'bookings' });

// Update timestamp before saving
BookingSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Booking', BookingSchema);