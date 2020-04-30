import { Router } from 'express'

import { isAuthenticated } from './helpers/token'
import { isAuthorized } from './helpers/authorization'

import authRouter from './auth'
import usersRouter from './users'
import leaguesRouter from './leagues'

const apiRouter = Router()

apiRouter.use('/', authRouter)
apiRouter.use('/users', isAuthenticated, usersRouter)
apiRouter.use('/leagues', isAuthenticated, isAuthorized, leaguesRouter)

export default apiRouter
