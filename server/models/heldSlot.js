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
    enum: ['12SD', '2SD', '4SD', '6SD', '11WT', '2WT', '5WT'],
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
