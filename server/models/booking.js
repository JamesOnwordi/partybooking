const mongoose = require('mongoose')
const { Schema } = mongoose

const bookingSchema = new Schema(
  {
    date: { type: Date, required: true },
    timeslot: {
      type: String,
      enum: ['12SD', '2SD', '4SD', '6SD', '11WT', '2WT', '5WT'],
      required: true
    },
    package: {
      type: String,
      enum: ['SolarMT', 'SolarFS', 'Galaxy'],
      required: true
    },
    customer: {
      first_name: { type: String, required: true, maxLength: 100 },
      last_name: { type: String, required: true, maxLength: 100 },
      phone: {
        type: String,
        required: true,
        match: [/^\+?\d{10,15}$/, 'Please enter a valid phone number']
      },
      email: {
        type: String,
        required: true,
        match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
      }
    },
    celebrant: {
      name: { type: String },
      gender: { type: String, enum: ['Male', 'Female'] },
      ageTurning: { type: Number }
    },
    reservation: {
      kids: { type: Number, default: 0 },
      adults: { type: Number, default: 0 },
      noOfRooms: {
        type: Number,
        enum: [1, 2],
        required: true
      }
    },
    packageAddons: {
      type: Object
    },
    addons: { type: Object }
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
