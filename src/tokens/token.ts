import { sign, verify, SignOptions } from 'jsonwebtoken'

import { JWT_SECRET } from '../util/secrets'
import { User } from '../model/User'

const tokenSignOptions: SignOptions = { expiresIn: '21d', issuer: 'private-leagues-api' }

/**
 * Generates valid JWT token for provided user. Token contains user profile and can be used to authenticate users.
 * Returns token or `null` if error ocurred.
 *
 * @param user User profile encoded in token
 */
export function generateToken(user: User) {
  try {
    const token = sign(user, JWT_SECRET, tokenSignOptions)

    return token
  } catch (error) {
    return null
  }
}

/**
 * Verifies provided `token` and if token is valid returns decoded user, else returns `null`.
 *
 * @param token Token to be decoded
 */
export function verifyToken(token: string) {
  try {
    const user = verify(token, JWT_SECRET)

    return user as User
  } catch (error) {
    return null
  }
}
