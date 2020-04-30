import { Request, Response } from 'express'

import { APP_KEYS } from '../../../util/secrets'

import { HEADER_NAME, isAuthorized } from '../authorization'

describe('isAuthorized middleware', () => {
  const appKey = APP_KEYS[APP_KEYS.length - 1]

  let next = jest.fn()
  let req: Request
  let res: Response

  beforeEach(() => {
    const pipe = () => res
    const json = jest.fn(pipe)
    const status = jest.fn(pipe)

    req = ({
      headers: {
        [HEADER_NAME]: `${appKey}`,
      },
    } as unknown) as Request
    res = ({ status, json } as unknown) as Response
    next = jest.fn()
  })

  it('passes request with valid header', () => {
    isAuthorized(req, res, next)

    expect(next).toBeCalledTimes(1)
    expect(next).toBeCalledWith()
  })

  it('responses 403 when wrong app key', () => {
    req.headers[HEADER_NAME] = 'test-app-key-wrong'

    isAuthorized(req, res, next)

    expect(next).toBeCalledTimes(0)
    expect(res.status).toBeCalledTimes(1)
    expect(res.status).toBeCalledWith(403)
  })

  it('responses 403 when header is missing', () => {
    delete req.headers[HEADER_NAME]

    isAuthorized(req, res, next)

    expect(next).toBeCalledTimes(0)
    expect(res.status).toBeCalledTimes(1)
    expect(res.status).toBeCalledWith(403)
  })
})
