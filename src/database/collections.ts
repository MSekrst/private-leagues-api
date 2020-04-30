import { User, League } from '../model'

import { getDBConnection } from './mongo'
import { USERS_COLLECTION, LEAGUES_COLLECTION } from './const'

async function getDBCollection<T>(collectionName: string) {
  const db = await getDBConnection()

  return db.collection<T>(collectionName)
}

export async function getUsersCollection() {
  return await getDBCollection<User>(USERS_COLLECTION)
}

export async function getLeaguesCollection() {
  return await getDBCollection<League>(LEAGUES_COLLECTION)
}
