'use client'

import { TrendingDown, Activity, Users } from 'lucide-react'

export function EconomicWidget({ hour, forecastData = [] }: { hour: number, forecastData?: any[] }) {
  
  // Safely grab the current AQI, default to 40 if loading
  const currentAqi = forecastData[hour]?.predicted_aqi || 40

  // 1. RETAIL FOOT TRAFFIC (Immediate Behavioral Response)
  let footTrafficDrop = 0
  if (currentAqi > 50) {
    footTrafficDrop = Math.min(65, Math.floor((currentAqi - 50) * 0.15))
  }

  // 2. HEALTHCARE COSTS (True Cumulative Sum)
  let cumulativeHealthCost = 0.5 // Baseline ₹0.5L standard administrative cost

  // Loop through history up to the current hour to calculate permanent exposure damage
  for (let i = 0; i <= hour; i++) {
    const historicalAqi = forecastData[i]?.predicted_aqi || 40
    
    // Only accumulate financial damage if the air is actually unhealthy (AQI > 80)
    if (historicalAqi > 80) {
      // Add a fractional cost for every single hour spent in toxic air
      cumulativeHealthCost += (historicalAqi - 80) * 0.002
    }
  }

  const healthCost = cumulativeHealthCost.toFixed(1)

  return (
    <div className="glass-strong w-[280px] rounded-2xl p-4 border border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.5)] flex flex-col gap-4 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex items-center gap-2 mb-1">
        <TrendingDown className="size-4 text-orange-400" />
        <h3 className="text-xs font-bold text-white uppercase tracking-widest">Projected Economic Impact</h3>
      </div>

      {/* RETAIL FOOT TRAFFIC */}
      <div className="bg-black/30 rounded-xl p-3 border border-white/5 transition-colors duration-500">
        <div className="text-[10px] text-slate-400 font-mono flex items-center gap-2 mb-1">
          <Users className="size-3 text-orange-400" />
          RETAIL FOOT TRAFFIC
        </div>
        <div className="flex items-end gap-2">
          <div className="text-3xl font-display font-bold text-orange-400 transition-all duration-300">
            -{footTrafficDrop}%
          </div>
          <div className="text-xs text-slate-400 mb-1 leading-tight">projected drop<br/>(Live Response)</div>
        </div>
      </div>

      {/* HEALTHCARE SURGE */}
      <div className="bg-black/30 rounded-xl p-3 border border-white/5 transition-colors duration-500">
        <div className="text-[10px] text-slate-400 font-mono flex items-center gap-2 mb-1">
          <Activity className="size-3 text-red-400" />
          RESPIRATORY HEALTHCARE
        </div>
        <div className="flex items-end gap-2">
          <div className="text-3xl font-display font-bold text-red-400 transition-all duration-300">
            +₹{healthCost}L
          </div>
          <div className="text-xs text-slate-400 mb-1 leading-tight">est. cost<br/>(Cumulative)</div>
        </div>
        <div className="text-[9px] text-slate-500 font-mono mt-2 uppercase tracking-wider">Ward 12 — 30 Day Projection</div>
      </div>
      
    </div>
  )
}