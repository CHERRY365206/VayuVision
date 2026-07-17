'use client'

import { useState } from 'react'
import {
  HEXES,
  POIS,
  IOT_PATHS,
  SOURCES_GLOW,
  MAP_WIDTH,
  MAP_HEIGHT,
  aqiColor,
  aqiLevel,
  aqiLabel,
  type Hex,
} from '@/lib/vayu-data'
import { Sparkline } from '@/components/sparkline'
import { Factory, Hospital, GraduationCap, Wind, Gauge, X } from 'lucide-react'

export type Layers = {
  danger: boolean
  industrial: boolean
  hospitals: boolean
  schools: boolean
  iot: boolean
}

const POI_META = {
  industrial: { icon: Factory, color: 'oklch(0.75 0.19 55)' },
  hospital: { icon: Hospital, color: 'oklch(0.85 0.16 200)' },
  school: { icon: GraduationCap, color: 'oklch(0.82 0.22 145)' },
} as const

export function HexMap({ layers, timeShift }: { layers: Layers; timeShift: number }) {
  const [hovered, setHovered] = useState<string | null>(null)
  const [selected, setSelected] = useState<Hex | null>(null)

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Satellite base */}
      <img
        src="/images/satellite-map.png"
        alt="Dark satellite view of the monitored metropolitan area"
        className="absolute inset-0 h-full w-full object-cover opacity-80"
        crossOrigin="anonymous"
      />
      {/* Depth + vignette */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(120% 90% at 50% 40%, transparent 30%, oklch(0.1 0.03 250 / 0.65) 100%)',
        }}
      />

      <svg
        viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full"
        role="img"
        aria-label="Hexagonal air quality tessellation overlay"
      >
        <defs>
          <filter id="glow-blur" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="26" />
          </filter>
        </defs>

        {/* Soft cluster glow blobs */}
        {layers.danger && (
          <g filter="url(#glow-blur)" opacity="0.55">
            {SOURCES_GLOW.map((s, i) => (
              <circle key={i} cx={s.x} cy={s.y} r={s.radius * 0.7} fill={aqiColor(s.aqi, 0.5)} />
            ))}
          </g>
        )}

        {/* Hex tessellation */}
        <g>
          {HEXES.map((h) => {
            const isHover = hovered === h.id
            const isSel = selected?.id === h.id
            const level = aqiLevel(h.aqi)
            const showFill = layers.danger || level === 'severe'
            const baseAlpha =
              level === 'severe' ? 0.5 : level === 'poor' ? 0.32 : level === 'moderate' ? 0.18 : 0.1
            const alpha = layers.danger ? baseAlpha : level === 'severe' ? 0.42 : 0
            return (
              <polygon
                key={h.id}
                points={h.points}
                fill={showFill ? aqiColor(h.aqi, isHover || isSel ? Math.min(0.85, alpha + 0.3) : alpha) : 'transparent'}
                stroke={
                  isSel
                    ? 'oklch(0.95 0.02 220 / 0.9)'
                    : isHover
                      ? aqiColor(h.aqi, 0.95)
                      : 'oklch(0.85 0.14 200 / 0.14)'
                }
                strokeWidth={isSel ? 2 : isHover ? 1.6 : 0.75}
                className="cursor-pointer transition-all duration-150"
                style={{
                  transformOrigin: `${h.cx}px ${h.cy}px`,
                  transform: isSel || isHover ? 'scale(1.14)' : 'scale(1)',
                  filter:
                    isSel || isHover
                      ? `drop-shadow(0 0 10px ${aqiColor(h.aqi, 0.9)})`
                      : level === 'severe' && layers.danger
                        ? `drop-shadow(0 0 6px ${aqiColor(h.aqi, 0.6)})`
                        : 'none',
                }}
                onMouseEnter={() => setHovered(h.id)}
                onMouseLeave={() => setHovered(null)}
                onClick={() => setSelected(h)}
              />
            )
          })}
        </g>

        {/* IoT citizen sensor nodes moving along streets */}
        {layers.iot && (
          <g>
            {IOT_PATHS.map((d, pi) => (
              <path key={`p-${pi}`} d={d} fill="none" stroke="oklch(0.85 0.16 200 / 0.18)" strokeWidth="1.5" />
            ))}
            {IOT_PATHS.flatMap((d, pi) =>
              [0, 1, 2].map((k) => {
                const dur = 9 + pi * 1.5 + k * 2
                return (
                  <circle key={`iot-${pi}-${k}`} r="3.4" fill="oklch(0.85 0.18 205)">
                    <animateMotion dur={`${dur}s`} repeatCount="indefinite" begin={`${k * (dur / 3)}s`} path={d} />
                    <animate attributeName="opacity" values="0.2;1;0.2" dur="2.4s" repeatCount="indefinite" />
                  </circle>
                )
              }),
            )}
          </g>
        )}
      </svg>

      {/* POI markers (positioned in stretched coordinate space) */}
      {(['industrial', 'hospitals', 'schools'] as const).map((key) => {
        const typeKey = key === 'hospitals' ? 'hospital' : key === 'schools' ? 'school' : 'industrial'
        if (!layers[key]) return null
        return POIS.filter((p) => p.type === typeKey).map((p) => {
          const meta = POI_META[p.type]
          const Icon = meta.icon
          return (
            <div
              key={p.id}
              className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${(p.x / MAP_WIDTH) * 100}%`, top: `${(p.y / MAP_HEIGHT) * 100}%` }}
            >
              <div
                className="flex size-7 items-center justify-center rounded-lg border backdrop-blur-md"
                style={{
                  borderColor: meta.color,
                  background: 'oklch(0.18 0.04 250 / 0.7)',
                  boxShadow: `0 0 14px ${meta.color}`,
                }}
              >
                <Icon className="size-4" style={{ color: meta.color }} strokeWidth={2.2} />
              </div>
            </div>
          )
        })
      })}

      {/* Selected hex tooltip card */}
      {selected && (
        <SelectedCard hex={selected} timeShift={timeShift} onClose={() => setSelected(null)} />
      )}
    </div>
  )
}

function SelectedCard({ hex, timeShift, onClose }: { hex: Hex; timeShift: number; onClose: () => void }) {
  const shiftedAqi = Math.max(15, Math.round(hex.aqi + Math.sin(timeShift / 6) * 24 + timeShift * 0.4))
  const level = aqiLevel(shiftedAqi)
  const color = aqiColor(shiftedAqi, 1)
  const leftPct = (hex.cx / MAP_WIDTH) * 100
  const topPct = (hex.cy / MAP_HEIGHT) * 100
  const flipX = leftPct > 65

  return (
    <div
      className="animate-float-in glass-strong absolute z-30 w-60 rounded-2xl p-4"
      style={{
        left: `${Math.min(Math.max(leftPct, 6), 94)}%`,
        top: `${Math.min(Math.max(topPct, 8), 78)}%`,
        transform: `translate(${flipX ? '-108%' : '8%'}, -50%)`,
        borderColor: `color-mix(in oklab, ${color} 45%, transparent)`,
        boxShadow: `0 12px 48px oklch(0.08 0.03 250 / 0.6), 0 0 30px color-mix(in oklab, ${color} 40%, transparent)`,
      }}
    >
      <button
        onClick={onClose}
        className="absolute right-3 top-3 text-muted-foreground transition-colors hover:text-foreground"
        aria-label="Close cell details"
      >
        <X className="size-4" />
      </button>
      <div className="mb-1 font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
        {hex.ward} · Cell
      </div>
      <div className="flex items-end gap-2">
        <span className="font-display text-4xl font-bold leading-none" style={{ color, textShadow: `0 0 20px ${color}` }}>
          {shiftedAqi}
        </span>
        <span
          className="mb-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase"
          style={{ background: aqiColor(shiftedAqi, 0.2), color }}
        >
          {aqiLabel(shiftedAqi)}
        </span>
      </div>
      <div className="mt-1 text-[11px] text-muted-foreground">Air Quality Index</div>

      <div className="mt-3 rounded-lg bg-[oklch(0.12_0.03_250_/_0.5)] p-2">
        <Sparkline data={hex.trend} color={color} width={208} height={38} />
        <div className="mt-1 flex justify-between font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
          <span>-6h</span>
          <span>12h trend</span>
          <span>Now</span>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <div className="rounded-lg bg-[oklch(0.12_0.03_250_/_0.5)] p-2">
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <Wind className="size-3" /> Wind
          </div>
          <div className="font-mono text-sm text-foreground">{hex.windSpeed} m/s</div>
        </div>
        <div className="rounded-lg bg-[oklch(0.12_0.03_250_/_0.5)] p-2">
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <Gauge className="size-3" /> PM2.5
          </div>
          <div className="font-mono text-sm text-foreground">{Math.round(shiftedAqi * 0.62)} µg</div>
        </div>
      </div>
      {level === 'severe' && (
        <div className="mt-2 rounded-lg border border-[oklch(0.62_0.24_22_/_0.4)] bg-[oklch(0.62_0.24_22_/_0.12)] px-2 py-1.5 text-[10px] font-medium text-[oklch(0.78_0.2_22)]">
          Hazardous — protective response advised.
        </div>
      )}
    </div>
  )
}
