import { sanitizeMongoId, sanitizeUser } from '../sanitizers'

describe('Sanitizers', () => {
  const id = 'test-ID'

  it('removes mongo ID and adds ordinary ID', () => {
    const object = { _id: id, id: '' }

    sanitizeMongoId(object)

    expect(object._id).not.toBeDefined()
    expect(object.id).toBe(id)
  })

  it('removes user object', () => {
    const username = 'testUsername'
    const user = { _id: id, id: '', username, password: 'testUserPassword' }

    sanitizeUser(user)

    expect(user._id).not.toBeDefined()
    expect(user.password).not.toBeDefined()
    expect(user.id).toBe(id)
    expect(user.username).toBe(username)
  })
})
