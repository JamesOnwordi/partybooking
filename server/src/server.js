import mongoose from 'mongoose'
import dotenv from 'dotenv'
import app from './app.js'

dotenv.config()

const PORT = process.env.PORT

mongoose
  .connect(process.env.MONGO_URI_PROD)
  .then(() => {
    console.log('MongoDB Atlas has connected successfully')

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`)
    })
  })
  .catch((err) => {
    console.log('DB connection error', err)
  })
