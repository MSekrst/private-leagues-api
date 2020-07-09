import { Router } from 'express'
import { ObjectID } from 'mongodb'

import { findLeaguesByAppId } from '../helpers/selectors'
import { getLeaguesCollection } from '../../database/collections'

const eventsRouter = Router({ mergeParams: true })

/**
 * GET ~/leagues/:leagueId/events
 *
 * Returns list of events for provided leagueId.
 *
 * Returns:
 *  - 200 - Event list
 *  - 404 - No league with provided ID
 *  - 422 - Invalid ID
 */
eventsRouter.get('/', async (req, res) => {
  const leagues = await findLeaguesByAppId({ appKey: req.appKey, userId: req.user.id, id: req.params.leagueId })

  const league = leagues[0]

  if (!league) {
    return res.status(404).json({ error: 'No league with provided ID' })
  }

  return res.status(200).json(league.events || [])
})

/**
 * POST ~/leagues/:leagueId/events
 *
 * Adds new event to the league. Cannot add empty events.
 *
 * Returns:
 *  - 201 - Event created -> returns id
 *  - 400 - Event creation error
 *  - 404 - No league with provided ID
 *  - 422 - Invalid event
 */
eventsRouter.post('/', async (req, res) => {
  const event = req.body

  delete event.id
  delete event._id

  if (!Object.keys(event).length) {
    return res.status(422).json({ error: 'No valid fields' })
  }

  const userId = req.user.id
  const eventId = new ObjectID()
  event.id = eventId

  const leagueCollection = await getLeaguesCollection()

  const status = await leagueCollection.updateOne(
    { _id: new ObjectID(req.params.leagueId), appKey: req.appKey, $or: [{ admins: userId }, { users: userId }] },
    { $push: { events: event } }
  )

  if (!status.matchedCount) {
    return res.status(404).json({ error: 'No league with provided ID where you have admin rights' })
  }

  if (status.modifiedCount) {
    return res.status(201).json({ id: eventId })
  }

  return res.status(400).json({ error: 'Event not created' })
})

export default eventsRouter
