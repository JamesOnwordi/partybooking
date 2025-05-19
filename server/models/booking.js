const mongoose = require('mongoose')

const { Schema } = mongoose

const BookingSchema = new Schema({
  date: { type: Date },
  timeslot: [12, 2, 4, 6],
  package: ['solarweek', 'solarweekend', 'galaxy'],
  customer: {
    name: { type: String },
    phone: { type: Number },
    email: { type: String }
  },
  celebrant: {
    name: { type: String },
    gender: { type: String },
    turning: { type: Number }
  },
  capacity: {
    kids: Number,
    adults: Number
  },
  addons: [String]
})

// module.exports = mongoose.model('BookingSchema', BookingSchema)
