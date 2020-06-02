import { Router } from 'express'
import { check } from 'express-validator'

import { hasValidationError } from '../helpers/validators'

import leaguesRouter from './leagues'
import detailsRouter from './details'
import adminsRouter from './admins'
import leagueUsersRouter from './users'
import eventsRouter from './events'

const leaguesAppRouter = Router()

// TODO: move checkers in files

leaguesAppRouter.use('/', leaguesRouter)
leaguesAppRouter.use(
  '/:leagueId',
  check('leagueId').isMongoId(),
  hasValidationError('Invalid league ID'),
  detailsRouter
)
leaguesAppRouter.use(
  '/:leagueId/admins',
  check('leagueId').isMongoId(),
  hasValidationError('Invalid league ID'),
  check('userId').isMongoId(),
  hasValidationError('Invalid user ID'),
  adminsRouter
)
leaguesAppRouter.use(
  '/:leagueId/users',
  check('leagueId').isMongoId(),
  hasValidationError('Invalid league ID'),
  check('userId').isMongoId(),
  hasValidationError('Invalid user ID'),
  leagueUsersRouter
)
leaguesAppRouter.use(
  '/:leagueId/events',
  check('leagueId').isMongoId(),
  hasValidationError('Invalid league ID'),
  eventsRouter
)

export default leaguesAppRouter
