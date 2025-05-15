const Bookings = require("../models/bookings")
const asyncHandler = require("express-async-handler")

// get all bookings
exports.bookings_list = asyncHandler(async (req, res, next) => {
    res.send(` not implemented yet`)
})

// get specific date booking
exports.bookings_get = asyncHandler( async (req, res, next) => {
    res.send( ` not implemented yet ${req.params.id}`)
})

// create a new booking 
exports.bookings_create = asyncHandler(async (req, res, next) => {
    res.send(` not implemented `)
})

exports.bookings_edit = asyncHandler( async (req, res, next) => {
    res.send(` not implemented for ${req.params.id}`)
})

exports.bookings_delete =asyncHandler(async (req, res, next)=>{
    
})

