import { ObjectID } from 'mongodb'

import { getUsersCollection, getLeaguesCollection } from '../../database/collections'

import { isPasswordValid } from './password'

/**
 * Returns searched user. User can be searched by `username` or `username` and `password` combination.
 * This function will not sanitize inputs, inputs should already be sanitized.
 *
 * @param username Searched users username
 * @param password Searched users plain text password
 */
export async function findUser(username: string, password?: string) {
  const usersCollection = await getUsersCollection()

  const user = await usersCollection.findOne({ username })

  // username is invalid
  if (!user) {
    return null
  }

  if (password) {
    const isPasswordMatch = await isPasswordValid(password, user.password)

    if (!isPasswordMatch) {
      return null
    }
  }

  return user
}

/**
 * Returns user with provided `id` or `null` if user doesn't exist.
 *
 * @param id Searched users ID
 */
export async function findUserById(id: string) {
  const usersCollection = await getUsersCollection()

  const mongoId = new ObjectID(id)
  const user = await usersCollection.findOne({ _id: mongoId })

  return user
}

/**
 * Returns list of leagues available for app with provided `appKey`.
 *  If `id` is provided returns only league with provided id.
 *
 * @param appKey App key for leagues
 * @param id Specific league ID
 */
export async function findLeaguesByAppId({ userId, appKey, id }: { appKey: string; userId: string; id?: string }) {
  const leaguesCollection = await getLeaguesCollection()

  const query = { appKey, $or: [{ admins: userId }, { users: userId }] } as Record<
    string,
    ObjectID | string | Array<{ admin: string } | { users: string }>
  >

  if (id) {
    query._id = new ObjectID(id)
  }

  const leagues = await leaguesCollection.find(query).toArray()

  return leagues
}
