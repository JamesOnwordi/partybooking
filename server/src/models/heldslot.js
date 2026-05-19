import mongoose from 'mongoose'
const { Schema } = mongoose

const heldSlotSchema = new Schema(
  {
    startTime: {
      type: Date,
      required: true,
      index: true
    },

    endTime: {
      type: Date,
      required: true
    },

    room: {
      type: Schema.Types.ObjectId,
      ref: 'Room',
      required: true,
      index: true
    },

    expiresAt: {
      type: Date,
      required: true
    }
  },
  {
    timestamps: true
  }
)

heldSlot.index({
  room: 1,
  startTime: 1
})

heldSlot.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

export default mongoose.model('HeldSlot', heldSlotSchema)
