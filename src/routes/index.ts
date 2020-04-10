import { Router } from 'express'

import { isAuthenticated } from './helpers/token'

import authRouter from './auth'
import usersRouter from './users'

const apiRouter = Router()

apiRouter.use('/', authRouter)
apiRouter.use('/users', isAuthenticated, usersRouter)

export default apiRouter
