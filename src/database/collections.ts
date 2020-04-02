import { User } from '../model/User'
import { getDBConnection } from './mongo'
import { USER_COLLECTION } from './const'

export async function getUsersCollection() {
  const db = await getDBConnection()

  return db.collection<User>(USER_COLLECTION)
}
