const Bookings = require('../models/booking')
const asyncHandler = require('express-async-handler')

// list of all bookings
exports.booking_upcoming = asyncHandler(async (req, res, next) => {
  try {
    const bookings = await Bookings.find()
    res.status(200).json({
      status: true,
      message: `List of all bookings`,
      bookings
    })
  } catch (error) {
    res.status(400).json({ status: false, message: error.message })
  }
})
// exports.booking_upcoming = asyncHandler(async (req, res, next) => {
//   try {
//     const bookings = await Bookings.find({ date: { $gte: new Date() } })
//     res.status(200).json({
//       status: true,
//       message: `List of all bookings`,
//       bookings
//     })
//   } catch (error) {
//     res.status(400).json({ status: false, message: error.message })
//   }
// })
// get bookings for date
exports.booking_date = asyncHandler(async (req, res, next) => {
  try {
    const { date } = req.params
    const bookings = await Bookings.find({ date })
    res.status(200).json({
      status: true,
      message: `List of  bookings for ${date}`,
      bookings
    })
  } catch (error) {
    res.status(400).json({ status: false, message: error.message })
  }
})

// get specific booking by id
exports.booking_get = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params
    const bookings = await Bookings.find({ _id: id })

    if (!bookings)
      return res
        .status(400)
        .json({ status: false, message: `Booking with ${id} does not exist` })

    res.status(200).json({
      status: true,
      message: `Booking ${id}`,
      bookings
    })
  } catch (error) {
    res.status(400).json({ status: false, message: error.message })
  }
})

exports.booking_edit = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params
    const { bookingData } = req.body
    console.log(bookingData)
    const updatedBooking = await Bookings.findByIdAndUpdate(id, bookingData)
    console.log(updatedBooking)
    if (!updatedBooking)
      return res
        .status(400)
        .json({ status: true, message: `Booking ${id} not found ` })

    return res
      .status(200)
      .json({ status: true, message: `Booking ${id} updated successfully ` })
  } catch (error) {
    return res.status(400).json({ status: false, message: `${error.messgae}` })
  }
  console.log('something is wrong')
})

// delete a booking
exports.booking_delete = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params
    console.log(typeof id)
    const bookingExist = await Bookings.exists({ _id: id })
    console.log(bookingExist)
    if (!bookingExist) {
      return res
        .status(400)
        .json({ status: false, message: ` Booking ${id} not found` })
    }
    const deletedBooking = await Bookings.findByIdAndDelete(id)
    console.log(deletedBooking)

    return res
      .status(200)
      .json({ status: true, message: 'Booking Deleted', deletedBooking })
  } catch (error) {
    return res.status(400).json({ status: false, message: error.message })
  }
})
