'use client'

import Sidebar from './Sidebar'
import BottomNav from './BottomNav'

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh" style={{ background: '#F9FAFB' }}>
      <Sidebar />
      <main className="lg:pl-[260px] min-h-dvh flex flex-col">
        {children}
      </main>
      <BottomNav />
    </div>
  )
}
