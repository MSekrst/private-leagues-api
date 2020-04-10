import { Request, Response, NextFunction } from 'express'
import { sign, verify, SignOptions } from 'jsonwebtoken'

import { JWT_SECRET } from '../../util/secrets'
import { User } from '../../model/User'

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

    // TODO: implement token blacklist and storage

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

/**
 * Checks if request has `Authorization` header set. If header is set checks header contents (`Bearer <JWT_token>`).
 * If formatting is good, will verify JWT. If JWT is valid, sets decoded user from token to `req.user`.
 * If error happened, will return 401 with error message.
 */
export function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  const authorization = req.headers.authorization

  // authorization header must be preset
  if (authorization) {
    const split = authorization.split(' ')

    // authorization content must have 2 parts divided by whitespace
    if (split.length === 2) {
      const [bearer, token] = split

      // first part must be `Bearer` string and second part must be valid JWT
      if (bearer === 'Bearer' && token) {
        const user = verifyToken(token)

        if (user) {
          req.user = user
          return next()
        }
      }
    }
  }

  res.status(401).json({ error: 'Unauthenticated user' })
}
