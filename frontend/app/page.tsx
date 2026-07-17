'use client'

import { useState } from 'react'
import { IntroScreen } from '@/components/intro-screen'
import { Dashboard } from '@/components/dashboard'

export default function Page() {
  const [phase, setPhase] = useState<'intro' | 'exiting' | 'dashboard'>('intro')

  const enter = () => {
    setPhase('exiting')
    setTimeout(() => setPhase('dashboard'), 650)
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-background">
      {phase !== 'dashboard' && <IntroScreen onEnter={enter} exiting={phase === 'exiting'} />}
      {phase === 'dashboard' && <Dashboard entering={false} />}
    </main>
  )
}
