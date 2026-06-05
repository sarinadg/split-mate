'use client'

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useStore } from '@/lib/store'
import { useAuth } from '@/lib/auth'
import { settlementsApi, apiSettlementToStore, ApiError } from '@/lib/api'
import { getNetBalance } from '@/lib/utils'
import Avatar from '@/components/Avatar'
import AppShell from '@/components/AppShell'

export default function SettleUpPage({ params }: { params: Promise<{ personId: string }> }) {
  const { personId } = use(params)
  const { state, setState } = useStore()
  const { token } = useAuth()
  const router = useRouter()
  const [settled, setSettled] = useState(false)
  const [settling, setSettling] = useState(false)
  const [settleError, setSettleError] = useState('')

  useEffect(() => {
    if (!state.currentUserId || !state.house) router.replace('/')
  }, [state.currentUserId, state.house, router])

  if (!state.currentUserId || !state.house) return null

  const person = state.people.find(p => p.id === personId)
  if (!person) return null

  const balance = getNetBalance(state.currentUserId, personId, state.expenses, state.settlements)
  const amountOwed = Math.abs(balance)
  const iOweThemMoney = balance < 0
  const dateStr = new Date().toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })

  const relatedExpenses = state.expenses.filter(e =>
    (e.paidById === state.currentUserId && e.splitBetween.includes(personId)) ||
    (e.paidById === personId && e.splitBetween.includes(state.currentUserId!))
  )

  const handleSettle = async () => {
    if (Math.abs(balance) < 0.01 || !token || !state.house) return
    setSettling(true)
    setSettleError('')
    try {
      const settlement = await settlementsApi.create(token, {
        house_id: state.house.id,
        from_id: iOweThemMoney ? state.currentUserId! : personId,
        to_id: iOweThemMoney ? personId : state.currentUserId!,
        amount: amountOwed,
      })
      setState(prev => ({ ...prev, settlements: [...prev.settlements, apiSettlementToStore(settlement)] }))
      setSettling(false)
      setSettled(true)
    } catch (e) {
      setSettleError(e instanceof ApiError ? e.message : 'Failed to record settlement')
      setSettling(false)
    }
  }

  return (
    <AppShell>
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b px-6 lg:px-8 py-4 lg:py-5 flex items-center gap-4" style={{ borderColor: '#F0F0F0' }}>
          <button onClick={() => router.back()} className="w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0" style={{ background: '#F9FAFB' }}>←</button>
          <h1 className="text-xl font-extrabold tracking-tight" style={{ color: '#1A1A2E' }}>Settle Up</h1>
        </div>

        <div className="flex-1 p-6 lg:p-8 pb-24 lg:pb-8">
          <div className="max-w-xl lg:mx-auto">

            {settled ? (
              /* Confirmation state */
              <div className="bg-white rounded-3xl p-8 lg:p-12 text-center relative overflow-hidden" style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
                <div className="absolute pointer-events-none" style={{ width: 400, height: 400, background: 'radial-gradient(circle, rgba(0,191,165,0.07) 0%, transparent 70%)', top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }} />
                <div className="check-pop w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 relative z-10" style={{ background: 'linear-gradient(135deg, #00BFA5, #00897B)', boxShadow: '0 8px 32px rgba(0,191,165,0.4)' }}>
                  <div className="absolute w-28 h-28 rounded-full" style={{ background: 'rgba(0,191,165,0.15)' }} />
                  <span className="text-4xl relative z-10">✓</span>
                </div>
                <h2 className="text-2xl lg:text-3xl font-extrabold tracking-tight mb-3 relative z-10" style={{ color: '#1A1A2E' }}>All settled up!</h2>
                <p className="text-base leading-relaxed mb-8 relative z-10" style={{ color: '#6B7280' }}>
                  {iOweThemMoney
                    ? <>You paid <strong style={{ color: '#1A1A2E' }}>{person.name.split(' ')[0]}</strong> ${amountOwed.toFixed(2)}.<br />You&apos;re square now — no debts, no drama.</>
                    : <>{person.name.split(' ')[0]} marked as paid ${amountOwed.toFixed(2)}. Balances updated.</>
                  }
                </p>
                <div className="rounded-2xl p-5 mb-6 text-left relative z-10" style={{ background: '#F9FAFB', border: '1px solid #F0F0F0' }}>
                  {[
                    { key: 'Paid to', val: person.name },
                    { key: 'Amount', val: `$${amountOwed.toFixed(2)} AUD` },
                    { key: 'Method', val: 'PayID · direct transfer' },
                    { key: 'Date', val: dateStr },
                    { key: 'New balance', val: '$0.00 — Clear ✓', green: true },
                  ].map(({ key, val, green }) => (
                    <div key={key} className="flex justify-between py-2.5" style={{ borderBottom: key !== 'New balance' ? '1px solid #F0F0F0' : 'none' }}>
                      <span className="text-sm font-medium" style={{ color: '#9CA3AF' }}>{key}</span>
                      <span className="text-sm font-bold" style={{ color: green ? '#00BFA5' : '#1A1A2E' }}>{val}</span>
                    </div>
                  ))}
                </div>
                <p className="text-xs mb-6 relative z-10" style={{ color: '#9CA3AF' }}>🎉 {person.name.split(' ')[0]} has been notified via the app</p>
                <div className="flex gap-3 relative z-10">
                  <Link href="/house" className="flex-1 py-3.5 text-center text-white font-bold text-sm rounded-2xl" style={{ background: '#FF6B6B', boxShadow: '0 4px 16px rgba(255,107,107,0.35)' }}>
                    ← Back to Dashboard
                  </Link>
                  <button className="flex-1 py-3.5 flex items-center justify-center gap-2 font-bold text-sm rounded-2xl" style={{ border: '1.5px solid #F0F0F0', color: '#6B7280' }}>
                    📤 Share Receipt
                  </button>
                </div>
              </div>
            ) : (
              /* Pre-settle state */
              <>
                {/* Person card */}
                <div className="bg-white rounded-3xl p-6 lg:p-8 text-center mb-6" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.07)' }}>
                  <Avatar initials={person.initials} color={person.color} size={72} radius={22} fontSize={22} />
                  <h2 className="text-xl font-extrabold mt-4 tracking-tight" style={{ color: '#1A1A2E' }}>{person.name}</h2>
                  <p className="text-sm mt-1 mb-5" style={{ color: '#9CA3AF' }}>{person.handle}</p>
                  <div
                    className="inline-block px-8 py-4 rounded-2xl"
                    style={{ background: iOweThemMoney ? '#FFF0F0' : '#E0F7F4' }}
                  >
                    <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: '#9CA3AF' }}>
                      {iOweThemMoney ? 'You owe' : 'They owe you'}
                    </p>
                    <p className="text-4xl font-extrabold tracking-tight" style={{ color: iOweThemMoney ? '#FF6B6B' : '#00BFA5' }}>
                      ${amountOwed.toFixed(2)}
                    </p>
                  </div>
                </div>

                {/* Expense breakdown */}
                <div className="bg-white rounded-2xl overflow-hidden mb-6" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                  <div className="px-5 py-3.5 border-b" style={{ borderColor: '#F9FAFB' }}>
                    <h3 className="text-sm font-bold" style={{ color: '#1A1A2E' }}>Expense Breakdown</h3>
                  </div>
                  {relatedExpenses.length === 0 ? (
                    <div className="px-5 py-6 text-center text-sm" style={{ color: '#9CA3AF' }}>No shared expenses yet</div>
                  ) : (
                    relatedExpenses.slice(0, 6).map((e, i, arr) => {
                      const isPaidByMe = e.paidById === state.currentUserId
                      const share = e.amount / e.splitBetween.length
                      return (
                        <div key={e.id} className="flex items-center justify-between px-5 py-3.5" style={{ borderBottom: i < arr.length - 1 ? '1px solid #F9FAFB' : 'none' }}>
                          <div>
                            <p className="text-sm font-semibold" style={{ color: '#1A1A2E' }}>{e.name}</p>
                            <p className="text-xs mt-0.5" style={{ color: '#9CA3AF' }}>{new Date(e.date).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })}</p>
                          </div>
                          <span className="text-sm font-bold" style={{ color: isPaidByMe ? '#00BFA5' : '#FF6B6B' }}>
                            {isPaidByMe ? '+' : '–'}${share.toFixed(2)}
                          </span>
                        </div>
                      )
                    })
                  )}
                </div>

                {settleError && <p className="text-sm font-medium text-center" style={{ color: '#FF6B6B' }}>{settleError}</p>}

                <button
                  onClick={handleSettle}
                  disabled={settling || Math.abs(balance) < 0.01}
                  className="w-full py-4 text-white font-bold text-base rounded-2xl transition-all"
                  style={{ background: settling ? '#FFA5A5' : '#FF6B6B', boxShadow: '0 4px 16px rgba(255,107,107,0.35)' }}
                >
                  {settling ? '⏳ Processing...' : `✓ Mark as Settled — $${amountOwed.toFixed(2)}`}
                </button>
                <p className="text-xs text-center mt-3" style={{ color: '#9CA3AF' }}>
                  Records the settlement and updates all balances automatically.
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  )
}
