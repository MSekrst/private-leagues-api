import { Request, Response, NextFunction } from 'express'
import { validationResult } from 'express-validator'

const PASSWORD_REGEX = /^[A-Za-z0-9,.\-_]*$/ // alphanumerics and special chars (,.-_)
const USERNAME_REGEX = /^[A-Za-z0-9]*$/ // only alphanumerics
const NAME_REGEX = /^[\w\-\s]+$/ // any valid text with spaces

/**
 * Checks if provided `password` contains only allowed characters. checked password is plain text.
 *
 * @param password Checked password
 */
export function passwordValidator(password: string) {
  if (!PASSWORD_REGEX.test(password)) {
    throw new Error('Password contains invalid characters')
  }

  return true
}

/**
 * Checks if provided `username` contains only allowed characters.
 *
 * @param username Checked username
 */
export function usernameValidator(username: string) {
  if (!USERNAME_REGEX.test(username)) {
    throw new Error('Username contains invalid characters')
  }

  return true
}

/**
 * Checks if name contains only allowed characters.
 *
 * @param name Checked name
 */
export function nameValidator(name: string) {
  if (!NAME_REGEX.test(name)) {
    throw Error('Name validation failed')
  }

  return true
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
