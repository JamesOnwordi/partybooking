const express = require('express')
const router = express.Router()

const booking_controller = require('../controllers/bookingController')
const { model } = require('mongoose')

router.get('/available-timeslot', booking_controller.timeslot_availability)

router.get('/bookings', booking_controller.booking_list)

router.post('/bookings', booking_controller.booking_create)

router.post('/bookings/:date', booking_controller.booking_create)

router.put('bookings/:id', booking_controller.booking_edit)

router.delete('bookings/:id', booking_controller.booking_delete)

module.exports = router