import request, { Response } from 'supertest'

import app from '../src/app'
import { User } from '../src/model/User'

describe('Auth', () => {
  describe('POST /login', () => {
    const testUsername = 'testUser'
    const testPassword = 'testUser-password'

    it('should return user data for existing user', async done => {
      const response: Response = await request(app)
        .post('/api/login')
        .send({ username: testUsername, password: testPassword })
        .set('Content-Type', 'application/json')
        .expect(200)

      expect(typeof response.body).toBe('object')

      const { token, user, error } = response.body

      expect(error).toBeUndefined()
      expect(typeof token).toBe('string')
      expect(typeof user).toBe('object')

      const { username, password, id, _id } = user as User

      expect(username).toBe(testUsername)
      expect(password).toBeUndefined()
      expect(typeof id).toBe('string') // TODO: insert user before tests and delete it after, so check real ID
      expect(_id).toBeUndefined()

      done()
    })

    it('should return 422 for malformed username', done => {
      request(app)
        .post('/api/login')
        .send({ username: 'invalidChars_@!$', password: testPassword })
        .set('Content-Type', 'application/json')
        .expect(422, done)
    })

    it('should return 422 for malformed password', done => {
      request(app)
        .post('/api/login')
        .send({ username: testUsername, password: 'invalidChars_@!$' })
        .set('Content-Type', 'application/json')
        .expect(422, done)
    })

    it('should return 422 for too short passwords', done => {
      request(app)
        .post('/api/login')
        .send({ username: testUsername, password: 'short' })
        .set('Content-Type', 'application/json')
        .expect(422, done)
    })

    it('should return 404 for non existing username', done => {
      request(app)
        .post('/api/login')
        .send({ username: 'someWeirdButNonExistingButValidUsername', password: testPassword })
        .set('Content-Type', 'application/json')
        .expect(404, done)
    })

    it('should return 404 for invalid password for existing username', done => {
      request(app)
        .post('/api/login')
        .send({ username: testUsername, password: 'validButWrongPassword' })
        .set('Content-Type', 'application/json')
        .expect(404, done)
    })

    it('should return 404 for invalid password and invalid username', done => {
      request(app)
        .post('/api/login')
        .send({ username: 'someWeirdButNonExistingButValidUsername', password: 'validButWrongPassword' })
        .set('Content-Type', 'application/json')
        .expect(404, done)
    })
  })

  describe('POST /register', () => {
    it('Will be written as TODO', () => {
      // TODO: add /register tests

      expect(true).toBe(true)
    })
  })
})
