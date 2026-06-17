const express = require('express');
const router = express.Router();
const controller = require('../controllers/requestController'); 

router.get('/', controller.getAllRequests);
router.post('/', controller.createRequest);
router.put('/:id', controller.updateRequestStatus);

module.exports = router;