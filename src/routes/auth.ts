import { Router, Request, Response } from 'express'
import bcrypt from 'bcrypt'
import { check, validationResult } from 'express-validator'

import { getUsersCollection } from '../database/collections'
import { generateToken } from '../tokens/token'

const SALT_ROUNDS = 10

const authRouter = Router()

/**
 * Checks if provided `password` contains only allowed characters. checked password is plain text.
 * Function is used as validator middleware so error thrown would be caught by middleware.
 *
 * @param password Checked password
 */
function passwordValidator(password: string) {
  // password can contain only alphanumerics and special chars (,.-_)
  const passwordRegex = /^[ A-Za-z0-9,.\-_]*$/

  const result = passwordRegex.test(password)

  if (!result) {
    throw new Error('Password contains invalid characters')
  }

  return result
}

// user routes validations
const userValidators = [
  check('username').isAlphanumeric(),
  check('password').isLength({ min: 6 }),
  check('password').custom(passwordValidator),
]

/**
 * Returns searched user. User can be searched by `username` or `username` and `password` combination.
 * This function will not sanitize inputs, inputs should already be sanitized.
 *
 * @param username searched users username
 * @param password searched users plain text password
 */
async function findUser(username: string, password?: string) {
  const usersCollection = await getUsersCollection()

  const user = await usersCollection.findOne({ username })

  if (password) {
    const isPasswordMatch = await bcrypt.compare(password, user.password)

    if (!isPasswordMatch) {
      return null
    }
  }

  return user
}

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
authRouter.post('/login', userValidators, async (req: Request, res: Response) => {
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    return res.status(422).json({ error: 'Provide valid username and password' })
  }

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

  res.json({ user, token })
})

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
authRouter.post('/register', userValidators, async (req: Request, res: Response) => {
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    return res.status(422).json({ error: 'Provide valid username and password' })
  }

  // eslint-disable-next-line prefer-const
  let { username, password, ...bodyData } = req.body

  const existingUser = await findUser(username)

  if (existingUser) {
    return res.status(409).json({ error: 'Username already taken' })
  }

  // salt and hash password
  password = await bcrypt.hash(password, SALT_ROUNDS)

  const usersCollection = await getUsersCollection()
  const insertedUser = await usersCollection.insertOne({ username, password, ...bodyData })

  res.status(200).json({ id: insertedUser.insertedId })
})

export default authRouter
