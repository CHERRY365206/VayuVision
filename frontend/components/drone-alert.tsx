'use client'

import { useState, useEffect } from 'react'
import { X, AlertTriangle, Crosshair, Wind, Battery, Activity, ShieldAlert, Factory, BellRing } from 'lucide-react'

export function DroneAlert({ hour, aqi, wind, onClose }: { hour: number, aqi: number, wind: number, onClose: () => void }) {
  const [dispatchState, setDispatchState] = useState<'idle' | 'booting' | 'airborne'>('idle')
  const [terminalText, setTerminalText] = useState<string[]>([])
  
  const isFuture = hour > 0

  // Reset state if the user scrubs to a different hour
  useEffect(() => {
    setDispatchState('idle')
    setTerminalText([])
  }, [hour])

  useEffect(() => {
    if (dispatchState === 'booting') {
      const sequence = [
        "AUTH_TOKEN_ACCEPTED",
        "ESTABLISHING C2 LINK...",
        "UPLINK SECURE.",
        "CALIBRATING CRAZYFLIE CONTROLLERS...",
        "VISION-BASED NAV: ONLINE",
        "COOPERATIVE SWARM DISPATCHED."
      ]
      let i = 0
      const interval = setInterval(() => {
        if (i < sequence.length) {
          setTerminalText(prev => [...prev, sequence[i]])
          i++
        } else {
          clearInterval(interval)
          setTimeout(() => setDispatchState('airborne'), 800)
        }
      }, 400) 
      return () => clearInterval(interval)
    }
  }, [dispatchState])

  return (
    <div className="glass-strong w-[380px] rounded-2xl border border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.5)] overflow-hidden animate-in slide-in-from-right-8 duration-300">
      
      {/* Top Header */}
      <div className={`flex items-center justify-between px-4 py-3 border-b ${dispatchState === 'idle' ? (isFuture ? 'border-orange-500/30 bg-orange-500/10' : 'border-red-500/30 bg-red-500/10') : 'border-cyan-500/30 bg-cyan-500/10'}`}>
        <div className="flex items-center gap-2">
          {dispatchState === 'idle' ? (
            isFuture ? <ShieldAlert className="size-4 text-orange-400 animate-pulse" /> : <AlertTriangle className="size-4 text-red-500 animate-pulse" />
          ) : (
            <Crosshair className="size-4 text-cyan-400 animate-spin-slow" />
          )}
          <span className={`text-xs font-bold tracking-widest uppercase ${dispatchState === 'idle' ? (isFuture ? 'text-orange-400' : 'text-red-500') : 'text-cyan-400'}`}>
            {isFuture ? `Predictive Warning: +${hour}H` : 'Danger Alert: Live'}
          </span>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
          <X className="size-4" />
        </button>
      </div>

      <div className="p-5">
        
        {/* CURRENT HOUR (Drone Dispatch) */}
        {!isFuture && dispatchState === 'idle' && (
          <div className="space-y-4">
            <div>
              <div className="text-white font-bold leading-tight">Severe Emission Spike Detected at <span className="text-red-400">Sanathnagar.</span></div>
              <div className="text-xs text-slate-400 mt-2 flex items-center justify-between font-mono">
                <span>AQI: <strong className="text-red-400 text-sm">{aqi}</strong></span>
                <span>Wind: <strong>{wind}m/s</strong></span>
              </div>
            </div>
            <button 
              onClick={() => setDispatchState('booting')}
              className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-sm tracking-wider uppercase transition-all shadow-[0_0_20px_rgba(220,38,38,0.4)] flex items-center justify-center gap-2"
            >
              <Crosshair className="size-4" />
              Initiate Autonomous Drone Dispatch
            </button>
          </div>
        )}

        {/* FUTURE HOUR (Predictive Precautions) */}
        {isFuture && (
          <div className="space-y-4">
            <div>
              <div className="text-white font-bold leading-tight text-sm">
                Forecasted Emission Accumulation
              </div>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                ML models project AQI will reach <strong className="text-orange-400">{aqi}</strong> in {hour} hours. {wind < 4 ? "Stagnant wind patterns will trap industrial exhaust in the northern sector." : "High winds threaten to spread particulate matter to adjacent residential zones."}
              </p>
            </div>
            
            <div className="space-y-2 mt-4">
              <button className="w-full p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-left flex items-center gap-3 transition-colors">
                <Factory className="size-4 text-orange-400" />
                <div>
                  <div className="text-xs font-bold text-white uppercase tracking-wider">Issue Throttling Directive</div>
                  <div className="text-[10px] text-slate-400">Mandate 20% output reduction in Zone 4</div>
                </div>
              </button>
              
              <button className="w-full p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-left flex items-center gap-3 transition-colors">
                <BellRing className="size-4 text-cyan-400" />
                <div>
                  <div className="text-xs font-bold text-white uppercase tracking-wider">Pre-empt Healthcare</div>
                  <div className="text-[10px] text-slate-400">Alert Ward 12 clinics of respiratory risk</div>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* TERMINAL BOOTING (Only used for Hour 0 drone) */}
        {dispatchState === 'booting' && (
          <div className="h-[120px] bg-black/50 rounded-xl border border-white/5 p-3 font-mono text-[10px] text-cyan-400 flex flex-col justify-end overflow-hidden">
            {terminalText.map((text, i) => (
              <div key={i} className="animate-in fade-in slide-in-from-bottom-2">&gt; {text}</div>
            ))}
            <div className="animate-pulse mt-1">&gt; _</div>
          </div>
        )}

        {/* AIRBORNE TELEMETRY (Only used for Hour 0 drone) */}
        {dispatchState === 'airborne' && (
          <div className="space-y-4 animate-in fade-in duration-500">
            <div className="relative h-24 bg-slate-900 rounded-xl overflow-hidden border border-cyan-500/30 flex items-center justify-center">
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_transparent_0%,_#000_100%)]"></div>
              <div className="absolute inset-0 border-2 border-cyan-500/20 rounded-full scale-150 animate-[ping_3s_linear_infinite]"></div>
              <div className="absolute inset-0 border-2 border-cyan-500/20 rounded-full scale-100 animate-[ping_3s_linear_infinite_1s]"></div>
              <div className="relative z-10 flex flex-col items-center">
                <Crosshair className="size-8 text-cyan-400 opacity-50" />
                <span className="text-[9px] font-mono text-cyan-400 mt-1 uppercase tracking-widest bg-black/50 px-2 py-0.5 rounded">En Route to Target</span>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-white/5 rounded-lg p-2 text-center border border-white/10">
                <Wind className="size-4 text-cyan-400 mx-auto mb-1" />
                <div className="text-[10px] text-slate-400 font-mono">ALTITUDE</div>
                <div className="text-sm font-bold text-white">124m</div>
              </div>
              <div className="bg-white/5 rounded-lg p-2 text-center border border-white/10">
                <Activity className="size-4 text-emerald-400 mx-auto mb-1" />
                <div className="text-[10px] text-slate-400 font-mono">SPEED</div>
                <div className="text-sm font-bold text-white">18m/s</div>
              </div>
              <div className="bg-white/5 rounded-lg p-2 text-center border border-white/10">
                <Battery className="size-4 text-amber-400 mx-auto mb-1" />
                <div className="text-[10px] text-slate-400 font-mono">POWER</div>
                <div className="text-sm font-bold text-white">88%</div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}