'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useStore } from '@/lib/store'
import { seedNewHouse } from '@/lib/data'

export default function SetupPage() {
  const { setState } = useStore()
  const router = useRouter()
  const [name, setName] = useState('')
  const [houseName, setHouseName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleCreate = () => {
    if (!name.trim()) { setError('Please enter your name'); return }
    if (!houseName.trim()) { setError('Please enter a house name'); return }
    setLoading(true)
    setState(seedNewHouse(name.trim(), houseName.trim()))
    router.replace('/house')
  }

  return (
    <div className="min-h-dvh flex flex-col lg:flex-row">
      {/* Left marketing panel */}
      <div
        className="hidden lg:flex lg:w-2/5 xl:w-[45%] flex-col justify-between px-12 xl:px-16 py-12 relative overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #1A1A2E 0%, #2D1B4E 100%)' }}
      >
        <div className="absolute pointer-events-none" style={{ width: 400, height: 400, background: 'radial-gradient(circle, rgba(255,107,107,0.18) 0%, transparent 70%)', top: -100, right: -100, borderRadius: '50%' }} />
        <Link href="/" className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0" style={{ background: '#FF6B6B' }}>💸</div>
          <span className="text-xl font-extrabold text-white">Split<span style={{ color: '#FF6B6B' }}>Mate</span></span>
        </Link>
        <div className="relative z-10">
          <h2 className="text-4xl font-extrabold text-white leading-tight tracking-tight mb-4">
            Set up your share house in seconds
          </h2>
          <p className="text-base leading-relaxed mb-8" style={{ color: 'rgba(255,255,255,0.55)' }}>
            We'll add sample housemates so you can explore straight away. Add your own friends anytime.
          </p>
          {[
            '🏠 Liam, Jake & Mia added automatically',
            '💰 Sample expenses pre-loaded',
            '🔄 Smart debt adjustment from day one',
            '🔑 Share your house code with mates',
          ].map(b => (
            <div key={b} className="flex items-center gap-3 mb-3">
              <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: '#FF6B6B' }} />
              <span className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.65)' }}>{b}</span>
            </div>
          ))}
        </div>
        <p className="text-xs relative z-10" style={{ color: 'rgba(255,255,255,0.25)' }}>SplitMate · Australian Share Houses</p>
      </div>

      {/* Right form */}
      <div className="flex-1 flex flex-col">
        {/* Mobile header */}
        <div
          className="lg:hidden px-6 pt-12 pb-8 relative overflow-hidden"
          style={{ background: 'linear-gradient(160deg, #1A1A2E 0%, #2D1B4E 100%)' }}
        >
          <div className="absolute pointer-events-none" style={{ width: 200, height: 200, background: 'radial-gradient(circle, rgba(255,107,107,0.25) 0%, transparent 70%)', top: -40, right: -40, borderRadius: '50%' }} />
          <Link href="/" className="flex items-center gap-2 mb-6 relative z-10">
            <div className="w-9 h-9 flex items-center justify-center text-lg rounded-xl" style={{ background: 'rgba(255,255,255,0.12)' }}>←</div>
          </Link>
          <div className="relative z-10">
            <div className="text-2xl mb-1">🏠</div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">Create your house</h1>
            <p className="text-sm font-medium mt-1.5" style={{ color: 'rgba(255,255,255,0.55)' }}>Set up your share house in seconds</p>
          </div>
        </div>

        {/* Form area */}
        <div className="flex-1 flex flex-col justify-center px-6 lg:px-16 xl:px-24 py-10 lg:py-0">
          <div className="w-full max-w-md lg:mx-auto">
            {/* Desktop back + title */}
            <div className="hidden lg:block mb-10">
              <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold mb-6" style={{ color: '#9CA3AF' }}>
                <span>←</span> Back
              </Link>
              <h1 className="text-3xl font-extrabold tracking-tight" style={{ color: '#1A1A2E' }}>Create your house 🏠</h1>
              <p className="text-base mt-2" style={{ color: '#6B7280' }}>You'll be set up and splitting in under a minute.</p>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-xs font-semibold tracking-wider mb-2.5" style={{ color: '#6B7280' }}>YOUR NAME</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => { setName(e.target.value); setError('') }}
                  placeholder="e.g. Priya Sharma"
                  className="w-full px-4 py-4 rounded-xl text-base outline-none transition-all"
                  style={{ border: '1.5px solid #E5E7EB', background: '#F9FAFB', color: '#1A1A2E' }}
                  onFocus={e => { e.target.style.borderColor = '#FF6B6B'; e.target.style.background = '#fff' }}
                  onBlur={e => { e.target.style.borderColor = '#E5E7EB'; e.target.style.background = '#F9FAFB' }}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold tracking-wider mb-2.5" style={{ color: '#6B7280' }}>HOUSE NAME</label>
                <input
                  type="text"
                  value={houseName}
                  onChange={e => { setHouseName(e.target.value); setError('') }}
                  placeholder="e.g. Brunswick St House"
                  className="w-full px-4 py-4 rounded-xl text-base outline-none transition-all"
                  style={{ border: '1.5px solid #E5E7EB', background: '#F9FAFB', color: '#1A1A2E' }}
                  onFocus={e => { e.target.style.borderColor = '#FF6B6B'; e.target.style.background = '#fff' }}
                  onBlur={e => { e.target.style.borderColor = '#E5E7EB'; e.target.style.background = '#F9FAFB' }}
                />
              </div>

              {error && <p className="text-sm font-medium" style={{ color: '#FF6B6B' }}>{error}</p>}

              <div className="flex items-start gap-3 px-4 py-3 rounded-xl" style={{ background: '#E0F7F4' }}>
                <span className="text-sm shrink-0 mt-0.5">💡</span>
                <p className="text-xs font-semibold leading-relaxed" style={{ color: '#00897B' }}>
                  Liam, Jake &amp; Mia will be added as sample housemates so you can explore straight away.
                </p>
              </div>

              <button
                onClick={handleCreate}
                disabled={loading}
                className="w-full py-4 text-white font-bold text-base rounded-2xl transition-all"
                style={{ background: loading ? '#FFA5A5' : '#FF6B6B', boxShadow: '0 4px 16px rgba(255,107,107,0.35)' }}
              >
                {loading ? 'Creating...' : '🚀 Create House & Get Started'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
