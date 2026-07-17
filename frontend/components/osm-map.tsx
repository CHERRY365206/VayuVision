'use client'

import { useEffect } from 'react'
import { MapContainer, TileLayer, ZoomControl, Polygon, Popup, CircleMarker, Tooltip, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'


// 1. AQI Color Helper
function getAqiColor(aqi: number) {
  if (aqi < 50) return '#10b981' // Safe
  if (aqi < 100) return '#f59e0b' // Moderate
  if (aqi < 150) return '#f97316' // Poor
  return '#e11d48' // Severe
}

// 2. Hexagon Math Helper
function getHexagonPoints(lat: number, lng: number, radiusDegree: number): [number, number][] {
  const points: [number, number][] = []
  for (let i = 0; i < 6; i++) {
    const angle_deg = 60 * i + 30
    const angle_rad = (Math.PI / 180) * angle_deg
    points.push([
      lat + radiusDegree * Math.sin(angle_rad),
      lng + (radiusDegree * Math.cos(angle_rad)) * 1.05
    ])
  }
  return points
}

// 3. Triangle Math Helper (For All POIs)
function getTrianglePoints(lat: number, lng: number, radiusDegree: number): [number, number][] {
  const points: [number, number][] = []
  for (let i = 0; i < 3; i++) {
    const angle_rad = (Math.PI / 180) * (i * 120) // 0, 120, 240 degrees
    points.push([
      lat + radiusDegree * Math.cos(angle_rad), // Pointing North (Up)
      lng + (radiusDegree * Math.sin(angle_rad)) * 1.05 
    ])
  }
  return points
}

// 4. Cinematic Camera Controller
function MapCameraController({ center }: { center: [number, number] }) {
  const map = useMap()
  useEffect(() => {
    map.flyTo(center, 11, { duration: 2.5, easeLinearity: 0.25 }) // Zoomed out slightly to 11 for Delhi's massive size
  }, [center, map])
  return null
}

// ========================================================
// THE MASSIVE HYDERABAD POI DATABASE 
// ========================================================
const HYD_POIS = [
  { id: 'i1', lat: 17.4560, lng: 78.4430, type: 'industrial', name: 'Sanathnagar Industrial Estate' },
  { id: 'i2', lat: 17.5140, lng: 78.4670, type: 'industrial', name: 'Jeedimetla Chemical Park' },
  { id: 'i3', lat: 17.5287, lng: 78.2667, type: 'industrial', name: 'Patancheru Heavy Industry Belt' },
  { id: 'i4', lat: 17.4690, lng: 78.4480, type: 'industrial', name: 'Balanagar Factory Zone' },
  { id: 'i5', lat: 17.3150, lng: 78.4230, type: 'industrial', name: 'Katedan Industrial Area' },
  { id: 'i6', lat: 17.4260, lng: 78.5820, type: 'industrial', name: 'Nacharam Industrial Area' },
  { id: 'i7', lat: 17.4530, lng: 78.6010, type: 'industrial', name: 'Cherlapally Industrial Park' },
  { id: 'i8', lat: 17.4380, lng: 78.5710, type: 'industrial', name: 'Mallapur Industrial Belt' },
  { id: 'i9', lat: 17.5180, lng: 78.4980, type: 'industrial', name: 'Bolarum Industrial Area' },
  { id: 'h1', lat: 17.4243, lng: 78.5035, type: 'hospital', name: 'Gandhi General Hospital' },
  { id: 'h2', lat: 17.4227, lng: 78.4101, type: 'hospital', name: 'Apollo Health City Jubilee Hills' },
  { id: 'h3', lat: 17.3712, lng: 78.4800, type: 'hospital', name: 'Osmania General Hospital' },
  { id: 'h4', lat: 17.4410, lng: 78.5020, type: 'hospital', name: 'Yashoda Hospital (Secunderabad)' },
  { id: 'h5', lat: 17.4430, lng: 78.4820, type: 'hospital', name: 'KIMS Hospitals (Begumpet)' },
  { id: 'h6', lat: 17.4270, lng: 78.4550, type: 'hospital', name: 'NIMS (Punjagutta)' },
  { id: 'h7', lat: 17.4170, lng: 78.4480, type: 'hospital', name: 'Care Hospitals (Banjara Hills)' },
  { id: 'h8', lat: 17.4435, lng: 78.3653, type: 'hospital', name: 'AIG Hospitals (Gachibowli)' },
  { id: 'h9', lat: 17.4160, lng: 78.3420, type: 'hospital', name: 'Continental Hospitals' },
  { id: 'h10', lat: 17.4450, lng: 78.3840, type: 'hospital', name: 'Medicover Hospitals (HITEC City)' },
  { id: 's1', lat: 17.4138, lng: 78.5284, type: 'school', name: 'Osmania University Campus' },
  { id: 's2', lat: 17.4933, lng: 78.3914, type: 'school', name: 'JNTU Hyderabad' },
  { id: 's3', lat: 17.5975, lng: 78.1215, type: 'school', name: 'IIT Hyderabad (Kandi Campus)' },
  { id: 's4', lat: 17.4600, lng: 78.3268, type: 'school', name: 'University of Hyderabad (UoH)' },
  { id: 's5', lat: 17.4450, lng: 78.3480, type: 'school', name: 'IIIT Hyderabad' },
  { id: 's6', lat: 17.5450, lng: 78.5710, type: 'school', name: 'BITS Pilani Hyderabad Campus' },
  { id: 's7', lat: 17.4418, lng: 78.4658, type: 'school', name: 'Hyderabad Public School (Begumpet)' },
  { id: 's8', lat: 17.4214, lng: 78.3371, type: 'school', name: 'Oakridge International (Gachibowli)' },
  { id: 's9', lat: 17.4568, lng: 78.3551, type: 'school', name: 'Chirec Public Campus' },
  { id: 's10', lat: 17.4320, lng: 78.3640, type: 'school', name: 'Maulana Azad National Urdu University' },
  { id: 's11', lat: 17.6200, lng: 78.5600, type: 'school', name: 'NALSAR University of Law' },
  { id: 'm1', lat: 17.4340, lng: 78.3860, type: 'mall', name: 'Inorbit Mall (Madhapur)' },
  { id: 'm2', lat: 17.4570, lng: 78.3640, type: 'mall', name: 'Sarath City Capital Mall (Kondapur)' },
  { id: 'm3', lat: 17.4840, lng: 78.3890, type: 'mall', name: 'Nexus Mall / Forum Sujana (KPHB)' },
  { id: 'm4', lat: 17.4180, lng: 78.4480, type: 'mall', name: 'GVK One Mall (Banjara Hills)' },
  { id: 'm5', lat: 17.4565, lng: 78.3645, type: 'mall', name: 'AMB Cinemas & Mall' },
  { id: 'm6', lat: 17.4310, lng: 78.4490, type: 'mall', name: 'L&T Next Galleria (Irrum Manzil)' },
  { id: 'm7', lat: 17.4260, lng: 78.4520, type: 'mall', name: 'L&T Next Galleria (Punjagutta)' },
  { id: 'm8', lat: 17.4270, lng: 78.4510, type: 'mall', name: 'Hyderabad Central' },
  { id: 'm9', lat: 17.4160, lng: 78.4470, type: 'mall', name: 'City Center Mall (Banjara Hills)' },
  { id: 'm10', lat: 17.5020, lng: 78.3370, type: 'mall', name: 'GSM Mall (Miyapur)' },
]

// ========================================================
// THE NEW DELHI POI DATABASE 
// ========================================================
const DELHI_POIS = [
  { id: 'd-i1', lat: 28.5250, lng: 77.2790, type: 'industrial', name: 'Okhla Industrial Estate' },
  { id: 'd-i2', lat: 28.6360, lng: 77.1420, type: 'industrial', name: 'Naraina Industrial Area' },
  { id: 'd-i3', lat: 28.7990, lng: 77.0620, type: 'industrial', name: 'Bawana Industrial Area' },
  { id: 'd-i4', lat: 28.6310, lng: 77.1290, type: 'industrial', name: 'Mayapuri Industrial Area' },
  { id: 'd-i5', lat: 28.6290, lng: 77.3030, type: 'industrial', name: 'Patparganj Industrial Area' },
  { id: 'd-i6', lat: 28.6980, lng: 77.1630, type: 'industrial', name: 'Wazirpur Industrial Area' },
  { id: 'd-i7', lat: 28.8430, lng: 77.0910, type: 'industrial', name: 'Narela Industrial Park' },
  { id: 'd-i8', lat: 28.6940, lng: 77.0860, type: 'industrial', name: 'Mangolpuri Industrial Area' },
  { id: 'd-i9', lat: 28.6480, lng: 77.1440, type: 'industrial', name: 'Kirti Nagar Industrial Area' },
  { id: 'd-h1', lat: 28.5672, lng: 77.2100, type: 'hospital', name: 'AIIMS New Delhi' },
  { id: 'd-h2', lat: 28.5686, lng: 77.2045, type: 'hospital', name: 'Safdarjung Hospital' },
  { id: 'd-h3', lat: 28.5410, lng: 77.2830, type: 'hospital', name: 'Indraprastha Apollo' },
  { id: 'd-h4', lat: 28.5270, lng: 77.2120, type: 'hospital', name: 'Max Super Speciality Saket' },
  { id: 'd-h5', lat: 28.5580, lng: 77.2730, type: 'hospital', name: 'Fortis Escorts Heart Institute' },
  { id: 'd-h6', lat: 28.6380, lng: 77.1890, type: 'hospital', name: 'Sir Ganga Ram Hospital' },
  { id: 'd-h7', lat: 28.6250, lng: 77.1980, type: 'hospital', name: 'RML Hospital' },
  { id: 'd-h8', lat: 28.6380, lng: 77.2400, type: 'hospital', name: 'Lok Nayak (LNJP) Hospital' },
  { id: 'd-h9', lat: 28.6430, lng: 77.1810, type: 'hospital', name: 'BLK Super Speciality Hospital' },
  { id: 'd-h10', lat: 28.5610, lng: 77.2760, type: 'hospital', name: 'Holy Family Hospital' },
  { id: 'd-s1', lat: 28.6883, lng: 77.2064, type: 'school', name: 'Delhi University (North Campus)' },
  { id: 'd-s2', lat: 28.5400, lng: 77.1650, type: 'school', name: 'Jawaharlal Nehru University (JNU)' },
  { id: 'd-s3', lat: 28.5450, lng: 77.1926, type: 'school', name: 'IIT Delhi' },
  { id: 'd-s4', lat: 28.5610, lng: 77.2830, type: 'school', name: 'Jamia Millia Islamia' },
  { id: 'd-s5', lat: 28.5950, lng: 77.0190, type: 'school', name: 'Guru Gobind Singh IP University' },
  { id: 'd-s6', lat: 28.7500, lng: 77.1170, type: 'school', name: 'Delhi Technological University (DTU)' },
  { id: 'd-s7', lat: 28.6090, lng: 77.0340, type: 'school', name: 'Netaji Subhas University (NSUT)' },
  { id: 'd-s8', lat: 28.5450, lng: 77.2720, type: 'school', name: 'IIIT Delhi' },
  { id: 'd-s9', lat: 28.6660, lng: 77.2310, type: 'school', name: 'Ambedkar University' },
  { id: 'd-s10', lat: 28.4960, lng: 77.1960, type: 'school', name: 'IGNOU Main Campus' },
  { id: 'd-m1', lat: 28.5285, lng: 77.2192, type: 'mall', name: 'Select CITYWALK' },
  { id: 'd-m2', lat: 28.5418, lng: 77.1488, type: 'mall', name: 'DLF Promenade' },
  { id: 'd-m3', lat: 28.6420, lng: 77.1060, type: 'mall', name: 'Pacific Mall (Tagore Garden)' },
  { id: 'd-m4', lat: 28.5420, lng: 77.1490, type: 'mall', name: 'DLF Emporio' },
  { id: 'd-m5', lat: 28.5400, lng: 77.1500, type: 'mall', name: 'Ambience Mall (Vasant Kunj)' },
  { id: 'd-m6', lat: 28.5980, lng: 77.0290, type: 'mall', name: 'Vegas Mall (Dwarka)' },
  { id: 'd-m7', lat: 28.6500, lng: 77.1210, type: 'mall', name: 'City Square Mall' },
  { id: 'd-m8', lat: 28.6510, lng: 77.1220, type: 'mall', name: 'TDI Mall (Rajouri Garden)' },
  { id: 'd-m9', lat: 28.7230, lng: 77.1120, type: 'mall', name: 'Metro Walk Mall (Rohini)' },
  { id: 'd-m10', lat: 28.6360, lng: 77.2870, type: 'mall', name: 'V3S Mall (Nirman Vihar)' },
]

// ========================================================
// THE BENGALURU POI DATABASE 
// ========================================================
const BENGALURU_POIS = [
  { id: 'b-i1', lat: 13.0310, lng: 77.5180, type: 'industrial', name: 'Peenya Industrial Area' },
  { id: 'b-i2', lat: 12.8452, lng: 77.6602, type: 'industrial', name: 'Electronic City Phase 1' },
  { id: 'b-i3', lat: 12.8160, lng: 77.6920, type: 'industrial', name: 'Bommasandra Industrial Area' },
  { id: 'b-h1', lat: 12.9372, lng: 77.5942, type: 'hospital', name: 'NIMHANS' },
  { id: 'b-h2', lat: 12.9585, lng: 77.6443, type: 'hospital', name: 'Manipal Hospital (Old Airport Rd)' },
  { id: 'b-h3', lat: 12.8940, lng: 77.5970, type: 'hospital', name: 'Fortis Hospital (Bannerghatta)' },
  { id: 'b-s1', lat: 13.0163, lng: 77.5670, type: 'school', name: 'Indian Institute of Science (IISc)' },
  { id: 'b-s2', lat: 12.8913, lng: 77.5980, type: 'school', name: 'IIM Bangalore' },
  { id: 'b-s3', lat: 12.9230, lng: 77.4990, type: 'school', name: 'RV College of Engineering' },
  { id: 'b-m1', lat: 13.0108, lng: 77.5546, type: 'mall', name: 'Orion Mall' },
  { id: 'b-m2', lat: 12.9965, lng: 77.6957, type: 'mall', name: 'Phoenix Marketcity' },
]

// ========================================================
// THE CHENNAI POI DATABASE 
// ========================================================
const CHENNAI_POIS = [
  { id: 'c-i1', lat: 13.0970, lng: 80.1600, type: 'industrial', name: 'Ambattur Industrial Estate' },
  { id: 'c-i2', lat: 13.0070, lng: 80.2080, type: 'industrial', name: 'Guindy Industrial Estate' },
  { id: 'c-i3', lat: 12.8350, lng: 79.9570, type: 'industrial', name: 'Oragadam Auto Hub' },
  { id: 'c-h1', lat: 13.0610, lng: 80.2520, type: 'hospital', name: 'Apollo Hospitals (Greams Rd)' },
  { id: 'c-h2', lat: 13.0170, lng: 80.1790, type: 'hospital', name: 'MIOT International' },
  { id: 'c-h3', lat: 13.0805, lng: 80.2764, type: 'hospital', name: 'Rajiv Gandhi Govt General Hospital' },
  { id: 'c-s1', lat: 12.9915, lng: 80.2337, type: 'school', name: 'IIT Madras' },
  { id: 'c-s2', lat: 13.0100, lng: 80.2370, type: 'school', name: 'Anna University' },
  { id: 'c-s3', lat: 13.0630, lng: 80.2330, type: 'school', name: 'Loyola College' },
  { id: 'c-m1', lat: 13.0580, lng: 80.2640, type: 'mall', name: 'Express Avenue' },
  { id: 'c-m2', lat: 12.9910, lng: 80.2160, type: 'mall', name: 'Phoenix Marketcity (Velachery)' },
]

export default function OsmMap({ 
  aqiData, 
  weatherData, 
  layers,
  forecastData = [],    
  currentHour = 0,
  activeCity = 'hyderabad' 
}: { 
  aqiData: any, 
  weatherData: any, 
  layers: any,
  forecastData?: any[],
  currentHour?: number,
  activeCity?: string
}) {
  
  let centerPosition: [number, number] = [17.3850, 78.4867] // default Hyderabad
  let ACTIVE_POIS = HYD_POIS

  if (activeCity === 'delhi') {
    centerPosition = [28.6139, 77.2090]
    ACTIVE_POIS = DELHI_POIS
  } else if (activeCity === 'bengaluru') {
    centerPosition = [12.9716, 77.5946]
    ACTIVE_POIS = BENGALURU_POIS
  } else if (activeCity === 'chennai') {
    centerPosition = [13.0827, 80.2707]
    ACTIVE_POIS = CHENNAI_POIS
  }

  const currentForecast = forecastData?.[currentHour]
  const nodes = currentForecast?.nodes || { center: 40, north: 40, south: 40, east: 40, west: 40 }

  const getPredictedAqiForLocation = (lat: number, lng: number, cLat: number, cLng: number) => {
    if (lat > cLat + 0.065) return nodes.north; 
    if (lat < cLat - 0.065) return nodes.south; 
    if (lng > cLng + 0.035) return nodes.east;  
    if (lng < cLng - 0.065) return nodes.west;  
    return nodes.center;                 
  }

  // 🧠 NEW ARCHITECTURE: Deterministic Geo-Scatter Matrix
  // Replaces the spiral pattern with realistic scattered grid nodes, 
  // keeping nodes strictly within city landmasses (especially for coastal Chennai)
  const getDeterministicHash = (seed: number) => {
    let t = seed + 0x6D2B79F5;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  const getScatteredCoordinates = (index: number) => {
    const r1 = getDeterministicHash(index * 123);
    const r2 = getDeterministicHash(index * 321);

    if (activeCity === 'delhi') {
      return { lat: 28.6139 + (r1 - 0.5) * 0.45, lng: 77.2090 + (r2 - 0.5) * 0.45 };
    } else if (activeCity === 'bengaluru') {
      return { lat: 12.9716 + (r1 - 0.5) * 0.4, lng: 77.5946 + (r2 - 0.5) * 0.4 };
    } else if (activeCity === 'chennai') {
      // Chennai is coastal. Marina beach is at ~80.28. 
      // We force longitude to only scatter WEST of 80.28 to avoid the ocean!
      return { lat: 13.0827 + (r1 - 0.5) * 0.4, lng: 80.2800 - (r2 * 0.35) };
    } else {
      return { lat: 17.3850 + (r1 - 0.5) * 0.35, lng: 78.4867 + (r2 - 0.5) * 0.35 };
    }
  }

  return (
    <MapContainer 
      center={centerPosition} 
      zoom={11} 
      zoomControl={false}
      style={{ height: '100vh', width: '100vw', position: 'absolute', zIndex: 0, backgroundColor: '#020617' }}
    >
      <ZoomControl position="bottomright" />
      <MapCameraController center={centerPosition} />
      
      <TileLayer
        attribution='&copy; OpenStreetMap'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        className="map-tiles"
      />

      {/* LAYER OVERLAY 1: AQI Hexagon Mesh */}
      {layers.danger && aqiData?.records?.map((record: any, index: number) => {
        
        // Deploying the Deterministic Geo-Scatter algorithm
        const { lat: spreadLat, lng: spreadLng } = getScatteredCoordinates(index);
        
        const hexPoints = getHexagonPoints(spreadLat, spreadLng, 0.007); 
        const displayAqi = getPredictedAqiForLocation(spreadLat, spreadLng, centerPosition[0], centerPosition[1]);

        if (record.pollutant_avg > 0 || displayAqi > 0) { 
          return (
            <Polygon
              key={`hex-${activeCity}-${index}`}
              positions={hexPoints}
              pathOptions={{
                color: getAqiColor(displayAqi),
                fillColor: getAqiColor(displayAqi),
                fillOpacity: 0.4,
                weight: 2,
              }}
            >
              <Popup className="glass-popup">
                <div className="bg-slate-900 text-cyan-50 p-3 rounded-lg border border-slate-700 shadow-xl">
                  <h3 className="font-bold text-lg mb-1 text-white uppercase truncate">
                    {record.station || `GRID SECTOR: ${activeCity.substring(0,3)}-${index + 1}`}
                  </h3>
                  <p className="text-xs text-slate-400 mb-2">Live Telemetry Node: Active</p>
                  <div className="text-sm">
                    <p>
                      <span className="text-slate-400">{currentHour === 0 ? "Live AQI:" : `Predicted AQI (+${currentHour}h):`}</span> 
                      <strong className="ml-2" style={{color: getAqiColor(displayAqi)}}>{displayAqi}</strong>
                    </p>
                  </div>
                </div>
              </Popup>
            </Polygon>
          )
        }
        return null
      })}

      {/* LAYER OVERLAY 2: High-Impact POI Markers */}
      {ACTIVE_POIS.map((poi) => {
        const isVisible = 
          (poi.type === 'industrial' && layers.industrial) ||
          (poi.type === 'hospital' && layers.hospitals) ||
          (poi.type === 'school' && layers.schools) ||
          (poi.type === 'mall' && layers.malls)

        if (!isVisible) return null;

        let markerColor = '#f59e0b'; // Default Orange
        if (poi.type === 'hospital') markerColor = '#06b6d4'; // Cyan
        if (poi.type === 'school') markerColor = '#22c55e'; // Green
        if (poi.type === 'mall') markerColor = '#a855f7'; // Purple

        return (
          <Polygon
            key={poi.id}
            positions={getTrianglePoints(poi.lat, poi.lng, 0.006)} 
            pathOptions={{ color: markerColor, fillColor: markerColor, fillOpacity: 0.9, weight: 2 }}
          >
            <Tooltip direction="top" offset={[0, -10]} opacity={1}>
              <span className="font-bold">{poi.name}</span>
            </Tooltip>
          </Polygon>
        )
      })}

      {/* LAYER OVERLAY 3: Physical Citizen IoT Nodes */}
      {layers.iot && aqiData?.records?.map((record: any, index: number) => {
        
        // Syncing IoT nodes directly to the same Scatter pattern
        const { lat: spreadLat, lng: spreadLng } = getScatteredCoordinates(index);

        return (
          <CircleMarker
            key={`node-${activeCity}-${index}`}
            center={[spreadLat, spreadLng]}
            radius={3} 
            pathOptions={{
              color: '#00f6ff', 
              fillColor: '#00f6ff',
              fillOpacity: 1,
              weight: 1,
            }}
          >
            <Tooltip direction="top" opacity={1}>
              <span className="font-bold text-xs uppercase">VayuVision IoT Node #{index + 1} ({activeCity.substring(0,3)})</span>
            </Tooltip>
          </CircleMarker>
        )
      })}
    </MapContainer>
  )
}