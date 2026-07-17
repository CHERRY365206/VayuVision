// Deterministic data model for the VayuVision command center.
// All randomness is seeded so server and client render identically.

export const MAP_WIDTH = 1200
export const MAP_HEIGHT = 800
const HEX_SIZE = 34 // center-to-vertex radius (flat-top)

function mulberry32(seed: number) {
  return function () {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const rand = mulberry32(20260711)

// Pollution "sources" — clusters of severe emission.
export type Source = { x: number; y: number; strength: number; radius: number }

const SOURCES: Source[] = [
  { x: 360, y: 300, strength: 215, radius: 125 }, // Sanathnagar industrial belt
  { x: 860, y: 520, strength: 175, radius: 135 },
  { x: 640, y: 200, strength: 130, radius: 105 },
  { x: 1000, y: 270, strength: 95, radius: 100 },
]

export type Hex = {
  id: string
  cx: number
  cy: number
  points: string
  aqi: number
  windSpeed: number
  pm25: number
  ward: string
  trend: number[]
}

function hexPoints(cx: number, cy: number, size: number) {
  const pts: string[] = []
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 180) * (60 * i)
    pts.push(`${(cx + size * Math.cos(angle)).toFixed(1)},${(cy + size * Math.sin(angle)).toFixed(1)}`)
  }
  return pts.join(' ')
}

function buildGrid(): Hex[] {
  const hexes: Hex[] = []
  const horiz = HEX_SIZE * 1.5
  const vert = Math.sqrt(3) * HEX_SIZE
  let col = 0
  for (let x = 0; x <= MAP_WIDTH + horiz; x += horiz) {
    const offset = col % 2 === 0 ? 0 : vert / 2
    let row = 0
    for (let y = -vert; y <= MAP_HEIGHT + vert; y += vert) {
      const cx = x
      const cy = y + offset

      // Base AQI from proximity to pollution sources
      let aqi = 32 + rand() * 16
      for (const s of SOURCES) {
        const d = Math.hypot(cx - s.x, cy - s.y)
        const contribution = s.strength * Math.exp(-(d * d) / (2 * s.radius * s.radius))
        aqi += contribution
      }
      aqi += (rand() - 0.5) * 16
      aqi = Math.max(18, Math.min(320, Math.round(aqi)))

      const trend = Array.from({ length: 12 }, (_, i) => {
        const drift = Math.sin(i / 2 + col) * 12 + (rand() - 0.5) * 16
        return Math.max(10, Math.round(aqi + drift - (11 - i) * 1.5))
      })

      hexes.push({
        id: `h-${col}-${row}`,
        cx,
        cy,
        points: hexPoints(cx, cy, HEX_SIZE - 1.5),
        aqi,
        windSpeed: Math.round((2 + rand() * 6) * 10) / 10,
        pm25: Math.round(aqi * 0.62),
        ward: `Ward ${((col * 7 + row) % 24) + 1}`,
        trend,
      })
      row++
    }
    col++
  }
  return hexes
}

export const HEXES: Hex[] = buildGrid()

// Glow blobs behind severe clusters (drives the smooth gradient bloom).
export const SOURCES_GLOW = SOURCES.map((s) => ({
  x: s.x,
  y: s.y,
  radius: s.radius,
  aqi: Math.min(300, 120 + s.strength),
}))

export type AqiLevel = 'safe' | 'moderate' | 'poor' | 'severe'

export function aqiLevel(aqi: number): AqiLevel {
  if (aqi < 60) return 'safe'
  if (aqi < 120) return 'moderate'
  if (aqi < 190) return 'poor'
  return 'severe'
}

// Color for a hex fill (with alpha for the glass tessellation look).
export function aqiColor(aqi: number, alpha = 1): string {
  const level = aqiLevel(aqi)
  const map: Record<AqiLevel, string> = {
    safe: `oklch(0.82 0.22 145 / ${alpha})`,
    moderate: `oklch(0.85 0.17 110 / ${alpha})`,
    poor: `oklch(0.75 0.19 55 / ${alpha})`,
    severe: `oklch(0.62 0.24 22 / ${alpha})`,
  }
  return map[level]
}

export function aqiLabel(aqi: number): string {
  const level = aqiLevel(aqi)
  return {
    safe: 'Safe',
    moderate: 'Moderate',
    poor: 'Poor',
    severe: 'Severe',
  }[level]
}

// Static point-of-interest markers.
export type Poi = {
  id: string
  x: number
  y: number
  type: 'industrial' | 'hospital' | 'school' | 'elderly-care' | 'construction-site'
  name: string
}

export const POIS: Poi[] = [
  { id: 'i1', x: 360, y: 300, type: 'industrial', name: 'Sanathnagar Industrial Hub' },
  { id: 'i2', x: 820, y: 500, type: 'industrial', name: 'Balanagar Factory Belt' },
  { id: 'i3', x: 640, y: 205, type: 'industrial', name: 'Jeedimetla Chem Park' },
  { id: 'h1', x: 500, y: 460, type: 'hospital', name: 'Gandhi General Hospital' },
  { id: 'h2', x: 900, y: 300, type: 'hospital', name: 'Apollo Medical Center' },
  { id: 'h3', x: 240, y: 560, type: 'hospital', name: 'Osmania Care Unit' },
  { id: 's1', x: 700, y: 620, type: 'school', name: 'Vidya Public School' },
  { id: 's2', x: 460, y: 180, type: 'school', name: 'St. Anne’s Academy' },
  { id: 's3', x: 1040, y: 460, type: 'school', name: 'Green Valley High' },
  { id: 'e1', x: 320, y: 420, type: 'elderly-care', name: 'Grace Senior Living' },
  { id: 'e2', x: 800, y: 200, type: 'elderly-care', name: 'Sunrise Care Home' },
  { id: 'c1', x: 550, y: 350, type: 'construction-site', name: 'Metro Phase 2 Site' },
  { id: 'c2', x: 920, y: 600, type: 'construction-site', name: 'Tech Park Expansion' },
]

// IoT citizen sensor nodes travel along these street paths.
export const IOT_PATHS: string[] = [
  'M 80 620 L 300 600 L 520 560 L 760 520 L 1020 470',
  'M 120 180 L 340 240 L 560 300 L 780 360 L 1040 300',
  'M 600 60 L 620 260 L 640 460 L 660 700',
  'M 1120 120 L 900 260 L 700 420 L 460 560 L 200 700',
]

export type ForecastPoint = {
  hour: number
  label: string
  avgAqi: number
}

export const FORECAST: ForecastPoint[] = Array.from({ length: 73 }, (_, h) => {
  const base = 128 + Math.sin(h / 5) * 46 + Math.sin(h / 2.3) * 18
  const spike = h > 30 && h < 40 ? 55 : 0
  const avgAqi = Math.max(40, Math.round(base + spike + (mulberry32(h + 1)() - 0.5) * 20))
  return {
    hour: h,
    label: h === 0 ? 'Now' : `+${h}h`,
    avgAqi,
  }
})

// ============================================================================
// LIVE BACKEND DATA BRIDGES (CONNECTS TO FASTAPI ON PORT 8000)
// ============================================================================

const BASE_URL = ''

export async function fetchLiveWeatherData(city: string) {
  try {
    const timestamp = new Date().getTime();
    const response = await fetch(`${BASE_URL}/api/weather/current?t=${timestamp}&city=${city}`, {
      cache: 'no-store' 
    });
    
    if (!response.ok) {
      throw new Error(`Weather fetch failed with status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Backend Connection Error (Weather) for ${city}:`, error);
    return null; // Fallback to dummy data
  }
}

export async function fetchLiveAqiData(city: string) {
  try {
    const timestamp = new Date().getTime();
    const response = await fetch(`${BASE_URL}/api/aqi/current?t=${timestamp}&city=${city}`, {
      cache: 'no-store'
    });
    
    if (!response.ok) {
      throw new Error(`AQI fetch failed with status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Backend Connection Error (AQI) for ${city}:`, error);
    return null; // Fallback to dummy data
  }
}

export async function fetchSatelliteAnomalies(city: string) {
  try {
    const timestamp = new Date().getTime();
    const response = await fetch(`${BASE_URL}/api/satellite/anomalies?t=${timestamp}&city=${city}`, {
      cache: 'no-store'
    });
    
    if (!response.ok) return [];
    
    return await response.json();
  } catch (error) {
    console.error(`Satellite Feed Error for ${city}:`, error);
    return []; 
  }
}

export async function fetchForecastData(city: string) {
  try {
    const timestamp = new Date().getTime();
    const response = await fetch(`${BASE_URL}/api/forecast?t=${timestamp}&city=${city}`, {
      cache: 'no-store'
    });
    
    if (!response.ok) return null;
    
    return await response.json();
  } catch (error) {
    console.error(`Predictive Engine API Error for ${city}:`, error);
    return null; 
  }
}

export async function fetchHealthAdvisory(city: string, aqi: number) {
  try {
    const timestamp = new Date().getTime();
    const response = await fetch(`${BASE_URL}/api/health-advisory?t=${timestamp}&city=${city}&aqi=${aqi}`, {
      cache: 'no-store'
    });
    
    if (!response.ok) return null;
    
    return await response.json();
  } catch (error) {
    console.error(`Health Advisory API Error for ${city}:`, error);
    return null; 
  }
}