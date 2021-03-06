import { Router, Request, Response } from 'express'
import { ObjectID } from 'mongodb'

import { findUserById } from '../helpers/selectors'
import { getLeaguesCollection } from '../../database/collections'

const adminsRouter = Router({ mergeParams: true })

/**
 * POST ~/leagues/:leagueId/admins
 *
 * Adds provided user as admin of the league with provided ID for the app with provided `App-Key`.
 * If user doesn't exist returns 404.
 *
 * Returns:
 *  - 204 - Insert successful
 *  - 404 - No league with provided ID / NO user with provided ID
 *  - 422 - Invalid ID
 *  - 500 - Update failed
 */
adminsRouter.post('/', async (req: Request, res: Response) => {
  const userId = req.body.userId

  const newAdminUser = await findUserById(req.body.userId)

  if (!newAdminUser) {
    return res.status(404).json({ error: 'New admin ID does not exist' })
  }

  const leagueId = req.params.leagueId

  const leaguesCollection = await getLeaguesCollection()

  const status = await leaguesCollection.updateOne(
    { _id: new ObjectID(leagueId), admins: req.user.id, appKey: req.appKey },
    { $addToSet: { admins: userId } }
  )

  if (!status.matchedCount) {
    return res.status(404).json({ error: 'League with ID where you are admin not found' })
  }

  return res.status(204).end()
})

/**
 * DELETE ~/leagues/:leagueId/admins
 *
 * Deletes provided user as admin of the league with provided ID for the app with provided `App-Key`.
 *
 * Returns:
 *  - 204 - Deletion successful
 *  - 404 - No league with provided ID
 *  - 422 - Invalid ID
 *  - 500 - Update failed
 */
adminsRouter.delete('/', async (req: Request, res: Response) => {
  const leagueId = req.params.leagueId

  const leaguesCollection = await getLeaguesCollection()

  const status = await leaguesCollection.updateOne(
    { _id: new ObjectID(leagueId), admins: req.user.id, appKey: req.appKey },
    { $pull: { admins: req.body.userId } }
  )

  if (!status.matchedCount) {
    return res.status(404).json({ error: 'League with ID where you are admin not found' })
  }

  return res.status(204).end()
})

export default adminsRouter
