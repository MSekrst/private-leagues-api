import { Request, Response } from 'express'

import { User } from '../../../model'

import { generateToken, verifyToken, isAuthenticated } from '../token'

describe('Token', () => {
  const token =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6IlRlc3RVc2VybmFtZSIsImlkIjoidGVzdElEIiwiaWF0IjoxNTg3NTU1MDM0LCJleHAiOjE1ODkzNjk0MzQsImlzcyI6InByaXZhdGUtbGVhZ3Vlcy1hcGkifQ.l-TFSOGKdFp37TsiLwiD9xG9d0LSpMusslTbM1Pfrhk'
  const user = {
    username: 'TestUsername',
    id: 'testID',
  }

  describe('validation & generation', () => {
    it('generates user token', () => {
      const token = generateToken(user as User)

      expect(typeof token).toBe('string')
      expect(token.length).toBeGreaterThan(0)

      // same object will create two different tokens on repeated generation so token cannot be exact matched
    })

    it('verifies valid user token', () => {
      const tokenUser = verifyToken(token)

      expect(tokenUser).not.toBe(null)
      expect(typeof tokenUser).toBe('object')

      expect(tokenUser.id).toBe(user.id)
      expect(tokenUser.username).toBe(user.username)
    })

    it('returns null for invalid token', () => {
      const returned = verifyToken('random.token.123')

      expect(returned).toBe(null)
    })
  })

  describe('isAuthenticated middleware', () => {
    // TODO: extract to separate mock
    let next = jest.fn()
    let req: Request
    let res: Response

    beforeEach(() => {
      const pipe = () => res
      const json = jest.fn(pipe)
      const status = jest.fn(pipe)

      req = {
        headers: {
          authorization: `Bearer ${token}`,
        },
      } as Request
      res = ({ status, json } as unknown) as Response
      next = jest.fn()
    })

    it('passes request with valid token', async () => {
      isAuthenticated(req, res, next)

      expect(next).toBeCalledTimes(1)
      expect(next).toBeCalledWith()

      expect(typeof req.user).not.toBe(null)
      expect(typeof req.user).toBe('object')

      const { username, id } = req.user

      expect(username).toBe(user.username)
      expect(id).toBe(user.id)
    })

    it('responses 401 when Bearer missing', () => {
      req.headers.authorization = `Carrier ${token}`

      isAuthenticated(req, res, next)

      expect(next).toBeCalledTimes(0)
      expect(res.status).toBeCalledTimes(1)
      expect(res.status).toBeCalledWith(401)
    })

    it('responses 401 when token in invalid', () => {
      req.headers.authorization = 'Bearer invalid.token.123'

      isAuthenticated(req, res, next)

      expect(next).toBeCalledTimes(0)
      expect(res.status).toBeCalledTimes(1)
      expect(res.status).toBeCalledWith(401)
    })

    it('responses 401 when header has only 1 item', () => {
      req.headers.authorization = `Bearer${token}`

      isAuthenticated(req, res, next)

      expect(next).toBeCalledTimes(0)
      expect(res.status).toBeCalledTimes(1)
      expect(res.status).toBeCalledWith(401)
    })

    it('responses 401 when header has more then 2 items', () => {
      req.headers.authorization = `Bearer ${token} extraInfo`

      isAuthenticated(req, res, next)

      expect(next).toBeCalledTimes(0)
      expect(res.status).toBeCalledTimes(1)
      expect(res.status).toBeCalledWith(401)
    })

    it('responses 401 for request without header', () => {
      delete req.headers.authorization

      isAuthenticated(req, res, next)

      expect(next).toBeCalledTimes(0)
      expect(res.status).toBeCalledTimes(1)
      expect(res.status).toBeCalledWith(401)
    })
  })
})
