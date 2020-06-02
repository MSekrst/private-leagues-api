import { Event } from './Event'

export interface League {
  id: string
  appKey: string
  name: string
  events: Event[]
  admins: string[]
  users: string[]
  createdAtTimestamp: number
  updatedAtTimestamp: number
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any
}
