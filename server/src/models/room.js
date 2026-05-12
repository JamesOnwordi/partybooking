import mongoose from 'mongoose'

const roomSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    capacity: {
      type: Number,
      required: true,
      min: 1
    },
    description: {
      type: String,
      trim: true
    },
    amenities: [String]
  },
  {
    timestamps: true
  }
)

module.exports = mongoose.model('Room', roomSchema)
