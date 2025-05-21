const mongoose = require('mongoose')

const { Schema } = mongoose

const bokingSchema = new Schema(
  {
    date: { type: Date, required: true },
    timeslot: {
      type: String,
      enum: ['12PM', '2PM', '4PM', '6PM'],
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
      phone: { type: String, required: true },
      email: { type: String, required: true }
    },
    celebrant: {
      name: { type: String },
      gender: { type: String, enum: ['Male', 'Female'] },
      turning: { type: Number }
    },
    capacity: {
      kids: { type: Number, default: 8 },
      adults: { type: Number, default: 8 }
    },
    addons: [{ type: String }]
  },
  {
    timestamps: true
  }
)

// Virtual for customer's full name
bookingSchema.virtual('customer.fullName').get(function () {
  if (this.customer && this.customer.first_name && this.customer.last_name) {
    return `${this.customer.first_name} ${this.customer.last_name}`
  }
  return ''
})

// Optional virtual URL
// bookingSchema.virtual('url').get(function () {
//   return `/admin/booking/${this._id}`;
// });

// module.exports = mongoose.model('Booking', bookingSchema)
