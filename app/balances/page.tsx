'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useStore } from '@/lib/store'
import { getAllBalances, totalIOwe, totalOwedToMe, formatAUD } from '@/lib/utils'
import Avatar from '@/components/Avatar'
import AppShell from '@/components/AppShell'

export default function BalancesPage() {
  const { state } = useStore()
  const router = useRouter()

  useEffect(() => {
    if (!state.currentUserId || !state.house) router.replace('/')
  }, [state.currentUserId, state.house, router])

  if (!state.currentUserId || !state.house) return null

  const members = state.people.filter(p => state.house!.memberIds.includes(p.id) && p.id !== state.currentUserId)
  const balances = getAllBalances(state.currentUserId, state.house.memberIds, state.expenses, state.settlements)
  const iOwe = totalIOwe(balances)
  const owedToMe = totalOwedToMe(balances)

  const hasSmartAdjustment = members.some(m => {
    const paidByMe = state.expenses.filter(e => e.paidById === state.currentUserId && e.splitBetween.includes(m.id))
    const paidByThem = state.expenses.filter(e => e.paidById === m.id && e.splitBetween.includes(state.currentUserId!))
    return paidByMe.length > 0 && paidByThem.length > 0
  })

  const monthYear = new Date().toLocaleDateString('en-AU', { month: 'long', year: 'numeric' })

  const oweList = members.filter(m => (balances[m.id] ?? 0) < -0.01)
  const owedList = members.filter(m => (balances[m.id] ?? 0) > 0.01)
  const clearedList = members.filter(m => Math.abs(balances[m.id] ?? 0) <= 0.01)

  return (
    <AppShell>
      <div className="flex-1 flex flex-col">
        {/* Page header */}
        <div className="bg-white border-b px-6 lg:px-8 py-4 lg:py-5" style={{ borderColor: '#F0F0F0' }}>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-xl lg:text-2xl font-extrabold tracking-tight" style={{ color: '#1A1A2E' }}>Balances</h1>
              <p className="text-sm mt-0.5" style={{ color: '#9CA3AF' }}>{state.house.name} · {monthYear}</p>
            </div>
            <Link href="/add-expense" className="hidden sm:flex items-center gap-2 px-4 py-2.5 text-white text-sm font-bold rounded-xl" style={{ background: '#FF6B6B', boxShadow: '0 4px 12px rgba(255,107,107,0.35)' }}>
              + Add Expense
            </Link>
          </div>

          {/* Summary pills */}
          <div className="flex gap-3 mt-4">
            <div className="flex-1 lg:flex-none lg:w-48 rounded-xl py-3 px-4 text-center lg:text-left" style={{ background: '#FFF0F0' }}>
              <p className="text-xl lg:text-2xl font-extrabold tracking-tight" style={{ color: '#FF6B6B' }}>{formatAUD(iOwe)}</p>
              <p className="text-xs font-medium mt-0.5" style={{ color: '#E85555' }}>You owe total</p>
            </div>
            <div className="flex-1 lg:flex-none lg:w-48 rounded-xl py-3 px-4 text-center lg:text-left" style={{ background: '#E0F7F4' }}>
              <p className="text-xl lg:text-2xl font-extrabold tracking-tight" style={{ color: '#00BFA5' }}>{formatAUD(owedToMe)}</p>
              <p className="text-xs font-medium mt-0.5" style={{ color: '#00897B' }}>Owed to you total</p>
            </div>
            <div className="hidden lg:block flex-none w-48 rounded-xl py-3 px-4" style={{ background: '#F9FAFB' }}>
              <p className="text-xl lg:text-2xl font-extrabold tracking-tight" style={{ color: '#1A1A2E' }}>{members.length}</p>
              <p className="text-xs font-medium mt-0.5" style={{ color: '#9CA3AF' }}>Housemates</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 lg:p-8 pb-24 lg:pb-8 space-y-6 lg:space-y-8">

          {/* Smart adjustment banner */}
          {hasSmartAdjustment && (
            <div className="flex items-start gap-3 px-5 py-4 rounded-2xl" style={{ background: 'linear-gradient(135deg, #7C3AED, #9333EA)' }}>
              <span className="text-2xl shrink-0">🔄</span>
              <div>
                <p className="text-sm font-bold text-white">Smart Adjustment Active</p>
                <p className="text-xs mt-1 leading-relaxed" style={{ color: 'rgba(255,255,255,0.75)' }}>
                  Previous dues have been factored into net balances automatically. When you both owe each other, the amounts are offset.
                </p>
              </div>
            </div>
          )}

          {/* People who owe you */}
          {owedList.length > 0 && (
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider mb-3" style={{ color: '#9CA3AF' }}>
                Owed to you · {owedList.length} {owedList.length === 1 ? 'person' : 'people'}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {owedList.map(member => {
                  const balance = balances[member.id] ?? 0
                  const paidByMe = state.expenses.filter(e => e.paidById === state.currentUserId && e.splitBetween.includes(member.id))
                  const paidByThem = state.expenses.filter(e => e.paidById === member.id && e.splitBetween.includes(state.currentUserId!))
                  const hasAdj = paidByMe.length > 0 && paidByThem.length > 0

                  return (
                    <div key={member.id} className="bg-white rounded-2xl p-5" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)', borderTop: '3px solid #00BFA5' }}>
                      <div className="flex items-center gap-3 mb-4">
                        <Avatar initials={member.initials} color={member.color} size={48} radius={16} fontSize={16} />
                        <div className="flex-1 min-w-0">
                          <p className="text-base font-bold truncate" style={{ color: '#1A1A2E' }}>{member.name}</p>
                          <p className="text-xs mt-0.5" style={{ color: '#9CA3AF' }}>{member.handle}</p>
                          {hasAdj && (
                            <span className="inline-block text-[11px] font-semibold px-2 py-0.5 rounded-md mt-1" style={{ background: '#EDE9FE', color: '#7C3AED' }}>🔄 Smart adjusted</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-end justify-between">
                        <div>
                          <p className="text-xs font-medium mb-0.5" style={{ color: '#9CA3AF' }}>Owes you</p>
                          <p className="text-2xl font-extrabold tracking-tight" style={{ color: '#00BFA5' }}>+{formatAUD(balance)}</p>
                        </div>
                        <Link href={`/settle/${member.id}`} className="px-4 py-2 rounded-xl text-sm font-bold text-white" style={{ background: '#FF6B6B', boxShadow: '0 2px 8px rgba(255,107,107,0.3)' }}>
                          Settle Up
                        </Link>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* People you owe */}
          {oweList.length > 0 && (
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider mb-3" style={{ color: '#9CA3AF' }}>
                You owe · {oweList.length} {oweList.length === 1 ? 'person' : 'people'}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {oweList.map(member => {
                  const balance = balances[member.id] ?? 0
                  const paidByMe = state.expenses.filter(e => e.paidById === state.currentUserId && e.splitBetween.includes(member.id))
                  const paidByThem = state.expenses.filter(e => e.paidById === member.id && e.splitBetween.includes(state.currentUserId!))
                  const hasAdj = paidByMe.length > 0 && paidByThem.length > 0

                  return (
                    <div key={member.id} className="bg-white rounded-2xl p-5" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)', borderTop: '3px solid #FF6B6B' }}>
                      <div className="flex items-center gap-3 mb-4">
                        <Avatar initials={member.initials} color={member.color} size={48} radius={16} fontSize={16} />
                        <div className="flex-1 min-w-0">
                          <p className="text-base font-bold truncate" style={{ color: '#1A1A2E' }}>{member.name}</p>
                          <p className="text-xs mt-0.5" style={{ color: '#9CA3AF' }}>{member.handle}</p>
                          {hasAdj && (
                            <span className="inline-block text-[11px] font-semibold px-2 py-0.5 rounded-md mt-1" style={{ background: '#EDE9FE', color: '#7C3AED' }}>🔄 Smart adjusted</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-end justify-between">
                        <div>
                          <p className="text-xs font-medium mb-0.5" style={{ color: '#9CA3AF' }}>You owe</p>
                          <p className="text-2xl font-extrabold tracking-tight" style={{ color: '#FF6B6B' }}>–{formatAUD(balance)}</p>
                        </div>
                        <Link href={`/settle/${member.id}`} className="px-4 py-2 rounded-xl text-sm font-bold text-white" style={{ background: '#FF6B6B', boxShadow: '0 2px 8px rgba(255,107,107,0.3)' }}>
                          Settle Up
                        </Link>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* All clear */}
          {clearedList.length > 0 && (
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider mb-3" style={{ color: '#9CA3AF' }}>All clear</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                {clearedList.map(member => (
                  <div key={member.id} className="bg-white rounded-2xl px-4 py-3.5 flex items-center gap-3 opacity-60" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                    <Avatar initials={member.initials} color={member.color} size={40} radius={12} fontSize={13} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold truncate" style={{ color: '#1A1A2E' }}>{member.name.split(' ')[0]}</p>
                      <p className="text-xs mt-0.5" style={{ color: '#9CA3AF' }}>all settled up 🎉</p>
                    </div>
                    <div className="px-3 py-1.5 rounded-lg text-xs font-semibold" style={{ background: '#F9FAFB', color: '#9CA3AF' }}>✓ Clear</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {members.length === 0 && (
            <div className="bg-white rounded-2xl p-12 text-center" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              <div className="text-5xl mb-4">👥</div>
              <p className="font-bold text-lg" style={{ color: '#1A1A2E' }}>No housemates yet</p>
              <p className="text-sm mt-1 mb-6" style={{ color: '#9CA3AF' }}>Add friends to start splitting expenses</p>
              <Link href="/friends" className="inline-flex items-center gap-2 px-5 py-2.5 text-white text-sm font-bold rounded-xl" style={{ background: '#FF6B6B' }}>
                + Add Friends
              </Link>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  )
}
