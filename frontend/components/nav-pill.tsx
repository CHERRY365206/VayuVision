'use client'

import { Map, CloudSun, Settings2, Info } from 'lucide-react'

const ITEMS = [
  { id: 'map', label: 'Live Map', icon: Map },
  { id: 'weather', label: 'Weather Forecasts', icon: CloudSun },
  { id: 'settings', label: 'System Settings', icon: Settings2 },
  { id: 'about', label: 'About Vayu', icon: Info }, // NEW ITEM ADDED
] as const

export function NavPill({
  active,
  onChange,
}: {
  active: string
  onChange: (id: string) => void
}) {
  return (
    <nav className="glass-strong animate-float-in flex items-center gap-1 rounded-full p-1.5">
      <div className="flex items-center gap-2 pl-3 pr-1">
        <span className="size-2 rounded-full bg-[oklch(0.82_0.22_145)] shadow-[0_0_10px_oklch(0.82_0.22_145)]" />
        <span className="font-display text-sm font-bold tracking-widest text-foreground">VAYU</span>
      </div>
      <div className="mx-1 h-6 w-px bg-border" />
      {ITEMS.map((item) => {
        const Icon = item.icon
        const isActive = active === item.id
        return (
          <button
            key={item.id}
            onClick={() => onChange(item.id)}
            className={`group flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium transition-all ${
              isActive
                ? 'bg-[oklch(0.85_0.16_200_/_0.16)] text-[oklch(0.9_0.14_200)]'
                : 'text-muted-foreground hover:bg-[oklch(0.85_0.16_200_/_0.08)] hover:text-foreground'
            }`}
            aria-current={isActive ? 'page' : undefined}
          >
            <Icon
              className="size-4"
              strokeWidth={2.2}
              style={isActive ? { filter: 'drop-shadow(0 0 6px oklch(0.85 0.16 200))' } : undefined}
            />
            <span className="hidden sm:inline">{item.label}</span>
          </button>
        )
      })}
    </nav>
  )
}