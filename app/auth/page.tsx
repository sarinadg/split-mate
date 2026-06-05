'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth'

export default function AuthPage() {
  const { signIn, signUp } = useAuth()
  const router = useRouter()

  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [signUpDone, setSignUpDone] = useState(false)

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) { setError('Please fill in all fields'); return }
    setLoading(true)
    setError('')

    if (mode === 'signup') {
      const err = await signUp(email.trim(), password)
      setLoading(false)
      if (err) { setError(err); return }
      router.replace('/')
    } else {
      const err = await signIn(email.trim(), password)
      setLoading(false)
      if (err) { setError(err); return }
      router.replace('/')
    }
  }

  if (signUpDone) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-white px-6">
        <div className="max-w-sm w-full text-center">
          <div className="text-6xl mb-4">📬</div>
          <h1 className="text-2xl font-extrabold tracking-tight mb-2" style={{ color: '#1A1A2E' }}>Check your email</h1>
          <p className="text-sm mb-6" style={{ color: '#6B7280' }}>
            We sent a confirmation link to <strong>{email}</strong>. Click it, then sign in.
          </p>
          <button
            onClick={() => { setSignUpDone(false); setMode('signin') }}
            className="w-full py-4 text-white font-bold text-base rounded-2xl"
            style={{ background: '#FF6B6B' }}
          >
            Back to Sign In
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-dvh flex flex-col lg:flex-row">
      {/* Left dark panel */}
      <div
        className="hidden lg:flex lg:w-[45%] flex-col items-center justify-center px-16 relative overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #1A1A2E 0%, #2D1B4E 100%)' }}
      >
        <div className="absolute pointer-events-none" style={{ width: 400, height: 400, background: 'radial-gradient(circle, rgba(255,107,107,0.18) 0%, transparent 70%)', top: -100, right: -100, borderRadius: '50%' }} />
        <div className="relative z-10 text-center">
          <div className="w-20 h-20 flex items-center justify-center text-4xl rounded-3xl mx-auto mb-6" style={{ background: '#FF6B6B', boxShadow: '0 8px 32px rgba(255,107,107,0.5)' }}>
            💸
          </div>
          <h1 className="text-4xl font-extrabold text-white tracking-tight mb-3">
            Split<span style={{ color: '#FF6B6B' }}>Mate</span>
          </h1>
          <p className="text-base font-medium" style={{ color: 'rgba(255,255,255,0.55)' }}>
            Split smart. Stay mates.
          </p>
        </div>
      </div>

      {/* Right form */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 lg:px-16 xl:px-24 py-12 bg-white">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-10 lg:hidden">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ background: '#FF6B6B' }}>💸</div>
            <span className="text-xl font-extrabold" style={{ color: '#1A1A2E' }}>Split<span style={{ color: '#FF6B6B' }}>Mate</span></span>
          </div>

          <h2 className="text-3xl font-extrabold tracking-tight mb-1" style={{ color: '#1A1A2E' }}>
            {mode === 'signin' ? 'Welcome back' : 'Create account'}
          </h2>
          <p className="text-sm mb-8" style={{ color: '#6B7280' }}>
            {mode === 'signin' ? 'Sign in to your SplitMate account' : 'Join SplitMate and start splitting'}
          </p>

          {/* Toggle */}
          <div className="flex rounded-xl p-1 mb-8" style={{ background: '#F3F4F6' }}>
            {(['signin', 'signup'] as const).map(m => (
              <button
                key={m}
                onClick={() => { setMode(m); setError('') }}
                className="flex-1 py-2.5 text-sm font-bold rounded-lg transition-all"
                style={{
                  background: mode === m ? '#fff' : 'transparent',
                  color: mode === m ? '#1A1A2E' : '#9CA3AF',
                  boxShadow: mode === m ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                }}
              >
                {m === 'signin' ? 'Sign In' : 'Sign Up'}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold tracking-wider mb-2" style={{ color: '#6B7280' }}>EMAIL</label>
              <input
                type="email"
                value={email}
                onChange={e => { setEmail(e.target.value); setError('') }}
                placeholder="you@example.com"
                className="w-full px-4 py-4 rounded-xl text-base outline-none transition-all"
                style={{ border: '1.5px solid #E5E7EB', background: '#F9FAFB', color: '#1A1A2E' }}
                onFocus={e => { e.target.style.borderColor = '#FF6B6B'; e.target.style.background = '#fff' }}
                onBlur={e => { e.target.style.borderColor = '#E5E7EB'; e.target.style.background = '#F9FAFB' }}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold tracking-wider mb-2" style={{ color: '#6B7280' }}>PASSWORD</label>
              <input
                type="password"
                value={password}
                onChange={e => { setPassword(e.target.value); setError('') }}
                placeholder="••••••••"
                className="w-full px-4 py-4 rounded-xl text-base outline-none transition-all"
                style={{ border: '1.5px solid #E5E7EB', background: '#F9FAFB', color: '#1A1A2E' }}
                onFocus={e => { e.target.style.borderColor = '#FF6B6B'; e.target.style.background = '#fff' }}
                onBlur={e => { e.target.style.borderColor = '#E5E7EB'; e.target.style.background = '#F9FAFB' }}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              />
            </div>

            {error && <p className="text-sm font-medium" style={{ color: '#FF6B6B' }}>{error}</p>}

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full py-4 text-white font-bold text-base rounded-2xl transition-all"
              style={{ background: loading ? '#FFA5A5' : '#FF6B6B', boxShadow: '0 4px 16px rgba(255,107,107,0.35)' }}
            >
              {loading ? '...' : mode === 'signin' ? 'Sign In' : 'Create Account'}
            </button>
          </div>

          <p className="text-xs text-center mt-8" style={{ color: '#D1D5DB' }}>
            <Link href="/" style={{ color: '#9CA3AF' }}>← Back to home</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
