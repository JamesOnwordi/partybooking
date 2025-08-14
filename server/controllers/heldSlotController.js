const { default: mongoose } = require('mongoose')
const HeldSlot = require('../models/heldSlot')
const booking_controller = require('./bookingController')
const asyncHandler = require('express-async-handler')

exports.start_slot_hold = asyncHandler(async (req, res) => {
  try {
    const { heldSlotId, date, timeslot, noOfRooms } = req.body
    const timeslotIsAvailable = await booking_controller.booking_available(
      date,
      timeslot,
      noOfRooms,
      heldSlotId
    )

    console.log(timeslotIsAvailable)
    if (!timeslotIsAvailable)
      return res.status(400).json({
        message: 'Timeslot Filled Up'
      })

    const foundHeldSlot = await HeldSlot.findOne({ heldSlotId })
    let updatedHeldSlot

    if (foundHeldSlot) {
      const stringDate = foundHeldSlot.date.toISOString().slice(0, 10)
      console.log(
        'found Heldslot: ',
        foundHeldSlot,
        stringDate,
        // foundHeldSlot.slice(0, 10),
        heldSlotId,
        date,
        timeslot,
        noOfRooms
      )
      if (
        foundHeldSlot.timeslot != timeslot ||
        stringDate != date ||
        foundHeldSlot.noOfRooms != noOfRooms
      ) {
        updatedHeldSlot = await HeldSlot.findOneAndUpdate(
          { heldSlotId },
          { timeslot, date, noOfRooms },
          { new: true }
        )
        return res.status(200).json({
          message: 'Slot updated',
          heldSlot: updatedHeldSlot ? updatedHeldSlot : foundHeldSlot
        })
      } else
        return res.status(300).json({
          message: 'Slot already Updated',
          heldSlot: foundHeldSlot
        })
    }

    const expiresAt = new Date(Date.now() + 10 * 60 * 1000)
    const heldSlot = await HeldSlot.create({
      heldSlotId,
      date,
      timeslot,
      noOfRooms,
      expiresAt
    })

    res.status(201).json({ message: 'Slot  succesfully held', heldSlot })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

exports.extend_held_slot = async (req, res) => {
  try {
    const { heldSlotId } = req.body

    const existingHold = await HeldSlot.findOne({ heldSlotId })

    if (!existingHold) {
      return res.status(400).json({ message: 'Slot does not exist' })
    }

    const newExpiresAt = new Date(Date.now() + 10 * 60 * 1000)

    const updatedHold = await HeldSlot.findOneAndUpdate(
      { heldSlotId },
      { expiresAt: newExpiresAt },
      { new: true }
    )
    if (!updatedHold) {
      return res.status(404).json({ error: 'Held Slot not found after update' })
    }
    res.status(200).json({ message: ' Hold extended', heldSlot: updatedHold })
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

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
      heldSlot.noOfRooms,
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
