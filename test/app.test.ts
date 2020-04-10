import request from 'supertest'
import app from '../src/app'

describe('GET /', () => {
  it('should return 200', done => {
    request(app).get('/').expect(200, 'Api is working', done)
  })
})

describe('GET /random-url', () => {
  it('should return 404', done => {
    request(app).get('/random-url').expect(404, done)
  })
})
