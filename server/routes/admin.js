const express = require('express')
const router = express.Router()
const admin_controller = require('../controllers/adminController')

const booking_controller = require('../controllers/bookingController')

router.get('/bookings', admin_controller.booking_list)

router.get('/bookings/:date', admin_controller.booking_get)

router.put('/bookings/:id', admin_controller.booking_edit)

router.delete('/bookings/:id', admin_controller.booking_delete)

module.exports = router
