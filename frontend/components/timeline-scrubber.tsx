'use client'

// Notice we removed FORECAST from the import here!
import { aqiColor, aqiLabel } from '@/lib/vayu-data'
import { Play, Pause, Clock } from 'lucide-react'
import { useEffect, useRef } from 'react'

export function TimelineScrubber({
  hour,
  onChange,
  playing,
  onTogglePlay,
  forecastData = [] // NEW: Catching the ML data from dashboard.tsx
}: {
  hour: number
  onChange: (h: number) => void
  playing: boolean
  onTogglePlay: () => void
  forecastData?: any[]
}) {
  const rafRef = useRef<number | null>(null)

  // Smooth playback loop
  useEffect(() => {
    if (!playing) return
    let last = performance.now()
    const tick = (now: number) => {
      if (now - last > 260) {
        last = now
        onChange((hour + 1) % 73)
      }
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [playing, hour, onChange])

  // 1. Data Safety: If ML API is still loading, draw a safe visual baseline
  const hasData = forecastData && forecastData.length > 0
  const data = hasData 
    ? forecastData 
    : Array.from({ length: 73 }).map((_, i) => ({ hour_offset: i, predicted_aqi: 40 }))

  // 2. Extract the current hour's predicted AQI
  const currentAqi = data[hour]?.predicted_aqi || 40
  const color = aqiColor(currentAqi, 1)
  
  // 3. Set a dynamic ceiling for the histogram, flooring at 150 so low-pollution days don't scale to 100% height
  const maxAqi = Math.max(...data.map((f) => f.predicted_aqi), 150)

  return (
    <div className="glass-strong animate-float-in w-[min(92vw,760px)] rounded-2xl p-4" style={{ animationDelay: '0.2s' }}>
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={onTogglePlay}
            className="flex size-9 items-center justify-center rounded-full bg-[oklch(0.85_0.16_200_/_0.16)] text-[oklch(0.9_0.14_200)] transition-all hover:bg-[oklch(0.85_0.16_200_/_0.28)]"
            style={{ boxShadow: '0 0 16px oklch(0.85 0.16 200 / 0.4)' }}
            aria-label={playing ? 'Pause forecast playback' : 'Play forecast playback'}
          >
            {playing ? <Pause className="size-4" /> : <Play className="size-4 translate-x-0.5" />}
          </button>
          <div>
            <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              <Clock className="size-3" /> 72h Forecast
            </div>
            <div className="font-display text-sm font-bold text-foreground">
              {hour === 0 ? 'Live · Now' : `Forecast +${hour}h`}
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="font-display text-2xl font-bold leading-none" style={{ color, textShadow: `0 0 18px ${color}` }}>
            {currentAqi}
          </div>
          <div className="text-[10px] font-medium" style={{ color }}>
            City Avg · {aqiLabel(currentAqi)}
          </div>
        </div>
      </div>

      {/* Forecast bars dynamically driven by ML predictions */}
      <div className="mb-2 flex h-14 items-end gap-[2px]">
        {data.map((f, index) => {
          const active = index === hour
          return (
            <button
              key={index}
              onClick={() => onChange(index)}
              className="group flex-1 rounded-t-sm transition-all"
              style={{
                height: `${(f.predicted_aqi / maxAqi) * 100}%`,
                background: aqiColor(f.predicted_aqi, active ? 1 : 0.45),
                boxShadow: active ? `0 0 12px ${aqiColor(f.predicted_aqi, 0.9)}` : 'none',
                outline: active ? '1px solid oklch(0.95 0.02 220 / 0.8)' : 'none',
              }}
              aria-label={`Hour ${index}, Predicted AQI ${f.predicted_aqi}`}
            />
          )
        })}
      </div>

      {/* Slider */}
      <input
        type="range"
        min={0}
        max={72}
        value={hour}
        onChange={(e) => onChange(Number(e.target.value))}
        className="vayu-range w-full"
        aria-label="72 hour forecast time scrubber"
      />
      <div className="mt-1 flex justify-between font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
        <span>Now</span>
        <span>+24h</span>
        <span>+48h</span>
        <span>+72h</span>
      </div>

      <style jsx>{`
        .vayu-range {
          -webkit-appearance: none;
          appearance: none;
          height: 4px;
          border-radius: 999px;
          background: oklch(0.85 0.05 220 / 0.18);
          outline: none;
        }
        .vayu-range::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: oklch(0.9 0.14 200);
          box-shadow: 0 0 12px oklch(0.85 0.16 200), 0 0 0 4px oklch(0.85 0.16 200 / 0.2);
          cursor: pointer;
        }
        .vayu-range::-moz-range-thumb {
          width: 16px;
          height: 16px;
          border: none;
          border-radius: 50%;
          background: oklch(0.9 0.14 200);
          box-shadow: 0 0 12px oklch(0.85 0.16 200);
          cursor: pointer;
        }
      `}</style>
    </div>
  )
}