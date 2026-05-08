import type { Expense, Settlement } from './types'

// Positive = other person owes currentUser. Negative = currentUser owes other person.
export function getNetBalance(
  currentUserId: string,
  otherPersonId: string,
  expenses: Expense[],
  settlements: Settlement[]
): number {
  let balance = 0

  for (const expense of expenses) {
    const share = expense.amount / expense.splitBetween.length
    if (expense.paidById === currentUserId && expense.splitBetween.includes(otherPersonId)) {
      balance += share
    }
    if (expense.paidById === otherPersonId && expense.splitBetween.includes(currentUserId)) {
      balance -= share
    }
  }

  for (const s of settlements) {
    if (s.fromId === otherPersonId && s.toId === currentUserId) {
      // Other person paid current user — reduces their debt to us
      balance -= s.amount
    }
    if (s.fromId === currentUserId && s.toId === otherPersonId) {
      // Current user paid other person — reduces our debt to them
      balance += s.amount
    }
  }

  return Math.round(balance * 100) / 100
}

export function getAllBalances(
  currentUserId: string,
  memberIds: string[],
  expenses: Expense[],
  settlements: Settlement[]
): Record<string, number> {
  const result: Record<string, number> = {}
  for (const id of memberIds) {
    if (id === currentUserId) continue
    result[id] = getNetBalance(currentUserId, id, expenses, settlements)
  }
  return result
}

export function totalIOwe(balances: Record<string, number>): number {
  return Math.round(
    Math.abs(Object.values(balances).filter(b => b < 0).reduce((s, b) => s + b, 0)) * 100
  ) / 100
}

export function totalOwedToMe(balances: Record<string, number>): number {
  return Math.round(
    Object.values(balances).filter(b => b > 0).reduce((s, b) => s + b, 0) * 100
  ) / 100
}

export function formatAUD(amount: number): string {
  return `$${Math.abs(amount).toFixed(2)}`
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export const AVATAR_COLORS = [
  'linear-gradient(135deg, #FF6B6B, #FF8E53)',
  'linear-gradient(135deg, #667EEA, #764BA2)',
  'linear-gradient(135deg, #11998E, #38EF7D)',
  'linear-gradient(135deg, #F093FB, #F5576C)',
  'linear-gradient(135deg, #FCCB90, #D57EEB)',
  'linear-gradient(135deg, #43E97B, #38F9D7)',
  'linear-gradient(135deg, #FA709A, #FEE140)',
  'linear-gradient(135deg, #A8EDEA, #FED6E3)',
]

export function uid(): string {
  return Math.random().toString(36).slice(2, 11)
}

export function generateCode(): string {
  return Math.random().toString(36).slice(2, 8).toUpperCase()
}

export const CATEGORY_META: Record<string, { icon: string; bg: string }> = {
  Rent: { icon: '🏠', bg: '#FFF0F0' },
  Utilities: { icon: '⚡', bg: '#FFF9E6' },
  Groceries: { icon: '🛒', bg: '#F0FFF4' },
  Entertainment: { icon: '📺', bg: '#F0F4FF' },
  Other: { icon: '✨', bg: '#F5F5FF' },
}
