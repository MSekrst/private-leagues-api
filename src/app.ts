import express from 'express'
import compression from 'compression'
import bodyParser from 'body-parser'
import cors from 'cors'

import { userRouter } from './routes'
import initializeDBConnection from './database/mongo'

// Create Express server
const app = express()

// Remove x-powered-by header
app.disable('x-powered-by')

// Connect to database and create DB connection pool
initializeDBConnection()

// Express configuration
app.use(cors())
app.use(compression())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

// basic response for root
app.get('/', (_req, res) => {
  res.send('Api is working')
})

// Routes
app.use(userRouter)

export default app
