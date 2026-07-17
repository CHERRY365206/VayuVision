'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { NavPill } from '@/components/nav-pill'
import { OverlayModals } from '@/components/overlay-modals'
import { LayerControls } from '@/components/layer-controls'
import { TimelineScrubber } from '@/components/timeline-scrubber'
import { EconomicWidget } from '@/components/economic-widget'
import { DroneAlert } from '@/components/drone-alert'
import { FlaskConical, Loader2, MapPin } from 'lucide-react' // Added MapPin

import { fetchLiveWeatherData, fetchLiveAqiData, fetchForecastData } from '@/lib/vayu-data'

// NEW PDF IMPORTS
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

const RealMap = dynamic(() => import('@/components/osm-map'), { ssr: false })

export type Layers = {
  danger: boolean
  industrial: boolean
  hospitals: boolean
  schools: boolean
  iot: boolean
  malls: boolean
}

export function Dashboard({ entering }: { entering: boolean }) {
  const [nav, setNav] = useState('map')
  const [hour, setHour] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [simulationMode, setSimulationMode] = useState(false)
  
  // NEW: State for Multi-City Tracking
  const [activeCity, setActiveCity] = useState('hyderabad')

  const [isExporting, setIsExporting] = useState(false) 

  const [layers, setLayers] = useState<Layers>({
    danger: true,
    industrial: true,
    hospitals: false,
    schools: false,
    iot: true,
    malls: true, 
  })

  const [liveWeather, setLiveWeather] = useState<any>(null)
  const [liveAqi, setLiveAqi] = useState<any>(null)
  const [forecastData, setForecastData] = useState<any[]>([]) 

  // CRITICAL UPDATE: Fetch real data specific to the active city
  useEffect(() => {
    async function loadBackendData() {
      try {
        // Passing the city down to your API fetchers
        const weather = await fetchLiveWeatherData(activeCity)
        const aqi = await fetchLiveAqiData(activeCity)
        const forecast = await fetchForecastData(activeCity) 
        if (weather) setLiveWeather(weather)
        if (aqi) setLiveAqi(aqi)
        if (forecast) setForecastData(forecast) 
      } catch (error) {
        console.error("API Error:", error)
      }
    }
    
    setHour(0) // Reset timeline when changing cities
    loadBackendData()
    const dataInterval = setInterval(loadBackendData, 30000)
    return () => clearInterval(dataInterval)
  }, [activeCity]) // Re-runs every time you change the dropdown

  const toggle = (key: keyof Layers) => setLayers((l) => ({ ...l, [key]: !l[key] }))

  const activeForecast = simulationMode 
    ? Array.from({ length: 73 }).map((_, i) => {
        let spike = 40;
        if (i <= 6) spike = 312 - (i * 30); 
        else if (i >= 35 && i <= 45) spike = 210 - (Math.abs(i - 40) * 20); 
        else spike = 40 + Math.random() * 5; 

        spike = Math.max(30, spike);
        return {
          hour_offset: i,
          predicted_aqi: Math.floor(spike),
          nodes: { center: spike, north: spike + 20, south: 40, east: spike - 10, west: spike + 30 }
        }
      })
    : forecastData

  const currentAqi = activeForecast[hour]?.predicted_aqi || 40
  const currentWind = liveWeather?.wind_speed_m_s || 3.1
  const isAlertNeeded = currentAqi > 120

  const handleExportPDF = async () => {
    setIsExporting(true)
    try {
      const pdf = new jsPDF('landscape', 'mm', 'a4')
      
      pdf.setTextColor(30, 41, 59) 
      pdf.setFont("helvetica", "bold")
      pdf.setFontSize(22)
      pdf.text(`VAYU COMMAND CENTER: Situation Report (${activeCity.toUpperCase()})`, 20, 25)
      
      pdf.setFont("helvetica", "normal")
      pdf.setFontSize(11)
      pdf.setTextColor(100, 116, 139) 
      pdf.text(`Generated: ${new Date().toLocaleString()}`, 20, 34)
      pdf.text(`Telemetry Status: ${simulationMode ? 'SIMULATED CRISIS PROTOCOL' : 'LIVE OPEN-METEO SYNC'}`, 20, 41)
      pdf.text(`Current Active AQI: ${currentAqi} | Wind: ${currentWind} m/s`, 20, 48)

      const econWidget = document.getElementById('economic-widget-capture')
      if (econWidget) {
        const canvas = await html2canvas(econWidget, { backgroundColor: '#020617', scale: 2 })
        const imgData = canvas.toDataURL('image/png')
        pdf.addImage(imgData, 'PNG', 20, 60, 75, 42) 
      }

      const timelineWidget = document.getElementById('timeline-capture')
      if (timelineWidget) {
        const canvas = await html2canvas(timelineWidget, { backgroundColor: '#020617', scale: 2 })
        const imgData = canvas.toDataURL('image/png')
        pdf.addImage(imgData, 'PNG', 20, 115, 250, 40) 
      }

      pdf.save(`Vayu_SitRep_${activeCity}_${new Date().toLocaleDateString().replace(/\//g, '-')}.pdf`)
    } catch (error) {
      console.error("PDF Generation Failed:", error)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="fixed inset-0 transition-all duration-700 bg-slate-950" style={{ opacity: entering ? 0 : 1, transform: entering ? 'scale(0.9)' : 'scale(1)' }}>
      
      {/* Pass activeCity to the Map */}
      <RealMap 
        aqiData={liveAqi} 
        weatherData={liveWeather} 
        layers={layers} 
        forecastData={activeForecast} 
        currentHour={hour} 
        activeCity={activeCity}
      />
      
      <OverlayModals active={nav} onClose={() => setNav('map')} activeCity={activeCity} currentAqi={currentAqi} />

      <div className="glass absolute left-1/2 top-20 z-30 flex -translate-x-1/2 items-center gap-4 rounded-full px-6 py-2 text-xs font-mono font-medium shadow-lg backdrop-blur-md border border-white/10 transition-all">
        
        {/* NEW: City Selection Dropdown */}
        <div className="flex items-center gap-2 pr-4 border-r border-white/20">
          <MapPin className="size-4 text-cyan-400" />
          <select 
            value={activeCity}
            onChange={(e) => setActiveCity(e.target.value)}
            className="bg-transparent text-white font-bold outline-none cursor-pointer hover:text-cyan-300 transition-colors appearance-none uppercase"
          >
            <option value="hyderabad" className="bg-slate-900">Hyderabad (TS)</option>
            <option value="delhi" className="bg-slate-900">New Delhi (DL)</option>
            <option value="bengaluru" className="bg-slate-900">Bengaluru (KA)</option>
            <option value="chennai" className="bg-slate-900">Chennai (TN)</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-400">API LINK:</span>
          <span className={liveWeather ? "text-green-400 animate-pulse font-bold" : "text-yellow-500 font-bold"}>{liveWeather ? "SECURE" : "FETCHING"}</span>
        </div>
        
        {liveWeather && (
          <>
            <div className="h-4 w-px bg-white/20" />
            <span className="text-cyan-300">TEMP: {liveWeather.temperature_c}°C</span>
            <span className="text-cyan-300">WIND: {liveWeather.wind_speed_m_s} m/s</span>
            <span className="text-cyan-300">HUMIDITY: {liveWeather.humidity_percent}%</span>
          </>
        )}

        <div className="h-4 w-px bg-white/20 mx-2" />
        <button 
          onClick={() => { setSimulationMode(!simulationMode); setHour(0); }}
          className={`flex items-center gap-2 px-3 py-1 rounded-full border transition-all ${simulationMode ? 'bg-purple-500/20 border-purple-500/50 text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.4)]' : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10'}`}
        >
          <FlaskConical className={`size-3 ${simulationMode ? 'animate-pulse' : ''}`} />
          {simulationMode ? 'SIMULATION ACTIVE' : 'REAL DATA'}
        </button>
      </div>

      <div className="absolute left-4 top-4 z-20">
        <NavPill active={nav} onChange={setNav} />
      </div>

      <div className="absolute right-4 top-4 z-20 flex flex-col gap-2 items-end">
        <LayerControls layers={layers} onToggle={toggle} />
        
        <button 
          onClick={handleExportPDF}
          disabled={isExporting}
          className="glass flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-bold text-white hover:bg-white/10 transition-colors border border-white/10 disabled:opacity-50"
        >
          {isExporting ? <Loader2 className="size-3 animate-spin" /> : null}
          {isExporting ? 'GENERATING PDF...' : 'EXPORT SITREP (PDF)'}
        </button>
      </div>

      <div id="economic-widget-capture" className="absolute bottom-4 left-4 z-20 hidden md:block">
        <EconomicWidget hour={hour} forecastData={activeForecast} />
      </div>

      <div id="timeline-capture" className="absolute bottom-4 left-1/2 z-20 -translate-x-1/2 p-2 rounded-2xl bg-slate-950/20">
        <TimelineScrubber hour={hour} onChange={setHour} playing={playing} onTogglePlay={() => setPlaying((p) => !p)} forecastData={activeForecast} />
      </div>

      {isAlertNeeded && (
        <div className="absolute right-4 top-[316px] z-30">
          <DroneAlert hour={hour} aqi={currentAqi} wind={currentWind} onClose={() => setHour(hour > 0 ? 0 : 10)} />
        </div>
      )}
    </div>
  )
}