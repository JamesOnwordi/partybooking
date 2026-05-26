import express from 'express'
import bookingController from '../controllers/bookingController.js'

const router = express.Router()

router.get('/availability', bookingController.getAvailability)

router.post('/create', bookingController.createBooking)

export default router
