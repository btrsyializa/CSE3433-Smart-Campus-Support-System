const express = require('express');
const router = express.Router();
const controller = require('../controllers/requestController'); 

// The names here (getAllRequests, createRequest) MUST match the "exports." names in the controller
console.log("Controller content:", controller);
router.get('/', controller.getAllRequests);
router.post('/', controller.createRequest);

module.exports = router;