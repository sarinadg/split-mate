'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useStore, clearStore } from '@/lib/store'
import { useAuth } from '@/lib/auth'
import AppShell from '@/components/AppShell'
import { getAllBalances, totalIOwe, totalOwedToMe, formatAUD } from '@/lib/utils'
import { housesApi } from '@/lib/api'

export default function ProfilePage() {
  const { state, setState } = useStore()
  const { token, signOut } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!state.currentUserId || !state.house) router.replace('/')
  }, [state.currentUserId, state.house, router])

  if (!state.currentUserId || !state.house) return null

  const currentUser = state.people.find(p => p.id === state.currentUserId)!
  const balances = getAllBalances(state.currentUserId, state.house.memberIds, state.expenses, state.settlements)
  const iOwe = totalIOwe(balances)
  const owedToMe = totalOwedToMe(balances)
  const totalSpend = state.expenses.reduce((s, e) => s + e.amount, 0)

  const handleSignOut = async () => {
    await signOut()
    clearStore()
    setState({ currentUserId: null, people: [], house: null, expenses: [], settlements: [] })
    router.replace('/')
  }

  const handleLeaveHouse = async () => {
    if (!confirm('Leave this house? You can rejoin with the house code.')) return
    if (token && state.house) {
      await housesApi.leave(token, state.house.id).catch(() => {})
    }
    clearStore()
    setState({ currentUserId: null, people: [], house: null, expenses: [], settlements: [] })
    router.replace('/')
  }

  return (
    <AppShell>
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b px-6 lg:px-8 py-4 lg:py-5" style={{ borderColor: '#F0F0F0' }}>
          <h1 className="text-xl lg:text-2xl font-extrabold tracking-tight" style={{ color: '#1A1A2E' }}>Profile</h1>
          <p className="text-sm mt-0.5" style={{ color: '#9CA3AF' }}>Your account & house settings</p>
        </div>

        <div className="flex-1 p-6 lg:p-8 pb-24 lg:pb-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">

            {/* Left: Profile card */}
            <div className="lg:col-span-1 space-y-4">
              <div
                className="rounded-2xl p-6 text-center relative overflow-hidden"
                style={{ background: 'linear-gradient(160deg, #1A1A2E 0%, #2D1B4E 100%)' }}
              >
                <div className="absolute pointer-events-none" style={{ width: 200, height: 200, background: 'radial-gradient(circle, rgba(255,107,107,0.2) 0%, transparent 70%)', top: -40, right: -40, borderRadius: '50%' }} />
                <div
                  className="w-20 h-20 rounded-3xl flex items-center justify-center text-2xl font-extrabold text-white mx-auto mb-3 relative z-10"
                  style={{ background: currentUser.color, boxShadow: '0 8px 24px rgba(0,0,0,0.3)' }}
                >
                  {currentUser.initials}
                </div>
                <h2 className="text-xl font-extrabold text-white tracking-tight relative z-10">{currentUser.name}</h2>
                <p className="text-sm mt-1 relative z-10" style={{ color: 'rgba(255,255,255,0.5)' }}>{currentUser.handle}</p>
                <div className="inline-flex items-center gap-1.5 mt-3 px-3 py-1.5 rounded-full text-xs font-semibold relative z-10" style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)' }}>
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#4ADE80' }} />
                  {state.house.name}
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: '💸', label: 'You owe', value: formatAUD(iOwe), color: '#FF6B6B', bg: '#FFF0F0' },
                  { icon: '💰', label: 'Owed to you', value: formatAUD(owedToMe), color: '#00BFA5', bg: '#E0F7F4' },
                  { icon: '📋', label: 'Expenses', value: `${state.expenses.length}`, color: '#1A1A2E', bg: '#F9FAFB' },
                  { icon: '🤝', label: 'Settlements', value: `${state.settlements.length}`, color: '#7C3AED', bg: '#EDE9FE' },
                ].map(stat => (
                  <div key={stat.label} className="bg-white rounded-2xl p-4" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-base mb-2" style={{ background: stat.bg }}>{stat.icon}</div>
                    <p className="text-xl font-extrabold tracking-tight" style={{ color: stat.color }}>{stat.value}</p>
                    <p className="text-xs font-medium mt-0.5" style={{ color: '#9CA3AF' }}>{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Settings */}
            <div className="lg:col-span-2 space-y-4">
              {/* House info */}
              <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                <div className="px-5 py-4 border-b" style={{ borderColor: '#F9FAFB' }}>
                  <h2 className="text-sm font-bold" style={{ color: '#1A1A2E' }}>House Details</h2>
                </div>
                {[
                  { icon: '🏠', label: 'House name', value: state.house.name },
                  { icon: '🔑', label: 'House code', value: state.house.code, mono: true, badge: 'Share with mates' },
                  { icon: '👥', label: 'Housemates', value: `${state.house.memberIds.length - 1} people` },
                  { icon: '💰', label: 'Total expenses', value: `$${totalSpend.toFixed(2)} AUD` },
                ].map(({ icon, label, value, mono, badge }, i, arr) => (
                  <div
                    key={label}
                    className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors"
                    style={{ borderBottom: i < arr.length - 1 ? '1px solid #F9FAFB' : 'none' }}
                  >
                    <span className="text-xl w-8 text-center shrink-0">{icon}</span>
                    <div className="flex-1">
                      <p className="text-sm font-semibold" style={{ color: '#1A1A2E' }}>{label}</p>
                    </div>
                    <div className="text-right flex items-center gap-2">
                      <span
                        className={`text-sm font-bold ${mono ? 'font-mono tracking-widest' : ''}`}
                        style={{ color: '#6B7280' }}
                      >
                        {value}
                      </span>
                      {badge && (
                        <span className="hidden sm:inline-block text-[11px] font-semibold px-2 py-1 rounded-lg" style={{ background: '#E0F7F4', color: '#00897B' }}>{badge}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* About section */}
              <div className="bg-white rounded-2xl p-5" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                <h2 className="text-sm font-bold mb-3" style={{ color: '#1A1A2E' }}>About SplitMate</h2>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { icon: '🔄', text: 'Smart debt adjustment — previous dues offset automatically' },
                    { icon: '🏠', text: 'Built for Australian share houses' },
                    { icon: '🔒', text: 'All data stored locally — no account needed' },
                    { icon: '⚡', text: 'Split any expense in seconds' },
                  ].map(f => (
                    <div key={f.text} className="flex items-start gap-2.5 p-3 rounded-xl" style={{ background: '#F9FAFB' }}>
                      <span className="text-lg shrink-0">{f.icon}</span>
                      <p className="text-xs font-semibold leading-relaxed" style={{ color: '#4B5563' }}>{f.text}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Danger zone */}
              <div className="bg-white rounded-2xl p-5" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #FFE8E8' }}>
                <h2 className="text-sm font-bold mb-1" style={{ color: '#FF6B6B' }}>Danger Zone</h2>
                <p className="text-xs mb-4" style={{ color: '#9CA3AF' }}>These actions affect your account and house membership.</p>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={handleLeaveHouse}
                    className="px-5 py-2.5 font-bold text-sm rounded-xl transition-all"
                    style={{ border: '1.5px solid #FF6B6B', color: '#FF6B6B', background: '#FFF0F0' }}
                  >
                    🚪 Leave House
                  </button>
                  <button
                    onClick={handleSignOut}
                    className="px-5 py-2.5 font-bold text-sm rounded-xl transition-all"
                    style={{ border: '1.5px solid #9CA3AF', color: '#6B7280', background: '#F9FAFB' }}
                  >
                    Sign Out
                  </button>
                </div>
              </div>

              <p className="text-center text-xs" style={{ color: '#D1D5DB' }}>
                SplitMate v1.0 · Made for Australian share houses 🦘
              </p>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
