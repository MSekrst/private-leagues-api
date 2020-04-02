import express from 'express'
import compression from 'compression'
import bodyParser from 'body-parser'
import path from 'path'

import { userRouter } from './routes'
import initializeDBConnection from './database/mongo'

// Create Express server
const app = express()

// Remove x-powered-by header
app.disable('x-powered-by')

// Connect to database and create DB connection pool
initializeDBConnection()

// Express configuration
app.set('port', process.env.PORT || 3000)
app.use(compression())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, 'public'), { maxAge: 31557600000 }))

// Routes
app.use(userRouter)

export default app
