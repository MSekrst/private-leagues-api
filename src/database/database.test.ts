import initializeDBConnection, { getDBConnection } from './mongo'
import { getUsersCollection, getLeaguesCollection } from './collections'

describe('Database integration', () => {
  it('initialize DB connection', async done => {
    const db = await initializeDBConnection()

    expect(db).not.toBe(null)

    done()
  })

  it('returns existing db instance on multiple calls', async done => {
    const db = await getDBConnection()
    const db2 = await getDBConnection()

    expect(db).toBe(db2)

    done()
  })
})

describe('Database collections', () => {
  it('returns users collection', async done => {
    const usersCollection = await getUsersCollection()

    expect(typeof usersCollection).toBe('object')
    // Check if mongoDB collection
    expect(usersCollection.findOne).toBeDefined()

    done()
  })

  it('returns leagues collection', async done => {
    const leagues = await getLeaguesCollection()

    expect(typeof leagues).toBe('object')
    // Check if mongoDB collection
    expect(leagues.findOne).toBeDefined()

    done()
  })
})
