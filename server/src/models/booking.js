import mongoose from 'mongoose'
import { BOOKING_STATUS } from '../utils/bookingUtils'
const { Schema } = mongoose

const bookingSchema = new Schema(
  {
    startTime: {
      type: Date,
      required: true,
      index: true
    },

    endTime: {
      type: Date,
      required: true,
      validate: {
        validator: function (value) {
          return value > this.startTime
        }
      }
    },

    bookingPackage: {
      type: Schema.Types.ObjectId,
      ref: 'Package',
      required: true,
      index: true
    },

    room: {
      type: Schema.Types.ObjectId,
      ref: 'Room',
      required: true,
      index: true
    },

    status: {
      type: String,
      enum: Object.values(BOOKING_STATUS),
      index: true
    },

    customer: {
      firstName: { type: String, required: true, trim: true },
      lastName: { type: String, required: true, trim: true },
      phone: {
        type: String,
        required: true
        // match: [/^\+?\d{10,15}$/, 'Please enter a valid phone number']
      },
      email: {
        type: String,
        required: true,
        lowercase: true
        // match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
      }
    },

    celebrant: {
      name: { type: String, required: true },
      gender: {
        type: String,
        enum: ['Male', 'Female'],
        required: true
      },
      ageTurning: {
        type: Number,
        required: true,
        min: 1
      }
    },

    guests: {
      kids: {
        type: Number,
        required: true,
        min: 0,
        max: 20
      },
      adults: {
        type: Number,
        required: true,
        min: 0,
        max: 20
      }
    },

    addon: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Addon'
      }
    ],

    paymentDueAt: {
      type: Date,
      required: true
    },

    idempotencyKey: {
      type: String,
      required: true,
      unique: true
    },

    isActive: {
      type: Boolean,
      default: true
    }
  },

  {
    timestamps: true
  }
)

// compound index for booking with specific startime, room, and status
bookingSchema.index(
  {
    room: 1,
    startTime: 1
  },
  {
    unique: true,
    partialFilterExpression: {
      isActive: true
    }
  }
)

// FOR PRODUCTION
// bookingSchema.set({ autoIndex: false })

// Virtual: Customer full name
// bookingSchema.virtual('customerFullName').get(function () {
//   if (this.customer?.first_name && this.customer?.last_name) {
//     return `${this.customer.first_name} ${this.customer.last_name}`
//   }
//   return ''
// })

// Virtual: Total guests (kids + adults)
// bookingSchema.virtual('reservation.totalGuests').get(function () {
//   return (this.reservation.kids || 0) + (this.reservation.adults || 0)
// })

export default mongoose.model('Booking', bookingSchema)
