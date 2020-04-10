import initializeDBConnection, { getDBConnection } from '../src/database/mongo'
import { getUsersCollection } from '../src/database/collections'

describe('Database integration', () => {
  it('initialize DB connection', async (done) => {
    const db = await initializeDBConnection()

    expect(db).not.toBe(null)

    done()
  })

  it('returns existing db instance on multiple calls', async () => {
    const db = await getDBConnection()
    const db2 = await getDBConnection()

    expect(db).toBe(db2)
  })
})

describe('Database collections', () => {
  it('returns users collection', async () => {
    const usersCollection = await getUsersCollection()

    expect(typeof usersCollection).toBe('object')
    // Check if mongoDB collection
    expect(usersCollection.findOne).toBeDefined()
  })
})
