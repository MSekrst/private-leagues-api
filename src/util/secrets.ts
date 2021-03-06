import logger from './logger'
import dotenv from 'dotenv'
import fs from 'fs'

if (fs.existsSync('.env')) {
  logger.debug('Using .env file to supply config environment variables')
  dotenv.config({ path: '.env' })
}

export const ENVIRONMENT = process.env.NODE_ENV
const prod = ENVIRONMENT === 'production' // Anything else is treated as 'dev'
export const IS_TEST = ENVIRONMENT === 'test'

export const MONGODB_URI = prod ? process.env['MONGODB_URI'] : process.env['MONGODB_URI_LOCAL']

if (!MONGODB_URI) {
  if (prod) {
    logger.error('No mongo connection string. Set MONGODB_URI environment variable.')
  } else {
    logger.error('No mongo connection string. Set MONGODB_URI_LOCAL environment variable.')
  }
  process.exit(1)
}

export const PORT = prod ? process.env['PORT'] : process.env['PORT_LOCAL']

export const JWT_SECRET = process.env.JWT_SECRET

if (!JWT_SECRET) {
  logger.error('No JWT Token secret. Set JWT_SECRET environment variable.')

  process.exit(1)
}

const appKeys = process.env.APP_KEYS || ''

export const APP_KEYS = appKeys.split(',')
