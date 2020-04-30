import request, { Response } from 'supertest'

import app from '../src/app'
import { User } from '../src/model/User'
import { getDBConnection, closeDBConnection } from '../src/database/mongo'
import { getUsersCollection } from '../src/database/collections'

beforeAll(async () => {
  await getDBConnection() // open test db connections
})

let testUsername = 'testUser'
const testPassword = 'testUser-password'
let testId = ''
let testToken = ''
const testData = 'test-extra-data'

describe('Auth', () => {
  describe('POST /register', () => {
    it('should add new user', async () => {
      const response: Response = await request(app)
        .post('/api/register')
        .send({ username: testUsername, password: testPassword, data: testData })
        .set('Content-Type', 'application/json')
        .expect(200)

      expect(typeof response.body).toBe('object')

      const { id, error } = response.body

      expect(error).toBeUndefined()
      expect(typeof id).toBe('string')

      testId = id
    })

    it('should return 422 for malformed username', done => {
      request(app)
        .post('/api/register')
        .send({ username: 'invalidChars_@!$', password: testPassword })
        .set('Content-Type', 'application/json')
        .expect(422, done)
    })

    it('should return 422 for malformed password', done => {
      request(app)
        .post('/api/register')
        .send({ username: testUsername, password: 'invalidChars_@!$' })
        .set('Content-Type', 'application/json')
        .expect(422, done)
    })

    it('should return 422 for too short passwords', done => {
      request(app)
        .post('/api/register')
        .send({ username: testUsername, password: 'short' })
        .set('Content-Type', 'application/json')
        .expect(422, done)
    })

    it('should return 409 for taken username', done => {
      request(app)
        .post('/api/register')
        .send({ username: testUsername, password: testPassword })
        .set('Content-Type', 'application/json')
        .expect(409, done)
    })
  })

  describe('POST /login', () => {
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

      testToken = token

      const { username, password, id, _id } = user as User

      expect(username).toBe(testUsername)
      expect(password).toBeUndefined()
      expect(id).toBe(testId)
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

  describe('POST /check-token', () => {
    it('should return 204 for valid token', async done => {
      request(app)
        .post('/api/check-token')
        .send({ token: testToken })
        .set('Content-Type', 'application/json')
        .expect(204, done)
    })

    it('should return 422 for malformed token', done => {
      request(app)
        .post('/api/check-token')
        .send({ token: 'fakeToken' })
        .set('Content-Type', 'application/json')
        .expect(422, done)
    })

    // TODO: add this test when tokens will be checked in DB
    // it('should return 401 for forged token', done => {
    //   const forgedToken =
    //     'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3RVc2VyMiIsImlkIjoiNWU4YjRiYjYwN2I1ZDcwMDIzOGE4NWQ1IiwiaWF0IjoxNTg2MTg3NzY1LCJleHAiOjE1ODgwMDIxNjUsImlzcyI6InByaXZhdGUtbGVhZ3Vlcy1hcGkifQ.i5glDC00da7mDq2kcTVGOGH_O3_HF0j17A6lHhKItPc'

    //   request(app)
    //     .post('/api/check-token')
    //     .send({ token: forgedToken })
    //     .set('Content-Type', 'application/json')
    //     .expect(422, done)
    // })
  })
})

const testToken2 =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3RVc2VyMiIsImlkIjoiNWVhMDNmZmM2MWQwYjgwMDIzZjI1MGM5IiwiaWF0IjoxNTg3NTYwNDUxLCJleHAiOjE1ODkzNzQ4NTEsImlzcyI6InByaXZhdGUtbGVhZ3Vlcy1hcGkifQ.A9rKyKyrM7dYfB7990Na1LHuUG5WFTj5ei7aa__JQ1Q'

describe('User', () => {
  describe('GET /users/me', () => {
    it('returns current user profile', async () => {
      const response: Response = await request(app)
        .get('/api/users/me')
        .set('Authorization', `Bearer ${testToken}`)
        .expect(200)

      expect(typeof response.body).toBe('object')
      expect(response.body.error).toBeUndefined()

      const user = response.body

      expect(user.id).toBe(testId)
      expect(user.username).toBe(testUsername)
      expect(user.data).toBe(testData)
    })

    it('returns 404 for token of non existing user', done => {
      request(app).get('/api/users/me').set('Authorization', `Bearer ${testToken2}`).expect(404, done)
    })
  })

  const nonExistingUserId = '5e8726e7baae964361c80456'
  const extraData = 'text-more-extra-data'

  describe('PATCH /users/me', () => {
    it('returns 409 if new username taken', done => {
      request(app)
        .patch('/api/users/me')
        .send({ username: testUsername })
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${testToken}`)
        .expect(409, done)
    })

    it('updates current user', done => {
      testUsername = 'testUserNamePatched'

      request(app)
        .patch('/api/users/me')
        // id should not change
        .send({ id: nonExistingUserId, username: testUsername, password: `${testPassword}v2`, extraData })
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${testToken}`)
        .expect(204, done)
    })

    it('returns 422 if no updates', done => {
      request(app)
        .patch('/api/users/me')
        .send({})
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${testToken}`)
        .expect(422, done)
    })

    it('returns 422 if only id update', done => {
      request(app)
        .patch('/api/users/me')
        .send({ id: nonExistingUserId })
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${testToken}`)
        .expect(422, done)
    })

    it('returns 422 if new username invalid', done => {
      request(app)
        .patch('/api/users/me')
        .send({ username: 'username123Invalid!@#!$' })
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${testToken}`)
        .expect(422, done)
    })

    it('returns 422 if new password invalid', done => {
      request(app)
        .patch('/api/users/me')
        .send({ password: 'passwordInvalid!@#!$' })
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${testToken}`)
        .expect(422, done)
    })
    it('returns 404 if user does not exist', done => {
      request(app)
        .patch('/api/users/me')
        .send({ extraData })
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${testToken2}`)
        .expect(404, done)
    })
  })

  describe('GET /users/:id', () => {
    it('returns current user profile', async () => {
      const response: Response = await request(app)
        .get(`/api/users/${testId}`)
        .set('Authorization', `Bearer ${testToken2}`)
        .expect(200)

      expect(typeof response.body).toBe('object')
      expect(response.body.error).toBeUndefined()

      const user = response.body

      expect(user.id).toBe(testId)
      expect(user.username).toBe(testUsername)
      expect(user.data).toBe(testData)
      expect(user.extraData).toBe(extraData)
    })

    it('returns 404 for invalid user ID', done => {
      request(app).get('/api/users/wrongID').set('Authorization', `Bearer ${testToken}`).expect(422, done)
    })

    it('returns 404 for non existing user', done => {
      request(app).get(`/api/users/${nonExistingUserId}`).set('Authorization', `Bearer ${testToken}`).expect(404, done)
    })
  })

  describe('DELETE /users/me', () => {
    it('deletes current user', done => {
      request(app).delete('/api/users/me').set('Authorization', `Bearer ${testToken}`).expect(204, done)
    })

    it('return 204 for non existing user', done => {
      request(app).delete('/api/users/me').set('Authorization', `Bearer ${testToken2}`).expect(204, done)
    })
  })
})

afterAll(async () => {
  const users = await getUsersCollection()

  users.deleteMany({}) // clear user database

  await closeDBConnection() // close db test connection
})
