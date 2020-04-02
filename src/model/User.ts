export interface User {
  id: string
  username: string
  password: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any
}
