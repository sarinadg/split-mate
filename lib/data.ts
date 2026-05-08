import type { AppState, Person } from './types'
import { uid, generateCode, getInitials, AVATAR_COLORS } from './utils'

const SAMPLE_HOUSEMATES: Omit<Person, 'id'>[] = [
  { name: 'Liam O\'Brien', initials: 'LI', color: AVATAR_COLORS[1], handle: '@liam_ob' },
  { name: 'Jake Nguyen', initials: 'JK', color: AVATAR_COLORS[2], handle: '@jakenguyen' },
  { name: 'Mia Chen', initials: 'MI', color: AVATAR_COLORS[3], handle: '@miachen' },
]

export function seedNewHouse(userName: string, houseName: string): AppState {
  const currentUser: Person = {
    id: uid(),
    name: userName,
    initials: getInitials(userName),
    color: AVATAR_COLORS[0],
    handle: '@' + userName.toLowerCase().replace(/\s+/g, '_'),
  }

  const housemates: Person[] = SAMPLE_HOUSEMATES.map(m => ({ ...m, id: uid() }))
  const allPeople = [currentUser, ...housemates]
  const [liam, jake, mia] = housemates

  const house = {
    id: uid(),
    name: houseName,
    code: generateCode(),
    memberIds: allPeople.map(p => p.id),
  }

  const today = new Date()
  const d = (daysAgo: number) => {
    const dt = new Date(today)
    dt.setDate(dt.getDate() - daysAgo)
    return dt.toISOString()
  }

  const expenses = [
    {
      id: uid(),
      houseId: house.id,
      name: 'Rent',
      amount: 1800,
      category: 'Rent' as const,
      paidById: liam.id,
      splitBetween: allPeople.map(p => p.id),
      date: d(38),
    },
    {
      id: uid(),
      houseId: house.id,
      name: 'Electricity',
      amount: 120,
      category: 'Utilities' as const,
      paidById: currentUser.id,
      splitBetween: allPeople.map(p => p.id),
      date: d(20),
    },
    {
      id: uid(),
      houseId: house.id,
      name: 'Groceries',
      amount: 65,
      category: 'Groceries' as const,
      paidById: mia.id,
      splitBetween: allPeople.map(p => p.id),
      date: d(18),
    },
    {
      id: uid(),
      houseId: house.id,
      name: 'Netflix + Disney+',
      amount: 34,
      category: 'Entertainment' as const,
      paidById: liam.id,
      splitBetween: allPeople.map(p => p.id),
      date: d(23),
    },
  ]

  return {
    currentUserId: currentUser.id,
    people: allPeople,
    house,
    expenses,
    settlements: [],
  }
}

export function seedJoinedHouse(userName: string): AppState {
  return seedNewHouse(userName, 'Brunswick St House')
}
