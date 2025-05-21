const express = require('express')
const router = express.Router()

const booking_controller = require('../controllers/bookingController')

router.get('/', booking_controller.booking_list)

// router.get('/:id', booking_controller.bo)

router.get('/:date', booking_controller.booking_get)

router.put('/:id', booking_controller.booking_edit)

router.delete('/:id', booking_controller.booking_delete)

module.exports = router
