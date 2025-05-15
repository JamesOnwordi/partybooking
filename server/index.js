const bookingsRouter = require('./routes/bookings')
const adminRouter = require('./routes/admin')
const express = require('express')
const cors = require('cors')
const app = express()
const port = 3000


app.use('/admin', adminRouter)
app.use('/',bookingsRouter)

app.use(cors())

app.listen( port, ()=>{
    console.log(`Server running on port ${port}`)
})