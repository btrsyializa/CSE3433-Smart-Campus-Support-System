const express = require('express');
const router = express.Router();
const controller = require('../controllers/facilityController');

router.get('/', controller.getAllBookings);
router.post('/', controller.createBooking);
router.put('/block', controller.blockFacility);

module.exports = router;