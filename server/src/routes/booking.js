const express = require('express')
const router = express.Router()
const booking_controller = require('../controllers/bookingController')

router.post('/create', booking_controller.booking_create)

router.get('/:date/heldSlot/:id', booking_controller.timeslots_available)

module.exports = router
