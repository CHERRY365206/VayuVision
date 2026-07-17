'use client'

import { useState, useEffect } from 'react'
import { X, Code, Mail, Cpu, Database, Server, ShieldAlert, Loader2, Bot, Megaphone, Smartphone } from 'lucide-react'
import { fetchHealthAdvisory } from '@/lib/vayu-data'

export function OverlayModals({ active, onClose, activeCity = 'hyderabad', currentAqi = 40 }: { active: string; onClose: () => void; activeCity?: string; currentAqi?: number }) {
  const [advisoryData, setAdvisoryData] = useState<any>(null)
  const [loadingAdvisory, setLoadingAdvisory] = useState(false)

  useEffect(() => {
    if (active === 'advisory') {
      setLoadingAdvisory(true)
      fetchHealthAdvisory(activeCity, currentAqi).then(data => {
        setAdvisoryData(data)
        setLoadingAdvisory(false)
      })
    }
  }, [active, activeCity, currentAqi])

  if (active === 'map') return null // Hide when viewing the map

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="glass-strong relative w-full max-w-2xl rounded-3xl p-8 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full text-muted-foreground hover:bg-red-500/20 hover:text-red-400 transition-colors"
        >
          <X className="size-5" />
        </button>

        {/* 0. CITIZEN ADVISORY MODAL */}
        {active === 'advisory' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-display font-bold text-foreground flex items-center gap-3">
              <ShieldAlert className="size-6 text-red-500" />
              Citizen Health Risk Advisory
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              AI-generated multi-lingual advisories mapped against vulnerable population density (hospitals, schools, outdoor workers) for {activeCity.toUpperCase()}.
            </p>
            
            {loadingAdvisory || !advisoryData ? (
              <div className="flex flex-col items-center justify-center py-10 space-y-4">
                <Loader2 className="size-8 text-cyan-500 animate-spin" />
                <span className="text-sm font-mono text-cyan-500 animate-pulse">GENERATING ADVISORIES IN REGIONAL LANGUAGE...</span>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-black/40 p-4 rounded-xl border border-red-500/30">
                    <div className="text-red-400 text-xs font-mono mb-1 uppercase tracking-wider">Risk Level</div>
                    <div className="text-2xl font-bold text-red-500">{advisoryData.risk_level} <span className="text-sm font-normal text-muted-foreground">(AQI {advisoryData.aqi_analyzed})</span></div>
                  </div>
                  <div className="bg-black/40 p-4 rounded-xl border border-yellow-500/30">
                    <div className="text-yellow-400 text-xs font-mono mb-1 uppercase tracking-wider">Vulnerable Demographics</div>
                    <div className="text-sm font-bold text-yellow-500">{advisoryData.target_vulnerable_groups.join(', ')}</div>
                  </div>
                </div>

                <div className="bg-slate-900/50 p-4 rounded-xl border border-white/5 space-y-3 relative overflow-hidden">
                  <Bot className="absolute -right-4 -top-4 size-24 text-white/5" />
                  <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs mb-2">
                    <Smartphone className="size-4" /> 
                    <span>MOBILE PUSH NOTIFICATION ({advisoryData.language_detected})</span>
                  </div>
                  <div className="text-foreground font-bold">{advisoryData.simulated_llm_outputs.regional_push_notification.title}</div>
                  <div className="text-muted-foreground text-sm leading-relaxed">{advisoryData.simulated_llm_outputs.regional_push_notification.body}</div>
                </div>

                <div className="bg-slate-900/50 p-4 rounded-xl border border-white/5 space-y-3 relative overflow-hidden">
                  <Megaphone className="absolute -right-4 -top-4 size-24 text-white/5" />
                  <div className="flex items-center gap-2 text-green-400 font-mono text-xs mb-2">
                    <Server className="size-4" /> 
                    <span>IVR AUTO-DIALER SCRIPT ({advisoryData.language_detected})</span>
                  </div>
                  <div className="text-muted-foreground text-sm leading-relaxed italic border-l-2 border-green-500/50 pl-3">
                    "{advisoryData.simulated_llm_outputs.regional_ivr_script}"
                  </div>
                  <div className="text-xs text-slate-500 mt-2 font-mono">EN: {advisoryData.simulated_llm_outputs.english_ivr_base}</div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 1. WEATHER FORECASTS MODAL */}
        {active === 'weather' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-display font-bold text-foreground flex items-center gap-3">
              <span className="size-3 rounded-full bg-[oklch(0.9_0.14_200)] animate-pulse" style={{ boxShadow: '0 0 12px oklch(0.9 0.14 200)' }}></span>
              Meteorological Data Hub
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              This dashboard is powered by live telemetry from the Open-Meteo API and processed through our custom XGBoost Machine Learning architecture. The forecast models run a 72-hour sliding window prediction mapped across a 5-point spatial grid to capture city microclimates.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-black/20 p-4 rounded-xl border border-white/5">
                <div className="text-[oklch(0.9_0.14_200)] text-xs font-mono mb-1 uppercase tracking-wider">Model Accuracy (MAE)</div>
                <div className="text-3xl font-bold text-foreground">8.81 <span className="text-sm text-muted-foreground font-normal">AQI Points</span></div>
              </div>
              <div className="bg-black/20 p-4 rounded-xl border border-white/5">
                <div className="text-[oklch(0.82_0.22_145)] text-xs font-mono mb-1 uppercase tracking-wider">Training Dataset</div>
                <div className="text-3xl font-bold text-foreground">6 Mos <span className="text-sm text-muted-foreground font-normal">Historical</span></div>
              </div>
            </div>
          </div>
        )}

        {/* 2. SYSTEM SETTINGS MODAL */}
        {active === 'settings' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-display font-bold text-foreground">System Configuration</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-black/20 p-4 rounded-xl border border-white/5">
                <div className="flex items-center gap-3 text-foreground"><Cpu className="text-muted-foreground size-5" /> AI Inference Engine</div>
                <span className="px-3 py-1 bg-[oklch(0.82_0.22_145_/_0.15)] text-[oklch(0.82_0.22_145)] text-xs font-bold rounded-full border border-[oklch(0.82_0.22_145_/_0.3)]">ONLINE</span>
              </div>
              <div className="flex items-center justify-between bg-black/20 p-4 rounded-xl border border-white/5">
                <div className="flex items-center gap-3 text-foreground"><Database className="text-muted-foreground size-5" /> PostgreSQL / Geospatial DB</div>
                <span className="px-3 py-1 bg-[oklch(0.82_0.22_145_/_0.15)] text-[oklch(0.82_0.22_145)] text-xs font-bold rounded-full border border-[oklch(0.82_0.22_145_/_0.3)]">SYNCED</span>
              </div>
              <div className="flex items-center justify-between bg-black/20 p-4 rounded-xl border border-white/5">
                <div className="flex items-center gap-3 text-foreground"><Server className="text-muted-foreground size-5" /> FastAPI Backend</div>
                <span className="text-muted-foreground text-sm font-mono">127.0.0.1:8000</span>
              </div>
            </div>
          </div>
        )}

        {/* 3. ABOUT / CONTACT MODAL */}
        {active === 'about' && (
          <div className="space-y-6">
            <h2 className="text-3xl font-display font-bold text-foreground mb-2">Project VAYU</h2>
            <p className="text-muted-foreground leading-relaxed">
              Vayu is an autonomous, AI-driven environmental command center built to monitor, predict, and mitigate urban pollution in real-time. Designed to optimize drone routing for immediate localized intervention.
            </p>
            
            <div className="h-px w-full bg-border my-6"></div>
            
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">Contact & Developer</h3>
            <div className="flex flex-col sm:flex-row gap-3">
              <a href="mailto:vayuvision365@gmail.com" className="flex items-center gap-3 text-[oklch(0.9_0.14_200)] hover:text-white transition-colors p-3 bg-[oklch(0.85_0.16_200_/_0.1)] rounded-xl border border-[oklch(0.85_0.16_200_/_0.2)]">
                <Mail className="size-5" />
                Contact the Team
              </a>
              <a href="https://github.com/CHERRY365206/VayuVision" target="_blank" rel="noreferrer" className="flex items-center gap-3 text-foreground hover:bg-white/10 transition-colors p-3 bg-white/5 rounded-xl border border-white/10">
                <Code className="size-5" />
                View Source Code
              </a>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}