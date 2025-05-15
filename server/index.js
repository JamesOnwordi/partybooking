const express = require('express')
const app = express()
const port = 3000

const cors = require('cors')
const { get } = require('mongoose')
app.use(cors())

// 
app.get('',()=>{

})

// create a new booking
app.post('',()=>{

})




app.listen( port, ()=>{
    console.log(`Server running on port ${port}`)
})