import { Router, Request, Response } from 'express'
import { check } from 'express-validator'

import { passwordValidator, usernameValidator, hasValidationError } from './helpers/validators'
import { findUser } from './helpers/selectors'
import { getSecuredPassword } from './helpers/password'
import { generateToken } from './helpers/token'
import { getUsersCollection } from '../database/collections'

const authRouter = Router()

// user routes validations
const userValidators = [
  check('username').custom(usernameValidator),
  check('password').isLength({ min: 6 }),
  check('password').custom(passwordValidator),
]

/**
 * POST ~/login
 *
 * Logins user into the app if credentials provided exist and match those in database.
 *
 * Returns:
 *  - 200 - Success -> User profile and token
 *  - 422 - Credentials not provided
 *  - 404 - Wrong credentials
 */
authRouter.post(
  '/login',
  userValidators,
  hasValidationError('Provide valid username and password'),
  async (req: Request, res: Response) => {
    const { username, password } = req.body
    const user = await findUser(username, password)

    if (!user) {
      return res.status(404).json({ error: 'Invalid credentials' })
    }

    // remove unnecessary fields from user
    delete user.password
    user.id = user._id
    delete user._id

    const token = generateToken(user)

    return res.status(200).json({ user, token })
  }
)

/**
 * POST ~/register
 *
 * Creates new user if username is not taken.
 *
 * Returns:
 *  - 200 - Success -> Users ID
 *  - 422 - Credentials are invalid
 *  - 409 - Username is taken
 *
 */
authRouter.post(
  '/register',
  userValidators,
  hasValidationError('Provide valid username and password'),
  async (req: Request, res: Response) => {
    // eslint-disable-next-line prefer-const
    let { username, password, ...bodyData } = req.body

    const existingUser = await findUser(username)

    if (existingUser) {
      return res.status(409).json({ error: 'Username already taken' })
    }

    password = await getSecuredPassword(password)

    const usersCollection = await getUsersCollection()
    const insertedUser = await usersCollection.insertOne({ username, password, ...bodyData })

    res.status(200).json({ id: insertedUser.insertedId })
  }
)

export default authRouter
