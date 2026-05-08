'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useStore } from '@/lib/store'
import { getAllBalances, totalIOwe, totalOwedToMe, formatAUD } from '@/lib/utils'

const navItems = [
  { href: '/house', icon: '🏠', label: 'Home' },
  { href: '/balances', icon: '⚖️', label: 'Balances' },
  { href: '/friends', icon: '👥', label: 'Friends' },
  { href: '/profile', icon: '👤', label: 'Profile' },
]

export default function Sidebar() {
  const pathname = usePathname()
  const { state } = useStore()

  const balances = state.currentUserId && state.house
    ? getAllBalances(state.currentUserId, state.house.memberIds, state.expenses, state.settlements)
    : {}
  const iOwe = totalIOwe(balances)
  const owedToMe = totalOwedToMe(balances)
  const currentUser = state.people.find(p => p.id === state.currentUserId)

  return (
    <aside
      className="fixed top-0 left-0 h-full w-[260px] z-30 hidden lg:flex flex-col"
      style={{ background: '#1A1A2E', borderRight: '1px solid rgba(255,255,255,0.06)' }}
    >
      {/* Logo */}
      <div className="px-6 py-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0"
            style={{ background: '#FF6B6B', boxShadow: '0 4px 12px rgba(255,107,107,0.4)' }}
          >
            💸
          </div>
          <span className="text-lg font-extrabold text-white tracking-tight">
            Split<span style={{ color: '#FF6B6B' }}>Mate</span>
          </span>
        </div>
      </div>

      {/* Current user */}
      {currentUser && (
        <div className="px-4 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl" style={{ background: 'rgba(255,255,255,0.05)' }}>
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white shrink-0"
              style={{ background: currentUser.color }}
            >
              {currentUser.initials}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-white truncate">{currentUser.name.split(' ')[0]}</p>
              <p className="text-[11px] truncate" style={{ color: 'rgba(255,255,255,0.4)' }}>
                {currentUser.handle}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 px-4 py-3 space-y-0.5 overflow-y-auto no-scroll">
        {navItems.map(item => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group"
              style={{
                background: active ? 'rgba(255,107,107,0.15)' : 'transparent',
              }}
            >
              <span style={{ fontSize: 18, opacity: active ? 1 : 0.5 }}>{item.icon}</span>
              <span
                className="text-sm font-semibold flex-1"
                style={{ color: active ? '#FF6B6B' : 'rgba(255,255,255,0.6)' }}
              >
                {item.label}
              </span>
              {active && (
                <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: '#FF6B6B' }} />
              )}
            </Link>
          )
        })}
      </nav>

      {/* Balance summary */}
      {state.house && (
        <div className="px-4 py-3" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <div
            className="px-3 py-2.5 rounded-xl mb-3 space-y-1.5"
            style={{ background: 'rgba(255,255,255,0.05)' }}
          >
            <div className="flex justify-between items-center">
              <span className="text-[11px] font-medium" style={{ color: 'rgba(255,255,255,0.4)' }}>You owe</span>
              <span className="text-sm font-bold" style={{ color: '#FF6B6B' }}>{formatAUD(iOwe)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[11px] font-medium" style={{ color: 'rgba(255,255,255,0.4)' }}>Owed to you</span>
              <span className="text-sm font-bold" style={{ color: '#00BFA5' }}>{formatAUD(owedToMe)}</span>
            </div>
            <div className="h-px w-full my-1" style={{ background: 'rgba(255,255,255,0.08)' }} />
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-mono tracking-widest" style={{ color: 'rgba(255,255,255,0.3)' }}>
                {state.house.code}
              </span>
              <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.2)' }}>·</span>
              <span className="text-[11px] truncate" style={{ color: 'rgba(255,255,255,0.4)' }}>
                {state.house.name}
              </span>
            </div>
          </div>
          <Link
            href="/add-expense"
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-white text-sm font-bold transition-all"
            style={{
              background: '#FF6B6B',
              boxShadow: '0 4px 12px rgba(255,107,107,0.35)',
            }}
          >
            + Add Expense
          </Link>
        </div>
      )}
    </aside>
  )
}
