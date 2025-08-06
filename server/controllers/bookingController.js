const Bookings = require('../models/booking')
const HeldSlot = require('../models/heldSlot')

const dayjs = require('dayjs')
const customParseFormat = require('dayjs/plugin/customParseFormat')

const redisClient = require('../redisClient')
const invalidateTimeslotCache = require('../utils/cache')

const asyncHandler = require('express-async-handler')
const { default: mongoose } = require('mongoose')
const { response } = require('express')

dayjs.extend(customParseFormat)
// constant value
const MAX_ROOMS_PER_TIMESLOT = 2
const TIMESLOTS = ['12PM', '2PM', '4PM', '6PM']

// customer accessible routes
// get available timeslots

exports.timeslots_available = asyncHandler(async (req, res, next) => {
  try {
    console.log(req.params)
    const { date, id } = req.params
    if (!date || !dayjs(date, 'YYYY-MM-DD', true).isValid()) {
      return res
        .status(400)
        .json({ error: 'Invalid or missing date. Expected format: YYYY-MM-DD' })
    }
    const minDate = new Date(new Date().setDate(new Date().getDate() + 2))
    const maxDate = new Date(
      new Date().getFullYear(),
      new Date().getMonth() + 4,
      0
    )

    if (
      date < minDate.toLocaleDateString() ||
      date > maxDate.toLocaleDateString()
    ) {
      return res
        .status(400)
        .json({ error: 'Invalid Date. Cannot Book Date Requested' })
    }

    const cacheKey = `timeslots:${date}`
    if (!id) {
      const cached = await redisClient.get(cacheKey)
      if (cached) {
        console.log(`Cache hit for ${date}`)
        return res.status(200).json(JSON.parse(cached))
      }
    }

    const excludeHeldSlotIds = id ? [id] : []
    const bookings = await Bookings.find(
      { date },
      'reservation.noOfRooms timeslot'
    ).exec()

    const heldSlots = await HeldSlot.find(
      {
        date,
        ...(excludeHeldSlotIds.length && {
          heldSlotId: { $nin: excludeHeldSlotIds }
        })
      },
      'noOfRooms timeslot'
    ).exec()

    const roomsBooked = {}
    bookings.forEach(({ reservation: { noOfRooms }, timeslot }) => {
      roomsBooked[timeslot] = (roomsBooked[timeslot] || 0) + noOfRooms
    })

    const roomsHeld = {}
    heldSlots.forEach(({ noOfRooms, timeslot }) => {
      roomsHeld[timeslot] = (roomsHeld[timeslot] || 0) + noOfRooms
    })

    const sortedRoomsBooked = {}
    const sortedRoomsHeld = {}
    const timeslotAvailability = {}
    TIMESLOTS.forEach((slot) => {
      timeslotAvailability[slot] =
        MAX_ROOMS_PER_TIMESLOT -
        ((roomsBooked[slot] || 0) + (roomsHeld[slot] || 0))

      sortedRoomsBooked[slot] = roomsBooked[slot] || 0
      sortedRoomsHeld[slot] = roomsHeld[slot] || 0
    })

    res.status(200).json({
      message: `List of available timeslots for ${req.params.date}`,
      roomsBooked: sortedRoomsBooked,
      roomsHeld: sortedRoomsHeld,
      timeslotAvailability
    })

    if (!id) {
      await redisClient.setEx(cacheKey, 300, JSON.stringify(response))
    }

    console.log(`List of available timeslots for ${req.params.date}`)
  } catch (error) {
    console.error('Error finding date:', error)
    res.status(400).json({ error: error.message })
  }
})

// create a new booking
exports.booking_create = async (req, res) => {
  const session = await mongoose.startSession()
  session.startTransaction()

  try {
    const bookingForm = req.body

    const isAvailable = await bookingAvailable(
      bookingForm.date,
      bookingForm.timeslot,
      bookingForm.reservation.noOfRooms,
      session
    )

    if (!isAvailable) {
      await session.abortTransaction()
      session.endSession()
      res.status(400).json({ error: 'Exceeds room capacity' })
    }

    const createdBooking = await Bookings.create([bookingForm], { session })

    await session.commitTransaction()
    session.endSession()

    await invalidateTimeslotCache(date)

    res.status(201).json({
      message: 'Booking Created Succesfully',
      createdBooking: createdBooking[0]
    })
  } catch (error) {
    await session.abortTransaction()
    session.endSession()
    console.error('Transaction failed:', error.message)
    res.status(500).json({ error: 'Booking failed. Try again.' })
  }
}

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
const bookingAvailable = async (
  date,
  timeslot,
  noOfRooms,
  heldSlotId,
  session
) => {
  const bookings = await Bookings.find(
    { date, timeslot },
    'reservation.noOfRooms',
    { session }
  ).exec()

  console.log(bookings)

  const heldSlots = await HeldSlot.find(
    {
      heldSlotId: { $nin: heldSlotId },
      date,
      timeslot
    },
    'noOfRooms'
  ).exec()

  const roomBooked = bookings.reduce((total, booking) => {
    return (total += booking.reservation.noOfRooms)
  }, 0)

  const roomHeld = heldSlots.reduce((total, slot) => {
    return (total += slot.noOfRooms)
  }, 0)

  return MAX_ROOMS_PER_TIMESLOT - roomBooked >= noOfRooms
}
