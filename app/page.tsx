'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useStore } from '@/lib/store'
import { useAuth } from '@/lib/auth'

const FEATURES = [
  { icon: '⚡', text: 'Add expenses in seconds' },
  { icon: '🔄', text: 'Smart debt adjustment across payments' },
  { icon: '🏠', text: 'Built for Australian share houses' },
  { icon: '🔑', text: 'Backed by a real Python API' },
]

export default function OnboardingPage() {
  const { state } = useStore()
  const { session, loading: authLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (authLoading) return
    // Authenticated + data loaded → go to dashboard
    if (state.currentUserId && state.house) { router.replace('/house'); return }
    // Authenticated + no house yet → go to setup
    if (session && state.currentUserId && !state.house) { router.replace('/setup'); return }
  }, [state.currentUserId, state.house, session, authLoading, router])

  if (authLoading || (session && state.currentUserId)) return null

  return (
    <div className="min-h-dvh flex flex-col lg:flex-row">
      {/* Left panel — dark, always full height */}
      <div
        className="lg:w-[55%] xl:w-[60%] flex flex-col items-center justify-between px-8 py-14 lg:py-16 relative overflow-hidden flex-1 lg:flex-none"
        style={{ background: 'linear-gradient(160deg, #1A1A2E 0%, #2D1B4E 60%, #1A1A2E 100%)' }}
      >
        {/* Background glows */}
        <div className="absolute pointer-events-none" style={{ width: 500, height: 500, background: 'radial-gradient(circle, rgba(255,107,107,0.18) 0%, transparent 70%)', top: -150, right: -150, borderRadius: '50%' }} />
        <div className="absolute pointer-events-none" style={{ width: 400, height: 400, background: 'radial-gradient(circle, rgba(0,191,165,0.12) 0%, transparent 70%)', bottom: 80, left: -100, borderRadius: '50%' }} />

        {/* Logo */}
        <div className="flex flex-col items-center gap-4 relative z-10">
          <div className="w-20 h-20 lg:w-24 lg:h-24 flex items-center justify-center text-4xl lg:text-5xl rounded-3xl" style={{ background: '#FF6B6B', boxShadow: '0 8px 32px rgba(255,107,107,0.5)' }}>
            💸
          </div>
          <div className="text-center">
            <h1 className="text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
              Split<span style={{ color: '#FF6B6B' }}>Mate</span>
            </h1>
            <p className="text-base lg:text-lg font-medium mt-2" style={{ color: 'rgba(255,255,255,0.55)' }}>
              Split smart. Stay mates.
            </p>
          </div>
        </div>

        {/* Floating preview cards */}
        <div className="relative z-10 flex flex-col items-center gap-4 w-full max-w-xs lg:max-w-sm">
          {[
            { label: '🏠 Brunswick St House', title: 'Rent — $1,800', badge: 'You owe $450', badgeColor: 'rgba(255,107,107,0.2)', badgeText: '#FF6B6B', anim: 'float-1', rotate: '-2deg' },
            { label: '⚡ Electricity', title: '$120', badge: 'Liam owes you', badgeColor: 'rgba(0,191,165,0.2)', badgeText: '#00BFA5', anim: 'float-2', rotate: '1.5deg' },
          ].map(card => (
            <div
              key={card.title}
              className={`${card.anim} flex items-center gap-3 px-5 py-4 w-full`}
              style={{ background: 'rgba(255,255,255,0.07)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 16, transform: `rotate(${card.rotate})` }}
            >
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium mb-1" style={{ color: 'rgba(255,255,255,0.5)' }}>{card.label}</p>
                <p className="text-lg font-bold text-white truncate">{card.title}</p>
              </div>
              <div className="px-3 py-1.5 rounded-full text-xs font-semibold shrink-0" style={{ background: card.badgeColor, color: card.badgeText }}>
                {card.badge}
              </div>
            </div>
          ))}
        </div>

        {/* Features — only on desktop */}
        <div className="hidden lg:flex flex-col gap-2.5 relative z-10 w-full max-w-sm">
          {FEATURES.map(f => (
            <div key={f.text} className="flex items-center gap-3">
              <span className="text-base">{f.icon}</span>
              <span className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.6)' }}>{f.text}</span>
            </div>
          ))}
        </div>

        {/* Mobile CTA */}
        <div className="relative z-10 w-full flex flex-col gap-3 lg:hidden">
          <Link href="/auth" className="w-full py-4 text-center text-white font-bold text-base rounded-2xl" style={{ background: '#FF6B6B', boxShadow: '0 4px 16px rgba(255,107,107,0.4)' }}>
            Get Started
          </Link>
        </div>
      </div>

      {/* Right panel — light, desktop only */}
      <div className="hidden lg:flex lg:w-[45%] xl:w-[40%] flex-col items-center justify-center px-12 xl:px-20 bg-white">
        <div className="w-full max-w-sm">
          <h2 className="text-3xl xl:text-4xl font-extrabold tracking-tight mb-2" style={{ color: '#1A1A2E' }}>
            Welcome to <span style={{ color: '#FF6B6B' }}>SplitMate</span> 🏠
          </h2>
          <p className="text-base mb-10" style={{ color: '#6B7280' }}>
            The easiest way to split expenses with your share house mates.
          </p>

          <div className="flex flex-col gap-4">
            <Link
              href="/auth"
              className="flex items-center justify-center gap-3 w-full py-4 text-white font-bold text-base rounded-2xl transition-all hover:opacity-90"
              style={{ background: '#FF6B6B', boxShadow: '0 4px 20px rgba(255,107,107,0.4)' }}
            >
              <span className="text-xl">🚀</span>
              <div className="text-left">
                <div>Get Started</div>
                <div className="text-xs font-medium opacity-80">Sign in or create an account</div>
              </div>
            </Link>
          </div>

          <div className="mt-10 grid grid-cols-2 gap-3">
            {FEATURES.map(f => (
              <div key={f.text} className="flex items-start gap-2.5 p-3.5 rounded-xl" style={{ background: '#F9FAFB' }}>
                <span className="text-lg">{f.icon}</span>
                <span className="text-xs font-semibold leading-relaxed" style={{ color: '#4B5563' }}>{f.text}</span>
              </div>
            ))}
          </div>

          <p className="text-xs text-center mt-8" style={{ color: '#D1D5DB' }}>
            Made for Australian share houses 🦘 · No account required
          </p>
        </div>
      </div>
    </div>
  )
}
