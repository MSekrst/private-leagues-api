import { Request, Response, NextFunction } from 'express'

import { APP_KEYS } from '../../util/secrets'

export const HEADER_NAME = 'x-app-key'

/**
 * Checks if request has `X-app-Key` header set. If header is set, checks header contents (`<app_key>`).
 * If formatting is good, will verify App key. If App key is valid, sets App key to `req.appKey`.
 * If error happened, will return 403 with error message.
 */
export function isAuthorized(req: Request, res: Response, next: NextFunction) {
  try {
    const appKey = req.headers[HEADER_NAME]

    if (appKey && typeof appKey === 'string' && APP_KEYS.includes(appKey)) {
      req.appKey = appKey

      return next()
    }

    throw Error
  } catch (e) {
    return res.status(403).json({ error: 'Unauthorized' })
  }
}
