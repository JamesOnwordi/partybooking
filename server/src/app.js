// import bookingsRouter from './routes/booking.js'
// import adminRouter from './routes/admin.js'
// import heldSlotRouter from './routes/heldSlot.js'
import addonRouter from './routes/addon.js'
import express from 'express'
import cors from 'cors'

const app = express()

// main().catch((err) => console.log(err))

app.use(express.json())
app.use(cors())

// app.use('/heldSlots', heldSlotRouter)
// app.use('/admin', adminRouter)
// app.use('/booking', bookingsRouter)
console.log('in app')
app.use('/addon', addonRouter)
app.get('/', (req, res) => {
  res.json({ message: 'Cloud Land Party Booking API is running' })
})

app.use((err, req, res, next) => {
  console.error('🔥 Error:', err.message)
  res.status(500).json({ error: err.message })
})

export default app
