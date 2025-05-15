const express = require('express')
const router = express.Router()

const booking_controller = require('../controllers/bookingController')
const { model } = require('mongoose')

router.get('/:date', booking_controller.booking_available)

router.post('/', booking_controller.booking_create)

module.exports = router