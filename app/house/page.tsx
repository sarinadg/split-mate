'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useStore } from '@/lib/store'
import { getAllBalances, totalIOwe, totalOwedToMe, getNetBalance, formatAUD, CATEGORY_META } from '@/lib/utils'
import Avatar from '@/components/Avatar'
import AppShell from '@/components/AppShell'

export default function HousePage() {
  const { state } = useStore()
  const router = useRouter()

  useEffect(() => {
    if (!state.currentUserId || !state.house) router.replace('/')
  }, [state.currentUserId, state.house, router])

  if (!state.currentUserId || !state.house) return null

  const currentUser = state.people.find(p => p.id === state.currentUserId)!
  const members = state.people.filter(p => state.house!.memberIds.includes(p.id) && p.id !== state.currentUserId)
  const balances = getAllBalances(state.currentUserId, state.house.memberIds, state.expenses, state.settlements)
  const iOwe = totalIOwe(balances)
  const owedToMe = totalOwedToMe(balances)
  const pendingCount = Object.values(balances).filter(b => Math.abs(b) > 0.01).length

  const recent = [...state.expenses]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 8)

  const totalSpend = state.expenses.reduce((s, e) => s + e.amount, 0)

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  }

  return (
    <AppShell>
      <div className="flex-1 flex flex-col min-h-dvh">
        {/* Page header */}
        <div className="bg-white border-b px-6 lg:px-8 py-4 lg:py-5 flex items-center justify-between" style={{ borderColor: '#F0F0F0' }}>
          <div>
            <p className="text-sm font-medium" style={{ color: '#9CA3AF' }}>{greeting()},</p>
            <h1 className="text-xl lg:text-2xl font-extrabold tracking-tight" style={{ color: '#1A1A2E' }}>
              {currentUser.name.split(' ')[0]} <span style={{ color: '#FF6B6B' }}>✌️</span>
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/add-expense"
              className="hidden sm:flex items-center gap-2 px-4 py-2.5 text-white text-sm font-bold rounded-xl"
              style={{ background: '#FF6B6B', boxShadow: '0 4px 12px rgba(255,107,107,0.35)' }}
            >
              <span className="text-base">+</span> Add Expense
            </Link>
            <Link href="/profile">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold"
                style={{ background: currentUser.color, border: '2.5px solid rgba(255,107,107,0.3)' }}
              >
                {currentUser.initials}
              </div>
            </Link>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 lg:p-8 pb-24 lg:pb-8">

          {/* Top stats row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6 lg:mb-8">
            {[
              { icon: '💸', label: 'You Owe', value: formatAUD(iOwe), color: '#FF6B6B', bg: '#FFF0F0' },
              { icon: '💰', label: 'Owed to You', value: formatAUD(owedToMe), color: '#00BFA5', bg: '#E0F7F4' },
              { icon: '📋', label: 'Total Expenses', value: `${state.expenses.length}`, color: '#1A1A2E', bg: '#F9FAFB' },
              { icon: '🤝', label: 'Pending Settles', value: `${pendingCount}`, color: '#7C3AED', bg: '#EDE9FE' },
            ].map(stat => (
              <div key={stat.label} className="bg-white rounded-2xl p-4 lg:p-5" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-3"
                  style={{ background: stat.bg }}
                >
                  {stat.icon}
                </div>
                <p className="text-2xl lg:text-3xl font-extrabold tracking-tight" style={{ color: stat.color }}>{stat.value}</p>
                <p className="text-xs font-medium mt-1" style={{ color: '#9CA3AF' }}>{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Main grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">

            {/* Left: Recent expenses (takes 2/3 on desktop) */}
            <div className="lg:col-span-2">
              {/* Summary gradient card */}
              <div
                className="rounded-2xl px-5 lg:px-6 py-5 relative overflow-hidden mb-6"
                style={{ background: 'linear-gradient(135deg, #FF6B6B, #FF8E53)', boxShadow: '0 6px 20px rgba(255,107,107,0.35)' }}
              >
                <div className="absolute pointer-events-none" style={{ width: 200, height: 200, background: 'rgba(255,255,255,0.1)', borderRadius: '50%', right: -60, top: -60 }} />
                <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'rgba(255,255,255,0.8)' }}>
                  {state.house.name} · Your Balance
                </p>
                <div className="flex items-center gap-6 lg:gap-8 flex-wrap">
                  <div>
                    <p className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight">{formatAUD(iOwe)}</p>
                    <p className="text-sm font-medium mt-0.5" style={{ color: 'rgba(255,255,255,0.7)' }}>you owe</p>
                  </div>
                  <div className="w-px h-12" style={{ background: 'rgba(255,255,255,0.25)' }} />
                  <div>
                    <p className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight">{formatAUD(owedToMe)}</p>
                    <p className="text-sm font-medium mt-0.5" style={{ color: 'rgba(255,255,255,0.7)' }}>owed to you</p>
                  </div>
                  <div className="w-px h-12 hidden sm:block" style={{ background: 'rgba(255,255,255,0.25)' }} />
                  <div className="hidden sm:block">
                    <p className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight">${totalSpend.toFixed(0)}</p>
                    <p className="text-sm font-medium mt-0.5" style={{ color: 'rgba(255,255,255,0.7)' }}>total split</p>
                  </div>
                </div>
                <div
                  className="inline-flex items-center gap-1.5 mt-4 px-3 py-1.5 rounded-full text-xs font-semibold"
                  style={{ background: 'rgba(255,255,255,0.15)', color: '#fff' }}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-white" />
                  {state.house.memberIds.length} mates · Code: {state.house.code}
                </div>
              </div>

              {/* Expenses table */}
              <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                <div className="flex items-center justify-between px-5 lg:px-6 py-4 border-b" style={{ borderColor: '#F9FAFB' }}>
                  <h2 className="text-base font-bold" style={{ color: '#1A1A2E' }}>Recent Expenses</h2>
                  <span className="text-sm font-medium" style={{ color: '#9CA3AF' }}>{state.expenses.length} total</span>
                </div>

                {recent.length === 0 ? (
                  <div className="px-6 py-12 text-center">
                    <div className="text-5xl mb-4">🎉</div>
                    <p className="font-semibold text-lg" style={{ color: '#1A1A2E' }}>No expenses yet</p>
                    <p className="text-sm mt-1 mb-6" style={{ color: '#9CA3AF' }}>Add your first expense to get started</p>
                    <Link href="/add-expense" className="inline-flex items-center gap-2 px-5 py-2.5 text-white text-sm font-bold rounded-xl" style={{ background: '#FF6B6B' }}>
                      + Add Expense
                    </Link>
                  </div>
                ) : (
                  <>
                    {/* Table header — desktop only */}
                    <div className="hidden lg:grid grid-cols-12 gap-4 px-6 py-2.5 text-xs font-semibold uppercase tracking-wider" style={{ color: '#9CA3AF', background: '#FAFAFA', borderBottom: '1px solid #F0F0F0' }}>
                      <div className="col-span-5">Expense</div>
                      <div className="col-span-2 text-center">Category</div>
                      <div className="col-span-2 text-right">Amount</div>
                      <div className="col-span-3 text-right">Your share</div>
                    </div>

                    {recent.map((expense, i) => {
                      const payer = state.people.find(p => p.id === expense.paidById)
                      const isMe = expense.paidById === state.currentUserId
                      const inSplit = expense.splitBetween.includes(state.currentUserId!)
                      const myShare = inSplit ? expense.amount / expense.splitBetween.length : 0
                      const meta = CATEGORY_META[expense.category] ?? CATEGORY_META.Other
                      const dateStr = new Date(expense.date).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })

                      return (
                        <div
                          key={expense.id}
                          className="flex lg:grid lg:grid-cols-12 lg:gap-4 items-center px-5 lg:px-6 py-3.5 lg:py-4 hover:bg-gray-50 transition-colors"
                          style={{ borderBottom: i < recent.length - 1 ? '1px solid #F9FAFB' : 'none' }}
                        >
                          {/* Icon + name */}
                          <div className="flex items-center gap-3 flex-1 lg:col-span-5 min-w-0">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0" style={{ background: meta.bg }}>
                              {meta.icon}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-bold truncate" style={{ color: '#1A1A2E' }}>{expense.name}</p>
                              <p className="text-xs mt-0.5" style={{ color: '#9CA3AF' }}>
                                {isMe ? 'You paid' : `${payer?.name.split(' ')[0]} paid`} · {dateStr}
                              </p>
                            </div>
                          </div>

                          {/* Category chip — desktop */}
                          <div className="hidden lg:flex lg:col-span-2 justify-center">
                            <span className="px-2.5 py-1 rounded-full text-xs font-semibold" style={{ background: meta.bg, color: '#6B7280' }}>
                              {expense.category}
                            </span>
                          </div>

                          {/* Amount */}
                          <div className="hidden lg:block lg:col-span-2 text-right">
                            <p className="text-sm font-bold" style={{ color: '#1A1A2E' }}>${expense.amount.toFixed(2)}</p>
                          </div>

                          {/* Your share */}
                          <div className="text-right shrink-0 lg:col-span-3">
                            <p className="text-sm font-bold" style={{ color: '#1A1A2E' }}>
                              <span className="lg:hidden">${expense.amount.toFixed(2)} · </span>
                              {inSplit
                                ? <span style={{ color: isMe ? '#00BFA5' : '#FF6B6B' }}>
                                    {isMe ? `+$${(myShare * (expense.splitBetween.length - 1)).toFixed(2)}` : `-$${myShare.toFixed(2)}`}
                                  </span>
                                : <span style={{ color: '#D1D5DB' }}>–</span>
                              }
                            </p>
                            {inSplit && (
                              <p className="text-xs mt-0.5" style={{ color: '#9CA3AF' }}>
                                {isMe ? 'owed to you' : 'you owe'}
                              </p>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </>
                )}
              </div>
            </div>

            {/* Right: Balances panel */}
            <div className="lg:col-span-1 space-y-4">
              <div className="flex items-center justify-between mb-1">
                <h2 className="text-base font-bold" style={{ color: '#1A1A2E' }}>Housemate Balances</h2>
                <Link href="/balances" className="text-sm font-semibold" style={{ color: '#FF6B6B' }}>See all</Link>
              </div>

              {members.map(member => {
                const balance = balances[member.id] ?? 0
                const isOwed = balance > 0
                const isSettled = Math.abs(balance) < 0.01

                return (
                  <div
                    key={member.id}
                    className="bg-white rounded-2xl px-4 py-3.5 flex items-center gap-3"
                    style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)', opacity: isSettled ? 0.6 : 1 }}
                  >
                    <Avatar initials={member.initials} color={member.color} size={42} radius={13} fontSize={14} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold truncate" style={{ color: '#1A1A2E' }}>{member.name.split(' ')[0]}</p>
                      <p className="text-xs mt-0.5 font-medium" style={{ color: isSettled ? '#9CA3AF' : isOwed ? '#00BFA5' : '#FF6B6B' }}>
                        {isSettled ? 'All clear ✓' : isOwed ? `owes you` : `you owe`}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-base font-extrabold" style={{ color: isSettled ? '#9CA3AF' : isOwed ? '#00BFA5' : '#FF6B6B' }}>
                        {isSettled ? '$0' : `${isOwed ? '+' : '–'}${formatAUD(balance)}`}
                      </p>
                      {!isSettled && (
                        <Link
                          href={`/settle/${member.id}`}
                          className="text-[11px] font-bold mt-0.5 inline-block"
                          style={{ color: '#FF6B6B' }}
                        >
                          Settle →
                        </Link>
                      )}
                    </div>
                  </div>
                )
              })}

              {/* Quick add friends */}
              <Link
                href="/friends"
                className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl text-sm font-bold transition-all"
                style={{ border: '2px dashed #E5E7EB', color: '#9CA3AF' }}
              >
                👥 Manage Friends
              </Link>
            </div>
          </div>
        </div>

        {/* Mobile FAB */}
        <Link
          href="/add-expense"
          className="fixed flex items-center justify-center text-white text-3xl font-light z-10 sm:hidden"
          style={{ bottom: 88, right: 20, width: 56, height: 56, background: '#FF6B6B', borderRadius: 18, boxShadow: '0 8px 24px rgba(255,107,107,0.45)' }}
        >
          +
        </Link>
      </div>
    </AppShell>
  )
}
