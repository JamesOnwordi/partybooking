import bookingService from '../services/bookingService.js'

export const getAvailability = async (req, res) => {
  try {
    const availability = await bookingService.getAvailability()

    res.status(200).json({
      success: true,
      availability
    })
  } catch (error) {
    console.log(error)
    res.status(500).json({ success: false, message: 'Internal server error' })
  }
}

// create a new booking
export const createBooking = async (req, res) => {
  try {
    const booking = await bookingService.createBooking(req.body)

    res.status(201).json({
      success: true,
      booking
    })
  } catch (error) {
    console.log(error)
    res.status(500).json({ success: false, message: 'Internal server error' })
  }
}

//
