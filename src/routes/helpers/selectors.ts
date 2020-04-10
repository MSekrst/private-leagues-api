import { ObjectID } from 'mongodb'

import { getUsersCollection } from '../../database/collections'

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
