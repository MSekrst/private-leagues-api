import { Router } from 'express'

const userRouter = Router()

userRouter.get('/login', (req, res) => {
  console.log(req.app.locals)

  res.json({ login: 'ok' })
})

export default userRouter
