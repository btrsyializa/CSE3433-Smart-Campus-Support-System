const mongoose = require('mongoose');

const RequestSchema = new mongoose.Schema({
    title: { type: String, required: true },
    location: { type: String, required: true },
    status: { type: String, default: 'Pending' }
}, {
    // Explicitly target the collection you see in MongoDB Compass
    collection: 'issuerequests' 
});

module.exports = mongoose.model('IssueRequest', RequestSchema);