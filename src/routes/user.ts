import { Router } from 'express'

import { getUsersCollection } from '../database/collections'

const userRouter = Router()

/**
 * Returns searched user. User can be searched by `username` or `username` and `password` combination.
 *
 * @param username searched users username
 * @param password searched users password
 */
async function findUser(username: string, password?: string) {
  const usersCollection = await getUsersCollection()

  const user = await usersCollection.findOne({ username, password })

  return user
}

userRouter.post('/login', async (req, res) => {
  const { username, password } = req.body

  if (!username || !password) {
    return res.status(422).json({ error: 'Provide username and password' })
  }

  const user = await findUser(username, password)

  if (!user) {
    return res.status(404).json({ error: 'User not found' })
  }

  // remove unnecessary fields from user
  delete user.password
  user.id = user._id
  delete user._id

  res.json(user)
})

export default userRouter
