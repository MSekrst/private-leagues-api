import { IS_TEST } from '../util/secrets'

export const DB_NAME = IS_TEST ? 'test-db' : 'private-leagues'

export const USERS_COLLECTION = 'users'
export const LEAGUES_COLLECTION = 'leagues'
