import { getSecuredPassword, isPasswordValid } from '../password'

describe('Password', () => {
  const password = 'testPassword123'
  const encryptedPassword = '$2b$10$ocTOqqM1HRMrOkYVdYyAzurlqOMgbI.k8pY8ZmCzF9VyxPDaHxyhG'

  it('encrypts provided plain text password', async () => {
    const encrypted = await getSecuredPassword(password)

    expect(typeof encrypted).toBe('string')
    expect(encrypted.length).toBeGreaterThan(0)
  })

  it('returns true for matching passwords', async () => {
    const ret = await isPasswordValid(password, encryptedPassword)

    expect(ret).toBe(true)
  })

  it('returns false for wrong rawPassword', async () => {
    const ret = await isPasswordValid('wrongPassword', encryptedPassword)

    expect(ret).toBe(false)
  })

  it('returns false for wrong securedPassword', async () => {
    const ret = await isPasswordValid(password, 'wrongEncryptedPassword')

    expect(ret).toBe(false)
  })
})
