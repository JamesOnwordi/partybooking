const express = require('express')
const router = express.Router()

const booking_controller = require('../controllers/bookingController')
const { model } = require('mongoose')

router.get('/:date/heldSlot/:id', booking_controller.timeslots_available)

router.post('/', booking_controller.booking_create)

module.exports = router
