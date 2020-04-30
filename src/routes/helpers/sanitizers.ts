export function sanitizeMongoId(object: Record<string, any>) {
  object.id = object._id
  delete object._id

  return object
}

export function sanitizeUser(user: Record<string, any>) {
  sanitizeMongoId(user)
  delete user.password

  return user
}
