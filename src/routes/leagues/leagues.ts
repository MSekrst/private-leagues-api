import { Router } from 'express'
import { check } from 'express-validator'

import { findLeaguesByAppId } from '../helpers/selectors'
import { hasValidationError, nameValidator } from '../helpers/validators'
import { sanitizeMongoId } from '../helpers/sanitizers'
import { getLeaguesCollection } from '../../database/collections'

const leaguesRouter = Router()

/**
 * GET ~/leagues
 *
 * Returns list of all leagues for the app with provided App-Key.
 *
 * Returns:
 * - 200 - Success -> List of leagues
 */
leaguesRouter.get('/', async (req, res) => {
  const leagues = await findLeaguesByAppId({ appKey: req.appKey, userId: req.user.id })

  const sanitizedLeagues = leagues.map(league => {
    sanitizeMongoId(league)
    delete league.events
    delete league.appKey

    return league
  })

  return res.status(200).json(sanitizedLeagues)
})

/**
 * POST ~/leagues
 *
 * Adds new league to collection for app with provided `App-Key`.
 *
 * Returns:
 *  - 201 - Created -> Created league ID
 *  - 422 - Name is not valid string
 *  - 500 - Insert failed
 */
leaguesRouter.post(
  '/',
  check('name').custom(nameValidator),
  hasValidationError('Name is missing'),
  async (req, res) => {
    const unixTimestamp = Math.round(Date.now() / 1000)

    const league = {
      ...req.body,
      appKey: req.appKey,
      admins: [req.user.id],
      users: [],
      events: [],
      createdAtTimestamp: unixTimestamp,
      updatedAtTimestamp: unixTimestamp,
    }

    const leaguesCollection = await getLeaguesCollection()

    const insertInfo = await leaguesCollection.insertOne(league)

    if (!insertInfo.insertedId) {
      return res.status(500).json({ error: 'League creation failed' })
    }

    return res.status(201).json({ id: insertInfo.insertedId })
  }
)

export default leaguesRouter
