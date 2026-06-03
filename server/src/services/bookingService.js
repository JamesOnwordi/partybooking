import mongoose from 'mongoose'
import Booking from '../models/booking.js'
// import heldSlots from '../models/heldslot.js'

const getAvailability = async (data) => {
  console.log(data)

  const bookings = await Booking.find(
    { startTime: { $gte: startTime }, endTime: { $lte: endTime } },
    'room '
  ).exec()

  // const heldSlots = await HeldSlot.find(
  //   {
  //     // { startTime: { $gte: startTime }, endTime: { $lte: endTime } },
  //     // ...(excludeHeldSlotIds.length && {
  //     //   heldSlotId: { $nin: excludeHeldSlotIds }
  //     })
  //   },
  //   'room timeslot'
  // ).exec()

  return bookings
}

const createBooking = async (data) => {
  const session = await mongoose.startSession()
  try {
    await session.withTransaction(async () => {
      const existingBooking = await Booking.exists({
        startTime: { $lt: data.endTime },
        endTime: { $gt: data.startTime }
      }).session(session)
      if (existingBooking) {
        throw new Error(
          'Timeslot not available. Booking conflicts with an existing booking.'
        )
      }

      await Booking.create([data], { session })
    })
  } catch (error) {
    console.log(error)
  } finally {
    await session.endSession()
  }
}

const bookingService = {
  getAvailability,
  createBooking
}
export default bookingService

// const isAvailable = await this.booking_available(
//   bookingForm.date,
//   bookingForm.timeslot,
//   bookingForm.reservation.room
// )
// console.log(bookingForm)

// if (!isAvailable) {
//   await session.abortTransaction()
//   session.endSession()
//   res.status(400).json({ status: false, message: 'Exceeds room capacity' })
// }

// const createdBooking = await Bookings.create([bookingForm], { session })

// await session.commitTransaction()
// session.endSession()

// res.status(201).json({
//   status: false,
//   message: 'Booking Created Succesfully',
//   createdBooking: createdBooking[0],
//   status: true
// })

// // check if timeslot choosen is available for booking
// exports.booking_available = asyncHandler(
//   async (date, timeslot, room, heldSlotId) => {
//     try {
//       console.log('In booking availability')

//       room = parseInt(room)

//       console.log(date, timeslot, room, heldSlotId)

//       const bookings = await Bookings.find(
//         { date, timeslot },
//         'reservation.room'
//       ).exec()

//       console.log('booking ----', bookings)

//       let roomHeld = 0

//       if (heldSlotId) {
//         const heldSlots = await HeldSlot.find(
//           {
//             heldSlotId: { $nin: heldSlotId },
//             date,
//             timeslot
//           },
//           'room'
//         ).exec()

//         console.log('heldSlot ----', heldSlots)

//         if (heldSlots.length) {
//           roomHeld = heldSlots.reduce((total, slot) => {
//             return (total += slot.room)
//           }, 0)
//         }
//       }

//       const roomBooked = bookings.reduce((total, booking) => {
//         return (total += booking.reservation.room)
//       }, 0)

//       console.log(
//         'room booked',
//         roomBooked,
//         'room held',
//         roomHeld,
//         'room to be booked',
//         room
//       )
//       const reservedRoom = roomBooked + roomHeld

//       if (reservedRoom === 0) return true
//       if (reservedRoom === 3) return false

//       return room === (reservedRoom === 1 ? 2 : 1)
//     } catch (err) {
//       res.status(400).json({ status: false, message: error.message })
//     }
//   }
// )

// exports.timeslots_available = asyncHandler(async (req, res, next) => {
//   try {
//     console.log(req.params)
//     const { date, id } = req.params

//     if (!date || !dayjs(date, 'YYYY-MM-DD', true).isValid()) {
//       return res.status(400).json({
//         status: false,
//         message: 'Invalid or missing date. Expected format: YYYY-MM-DD'
//       })
//     }

//     const minDate = dayjs(MINDATE)
//     const maxDate = dayjs(MAXDATE)
//     const currentDate = dayjs(date)

//     if (currentDate.diff(minDate) < 0 || currentDate.diff(maxDate) > 0) {
//       return res.status(400).json({
//         status: false,
//         message: 'Invalid Date. Cannot Book Date Requested'
//       })
//     }

//     const excludeHeldSlotIds = id ? [id] : []

//     const bookings = await Bookings.find(
//       { date },
//       'reservation.room timeslot'
//     ).exec()

//     const heldSlots = await HeldSlot.find(
//       {
//         date,
//         ...(excludeHeldSlotIds.length && {
//           heldSlotId: { $nin: excludeHeldSlotIds }
//         })
//       },
//       'room timeslot'
//     ).exec()

//     console.log('booked ---', bookings, 'held ----', heldSlots)

//     // count of rooms booked per timeslot
//     const roomsBooked = {}
//     console.log('bookings', bookings)
//     bookings.forEach(({ reservation: { room }, timeslot }) => {
//       roomsBooked[timeslot] = (roomsBooked[timeslot] || 0) + room
//     })
//     console.log('roomsBooked', roomsBooked)

//     // count of rooms held per timeslot
//     const roomsHeld = {}
//     heldSlots.forEach(({ room, timeslot }) => {
//       roomsHeld[timeslot] = (roomsHeld[timeslot] || 0) + room
//     })

//     const sortedRoomsBooked = {}
//     const sortedRoomsHeld = {}
//     const timeslotAvailability = {}

//     const restoredDate = DateTime.fromISO(date, {
//       zone: ZONE
//     }).toJSDate()

//     const month = restoredDate.getMonth()
//     const day = restoredDate.getDay()

//     const TIMESLOTS =
//       WINTER_MONTHS.includes(month) && WEEKEND_DATE.includes(day)
//         ? WINTER_TIMESLOTS
//         : STANDARD_TIMESLOTS

//     TIMESLOTS.forEach((slot) => {
//       timeslotAvailability[slot] =
//         MAX_ROOMS_PER_TIMESLOT -
//         noOfRooms((roomsBooked[slot] || 0) + (roomsHeld[slot] || 0))

//       sortedRoomsBooked[slot] = roomsBooked[slot] || 0
//       sortedRoomsHeld[slot] = roomsHeld[slot] || 0
//     })

//     console.log('sortedRoomsBooked', sortedRoomsBooked)
//     console.log('sortedRoomsHeld', sortedRoomsHeld)
//     console.log('timeslotAvailability', timeslotAvailability)

//     res.status(200).json({
//       status: true,
//       message: `List of available timeslots for ${date}`,
//       roomsBooked: sortedRoomsBooked,
//       roomsHeld: sortedRoomsHeld,
//       timeslotAvailability
//     })
//   } catch (error) {
//     console.error('Error finding date:', error)
//     res.status(400).json({ status: false, message: error.message })
//   }
// })
