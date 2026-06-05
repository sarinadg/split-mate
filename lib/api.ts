const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'

async function request<T>(path: string, token: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...init?.headers,
    },
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new ApiError(res.status, body.detail ?? res.statusText)
  }

  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message)
    this.name = 'ApiError'
  }
}

// ── Types matching the backend response models ──────────────────────────────

export interface ApiUser {
  id: string
  name: string
  initials: string
  color: string
  handle: string
  house_id: string | null
}

export interface ApiHouse {
  id: string
  name: string
  code: string
  members: ApiUser[]
}

export interface ApiExpense {
  id: string
  house_id: string
  name: string
  amount: number
  category: string
  paid_by_id: string
  split_between: string[]
  date: string
}

export interface ApiSettlement {
  id: string
  house_id: string
  from_id: string
  to_id: string
  amount: number
  date: string
}

export interface ApiBalances {
  house_id: string
  // balances[A][B] > 0 → B owes A; < 0 → A owes B
  balances: Record<string, Record<string, number>>
}

// ── Store conversion helpers ─────────────────────────────────────────────────

import type { Person, House, Expense, Settlement, Category } from './types'

export function apiUserToPerson(u: ApiUser): Person {
  return { id: u.id, name: u.name, initials: u.initials, color: u.color, handle: u.handle }
}

export function apiHouseToStore(h: ApiHouse): { house: House; people: Person[] } {
  return {
    house: { id: h.id, name: h.name, code: h.code, memberIds: h.members.map(m => m.id) },
    people: h.members.map(apiUserToPerson),
  }
}

export function apiExpenseToStore(e: ApiExpense): Expense {
  return {
    id: e.id,
    houseId: e.house_id,
    name: e.name,
    amount: e.amount,
    category: e.category as Category,
    paidById: e.paid_by_id,
    splitBetween: e.split_between,
    date: e.date,
  }
}

export function apiSettlementToStore(s: ApiSettlement): Settlement {
  return {
    id: s.id,
    fromId: s.from_id,
    toId: s.to_id,
    amount: s.amount,
    date: s.date,
  }
}

// ── Users ───────────────────────────────────────────────────────────────────

export const usersApi = {
  upsert(token: string, body: { name: string; initials: string; color: string; handle: string }) {
    return request<ApiUser>('/users/me', token, { method: 'POST', body: JSON.stringify(body) })
  },
  me(token: string) {
    return request<ApiUser>('/users/me', token)
  },
}

// ── Houses ──────────────────────────────────────────────────────────────────

export const housesApi = {
  create(token: string, name: string) {
    return request<ApiHouse>('/houses', token, { method: 'POST', body: JSON.stringify({ name }) })
  },
  join(token: string, code: string) {
    return request<ApiHouse>('/houses/join', token, { method: 'POST', body: JSON.stringify({ code }) })
  },
  get(token: string, houseId: string) {
    return request<ApiHouse>(`/houses/${houseId}`, token)
  },
  balances(token: string, houseId: string) {
    return request<ApiBalances>(`/houses/${houseId}/balances`, token)
  },
  leave(token: string, houseId: string) {
    return request<void>(`/houses/${houseId}/leave`, token, { method: 'DELETE' })
  },
}

// ── Expenses ─────────────────────────────────────────────────────────────────

export const expensesApi = {
  list(token: string, houseId: string) {
    return request<ApiExpense[]>(`/expenses?house_id=${houseId}`, token)
  },
  create(token: string, body: Omit<ApiExpense, 'id'>) {
    return request<ApiExpense>('/expenses', token, { method: 'POST', body: JSON.stringify(body) })
  },
  delete(token: string, expenseId: string) {
    return request<void>(`/expenses/${expenseId}`, token, { method: 'DELETE' })
  },
}

// ── Settlements ──────────────────────────────────────────────────────────────

export const settlementsApi = {
  list(token: string, houseId: string) {
    return request<ApiSettlement[]>(`/settlements?house_id=${houseId}`, token)
  },
  create(token: string, body: Omit<ApiSettlement, 'id' | 'date'>) {
    return request<ApiSettlement>('/settlements', token, { method: 'POST', body: JSON.stringify(body) })
  },
}
