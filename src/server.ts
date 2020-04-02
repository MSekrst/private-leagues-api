import errorHandler from 'errorhandler'

import app from './app'
import { ENVIRONMENT, PORT } from './util/secrets'

/**
 * Error Handler. Provides full stack - remove for production
 */
if (ENVIRONMENT !== 'production') {
  app.use(errorHandler())
}

/**
 * Start Express server.
 */
const server = app.listen(PORT, () => {
  console.log('  App is running at http://localhost:%d in %s mode', PORT, ENVIRONMENT)
  console.log('  Press CTRL-C to stop\n')
})

export default server
