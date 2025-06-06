const { raw } = require('express')
const Bookings = require('../models/booking')
const asyncHandler = require('express-async-handler')

// constant value
const MAX_ROOMS_PER_TIMESLOT = 2
const TIMESLOTS = ['12PM', '2PM', '4PM', '6PM']

// customer accessible routes
// get available timeslots

exports.timeslots_available = asyncHandler(async (req, res, next) => {
  try {
    const bookings = await Bookings.find(
      { date: req.params.date },
      'reservation.noOfRooms timeslot'
    ).exec()

    const roomsBooked = {}
    bookings.forEach(({ reservation: { noOfRooms }, timeslot }) => {
      roomsBooked[timeslot] = (roomsBooked[timeslot] || 0) + noOfRooms
    })

    const timeslotAvailability = {}
    TIMESLOTS.forEach((slot) => {
      timeslotAvailability[slot] =
        MAX_ROOMS_PER_TIMESLOT - (roomsBooked[slot] || 0)
    })

    res.status(200).json({
      message: `List of available timeslots for ${req.params.date}`,
      timeslotAvailability
    })

    console.log(`List of available timeslots for ${req.params.date}`)
  } catch (error) {
    console.error('Error finding date:', error)
    res.status(400).json({ error: error.message })
  }
})

// create a new booking
exports.booking_create = asyncHandler(async (req, res, next) => {
  try {
    const bookingForm = req.body

    if (
      await bookingAvailable(
        bookingForm.date,
        bookingForm.timeslot,
        bookingForm.reservation.noOfRooms
      )
    ) {
      const createdBooking = await Bookings.create(bookingForm)
      res.status(201).json({
        message: 'Booking Created Succesfully',
        createdBooking
      })
    } else {
      res.status(400).json({ error: 'Exceeds room capacity' })
    }
  } catch (error) {
    console.error('Error creating booking:', error.message)
    res.status(400).json({ error: error.message })
  }
})

// admin only routes
// get all bookings
exports.booking_list = asyncHandler(async (req, res, next) => {
  try {
    const bookings = await Bookings.find({})
    res.status(200).json({
      message: 'List of all bookings',
      bookings
    })
  } catch (error) {
    console.error('Error accessing all bookings:', error.message)
    res.status(400).json({ error: error.message })
  }
})

// get specific date booking
exports.booking_get = asyncHandler(async (req, res, next) => {
  try {
    const bookings = await Bookings.find({ date: req.params.date })

    res.status(200).json({
      message: `List of bookings for ${req.params.date}`,
      bookings
    })
  } catch (error) {
    console.error(
      `Couldn't get bookings for ${req.params.date}:`,
      error.message
    )
    res.status(400).json({ error: error.message })
  }
})

// edit a booking
exports.booking_edit = asyncHandler(async (req, res, next) => {
  res.send(` edited booking ${req.params.id}`)
})

// delete a booking
exports.booking_delete = asyncHandler(async (req, res, next) => {
  res.send(` deleted booking ${req.params.id}`)
})

// check if timeslot choosen is available for booking
const bookingAvailable = async (date, timeslot, noOfRooms) => {
  const bookings = await Bookings.find(
    { date: date, timeslot: timeslot },
    'reservation.noOfRooms'
  ).exec()

  const roomBooked = bookings.reduce((total, booking) => {
    return (total += booking.reservation.noOfRooms)
  }, 0)

  return MAX_ROOMS_PER_TIMESLOT - roomBooked >= noOfRooms ? true : false
}
