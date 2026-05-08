'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useStore } from '@/lib/store'
import { seedJoinedHouse } from '@/lib/data'

export default function JoinPage() {
  const { setState } = useStore()
  const router = useRouter()
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleJoin = () => {
    if (!name.trim()) { setError('Please enter your name'); return }
    if (code.trim().length < 4) { setError('Please enter a valid house code'); return }
    setLoading(true)
    setState(seedJoinedHouse(name.trim()))
    router.replace('/house')
  }

  return (
    <div className="min-h-dvh flex flex-col lg:flex-row">
      {/* Left marketing panel */}
      <div
        className="hidden lg:flex lg:w-2/5 xl:w-[45%] flex-col justify-between px-12 xl:px-16 py-12 relative overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #1A1A2E 0%, #00897B 200%)' }}
      >
        <div className="absolute pointer-events-none" style={{ width: 400, height: 400, background: 'radial-gradient(circle, rgba(0,191,165,0.2) 0%, transparent 70%)', top: -100, right: -100, borderRadius: '50%' }} />
        <Link href="/" className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ background: '#FF6B6B' }}>💸</div>
          <span className="text-xl font-extrabold text-white">Split<span style={{ color: '#FF6B6B' }}>Mate</span></span>
        </Link>
        <div className="relative z-10">
          <h2 className="text-4xl font-extrabold text-white leading-tight tracking-tight mb-4">
            Joining your housemate's place
          </h2>
          <p className="text-base leading-relaxed mb-8" style={{ color: 'rgba(255,255,255,0.55)' }}>
            Enter the code your housemate shared and you'll be tracking expenses together instantly.
          </p>
          {['🔑 Get the code from your housemate', '👤 Enter your name — no password needed', '⚖️ See your share of all expenses', '🤝 Settle up with one tap'].map(b => (
            <div key={b} className="flex items-center gap-3 mb-3">
              <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: '#00BFA5' }} />
              <span className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.65)' }}>{b}</span>
            </div>
          ))}
        </div>
        <p className="text-xs relative z-10" style={{ color: 'rgba(255,255,255,0.25)' }}>SplitMate · Australian Share Houses</p>
      </div>

      {/* Right form */}
      <div className="flex-1 flex flex-col">
        <div
          className="lg:hidden px-6 pt-12 pb-8 relative overflow-hidden"
          style={{ background: 'linear-gradient(160deg, #1A1A2E 0%, #2D1B4E 100%)' }}
        >
          <div className="absolute pointer-events-none" style={{ width: 200, height: 200, background: 'radial-gradient(circle, rgba(0,191,165,0.2) 0%, transparent 70%)', top: -40, right: -40, borderRadius: '50%' }} />
          <Link href="/" className="flex items-center gap-2 mb-6 relative z-10">
            <div className="w-9 h-9 flex items-center justify-center text-lg rounded-xl" style={{ background: 'rgba(255,255,255,0.12)' }}>←</div>
          </Link>
          <div className="relative z-10">
            <div className="text-2xl mb-1">🔑</div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">Join a house</h1>
            <p className="text-sm font-medium mt-1.5" style={{ color: 'rgba(255,255,255,0.55)' }}>Enter the code your housemate shared</p>
          </div>
        </div>

        <div className="flex-1 flex flex-col justify-center px-6 lg:px-16 xl:px-24 py-10 lg:py-0">
          <div className="w-full max-w-md lg:mx-auto">
            <div className="hidden lg:block mb-10">
              <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold mb-6" style={{ color: '#9CA3AF' }}>← Back</Link>
              <h1 className="text-3xl font-extrabold tracking-tight" style={{ color: '#1A1A2E' }}>Join a house 🔑</h1>
              <p className="text-base mt-2" style={{ color: '#6B7280' }}>Enter your name and the house code to get started.</p>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-xs font-semibold tracking-wider mb-2.5" style={{ color: '#6B7280' }}>YOUR NAME</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => { setName(e.target.value); setError('') }}
                  placeholder="e.g. Tom Wilson"
                  className="w-full px-4 py-4 rounded-xl text-base outline-none transition-all"
                  style={{ border: '1.5px solid #E5E7EB', background: '#F9FAFB', color: '#1A1A2E' }}
                  onFocus={e => { e.target.style.borderColor = '#00BFA5'; e.target.style.background = '#fff' }}
                  onBlur={e => { e.target.style.borderColor = '#E5E7EB'; e.target.style.background = '#F9FAFB' }}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold tracking-wider mb-2.5" style={{ color: '#6B7280' }}>HOUSE CODE</label>
                <input
                  type="text"
                  value={code}
                  onChange={e => { setCode(e.target.value.toUpperCase()); setError('') }}
                  placeholder="e.g. ABC123"
                  maxLength={8}
                  className="w-full px-4 py-4 rounded-xl text-base outline-none transition-all font-mono tracking-widest uppercase"
                  style={{ border: '1.5px solid #E5E7EB', background: '#F9FAFB', color: '#1A1A2E' }}
                  onFocus={e => { e.target.style.borderColor = '#00BFA5'; e.target.style.background = '#fff' }}
                  onBlur={e => { e.target.style.borderColor = '#E5E7EB'; e.target.style.background = '#F9FAFB' }}
                />
                <p className="text-xs mt-2" style={{ color: '#9CA3AF' }}>Ask your housemate to share their house code from the dashboard</p>
              </div>
              {error && <p className="text-sm font-medium" style={{ color: '#FF6B6B' }}>{error}</p>}
              <button
                onClick={handleJoin}
                disabled={loading}
                className="w-full py-4 text-white font-bold text-base rounded-2xl"
                style={{ background: loading ? '#80CFC7' : '#00BFA5', boxShadow: '0 4px 16px rgba(0,191,165,0.35)' }}
              >
                {loading ? 'Joining...' : '🏠 Join House'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
