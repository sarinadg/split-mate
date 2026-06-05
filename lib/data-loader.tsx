'use client'

import { useEffect, useRef } from 'react'
import { useAuth } from './auth'
import { useStore } from './store'
import {
  usersApi, housesApi, expensesApi, settlementsApi,
  apiHouseToStore, apiExpenseToStore, apiSettlementToStore,
} from './api'

export function DataLoader() {
  const { token, loading: authLoading } = useAuth()
  const { setState } = useStore()
  const lastToken = useRef<string | null>(null)

  useEffect(() => {
    // Don't run while auth is still initialising
    if (authLoading) return

    // User signed out — clear the store
    if (!token) {
      if (lastToken.current !== null) {
        lastToken.current = null
        setState({ currentUserId: null, people: [], house: null, expenses: [], settlements: [] })
      }
      return
    }

    // Same token as last load — skip
    if (token === lastToken.current) return
    lastToken.current = token

    async function load() {
      try {
        const user = await usersApi.me(token!)

        // No profile yet — let the setup flow handle it
        if (!user.house_id) {
          setState(prev => ({ ...prev, currentUserId: user.id }))
          return
        }

        const [house, expenses, settlements] = await Promise.all([
          housesApi.get(token!, user.house_id),
          expensesApi.list(token!, user.house_id),
          settlementsApi.list(token!, user.house_id),
        ])

        const { house: storeHouse, people } = apiHouseToStore(house)

        setState({
          currentUserId: user.id,
          people,
          house: storeHouse,
          expenses: expenses.map(apiExpenseToStore),
          settlements: settlements.map(apiSettlementToStore),
        })
      } catch {
        // 404 = no profile yet, network error, etc. — leave store as-is
      }
    }

    load()
  }, [token, authLoading, setState])

  return null
}
