import { Router } from 'express'
import { ObjectID } from 'mongodb'

import { findLeaguesByAppId } from '../helpers/selectors'
import { getLeaguesCollection } from '../../database/collections'

const eventDetailsRouter = Router({ mergeParams: true })

/**
 * GET ~/leagues/:leagueId/events/:eventId
 *
 * Returns event details.
 *
 * Returns:
 *  - 200 - Event details
 *  - 404 - No league/event with provided ID
 *  - 422 - Invalid ID
 */
eventDetailsRouter.get('/', async (req, res) => {
  const userId = req.user.id
  const eventId = req.params.eventId

  const leagueCollection = await getLeaguesCollection()

  const league = await leagueCollection.findOne({
    _id: new ObjectID(req.params.leagueId),
    appKey: req.appKey,
    $or: [{ admins: userId }, { users: userId }],
    'events.id': new ObjectID(eventId),
  })

  if (!league) {
    return res.status(404).json({ error: 'No league or event found' })
  }

  return res.status(200).json(league.events.find(e => new ObjectID(e.id).toString() === eventId))
})

/**
 * PATCH ~/leagues/:leagueId/events/:eventId
 *
 * Updates provided event with new fields. Existing fields will be replaced with new fields.
 *
 * Returns:
 *  - 204 - Successful update
 *  - 404 - No league/event with provided ID
 *  - 422 - Invalid ID
 */
eventDetailsRouter.patch('/', async (req, res) => {
  const event = req.body

  delete event.id
  delete event._id

  if (!Object.keys(event).length) {
    return res.status(422).json({ error: 'No valid fields' })
  }

  const userId = req.user.id
  const eventId = req.params.eventId

  const leagueCollection = await getLeaguesCollection()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const changes = {} as Record<string, any>
  Object.keys(event).forEach(key => {
    changes[`events.$.${key}`] = event[key]
  })

  const status = await leagueCollection.updateOne(
    {
      _id: new ObjectID(req.params.leagueId),
      appKey: req.appKey,
      $or: [{ admins: userId }, { users: userId }],
      'events.id': new ObjectID(eventId),
    },
    { $set: changes }
  )

  if (!status.matchedCount) {
    return res.status(404).json({ error: 'No league or event found' })
  }

  if (status.modifiedCount) {
    return res.status(204).json()
  }

  return res.status(400).json({ error: 'Event not updated' })
})

/**
 * DELETE ~/leagues/:leagueId/events/:eventId
 *
 * Removed event from the league.
 *
 * Returns:
 *  - 204 - Event removed
 *  - 404 - No league with provided ID
 *  - 422 - Invalid event
 */
eventDetailsRouter.delete('/', async (req, res) => {
  const userId = req.user.id

  const leagueCollection = await getLeaguesCollection()

  const status = await leagueCollection.updateOne(
    {
      _id: new ObjectID(req.params.leagueId),
      appKey: req.appKey,
      $or: [{ admins: userId }, { users: userId }],
    },
    { $pull: { events: { id: new ObjectID(req.params.eventId) } } }
  )

  if (!status.matchedCount) {
    return res.status(404).json({ error: 'No league with provided ID where you have admin rights' })
  }

  return res.status(204).json()
})

export default eventDetailsRouter
