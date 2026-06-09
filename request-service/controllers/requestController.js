const IssueRequest = require('../models/IssueRequest'); // Rename import

exports.getAllRequests = async (req, res) => {
    try {
        const requests = await IssueRequest.find(); // Use new variable
        res.status(200).json(requests);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.createRequest = async (req, res) => {
    try {
        if (!req.body.title || !req.body.location) {
            return res.status(400).json({ error: "Missing fields" });
        }
        // Use the new variable name here
        const newRequest = new IssueRequest({
            title: req.body.title.trim(),
            location: req.body.location.trim(),
            status: 'Pending'
        });
        await newRequest.save();
        res.status(201).json(newRequest);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};