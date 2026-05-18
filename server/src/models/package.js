import mongoose from 'mongoose'
const { Schema } = mongoose

const packageSchema = new Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true
    },

    name: {
      type: String,
      required: true
    },

    active: {
      type: Boolean,
      default: true
    },

    availability: {
      days: [
        {
          type: String,
          enum: [
            'Monday',
            'Tuesday',
            'Wednesday',
            'Thursday',
            'Friday',
            'Saturday',
            'Sunday'
          ]
        }
      ],
      excludeHolidays: {
        type: Boolean,
        default: false
      }
    },

    capacity: {
      includedKids: {
        type: Number,
        required: true
      },
      includedAdults: {
        type: Number,
        required: true
      }
    },

    pricing: {
      basePrice: {
        type: Number,
        required: true
      },
      cleaningFee: {
        type: Number,
        required: true
      },
      adultPrice: {
        type: Number,
        required: true
      },
      childPrice: {
        type: Number,
        required: true
      }
    },

    addOns: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Addon'
      }
    ]
  },
  {
    timestamps: true
  }
)

module.exports = mongoose.model('Package', packageSchema)
