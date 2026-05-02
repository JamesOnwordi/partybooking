require('dotenv').config()
const bookingsRouter = require('./routes/booking')
const adminRouter = require('./routes/admin')
const heldSlotRouter = require('./routes/heldSlot')
const mongoose = require('mongoose')
const express = require('express')
const cors = require('cors')
const app = express()
const port = 4000

main().catch((err) => console.log(err))

async function main() {
  await mongoose.connect(process.env.MONGO_URI_PROD)
  console.log('MongoDB Atlas has connected successfully')
}

app.use(express.json())
app.use(cors())

app.use('/heldSlots', heldSlotRouter)
app.use('/admin', adminRouter)
app.use('/booking', bookingsRouter)
app.get('/', (req, res) => {
  res.json({ message: 'Cloud Land Party Booking API is running' })
})

app.use((err, req, res, next) => {
  console.error('🔥 Error:', err.message)
  res.status(500).json({ error: err.message })
})

app.listen(port, () => {
  console.log(`Server running on port ${port}`)
})
