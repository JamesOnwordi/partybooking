const bookingsRouter = require('./routes/bookings')
const express = require('express')
const cors = require('cors')
const app = express()
const port = 3000

app.use('/bookings',bookingsRouter)
app.use(cors())

app.listen( port, ()=>{
    console.log(`Server running on port ${port}`)
})