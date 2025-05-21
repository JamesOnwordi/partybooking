// const Bookings = require("../models/booking")
const asyncHandler = require('express-async-handler')

// customer accessible routes
// get available timeslots
exports.booking_available = asyncHandler(async (req, res, next) => {
  res.send(` list of available timeslot for a specific date `)
})

// create a new booking
exports.booking_create = asyncHandler(async (req, res, next) => {
  res.send(`created a new booking`)
})

// admin only routes
// get all bookings
exports.booking_list = asyncHandler(async (req, res, next) => {
  res.send(` list of all bookings `)
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
