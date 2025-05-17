require('dotenv').config()
const bookingsRouter = require('./routes/booking')
const adminRouter = require('./routes/admin')
const mongoose = require('mongoose')
const express = require('express')
const cors = require('cors')
const app = express()
const port = 3000

main().catch((err) => console.log(err))
async function main() {
  await mongoose.connect(process.env.MONGO_URI_DEV)
  console.log(process.env.MONGO_URI_DEV, 'has connected succesfully ')
}

app.use('/admin', adminRouter)
app.use('/', bookingsRouter)

app.use(cors())

app.listen(port, () => {
  console.log(`Server running on port ${port}`)
})
