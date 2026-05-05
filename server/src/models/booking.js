import mongoose from 'mongoose'
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
      required: true
    },

    package: {
      type: String,
      enum: ['Solar', 'Galaxy'],
      required: true,
      index: true
    },

    room: {
      type: Number,
      enum: [1, 2],
      required: true,
      index: true
    },

    status: {
      type: String,
      enum: ['HELD', 'PENDING', 'CONFIRMED', 'CANCELLED', 'EXPIRED'],
      default: 'HELD',
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
        min: 1,
        max: 120
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

    galaxyExtras: {
      pizza1: {
        type: String,
        enum: ['cheese', 'pepperoni', null],
        default: null
      },
      pizza2: {
        type: String,
        enum: ['cheese', 'pepperoni', null],
        default: null
      }
    },

    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 } // TTL index (auto-delete at date)
    },

    paymentDueAt: {
      type: Date,
      required: true
    },

    idempotencyKey: {
      type: String,
      required: true
    }
  },

  {
    timestamps: true
  }
)

// Virtual: Customer full name
bookingSchema.virtual('customerFullName').get(function () {
  if (this.customer?.first_name && this.customer?.last_name) {
    return `${this.customer.first_name} ${this.customer.last_name}`
  }
  return ''
})

// Virtual: Total guests (kids + adults)
bookingSchema.virtual('reservation.totalGuests').get(function () {
  return (this.reservation.kids || 0) + (this.reservation.adults || 0)
})

// Pre-save hook: Default kids if not set, and validate capacity
// bookingSchema.pre('save', function (next) {
//   const totalCapacity = this.reservation.noOfRoom === 2 ? 40 : 20
//   const defaultCapacity = this.reservation.noOfRooms === 2 ? 16 : 8

//   // Set default kids if not provided
//   if (this.reservation.kids == null && this.reservation.adults == null) {
//     this.reservation.kids = defaultCapacity
//     this.reservation.adults = defaultCapacity
//   }

//   const totalGuests =
//     (this.reservation.kids || 0) + (this.reservation.adults || 0)
//   console.log(totalGuests, totalCapacity)
//   if (totalGuests > totalCapacity) {
//     return next(
//       new Error(
//         'Total guests exceed the allowed capacity for selected room count.'
//       )
//     )
//   }

//   next()
// })

module.exports = mongoose.model('Booking', bookingSchema)
