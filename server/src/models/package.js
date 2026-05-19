import mongoose from 'mongoose'
const { Schema } = mongoose

const packageSchema = new Schema(
  {
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
      additionalAdultPrice: {
        type: Number,
        required: true
      },
      additionalChildPrice: {
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

export default mongoose.model('Package', packageSchema)
