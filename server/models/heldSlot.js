const mongoose = require('mongoose')

const heldSlotSchema = new mongoose.Schema({
  heldSlotId: {
    type: String,
    required: true,
    unique: true
  },
  date: {
    type: Date,
    required: true
  },
  timeslot: {
    type: String,
    enum: ['12PM', '2PM', '4PM', '6PM'],
    required: true
  },
  noOfRooms: {
    type: Number,
    required: true,
    enum: [1, 2]
  },
  expiresAt: {
    type: Date,
    required: true
  }
})

heldSlotSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

module.exports = mongoose.model('HeldSlot', heldSlotSchema)
