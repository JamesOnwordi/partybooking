const Bookings = require('../models/booking')
const asyncHandler = require('express-async-handler')

// get all bookings
exports.booking_list = asyncHandler(async (req, res, next) => {
  try {
    const bookings = await Bookings.find({})
    res.status(200).json({
      status: true,
      message: 'List of all bookings',
      bookings
    })
  } catch (error) {
    res
      .status(400)
      .json({ status: false, message: 'Error retrieving bookings ' })
  }
})

// get specific date booking
exports.booking_get = asyncHandler(async (res, req) => {
  const { date } = req.params
  try {
    const bookings = await Bookings.find({ date })

    res.status(200).json({
      status: true,
      message: `List of bookings for ${date}`,
      bookings
    })
  } catch (error) {
    console.error(`Couldn't get bookings for ${date}:`, error.message)
    res.status(400).json({ status: false, message: error.message })
  }
})

exports.booking_edit = asyncHandler((res, req) => {
  try {
    const { _id } = req.params
    console.log(req.params)

    const existingBooking = Bookings.exists(_id)
    console.log(existingBooking)
    res.send('succesful')
    const updatedBooking = Bookings.findByIdAndUpdate(_id, req.body)
  } catch (error) {}
})

// delete a booking
exports.booking_delete = asyncHandler((res, req) => {
  try {
    const { id } = req.body

    const deletedBooking = Bookings.findByIdAndDelete(id)
    console.log(deletedBooking)

    if (!deletedBooking) {
      return res
        .status(400)
        .json({ status: false, message: ' Booking not Deleted' })
    }
    return res
      .status(200)
      .json({ status: true, message: 'Booking Deleted', deletedBooking })
  } catch (error) {
    return res
      .status(400)
      .json({ status: false, message: ' Failed to Delete Booking' })
  }
})
