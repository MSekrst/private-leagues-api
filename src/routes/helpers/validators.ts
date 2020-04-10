import { Request, Response, NextFunction } from 'express'
import { validationResult } from 'express-validator'

/**
 * Checks if provided `password` contains only allowed characters. checked password is plain text.
 *
 * @param password Checked password
 */
export function passwordValidator(password: string) {
  // password can contain only alphanumerics and special chars (,.-_)
  const passwordRegex = /^[A-Za-z0-9,.\-_]*$/

  const result = passwordRegex.test(password)

  if (!result) {
    throw new Error('Password contains invalid characters')
  }

  return result
}

/**
 * Checks if provided `username` contains only allowed characters.
 *
 * @param username Checked username
 */
export function usernameValidator(username: string) {
  // username can contain only alphanumerics
  const usernameRegex = /^[A-Za-z0-9]*$/

  const result = usernameRegex.test(username)

  if (!result) {
    throw new Error('Username contains invalid characters')
  }

  return result
}

/**
 * Middleware factory that checks if there are validation errors.
 * If errors are present returns 422 response with provided `errorMessage`.
 *
 * @param errorMessage Error message returned in response
 */
export function hasValidationError(errorMessage: string) {
  return function errorValidationMiddleware(req: Request, res: Response, next: NextFunction) {
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
      return res.status(422).json({ error: errorMessage })
    }

    next()
  }
}
