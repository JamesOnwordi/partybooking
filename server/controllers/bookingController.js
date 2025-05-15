const Bookings = require("../models/bookings")
const asyncHandler = require("express-async-handler")

// get available timeslots
exports.timeslot_availability = asyncHandler(async (req, res, next) => {
    res.send(` list of available timeslot for a specific date `)
})

// get all bookings
exports.booking_list = asyncHandler(async (req, res, next) => {
    res.send(` list of all bookings `)
})

// get specific date booking
exports.booking_get = asyncHandler( async (req, res, next) => {
    res.send( ` details for booking ${req.params.id}`)
})

// create a new booking 
exports.booking_create = asyncHandler(async (req, res, next) => {
    res.send(`created a new booking`)
})

// edit a booking 
exports.booking_edit = asyncHandler( async (req, res, next) => {
    res.send(` edited booking ${req.params.id}`)
})

// delete a booking 
exports.booking_delete =asyncHandler(async (req, res, next)=>{
    res.send(` deleted booking ${req.params.id}`)
})

