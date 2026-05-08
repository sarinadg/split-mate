'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const tabs = [
  { href: '/house', icon: '🏠', label: 'Home' },
  { href: '/balances', icon: '⚖️', label: 'Balances' },
  { href: '/friends', icon: '👥', label: 'Friends' },
  { href: '/profile', icon: '👤', label: 'Profile' },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 inset-x-0 h-20 bg-white border-t flex items-center justify-around pb-2 z-20 lg:hidden" style={{ borderColor: '#F0F0F0' }}>
      {tabs.map(tab => {
        const active = pathname === tab.href || pathname.startsWith(tab.href + '/')
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className="flex flex-col items-center gap-1 px-4 py-1.5 relative"
          >
            <span style={{ fontSize: 22, opacity: active ? 1 : 0.4 }}>{tab.icon}</span>
            <span
              className="text-[10px] font-semibold tracking-wide"
              style={{ color: active ? '#FF6B6B' : '#9CA3AF' }}
            >
              {tab.label}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}
