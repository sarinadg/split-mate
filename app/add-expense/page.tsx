'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useStore } from '@/lib/store'
import { useAuth } from '@/lib/auth'
import { expensesApi, apiExpenseToStore, ApiError } from '@/lib/api'
import { getNetBalance, CATEGORY_META } from '@/lib/utils'
import type { Category } from '@/lib/types'
import AppShell from '@/components/AppShell'

const CATEGORIES: Category[] = ['Rent', 'Utilities', 'Groceries', 'Entertainment', 'Other']

export default function AddExpensePage() {
  const { state, setState } = useStore()
  const { token } = useAuth()
  const router = useRouter()

  const [expenseName, setExpenseName] = useState('')
  const [amountStr, setAmountStr] = useState('')
  const [category, setCategory] = useState<Category>('Utilities')
  const [paidById, setPaidById] = useState(state.currentUserId ?? '')
  const [splitBetween, setSplitBetween] = useState<string[]>(state.house?.memberIds ?? [])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!state.currentUserId || !state.house) router.replace('/')
  }, [state.currentUserId, state.house, router])

  if (!state.currentUserId || !state.house) return null

  const members = state.people.filter(p => state.house!.memberIds.includes(p.id))
  const amount = parseFloat(amountStr) || 0
  const perPerson = splitBetween.length > 0 ? amount / splitBetween.length : 0

  const toggleSplit = (id: string) => {
    setSplitBetween(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  const adjustmentHints = members
    .filter(m => splitBetween.includes(m.id) && m.id !== state.currentUserId)
    .map(m => ({ person: m, balance: getNetBalance(state.currentUserId!, m.id, state.expenses, state.settlements) }))
    .filter(h => Math.abs(h.balance) > 0.01)

  const [saveError, setSaveError] = useState('')

  const handleSave = async () => {
    if (!expenseName.trim() || amount <= 0 || splitBetween.length === 0) return
    if (!token) return
    setSaving(true)
    setSaveError('')
    try {
      const expense = await expensesApi.create(token, {
        house_id: state.house!.id,
        name: expenseName.trim(),
        amount,
        category,
        paid_by_id: paidById,
        split_between: splitBetween,
        date: new Date().toISOString(),
      })
      setState(prev => ({ ...prev, expenses: [apiExpenseToStore(expense), ...prev.expenses] }))
      router.replace('/house')
    } catch (e) {
      setSaveError(e instanceof ApiError ? e.message : 'Failed to save expense')
      setSaving(false)
    }
  }

  const canSave = expenseName.trim() && amount > 0 && splitBetween.length > 0

  return (
    <AppShell>
      <div className="flex-1 flex flex-col">
        {/* Page header */}
        <div className="bg-white border-b px-6 lg:px-8 py-4 lg:py-5 flex items-center gap-4" style={{ borderColor: '#F0F0F0' }}>
          <button onClick={() => router.back()} className="w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0" style={{ background: '#F9FAFB' }}>←</button>
          <h1 className="text-xl font-extrabold tracking-tight" style={{ color: '#1A1A2E' }}>Add Expense</h1>
        </div>

        <div className="flex-1 p-6 lg:p-8 pb-24 lg:pb-8">
          <div className="max-w-2xl lg:mx-auto">

            {/* Amount hero card */}
            <div
              className="rounded-2xl px-6 py-8 text-center relative overflow-hidden mb-6"
              style={{ background: 'linear-gradient(160deg, #1A1A2E, #2D1B4E)' }}
            >
              <div className="absolute pointer-events-none" style={{ width: 200, height: 200, background: 'radial-gradient(circle, rgba(255,107,107,0.25) 0%, transparent 70%)', top: -50, right: -50, borderRadius: '50%' }} />
              <p className="text-xs font-semibold tracking-widest mb-3 relative" style={{ color: 'rgba(255,255,255,0.5)' }}>TOTAL AMOUNT</p>
              <div className="flex items-start justify-center gap-1 relative">
                <span className="text-2xl font-bold pt-3" style={{ color: 'rgba(255,255,255,0.4)' }}>$</span>
                <input
                  type="number"
                  value={amountStr}
                  onChange={e => setAmountStr(e.target.value)}
                  placeholder="0.00"
                  inputMode="decimal"
                  className="text-6xl font-extrabold bg-transparent border-none outline-none text-center tracking-tight"
                  style={{ color: amountStr ? '#fff' : 'rgba(255,255,255,0.2)', width: '220px' }}
                  autoFocus
                />
              </div>
              {splitBetween.length > 0 && amount > 0 && (
                <p className="text-sm mt-3 relative" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  Split equally · <span style={{ color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>${perPerson.toFixed(2)}</span> per person
                </p>
              )}
            </div>

            {/* Form grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
              {/* Left column */}
              <div className="space-y-5">
                {/* Expense name */}
                <div>
                  <label className="block text-xs font-semibold tracking-wider mb-2.5" style={{ color: '#6B7280' }}>EXPENSE NAME</label>
                  <input
                    type="text"
                    value={expenseName}
                    onChange={e => setExpenseName(e.target.value)}
                    placeholder="e.g. Electricity bill"
                    className="w-full px-4 py-3.5 rounded-xl text-sm outline-none"
                    style={{ border: '1.5px solid #E5E7EB', background: '#F9FAFB', color: '#1A1A2E' }}
                    onFocus={e => { e.target.style.borderColor = '#FF6B6B'; e.target.style.background = '#fff' }}
                    onBlur={e => { e.target.style.borderColor = '#E5E7EB'; e.target.style.background = '#F9FAFB' }}
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-xs font-semibold tracking-wider mb-2.5" style={{ color: '#6B7280' }}>CATEGORY</label>
                  <div className="grid grid-cols-5 gap-2">
                    {(['Rent', 'Utilities', 'Groceries', 'Entertainment', 'Other'] as Category[]).map(cat => {
                      const meta = CATEGORY_META[cat]
                      const selected = category === cat
                      return (
                        <button
                          key={cat}
                          onClick={() => setCategory(cat)}
                          className="flex flex-col items-center gap-1.5 py-2.5 px-1 rounded-xl transition-all"
                          style={{ border: selected ? '2px solid #FF6B6B' : '2px solid #E5E7EB', background: selected ? '#FFF0F0' : '#F9FAFB' }}
                        >
                          <span className="text-lg">{meta.icon}</span>
                          <span className="text-[9px] font-semibold" style={{ color: selected ? '#FF6B6B' : '#6B7280' }}>
                            {cat === 'Entertainment' ? 'Media' : cat}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Paid by */}
                <div>
                  <label className="block text-xs font-semibold tracking-wider mb-2.5" style={{ color: '#6B7280' }}>PAID BY</label>
                  <div className="flex gap-2 flex-wrap">
                    {members.map(m => {
                      const selected = paidById === m.id
                      const isMe = m.id === state.currentUserId
                      return (
                        <button
                          key={m.id}
                          onClick={() => setPaidById(m.id)}
                          className="flex items-center gap-2 px-3 py-2 rounded-full transition-all"
                          style={{ border: selected ? '2px solid #FF6B6B' : '2px solid #E5E7EB', background: selected ? '#FFF0F0' : '#F9FAFB' }}
                        >
                          <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0" style={{ background: m.color }}>{m.initials}</div>
                          <span className="text-xs font-semibold" style={{ color: selected ? '#FF6B6B' : '#1A1A2E' }}>
                            {isMe ? `${m.name.split(' ')[0]} (me)` : m.name.split(' ')[0]}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>

              {/* Right column: split between */}
              <div>
                <label className="block text-xs font-semibold tracking-wider mb-2.5" style={{ color: '#6B7280' }}>SPLIT BETWEEN</label>
                <div className="rounded-2xl overflow-hidden border" style={{ borderColor: '#E5E7EB' }}>
                  {members.map((m, i) => {
                    const checked = splitBetween.includes(m.id)
                    const isMe = m.id === state.currentUserId
                    const share = checked ? perPerson : 0
                    return (
                      <button
                        key={m.id}
                        onClick={() => toggleSplit(m.id)}
                        className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-gray-50 transition-colors"
                        style={{ borderBottom: i < members.length - 1 ? '1px solid #F0F0F0' : 'none' }}
                      >
                        <div
                          className="w-5 h-5 rounded-md flex items-center justify-center shrink-0 transition-all"
                          style={{ border: checked ? '2px solid #FF6B6B' : '2px solid #D1D5DB', background: checked ? '#FF6B6B' : '#fff' }}
                        >
                          {checked && <span className="text-white text-xs font-bold">✓</span>}
                        </div>
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white shrink-0" style={{ background: m.color }}>{m.initials}</div>
                        <span className="flex-1 text-sm font-semibold" style={{ color: '#1A1A2E' }}>
                          {isMe ? `${m.name.split(' ')[0]} (me)` : m.name.split(' ')[0]}
                        </span>
                        <span className="text-sm font-bold" style={{ color: checked ? '#FF6B6B' : '#D1D5DB' }}>
                          {checked && amount > 0 ? `$${share.toFixed(2)}` : '–'}
                        </span>
                      </button>
                    )
                  })}
                </div>

                {adjustmentHints.length > 0 && (
                  <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl mt-3" style={{ background: '#E0F7F4' }}>
                    <span className="text-sm shrink-0">💡</span>
                    <p className="text-xs font-semibold leading-relaxed" style={{ color: '#00897B' }}>
                      {adjustmentHints.map(h => {
                        const dir = h.balance > 0 ? `owes you $${Math.abs(h.balance).toFixed(2)}` : `you owe $${Math.abs(h.balance).toFixed(2)}`
                        return `${h.person.name.split(' ')[0]} ${dir}`
                      }).join(' · ')} — net balance adjusts automatically.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {saveError && <p className="text-sm font-medium text-center" style={{ color: '#FF6B6B' }}>{saveError}</p>}

            <button
              onClick={handleSave}
              disabled={saving || !canSave}
              className="w-full py-4 text-white font-bold text-base rounded-2xl transition-all"
              style={{ background: saving || !canSave ? '#FFA5A5' : '#FF6B6B', boxShadow: canSave ? '0 4px 16px rgba(255,107,107,0.35)' : 'none' }}
            >
              {saving ? 'Saving...' : '💾 Save & Split'}
            </button>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
