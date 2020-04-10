import { Router, Request, Response } from 'express'
import { check } from 'express-validator'
import { ObjectID } from 'mongodb'

import { findUserById, findUser } from './helpers/selectors'
import { getUsersCollection } from '../database/collections'
import { User } from '../model/User'
import { usernameValidator, passwordValidator, hasValidationError } from './helpers/validators'
import { getSecuredPassword } from './helpers/password'

const usersRouter = Router()

/**
 * GET ~/users/me
 *
 * Returns private profile for current user. User is identified by token.
 *
 * Returns:
 *  - 200 - Success -> Users private profile
 *  - 404 - User doesn't exist
 */
usersRouter.get('/me', async (req, res) => {
  const user = await findUserById(req.user.id)

  if (!user) {
    // TODO: blacklist token as user doesn't exist
    return res.status(404).json({ error: 'User not found' })
  }

  // user formatting is left to clients, public user data is everything except password
  delete user.password
  user.id = user._id
  delete user._id

  return res.status(200).json(user)
})

/**
 * GET ~/users/:id
 *
 * Returns public profile for user with provided `id`.
 *
 * Returns:
 *  - 200 - Success -> Users private profile
 *  - 404 - User doesn't exist
 */
usersRouter.get(
  '/:id',
  check('id').isMongoId(),
  hasValidationError('Provided ID not found'),
  async (req: Request, res: Response) => {
    const user = await findUserById(req.params.id)

    if (!user) {
      return res.status(404).json({ error: 'Provided ID not found' })
    }

    // user formatting is left to clients, public user data is everything except password
    delete user.password
    user.id = user._id
    delete user._id

    return res.status(200).json(user)
  }
)

/**
 *  DELETE ~/users/me
 *
 * Deletes user profile. User is determined based on token.
 *
 * Returns:
 *  - 204 -> Delete successful
 */
usersRouter.delete('/me', async (req, res) => {
  const mongoUserId = new ObjectID(req.user.id)

  const usersCollection = await getUsersCollection()

  const status = await usersCollection.deleteOne({ _id: mongoUserId })

  if (status.deletedCount) {
    return res.status(204).end()
  } else {
    // TODO: if user doesn't exist and valid token => add token to blacklist
    return res.status(204).end()
  }
})

/**
 * PATCH ~/users/me
 *
 * Updates users profile with body provided. User is identified by token. Updating of user id will be ignored.
 * New password and username will be validated before update.
 *
 * Returns:
 *  - 204 - Update successful
 *  - 404 - User not found
 *  - 409 - Username is taken
 *  - 422 - Invalid characters in username or password, or forbidden id update
 *
 */
usersRouter.patch('/me', async (req, res) => {
  const userMongoId = new ObjectID(req.user.id)

  const usersCollection = await getUsersCollection()

  // forbid id update
  const partialUpdatedUserData = { ...req.body } as User
  delete partialUpdatedUserData.id
  delete partialUpdatedUserData._id

  if (!Object.keys(partialUpdatedUserData).length) {
    return res.status(422).json({ error: 'ID cannot be updated' })
  }

  // check if new username valid and unique
  if (partialUpdatedUserData.username) {
    const username = partialUpdatedUserData.username

    try {
      usernameValidator(username)
    } catch (error) {
      return res.status(422).json({ error: 'Invalid username formatting' })
    }

    const existingUser = await findUser(username)

    if (existingUser) {
      return res.status(409).json({ error: 'Username already taken' })
    }
  }

  // check if password valid and secure it
  if (partialUpdatedUserData.password) {
    const password = partialUpdatedUserData.password

    try {
      passwordValidator(password)

      if (password.length < 6) {
        throw Error()
      }
    } catch (error) {
      return res.status(422).json({ error: 'Invalid password formatting' })
    }

    partialUpdatedUserData.password = await getSecuredPassword(password)
  }

  const status = await usersCollection.updateOne({ _id: userMongoId }, { $set: { ...partialUpdatedUserData } })

  if (status.matchedCount || status.modifiedCount) {
    return res.status(204).end()
  } else {
    return res.status(404).json({ error: 'User not found' })
  }
})

export default usersRouter
