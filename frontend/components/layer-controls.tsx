'use client'

import type { Layers } from '@/components/dashboard' // Note: Make sure this imports from where you defined the Layers type!
import { AlertTriangle, Factory, Hospital, GraduationCap, Radio, Store } from 'lucide-react'

const CONFIG = [
  { key: 'danger', label: 'Danger Zones', icon: AlertTriangle, color: 'oklch(0.62 0.24 22)' },
  { key: 'industrial', label: 'Industrial Hubs', icon: Factory, color: 'oklch(0.75 0.19 55)' },
  { key: 'hospitals', label: 'Hospitals', icon: Hospital, color: 'oklch(0.85 0.16 200)' },
  { key: 'schools', label: 'Schools', icon: GraduationCap, color: 'oklch(0.82 0.22 145)' },
  // 🛍️ NEW: Retail / Malls added to the map loop with a purple glow!
  { key: 'malls', label: 'Retail / Malls', icon: Store, color: 'oklch(0.70 0.22 300)' },
  { key: 'iot', label: 'Citizen IoT Nodes', icon: Radio, color: 'oklch(0.85 0.18 205)' },
] as const

export function LayerControls({
  layers,
  onToggle,
}: {
  layers: Layers
  onToggle: (key: keyof Layers) => void
}) {
  return (
    <div className="glass-strong animate-float-in w-60 rounded-2xl p-4" style={{ animationDelay: '0.1s' }}>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-display text-xs font-bold uppercase tracking-[0.2em] text-foreground">Map Layers</h2>
        <span className="font-mono text-[10px] text-muted-foreground">
          {/* Updated this to out of 6! */}
          {Object.values(layers).filter(Boolean).length}/6
        </span>
      </div>
      <div className="flex flex-col gap-1">
        {CONFIG.map(({ key, label, icon: Icon, color }) => {
          // Cast the key to ensure TypeScript is happy with dynamic object access
          const on = layers[key as keyof Layers]
          return (
            <button
              key={key}
              onClick={() => onToggle(key as keyof Layers)}
              className="flex items-center justify-between rounded-xl px-2.5 py-2 transition-colors hover:bg-[oklch(0.85_0.16_200_/_0.06)]"
              role="switch"
              aria-checked={on}
            >
              <span className="flex items-center gap-2.5">
                <Icon
                  className="size-4"
                  strokeWidth={2.2}
                  style={{ color: on ? color : 'oklch(0.6 0.02 235)', filter: on ? `drop-shadow(0 0 6px ${color})` : 'none' }}
                />
                <span className={`text-[13px] font-medium ${on ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {label}
                </span>
              </span>
              <span
                className="relative h-5 w-9 rounded-full transition-all duration-200"
                style={{
                  background: on ? `color-mix(in oklab, ${color} 55%, transparent)` : 'oklch(0.35 0.02 250 / 0.6)',
                  boxShadow: on ? `inset 0 0 0 1px ${color}, 0 0 12px color-mix(in oklab, ${color} 60%, transparent)` : 'inset 0 0 0 1px oklch(0.85 0.05 220 / 0.15)',
                }}
              >
                <span
                  className="absolute top-0.5 size-4 rounded-full bg-white transition-all duration-200"
                  style={{ left: on ? '18px' : '2px', boxShadow: '0 1px 3px oklch(0.1 0 0 / 0.5)' }}
                />
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}