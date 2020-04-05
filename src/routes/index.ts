import { Router } from 'express'

import { default as authRouter } from './auth'

const apiRouter = Router()

apiRouter.use('/', authRouter)

export default apiRouter
