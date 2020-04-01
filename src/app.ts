import express from 'express'
import compression from 'compression'
import bodyParser from 'body-parser'
import path from 'path'
import mongoose from 'mongoose'

import { MONGODB_URI } from './util/secrets'

// Create Express server
const app = express()

// Connect to MongoDB
const mongoUrl = MONGODB_URI

mongoose
  .connect(mongoUrl, { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true })
  .then(() => {
    /** ready to use. The `mongoose.connect()` promise resolves to undefined. */
  })
  .catch(err => {
    console.log('MongoDB connection error. Please make sure MongoDB is running. ' + err)
    process.exit()
  })

// Express configuration
app.set('port', process.env.PORT || 3000)
app.use(compression())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, 'public'), { maxAge: 31557600000 }))

export default app
