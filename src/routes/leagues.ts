import { Router } from 'express'
import { check } from 'express-validator'
import { ObjectID } from 'mongodb'
import { findLeaguesByAppId } from './helpers/selectors'
import { hasValidationError, nameValidator } from './helpers/validators'
import { sanitizeMongoId } from './helpers/sanitizers'
import { getLeaguesCollection } from '../database/collections'

const leaguesRouter = Router()

/**
 * GET ~/leagues
 *
 * Returns list of all leagues for app with provided App-Key.
 *
 * Returns:
 * - 200 - Success -> List of leagues
 */
leaguesRouter.get('/', async (req, res) => {
  const leagues = await findLeaguesByAppId(req.appKey)

  const sanitizedLeagues = leagues.map(sanitizeMongoId)

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
      participants: [],
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

/**
 * PATCH ~/leagues/:id
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
leaguesRouter.patch('/:id', check('id').isMongoId(), hasValidationError('Invalid league ID'), async (req, res) => {
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
  delete leagueModifications.participants
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
    { _id: new ObjectID(req.params.id), admins: req.user.id },
    { $set: { ...leagueModifications } }
  )

  if (!updatedInfo.matchedCount) {
    return res.status(404).json({ error: 'League with ID where you are admin not found' })
  }

  return res.status(204).end()
})

/**
 * DELETE ~/leagues/:id
 *
 * Modifies league with provided ID in collection for app with provided `App-Key`.
 *
 * Returns:
 *  - 204 - Update successful
 *  - 404 - No league with provided ID
 *  - 422 - Invalid ID
 *  - 500 - Update failed
 */
leaguesRouter.delete('/:id', check('id').isMongoId(), hasValidationError('Invalid league ID'), async (req, res) => {
  const leaguesCollection = await getLeaguesCollection()

  const deletedInfo = await leaguesCollection.deleteOne({ _id: new ObjectID(req.params.id) })

  if (!deletedInfo.deletedCount) {
    return res.status(404).json({ error: 'League with ID where you are admin not found' })
  }

  return res.status(204).end()
})

// TODO: add admin change, participants, ...

export default leaguesRouter
