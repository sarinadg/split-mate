'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useStore } from '@/lib/store'
import { getNetBalance, AVATAR_COLORS, getInitials, uid, formatAUD } from '@/lib/utils'
import type { Person } from '@/lib/types'
import Avatar from '@/components/Avatar'
import AppShell from '@/components/AppShell'

const SUGGESTED: Omit<Person, 'id'>[] = [
  { name: 'Sam Patterson', initials: 'SA', color: AVATAR_COLORS[4], handle: '@sampatty' },
  { name: 'Zara Williams', initials: 'ZA', color: AVATAR_COLORS[5], handle: '@zarawill' },
  { name: 'Ethan Brooks', initials: 'EB', color: AVATAR_COLORS[6], handle: '@ethanb' },
  { name: 'Chloe Martin', initials: 'CM', color: AVATAR_COLORS[7], handle: '@chloem' },
]

export default function FriendsPage() {
  const { state, setState } = useStore()
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [newFriendName, setNewFriendName] = useState('')
  const [newFriendHandle, setNewFriendHandle] = useState('')

  useEffect(() => {
    if (!state.currentUserId || !state.house) router.replace('/')
  }, [state.currentUserId, state.house, router])

  if (!state.currentUserId || !state.house) return null

  const allFriends = state.people.filter(p => p.id !== state.currentUserId)
  const filtered = allFriends.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.handle.toLowerCase().includes(search.toLowerCase())
  )

  const pendingCount = allFriends.filter(m => Math.abs(getNetBalance(state.currentUserId!, m.id, state.expenses, state.settlements)) > 0.01).length
  const suggestionsNotAdded = SUGGESTED.filter(s => !state.people.some(p => p.name === s.name))

  const addFriendToHouse = (s: Omit<Person, 'id'>) => {
    const p: Person = { ...s, id: uid() }
    setState(prev => ({
      ...prev,
      people: [...prev.people, p],
      house: prev.house ? { ...prev.house, memberIds: [...prev.house.memberIds, p.id] } : prev.house,
    }))
  }

  const addCustomFriend = () => {
    if (!newFriendName.trim()) return
    const p: Person = {
      id: uid(),
      name: newFriendName.trim(),
      initials: getInitials(newFriendName.trim()),
      color: AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)],
      handle: newFriendHandle.trim() || '@' + newFriendName.trim().toLowerCase().replace(/\s+/g, '_'),
    }
    setState(prev => ({
      ...prev,
      people: [...prev.people, p],
      house: prev.house ? { ...prev.house, memberIds: [...prev.house.memberIds, p.id] } : prev.house,
    }))
    setNewFriendName('')
    setNewFriendHandle('')
    setShowAddModal(false)
  }

  return (
    <AppShell>
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b px-6 lg:px-8 py-4 lg:py-5" style={{ borderColor: '#F0F0F0' }}>
          <div className="flex items-center justify-between mb-4 lg:mb-0">
            <div>
              <h1 className="text-xl lg:text-2xl font-extrabold tracking-tight" style={{ color: '#1A1A2E' }}>Friends</h1>
              <p className="text-sm mt-0.5" style={{ color: '#9CA3AF' }}>{allFriends.length} connected · {pendingCount} pending splits</p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2.5 text-white text-sm font-bold rounded-xl"
              style={{ background: '#FF6B6B', boxShadow: '0 4px 12px rgba(255,107,107,0.35)' }}
            >
              + Add Friend
            </button>
          </div>
        </div>

        <div className="flex-1 p-6 lg:p-8 pb-24 lg:pb-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">

            {/* Main: Friends list (2/3 on desktop) */}
            <div className="lg:col-span-2 space-y-5">

              {/* Search */}
              <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-white" style={{ border: '1.5px solid #E5E7EB' }}>
                <span className="text-base opacity-40">🔍</span>
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search by name or @handle..."
                  className="flex-1 bg-transparent border-none outline-none text-sm"
                  style={{ color: '#1A1A2E' }}
                />
                {search && (
                  <button onClick={() => setSearch('')} className="text-gray-400 text-sm">✕</button>
                )}
              </div>

              {filtered.length > 0 ? (
                <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                  <div className="flex justify-between items-center px-5 py-3.5 border-b" style={{ borderColor: '#F9FAFB' }}>
                    <h2 className="text-sm font-bold" style={{ color: '#1A1A2E' }}>Your Friends</h2>
                    <span className="text-xs" style={{ color: '#9CA3AF' }}>{filtered.length} total</span>
                  </div>
                  {/* Table header (desktop) */}
                  <div className="hidden lg:grid grid-cols-12 gap-4 px-5 py-2.5 text-xs font-semibold uppercase tracking-wider" style={{ color: '#9CA3AF', background: '#FAFAFA', borderBottom: '1px solid #F0F0F0' }}>
                    <div className="col-span-5">Person</div>
                    <div className="col-span-3 text-right">Balance</div>
                    <div className="col-span-4 text-right">Action</div>
                  </div>
                  {filtered.map((friend, i) => {
                    const balance = getNetBalance(state.currentUserId!, friend.id, state.expenses, state.settlements)
                    const isOwed = balance > 0
                    const isSettled = Math.abs(balance) < 0.01
                    return (
                      <div
                        key={friend.id}
                        className="flex lg:grid lg:grid-cols-12 lg:gap-4 items-center px-5 py-4 hover:bg-gray-50 transition-colors"
                        style={{ borderBottom: i < filtered.length - 1 ? '1px solid #F9FAFB' : 'none' }}
                      >
                        <div className="flex items-center gap-3 flex-1 lg:col-span-5 min-w-0">
                          <Avatar initials={friend.initials} color={friend.color} size={44} radius={14} fontSize={14} />
                          <div className="min-w-0">
                            <p className="text-sm font-bold truncate" style={{ color: '#1A1A2E' }}>{friend.name}</p>
                            <p className="text-xs mt-0.5 truncate" style={{ color: '#9CA3AF' }}>{friend.handle}</p>
                          </div>
                        </div>
                        <div className="hidden lg:block lg:col-span-3 text-right">
                          {!isSettled && (
                            <span
                              className="inline-block text-sm font-bold px-3 py-1 rounded-lg"
                              style={{ background: isOwed ? '#E0F7F4' : '#FFF0F0', color: isOwed ? '#00BFA5' : '#FF6B6B' }}
                            >
                              {isOwed ? `+${formatAUD(balance)}` : `–${formatAUD(balance)}`}
                            </span>
                          )}
                          {isSettled && <span className="text-sm font-semibold" style={{ color: '#9CA3AF' }}>Clear ✓</span>}
                        </div>
                        <div className="lg:col-span-4 text-right flex items-center justify-end gap-2">
                          {/* Mobile balance badge */}
                          {!isSettled && (
                            <span
                              className="lg:hidden inline-block text-xs font-bold px-2.5 py-1 rounded-lg mr-1"
                              style={{ background: isOwed ? '#E0F7F4' : '#FFF0F0', color: isOwed ? '#00BFA5' : '#FF6B6B' }}
                            >
                              {isOwed ? `+${formatAUD(balance)}` : `–${formatAUD(balance)}`}
                            </span>
                          )}
                          {!isSettled && (
                            <Link
                              href={`/settle/${friend.id}`}
                              className="text-xs font-bold px-3 py-2 rounded-lg text-white shrink-0"
                              style={{ background: '#FF6B6B' }}
                            >
                              Settle
                            </Link>
                          )}
                          {isSettled && (
                            <span className="text-xs font-semibold px-3 py-2 rounded-lg shrink-0" style={{ background: '#F9FAFB', color: '#9CA3AF' }}>✓ Added</span>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="bg-white rounded-2xl p-12 text-center" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                  <div className="text-5xl mb-4">{search ? '🔍' : '👥'}</div>
                  <p className="font-bold text-lg" style={{ color: '#1A1A2E' }}>
                    {search ? `No results for "${search}"` : 'No friends yet'}
                  </p>
                  <p className="text-sm mt-1 mb-6" style={{ color: '#9CA3AF' }}>
                    {search ? 'Try a different name or handle' : 'Add friends to start splitting'}
                  </p>
                  {!search && (
                    <button onClick={() => setShowAddModal(true)} className="inline-flex items-center gap-2 px-5 py-2.5 text-white text-sm font-bold rounded-xl" style={{ background: '#FF6B6B' }}>
                      + Add Friend
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Sidebar: invite + suggestions */}
            <div className="lg:col-span-1 space-y-4">
              {/* Invite banner */}
              <div className="rounded-2xl px-5 py-5 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #1A1A2E, #2D1B4E)' }}>
                <div className="absolute pointer-events-none" style={{ width: 150, height: 150, background: 'radial-gradient(circle, rgba(255,107,107,0.15) 0%, transparent 70%)', top: -30, right: -30, borderRadius: '50%' }} />
                <p className="text-2xl mb-2 relative z-10">🔗</p>
                <p className="text-sm font-bold text-white relative z-10 mb-1">Invite to SplitMate</p>
                <p className="text-xs mb-4 relative z-10" style={{ color: 'rgba(255,255,255,0.5)' }}>Share your house code and split instantly</p>
                <button
                  className="w-full py-2.5 text-white text-sm font-bold rounded-xl relative z-10"
                  style={{ background: '#FF6B6B', boxShadow: '0 4px 12px rgba(255,107,107,0.35)' }}
                >
                  Share Code: {state.house.code}
                </button>
              </div>

              {/* Suggested friends */}
              {suggestionsNotAdded.length > 0 && (
                <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                  <div className="px-4 py-3.5 border-b" style={{ borderColor: '#F9FAFB' }}>
                    <h2 className="text-sm font-bold" style={{ color: '#1A1A2E' }}>Suggested Friends</h2>
                    <p className="text-xs mt-0.5" style={{ color: '#9CA3AF' }}>People you might know</p>
                  </div>
                  {suggestionsNotAdded.map((s, i, arr) => (
                    <div
                      key={s.name}
                      className="flex items-center gap-3 px-4 py-3.5"
                      style={{ borderBottom: i < arr.length - 1 ? '1px solid #F9FAFB' : 'none' }}
                    >
                      <Avatar initials={s.initials} color={s.color} size={40} radius={12} fontSize={13} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold truncate" style={{ color: '#1A1A2E' }}>{s.name}</p>
                        <p className="text-xs truncate" style={{ color: '#9CA3AF' }}>{s.handle}</p>
                      </div>
                      <button
                        onClick={() => addFriendToHouse(s)}
                        className="text-xs font-bold px-3 py-1.5 rounded-lg shrink-0 transition-all"
                        style={{ border: '2px solid #FF6B6B', background: '#FFF0F0', color: '#FF6B6B' }}
                      >
                        + Add
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Add Friend Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
            <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.4)' }} onClick={() => setShowAddModal(false)} />
            <div className="relative w-full max-w-md mx-auto bg-white sm:rounded-3xl rounded-t-3xl px-6 pt-4 pb-8 slide-up" style={{ boxShadow: '0 -8px 32px rgba(0,0,0,0.12)' }}>
              <div className="w-10 h-1 rounded-full mx-auto mb-5 sm:hidden" style={{ background: '#E5E7EB' }} />
              <h2 className="text-lg font-extrabold mb-5" style={{ color: '#1A1A2E' }}>Add a Friend</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold tracking-wider mb-2" style={{ color: '#6B7280' }}>FULL NAME</label>
                  <input
                    type="text"
                    value={newFriendName}
                    onChange={e => setNewFriendName(e.target.value)}
                    placeholder="e.g. Tom Wilson"
                    className="w-full px-4 py-3.5 rounded-xl text-sm outline-none"
                    style={{ border: '1.5px solid #E5E7EB', background: '#F9FAFB', color: '#1A1A2E' }}
                    onFocus={e => { e.target.style.borderColor = '#FF6B6B'; e.target.style.background = '#fff' }}
                    onBlur={e => { e.target.style.borderColor = '#E5E7EB'; e.target.style.background = '#F9FAFB' }}
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold tracking-wider mb-2" style={{ color: '#6B7280' }}>HANDLE (optional)</label>
                  <input
                    type="text"
                    value={newFriendHandle}
                    onChange={e => setNewFriendHandle(e.target.value)}
                    placeholder="@tomwilson"
                    className="w-full px-4 py-3.5 rounded-xl text-sm outline-none"
                    style={{ border: '1.5px solid #E5E7EB', background: '#F9FAFB', color: '#1A1A2E' }}
                    onFocus={e => { e.target.style.borderColor = '#FF6B6B'; e.target.style.background = '#fff' }}
                    onBlur={e => { e.target.style.borderColor = '#E5E7EB'; e.target.style.background = '#F9FAFB' }}
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowAddModal(false)} className="flex-1 py-3.5 rounded-2xl font-bold text-sm" style={{ border: '1.5px solid #E5E7EB', color: '#6B7280' }}>Cancel</button>
                <button
                  onClick={addCustomFriend}
                  disabled={!newFriendName.trim()}
                  className="flex-1 py-3.5 rounded-2xl font-bold text-sm text-white"
                  style={{ background: newFriendName.trim() ? '#FF6B6B' : '#FFA5A5', boxShadow: newFriendName.trim() ? '0 4px 12px rgba(255,107,107,0.35)' : 'none' }}
                >
                  Add Friend
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  )
}
