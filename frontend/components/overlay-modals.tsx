'use client'

import { useState, useEffect } from 'react'
import { X, Code, Mail, Cpu, Database, Server, ShieldAlert, Loader2, Bot, Megaphone, Smartphone, Activity, CalendarClock, Target, BarChart2 } from 'lucide-react'
import { fetchHealthAdvisory, fetchSourceAttribution, fetchPredictiveForecast, fetchEnforcementAgent, fetchMultiCityCompare } from '@/lib/vayu-data'

export function OverlayModals({ 
  active, 
  onClose, 
  activeCity = 'hyderabad', 
  currentAqi = 40,
  currentWind = 0,
  currentTime = "00:00"
}: { 
  active: string; 
  onClose: () => void; 
  activeCity?: string; 
  currentAqi?: number;
  currentWind?: number;
  currentTime?: string;
}) {
  const [advisoryData, setAdvisoryData] = useState<any>(null)
  const [loadingAdvisory, setLoadingAdvisory] = useState(false)
  
  const [attributionData, setAttributionData] = useState<any>(null)
  const [loadingAttribution, setLoadingAttribution] = useState(false)

  const [forecastData, setForecastData] = useState<any>(null)
  const [loadingForecast, setLoadingForecast] = useState(false)

  const [enforcementData, setEnforcementData] = useState<any>(null)
  const [loadingEnforcement, setLoadingEnforcement] = useState(false)

  const [compareData, setCompareData] = useState<any>(null)
  const [loadingCompare, setLoadingCompare] = useState(false)

  useEffect(() => {
    if (active === 'advisory') {
      setLoadingAdvisory(true)
      fetchHealthAdvisory(activeCity, currentAqi).then(data => {
        setAdvisoryData(data)
        setLoadingAdvisory(false)
      })
    }
    
    if (active === 'attribution') {
      setLoadingAttribution(true)
      fetchSourceAttribution(activeCity, currentAqi, currentWind, currentTime).then(data => {
        setAttributionData(data)
        setLoadingAttribution(false)
      })
    }
    
    if (active === 'forecast') {
      setLoadingForecast(true)
      fetchPredictiveForecast(activeCity, currentAqi).then(data => {
        setForecastData(data)
        setLoadingForecast(false)
      })
    }
    
    if (active === 'enforcement') {
      setLoadingEnforcement(true)
      fetchEnforcementAgent(activeCity, currentAqi).then(data => {
        setEnforcementData(data)
        setLoadingEnforcement(false)
      })
    }
    
    if (active === 'compare') {
      setLoadingCompare(true)
      fetchMultiCityCompare().then(data => {
        setCompareData(data)
        setLoadingCompare(false)
      })
    }
  }, [active, activeCity, currentAqi, currentWind, currentTime])

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

        {/* 1. SOURCE ATTRIBUTION MODAL */}
        {active === 'attribution' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-display font-bold text-foreground flex items-center gap-3">
              <Activity className="size-6 text-[oklch(0.9_0.14_200)]" />
              AI Source Apportionment
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Real-time geospatial attribution of PM2.5 pollution sources, dynamically inferred by our Large Language Model using live weather, wind dispersal, and AQI telemetry.
            </p>
            
            {loadingAttribution ? (
              <div className="flex flex-col items-center justify-center p-8 space-y-4">
                <Loader2 className="size-8 text-[oklch(0.9_0.14_200)] animate-spin" />
                <p className="text-sm font-mono text-muted-foreground">AI Agent analyzing spatial telemetry...</p>
              </div>
            ) : attributionData ? (
              <div className="space-y-6">
                <div className="bg-black/20 p-4 rounded-xl border border-[oklch(0.9_0.14_200_/_0.2)]">
                  <div className="text-[oklch(0.9_0.14_200)] text-xs font-mono mb-2 uppercase tracking-wider flex items-center gap-2">
                    <Bot className="size-4" /> AI Analysis
                  </div>
                  <p className="text-sm text-foreground leading-relaxed">
                    {attributionData.analysis}
                  </p>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Confidence Scores</h3>
                  {Object.entries(attributionData.scores || {}).map(([source, score]) => (
                    <div key={source} className="space-y-1">
                      <div className="flex justify-between text-xs font-mono">
                        <span className="text-foreground uppercase">{source}</span>
                        <span className="text-cyan-400">{Number(score).toFixed(1)}%</span>
                      </div>
                      <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-[oklch(0.85_0.16_200)] to-[oklch(0.9_0.14_200)]" 
                          style={{ width: `${score}%`, transition: 'width 1s ease-out' }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-red-400 text-sm font-mono text-center p-4">
                Failed to connect to the AI Attribution Engine. Check API Key.
              </div>
            )}
          </div>
        )}

        {/* 2. WEATHER FORECASTS MODAL */}
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

        {/* NEW 1. PREDICTIVE FORECAST MODAL */}
        {active === 'forecast' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-display font-bold text-foreground flex items-center gap-3">
              <CalendarClock className="size-6 text-emerald-400" />
              Predictive AQI Forecasting
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              AI-generated 72-hour forecasting mapping expected air quality indices against meteorological trends.
            </p>
            
            {loadingForecast ? (
              <div className="flex flex-col items-center justify-center p-8 space-y-4">
                <Loader2 className="size-8 text-emerald-400 animate-spin" />
                <p className="text-sm font-mono text-muted-foreground">Simulating temporal shifts...</p>
              </div>
            ) : forecastData?.schedule ? (
              <div className="space-y-4">
                {forecastData.schedule.map((item: any, i: number) => (
                  <div key={i} className="bg-black/20 p-4 rounded-xl border border-emerald-500/20 flex gap-4 items-center">
                    <div className="bg-emerald-500/10 text-emerald-400 font-mono text-lg font-bold px-3 py-2 rounded-lg border border-emerald-500/20">
                      {item.time}
                    </div>
                    <div className="flex-1">
                      <div className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-1">Predicted AQI: {item.predicted_aqi}</div>
                      <div className="text-sm text-foreground font-medium">{item.action}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-red-400 text-sm font-mono text-center p-4">Failed to connect to Forecasting Engine.</div>
            )}
          </div>
        )}

        {/* NEW 2. ENFORCEMENT INTELLIGENCE MODAL */}
        {active === 'enforcement' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-display font-bold text-foreground flex items-center gap-3">
              <Target className="size-6 text-rose-500" />
              Enforcement Intelligence
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Correlating pollution hotspots with registered emission sources to generate prioritized, evidence-backed enforcement action recommendations.
            </p>
            
            {loadingEnforcement ? (
              <div className="flex flex-col items-center justify-center p-8 space-y-4">
                <Loader2 className="size-8 text-rose-500 animate-spin" />
                <p className="text-sm font-mono text-muted-foreground">Scanning emission registers...</p>
              </div>
            ) : enforcementData?.targets ? (
              <div className="space-y-4">
                {enforcementData.targets.map((item: any, i: number) => (
                  <div key={i} className="bg-rose-950/20 p-4 rounded-xl border border-rose-500/30 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-rose-500" />
                    <div className="flex justify-between items-start mb-2 pl-2">
                      <div className="font-bold text-rose-100">{item.target}</div>
                      <div className="text-rose-400 font-mono text-xs border border-rose-500/30 px-2 py-1 rounded bg-rose-950/40">
                        {item.confidence}% CONFIDENCE
                      </div>
                    </div>
                    <div className="text-sm text-rose-200/70 pl-2">
                      <span className="text-rose-400 font-mono text-xs uppercase tracking-wider mr-2">Action:</span>
                      {item.action}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-red-400 text-sm font-mono text-center p-4">Failed to connect to Enforcement Engine.</div>
            )}
          </div>
        )}

        {/* NEW 3. MULTI-CITY COMPARE MODAL */}
        {active === 'compare' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-display font-bold text-foreground flex items-center gap-3">
              <BarChart2 className="size-6 text-indigo-400" />
              Multi-City Intelligence
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Cross-comparing air quality trends and telemetry across multiple urban centers simultaneously.
            </p>
            
            {loadingCompare ? (
              <div className="flex flex-col items-center justify-center p-8 space-y-4">
                <Loader2 className="size-8 text-indigo-400 animate-spin" />
                <p className="text-sm font-mono text-muted-foreground">Aggregating national data...</p>
              </div>
            ) : compareData?.comparison ? (
              <div className="space-y-3">
                {compareData.comparison.map((city: any, i: number) => (
                  <div key={i} className="grid grid-cols-4 gap-4 items-center bg-black/20 p-3 rounded-xl border border-indigo-500/20">
                    <div className="font-bold text-indigo-100">{city.city}</div>
                    <div className="text-sm">
                      <span className="text-indigo-400 font-mono text-xs block">AQI</span>
                      <span className="font-bold">{city.aqi}</span>
                    </div>
                    <div className="text-sm">
                      <span className="text-indigo-400 font-mono text-xs block">TEMP</span>
                      <span className="font-bold">{city.temperature_c}°C</span>
                    </div>
                    <div className="text-sm">
                      <span className="text-indigo-400 font-mono text-xs block">WIND</span>
                      <span className="font-bold">{city.wind_speed_m_s} m/s</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-red-400 text-sm font-mono text-center p-4">Failed to aggregate city data.</div>
            )}
          </div>
        )}

      </div>
    </div>
  )
}