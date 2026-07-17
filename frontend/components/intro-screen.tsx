'use client'

import { ArrowRight, Wind } from 'lucide-react'

export function IntroScreen({ onEnter, exiting }: { onEnter: () => void; exiting: boolean }) {
  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center overflow-hidden transition-all duration-700"
      style={{
        background: 'radial-gradient(130% 120% at 50% 30%, oklch(0.22 0.06 250), oklch(0.12 0.03 255) 60%, oklch(0.08 0.02 260))',
        opacity: exiting ? 0 : 1,
        transform: exiting ? 'scale(1.35)' : 'scale(1)',
        filter: exiting ? 'blur(8px)' : 'blur(0)',
        pointerEvents: exiting ? 'none' : 'auto',
      }}
    >
      {/* Atmospheric drifting blobs */}
      <div
        className="animate-atmos absolute -left-40 top-10 size-[520px] rounded-full opacity-40 blur-3xl"
        style={{ background: 'radial-gradient(circle, oklch(0.5 0.16 200 / 0.6), transparent 70%)' }}
      />
      <div
        className="animate-atmos absolute -right-32 bottom-0 size-[460px] rounded-full opacity-30 blur-3xl"
        style={{ background: 'radial-gradient(circle, oklch(0.5 0.2 145 / 0.5), transparent 70%)', animationDelay: '-8s' }}
      />
      {/* Faint tessellation grid */}
      <svg className="absolute inset-0 h-full w-full opacity-[0.07]" aria-hidden="true">
        <defs>
          <pattern id="introhex" width="56" height="48" patternUnits="userSpaceOnUse" patternTransform="scale(1.4)">
            <polygon
              points="28,0 56,16 56,40 28,56 0,40 0,16"
              fill="none"
              stroke="oklch(0.85 0.14 200)"
              strokeWidth="1"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#introhex)" />
      </svg>

      <div className="relative z-10 flex flex-col items-center px-6 text-center">
        <div className="mb-6 flex items-center gap-2 rounded-full border border-border bg-[oklch(0.85_0.16_200_/_0.08)] px-4 py-1.5 backdrop-blur-md">
          <Wind className="size-3.5 text-[oklch(0.85_0.16_200)]" />
          <span className="font-mono text-[11px] uppercase tracking-[0.3em] text-[oklch(0.85_0.14_200)]">
            AI Environmental Command Center
          </span>
        </div>

        <h1
          className="font-display text-6xl font-black leading-none tracking-tight text-foreground sm:text-8xl md:text-9xl text-glow-cyan"
        >
          VAYU<span className="text-[oklch(0.88_0.15_200)]">VISION</span>
        </h1>

        <p className="mt-6 max-w-md text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
          Real-time atmospheric intelligence across a living hexagonal grid. Predict, visualize, and respond to
          pollution before it spreads.
        </p>

        <button
          onClick={onEnter}
          className="animate-pulse-glow group mt-10 flex items-center gap-3 rounded-full border border-[oklch(0.85_0.16_200_/_0.4)] bg-[oklch(0.85_0.16_200_/_0.12)] px-7 py-3.5 font-display text-sm font-bold uppercase tracking-[0.18em] text-[oklch(0.92_0.12_200)] backdrop-blur-xl transition-all hover:bg-[oklch(0.85_0.16_200_/_0.22)]"
        >
          Enter Command Center
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
        </button>

        <div className="mt-10 flex items-center gap-6 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="size-1.5 rounded-full bg-[oklch(0.82_0.22_145)]" /> 2,048 Cells
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-1.5 rounded-full bg-[oklch(0.85_0.16_200)]" /> 312 IoT Nodes
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-1.5 rounded-full bg-[oklch(0.62_0.24_22)]" /> 4 Active Alerts
          </span>
        </div>
      </div>
    </div>
  )
}
