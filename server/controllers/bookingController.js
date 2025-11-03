const Bookings = require('../models/booking')
const HeldSlot = require('../models/heldSlot')
const { DateTime } = require('luxon')

const dayjs = require('dayjs')
const customParseFormat = require('dayjs/plugin/customParseFormat')

const asyncHandler = require('express-async-handler')
const { default: mongoose } = require('mongoose')
const {
  WINTER_MONTHS,
  WINTER_TIMESLOTS,
  STANDARD_TIMESLOTS,
  MAX_ROOMS_PER_TIMESLOT,
  WEEKEND_DATE,
  ZONE,
  MINDATE,
  MAXDATE
} = require('../utils/bookingUtils')

dayjs.extend(customParseFormat)
// constant value

// customer accessible routes
// get available timeslots
console.log(WINTER_MONTHS, STANDARD_TIMESLOTS)
exports.timeslots_available = asyncHandler(async (req, res, next) => {
  try {
    console.log(req.params)
    const { date, id } = req.params
    if (!date || !dayjs(date, 'YYYY-MM-DD', true).isValid()) {
      return res.status(400).json({
        status: false,
        message: 'Invalid or missing date. Expected format: YYYY-MM-DD'
      })
    }

    const minDate = dayjs(MINDATE)
    const maxDate = dayjs(MAXDATE)
    const currentDate = dayjs(date)

    if (currentDate.diff(minDate) < 0 || currentDate.diff(maxDate) > 0) {
      return res.status(400).json({
        status: false,
        message: 'Invalid Date. Cannot Book Date Requested'
      })
    }

    if (date < minDate || date > maxDate) {
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

    console.log('slots', bookings, heldSlots)

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

    const restoredDate = DateTime.fromISO(date, {
      zone: ZONE
    }).toJSDate()

    const month = restoredDate.getMonth()
    const day = restoredDate.getDay()

    const TIMESLOTS =
      WINTER_MONTHS.includes(month) && WEEKEND_DATE.includes(day)
        ? WINTER_TIMESLOTS
        : STANDARD_TIMESLOTS

    TIMESLOTS.forEach((slot) => {
      timeslotAvailability[slot] =
        MAX_ROOMS_PER_TIMESLOT -
        ((roomsBooked[slot] || 0) + (roomsHeld[slot] || 0))

      sortedRoomsBooked[slot] = roomsBooked[slot] || 0
      sortedRoomsHeld[slot] = roomsHeld[slot] || 0
    })

    res.status(200).json({
      status: true,
      message: `List of available timeslots for ${date}`,
      roomsBooked: sortedRoomsBooked,
      roomsHeld: sortedRoomsHeld,
      timeslotAvailability
    })
  } catch (error) {
    console.error('Error finding date:', error)
    res.status(400).json({ status: false, message: error.message })
  }
})

// create a new booking
exports.booking_create = asyncHandler(async (req, res) => {
  console.log(req.body)

  const session = await mongoose.startSession()
  session.startTransaction()

  try {
    const bookingForm = req.body

    const isAvailable = await this.booking_available(
      bookingForm.date,
      bookingForm.timeslot,
      bookingForm.reservation.noOfRooms
    )
    console.log(bookingForm)

    if (!isAvailable) {
      await session.abortTransaction()
      session.endSession()
      res.status(400).json({ status: false, message: 'Exceeds room capacity' })
    }

    const createdBooking = await Bookings.create([bookingForm], { session })

    await session.commitTransaction()
    session.endSession()

    res.status(201).json({
      status: false,
      message: 'Booking Created Succesfully',
      createdBooking: createdBooking[0],
      status: true
    })
  } catch (error) {
    await session.abortTransaction()
    session.endSession()
    console.error('Transaction failed:', error.message)
    res
      .status(500)
      .json({ status: false, message: 'Booking failed. Try again.' })
  }
})

// check if timeslot choosen is available for booking
exports.booking_available = asyncHandler(
  async (date, timeslot, noOfRooms, heldSlotId) => {
    const bookings = await Bookings.find(
      { date, timeslot },
      'reservation.noOfRooms'
    ).exec()

    let roomHeld = 0

    if (heldSlotId) {
      const heldSlots = await HeldSlot.find(
        {
          heldSlotId: { $nin: heldSlotId },
          date,
          timeslot
        },
        'noOfRooms'
      ).exec()

      roomHeld = heldSlots.reduce((total, slot) => {
        return (total += slot.noOfRooms)
      }, 0)
    }

    try {
      const roomBooked = bookings.reduce((total, booking) => {
        return (total += booking.reservation.noOfRooms)
      }, 0)

      return MAX_ROOMS_PER_TIMESLOT - roomBooked - roomHeld >= noOfRooms
    } catch (err) {
      res.status(400).json({ status: false, message: error.message })
    }
  }
)

// admin only routes

// edit a booking
exports.booking_edit = asyncHandler(async (req, res, next) => {
  res.send(` edited booking ${req.params.id}`)
})
