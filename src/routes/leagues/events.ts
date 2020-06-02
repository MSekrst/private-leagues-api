import { Router, Request, Response } from 'express'

import { findLeaguesByAppId } from '../helpers/selectors'

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
eventsRouter.get('/', async (req: Request, res: Response) => {
  const leagues = await findLeaguesByAppId({ appKey: req.appKey, userId: req.user.id, id: req.params.leagueId })

  const league = leagues[0]

  if (!league) {
    return res.status(404).json({ error: 'No league with provided ID' })
  }

  return res.status(200).json(league.events || [])
})

export default eventsRouter
