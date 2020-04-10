import bcrypt from 'bcrypt'

const SALT_ROUNDS = 10

/**
 * Secures plain text password. Password will be hashed with salt. Returns secured password.
 * 
 * @param password plain text password
 */
export async function getSecuredPassword(password: string) {
  // salt and hash password
  const securedPassword = await bcrypt.hash(password, SALT_ROUNDS)

  return securedPassword
}

/**
 * Checks if plain text password matches secured password stored in DB. Returns boolean result.
 * 
 * @param rawPassword plain text password
 * @param securedPassword secured password
 */
export async function isPasswordValid(rawPassword: string, securedPassword: string) {
  return await bcrypt.compare(rawPassword, securedPassword)
}
