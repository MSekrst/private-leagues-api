import { Router, Request, Response } from 'express'
import { ObjectID } from 'mongodb'

import { findLeaguesByAppId } from '../helpers/selectors'
import { nameValidator } from '../helpers/validators'
import { sanitizeMongoId } from '../helpers/sanitizers'
import { getLeaguesCollection } from '../../database/collections'

const detailsRouter = Router({ mergeParams: true })

/**
 * GET ~/leagues/:leagueId
 *
 * Returns league with provided ID for the app with provided App-Key.
 *
 * Returns:
 * - 200 - Success -> League with provided ID
 * - 404 - No league with provided ID
 * - 422 - Invalid ID
 */
detailsRouter.get('/', async (req: Request, res: Response) => {
  const leagues = await findLeaguesByAppId({ appKey: req.appKey, userId: req.user.id, id: req.params.leagueId })

  if (!leagues.length) {
    return res.status(404).json({ error: 'League not found' })
  }

  const league = leagues[0]

  sanitizeMongoId(league)
  delete league.appKey

  return res.status(200).json(league)
})

/**
 * PATCH ~/leagues/:leagueId
 *
 * Modifies league with provided ID in collection for app with provided `App-Key`.
 * League will be modified only if user is one of leagues admins.
 *
 * Returns:
 *  - 204 - Update successful
 *  - 404 - No league with provided ID
 *  - 422 - Invalid ID
 *  - 500 - Update failed
 */
detailsRouter.patch('/', async (req, res) => {
  const unixTimestamp = Math.round(Date.now() / 1000)

  const leagueModifications = {
    ...req.body,
    updatedAtTimestamp: unixTimestamp,
  }

  // some modifications are forbidden and ignored
  delete leagueModifications.id
  delete leagueModifications._id
  delete leagueModifications.appKey
  delete leagueModifications.admins
  delete leagueModifications.users
  delete leagueModifications.events
  delete leagueModifications.createdAtTimestamp

  try {
    if (leagueModifications.name) {
      nameValidator(leagueModifications.name)
    }
  } catch (e) {
    return res.status(422).json({ error: 'Invalid name' })
  }

  const leaguesCollection = await getLeaguesCollection()

  const updatedInfo = await leaguesCollection.updateOne(
    { _id: new ObjectID(req.params.leagueId), admins: req.user.id, appKey: req.appKey },
    { $set: { ...leagueModifications } }
  )

  if (!updatedInfo.matchedCount) {
    return res.status(404).json({ error: 'League with ID where you are admin not found' })
  }

  return res.status(204).end()
})

/**
 * DELETE ~/leagues/:leagueId
 *
 * Modifies league with provided ID in collection for app with provided `App-Key`.
 *
 * Returns:
 *  - 204 - Update successful
 *  - 404 - No league with provided ID
 *  - 422 - Invalid ID
 *  - 500 - Update failed
 */
detailsRouter.delete('/', async (req, res) => {
  const leaguesCollection = await getLeaguesCollection()

  const deletedInfo = await leaguesCollection.deleteOne({
    _id: new ObjectID(req.params.leagueId),
    admins: req.user.id,
    appKey: req.appKey,
  })

  if (!deletedInfo.deletedCount) {
    return res.status(404).json({ error: 'League with ID where you are admin not found' })
  }

  return res.status(204).end()
})

export default detailsRouter
