export interface User {
  username: string
  password: string
  createdAt: string
  streak: number
  lastActiveDate: string
}

export interface Task {
  id: string
  text: string
  completed: boolean
  date: string // YYYY-MM-DD
  username: string
}
