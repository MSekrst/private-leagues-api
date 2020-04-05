import { User } from '../model/User'

// Extend Express Request type with custom `user` field
declare global {
  namespace Express {
    interface Request {
      user?: User
    }
  }
}
