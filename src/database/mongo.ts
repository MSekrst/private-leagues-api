import { MongoClient, Db } from 'mongodb'

import { MONGODB_URI } from '../util/secrets'
import logger from '../util/logger'
import { DB_NAME } from './const'

let db: Db = null

/**
 * Opens mongod connection pool. Opened db connection will be stored as singleton and can be retrieved with `getDBConnection` function.
 * If connection cannot be opened, error will be logged and process killed!
 */
function initializeDBConnection() {
  const client = new MongoClient(MONGODB_URI, { useUnifiedTopology: true, poolSize: 10 })

  // don't create multiple connection pools
  if (db) {
    return
  }

  return new Promise<Db>(resolve => {
    client
      .connect()
      .then(() => {
        logger.debug('MongoDB connection opened successfully')

        db = client.db(DB_NAME)

        resolve(db)
      })
      .catch(err => {
        logger.error('MongoDB connection error. Please make sure MongoDB is running. ' + err)
        process.exit()
      })
  })
}

export async function getDBConnection() {
  if (db) {
    return db
  }

  const openedDb = await initializeDBConnection()

  return openedDb
}

export default initializeDBConnection
