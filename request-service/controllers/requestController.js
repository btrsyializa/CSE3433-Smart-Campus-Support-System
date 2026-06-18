const IssueRequest = require('../models/IssueRequest');

// GET all requests
exports.getAllRequests = async (req, res) => {
    try {
        const requests = await IssueRequest.find();
        res.status(200).json(requests);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// POST create new request
exports.createRequest = async (req, res) => {
    try {
        if (!req.body.title || !req.body.location) {
            return res.status(400).json({
                error: "Missing fields"
            });
        }

        const newRequest = new IssueRequest({
            title: req.body.title.trim(),
            location: req.body.location.trim(),
            status: 'Pending'
        });

        await newRequest.save();

        res.status(201).json(newRequest);

    } catch (err) {
        res.status(400).json({
            error: err.message
        });
    }
};

// PUT update request status
exports.updateRequestStatus = async (req, res) => {
    try {

        const updatedRequest = await IssueRequest.findByIdAndUpdate(
            req.params.id,
            {
                status: req.body.status
            },
            {
                new: true
            }
        );

        if (!updatedRequest) {
            return res.status(404).json({
                error: "Request not found"
            });
        }

        res.status(200).json(updatedRequest);

    } catch (err) {
        res.status(500).json({
            error: err.message
        });
    }
};