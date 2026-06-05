'use client'

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import type { AppState } from './types'

const STORAGE_KEY = 'splitmate_v1'

const defaultState: AppState = {
  currentUserId: null,
  people: [],
  house: null,
  expenses: [],
  settlements: [],
}

type SetState = (update: Partial<AppState> | ((prev: AppState) => AppState)) => void

const StoreContext = createContext<{ state: AppState; setState: SetState } | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setStateRaw] = useState<AppState>(defaultState)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) setStateRaw(JSON.parse(stored))
    } catch {}
    setHydrated(true)
  }, [])

  const setState: SetState = useCallback((update) => {
    setStateRaw(prev => {
      const next = typeof update === 'function' ? update(prev) : { ...prev, ...update }
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      } catch {}
      return next
    })
  }, [])

  if (!hydrated) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-[#FF6B6B] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return <StoreContext.Provider value={{ state, setState }}>{children}</StoreContext.Provider>
}

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used within StoreProvider')
  return ctx
}

export function clearStore() {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {}
}
