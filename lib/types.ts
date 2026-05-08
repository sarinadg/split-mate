export type Category = 'Rent' | 'Utilities' | 'Groceries' | 'Entertainment' | 'Other'

export interface Person {
  id: string
  name: string
  initials: string
  color: string // CSS gradient string
  handle: string
}

export interface House {
  id: string
  name: string
  code: string
  memberIds: string[]
}

export interface Expense {
  id: string
  houseId: string
  name: string
  amount: number
  category: Category
  paidById: string
  splitBetween: string[] // person IDs
  date: string // ISO string
}

export interface Settlement {
  id: string
  fromId: string // who paid
  toId: string // who received
  amount: number
  date: string
}

export interface AppState {
  currentUserId: string | null
  people: Person[]
  house: House | null
  expenses: Expense[]
  settlements: Settlement[]
}
