import { Request, Response, NextFunction } from 'express'

import { verifyToken } from './token'

/**
 * Checks if request has `Authorization` header set. If header is set checks header contents (`Bearer <JWT_token>`).
 * If formatting is good, will verify JWT. If JWT is valid, sets decoded user from token to `req.user`.
 * If error happened, will return 401 with error message.
 */
function isAuthorizedMiddleware(req: Request, res: Response, next: NextFunction) {
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
          next()
        }
      }
    }
  }

  res.status(401).json({ error: 'Unauthenticated' })
}

export default isAuthorizedMiddleware
