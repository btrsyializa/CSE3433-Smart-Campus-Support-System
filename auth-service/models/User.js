const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    matricNo: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: 'student' }
}, { collection: 'students' });

module.exports = mongoose.model('User', UserSchema);