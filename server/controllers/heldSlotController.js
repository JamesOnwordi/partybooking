const { default: mongoose } = require('mongoose')
const HeldSlot = require('../models/heldSlot')
const booking_controller = require('./bookingController')
const asyncHandler = require('express-async-handler')

exports.start_slot_hold = asyncHandler(async (req, res) => {
  try {
    const { heldSlotId, date, timeslot, room } = req.body
    const timeslotIsAvailable = await booking_controller.booking_available(
      date,
      timeslot,
      room,
      heldSlotId
    )

    console.log(timeslotIsAvailable)
    if (!timeslotIsAvailable)
      return res.status(409).json({
        message: 'Timeslot Filled Up',
        status: false
      })

    const foundHeldSlot = await HeldSlot.findOne({ heldSlotId })
    let updatedHeldSlot

    if (foundHeldSlot) {
      const stringDate = new Date(foundHeldSlot.date).toISOString().slice(0, 10)
      console.log(
        'found Heldslot: ',
        foundHeldSlot,
        stringDate,
        // foundHeldSlot.slice(0, 10),
        heldSlotId,
        date,
        timeslot,
        room
      )
      if (
        foundHeldSlot.timeslot != timeslot ||
        stringDate != date ||
        foundHeldSlot.room != room
      ) {
        updatedHeldSlot = await HeldSlot.findOneAndUpdate(
          { heldSlotId },
          { timeslot, date, room },
          { new: true }
        )
        return res.status(200).json({
          message: 'Slot updated',
          heldSlot: updatedHeldSlot ? updatedHeldSlot : foundHeldSlot,
          status: true
        })
      } else
        return res.status(200).json({
          message: 'Slot already Updated',
          heldSlot: foundHeldSlot,
          status: true
        })
    }

    const expiresAt = new Date(Date.now() + 10 * 60 * 1000)
    const heldSlot = await HeldSlot.create({
      heldSlotId,
      date,
      timeslot,
      room,
      expiresAt
    })

    res
      .status(201)
      .json({ message: 'Slot  succesfully held', heldSlot, status: true })
  } catch (error) {
    res.status(400).json({ error: error.message, status: false })
  }
})

exports.extend_held_slot = asyncHandler(async (req, res) => {
  try {
    const { heldSlotId } = req.body

    const existingHold = await HeldSlot.findOne({ heldSlotId })

    if (!existingHold) {
      return res.status(400).json({ message: 'Held Slot does not exist' })
    }

    const currentHoldTime = existingHold.expiresAt
    console.log(
      existingHold,
      existingHold.expiresAt.getMilliseconds(),
      currentHoldTime.getMilliseconds()
    )
    if (currentHoldTime < new Date()) {
      return res.status(400).json({ message: 'Held Slot already Expired' })
    }

    const newExpiresAt = new Date(currentHoldTime.getTime() + 10 * 60 * 1000)
    console.log(new Date(Date.now()).toISOString(), newExpiresAt.toISOString())

    const updatedHold = await HeldSlot.findOneAndUpdate(
      { heldSlotId },
      { expiresAt: newExpiresAt },
      { new: true }
    )
    if (!updatedHold) {
      return res.status(404).json({ error: 'Held Slot Expired' })
    }
    return res
      .status(200)
      .json({ message: ' Hold extended', heldSlot: updatedHold })
  } catch (error) {
    return res.status(400).json({ message: error.message })
  }
})

exports.get_held_slot = asyncHandler(async (req, res) => {
  console.log('req.params', req.params)
  const { heldSlotId } = req.params

  const heldSlot = await HeldSlot.findOne({ heldSlotId: heldSlotId })

  if (heldSlot) {
    res.status(200).json({ message: 'retrieved held slot ', heldSlot })
  } else {
    res.status(400).json({ message: 'could not retrieve held slot ' })
  }
})

exports.delete_held_slot = asyncHandler(async (req, res) => {
  const { heldSlotId } = req.body
  if (!heldSlotId)
    return res.status(400).json({ message: 'heldSlotId is required' })
  try {
    const result = await HeldSlot.deleteOne({ heldSlotId: heldSlotId })

    if (result.deletedCount) {
      console.log('done', heldSlotId, result)
      res.status(200).json({ status: true, message: 'held slot deleted' })
    } else {
      res
        .status(400)
        .json({ status: false, message: 'held slot does not exist' })
    }
  } catch (error) {
    res.status(400).json({ status: false, message: error.message })
  }
})

// should be deleted, don't need to confirm held slot
exports.confirm_held_slot = async (req, res) => {
  const session = await mongoose.startSession()
  session.startTransaction()

  try {
    const { heldSlotId, bookingData } = req.body

    const heldSlot = HeldSlot.findOne({ _id: heldSlotId }).session(session)

    if (!heldSlot) {
      await session.commitTransaction()
      session.endSession()
      return res.status(400).json({ error: 'Hold expired or not found ' })
    }

    const stillAvailable = await bookingAvailable(
      heldSlot.date,
      heldSlot.timeslot,
      heldSlot.room,
      session
    )

    if (!stillAvailable) {
      throw new Error('Timeslot is no longer available')
    }

    const Booking = require('../models/booking')
    const createdBooking = await Booking.create([bookingData], { session })

    await HeldSlot.deleteOne({ _id: heldSlotId }).session(session)

    await session.commitTransaction()
    session.endSession()

    res
      .status(200)
      .json({ message: 'Booking Confirmed', booking: createdBooking[0] })
  } catch (error) {
    await session.abortTransaction()
    session.endSession()
    res.status(400).json({ message: error.message })
  }
}
