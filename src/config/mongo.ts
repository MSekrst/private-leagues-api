import { Express } from 'express'
import { MongoClient } from 'mongodb'

import { MONGODB_URI } from '../util/secrets'
import logger from '../util/logger'

export const DB_NAME = 'private-leagues'

/**
 * Opens mongod connection pool. Opened db connection will be attached to `app.locals.db`, so it can be retrieved on
 * each `req` object (e.g. `req.locals.app.db`).
 * If connection cannot be opened, error will be logged and process killed!
 */
function initializeDBConnection(app: Express) {
  const client = new MongoClient(MONGODB_URI, { useUnifiedTopology: true })

  client
    .connect()
    .then(() => {
      logger.debug('MongoDB connection opened successfully')

      app.locals.db = client.db(DB_NAME)
    })
    .catch(err => {
      logger.error('MongoDB connection error. Please make sure MongoDB is running. ' + err)
      process.exit()
    })
}

export default initializeDBConnection
