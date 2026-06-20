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

// Modern Mongoose style: Update timestamp automatically before saving without next() callbacks
BookingSchema.pre('save', function() {
    this.updatedAt = Date.now();
});

module.exports = mongoose.model('Booking', BookingSchema);