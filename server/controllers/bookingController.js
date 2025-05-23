const Bookings = require('../models/booking')
const asyncHandler = require('express-async-handler')

// customer accessible routes
// get available timeslots
exports.booking_available = asyncHandler(async (req, res, next) => {
  try {
    const booking = await Bookings.find({ date: '2025-06-15' })
    res.status(201).json({
      message: '',
      booking
    })
    console.log(` list of available timeslot for ${req.params.date} `)
    res.send(` list of available timeslot for ${req.params.date} `)
  } catch (error) {
    console.error(' Error finding date')
    res.status(400).json({ error: error.message })
  }
})

// create a new booking
exports.booking_create = asyncHandler(async (req, res, next) => {
  try {
    const booking = await Bookings.create(req.body)
    res.status(201).json({
      message: 'Booking Created Succesfully',
      booking
    })
  } catch (error) {
    console.error('Booking creation error:', error.message)
    res.status(400).json({ error: error.message })
  }
})

// admin only routes
// get all bookings
exports.booking_list = asyncHandler(async (req, res, next) => {
  try {
    const booking = await Bookings.find({})
    res.status(201).json({
      message: 'List of all bookings',
      booking
    })
  } catch (error) {
    console.error("Couln't access booking", error.message)
    res.status(400).json({ error: error.message })
  }
})

// // get a specific bookings
// exports.booking_ = asyncHandler(async (req, res, next) => {
//   res.send(` list of a specific booking ${req.params.id}`)
// })

// get specific date booking
exports.booking_get = asyncHandler(async (req, res, next) => {
  res.send(` details for booking ${req.params.id}`)
})

// edit a booking
exports.booking_edit = asyncHandler(async (req, res, next) => {
  res.send(` edited booking ${req.params.id}`)
})

// delete a booking
exports.booking_delete = asyncHandler(async (req, res, next) => {
  res.send(` deleted booking ${req.params.id}`)
})
