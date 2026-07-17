// 1. Initialize Leaflet Map Centered on Hyderabad
const map = L.map('vayu-map').setView([17.3850, 78.4867], 12);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

// 2. Mocking the Spatial Infrastructure Data (Person 2 Grid Data Integration)
// We define points of interest in Hyderabad to intercept the predictive matrix loops
const assets = [
    { name: "Apollo Hospital, Jubilee Hills", lat: 17.4265, lon: 78.4102, type: "Hospital" },
    { name: "Government High School, Sanathnagar", lat: 17.4560, lon: 78.4410, type: "School" },
    { name: "Osmania Medical College, Koti", lat: 17.3820, lon: 78.4840, type: "Hospital" }
];

// Define localized industrial emission centers (The source of our simulation plumes)
const industrialZones = [
    { name: "Sanathnagar Industrial Area", lat: 17.4600, lon: 78.4350, emissionBase: 190 },
    { name: "Jeeedimetla Industrial Zone", lat: 17.5150, lon: 78.4480, emissionBase: 220 }
];

let mapGridLayers = [];

// 3. Mathematical Engine: Render 1km Bounding Box Grid Matrix
function buildCityMesh() {
    // Clear old grids if any
    mapGridLayers.forEach(layer => map.removeLayer(layer));
    mapGridLayers = [];

    // Let's create a grid matrix around central Hyderabad coordinates
    const startLat = 17.3500;
    const startLon = 78.3800;
    const step = 0.009; // Approximate coordinate step for a ~1km grid spacing

    for (let i = 0; i < 15; i++) {
        for (let j = 0; j < 15; j++) {
            const latMin = startLat + (i * step);
            const latMax = latMin + step;
            const lonMin = startLon + (j * step);
            const lonMax = lonMin + step;

            const bounds = [[latMin, lonMin], [latMax, lonMax]];
            
            // Build a base rectangle layer
            const rect = L.rectangle(bounds, {
                color: "#334155",
                weight: 1,
                fillColor: "#22c55e",
                fillOpacity: 0.15
            }).addTo(map);

            // Save references along with coordinate center details
            mapGridLayers.push({
                layer: rect,
                centerLat: (latMin + latMax) / 2,
                centerLon: (lonMin + lonMax) / 2
            });
        }
    }
}

// 4. Extraordinary Feature: Calculate Wind Dispersion Vector Mechanics
function recalculatePollutionPlume(windSpeed, windDirectionAngle, hoursAhead) {
    const angleRad = (windDirectionAngle * Math.PI) / 180;
    const alertWidget = document.getElementById('ai-alert-widget');
    alertWidget.innerHTML = ""; // Flush old alert strings

    let safetyIncidentCount = 0;

    // Calculate displacement vectors based on wind dynamics
    const dispersionDistance = (windSpeed * hoursAhead * 0.002);
    const dLat = dispersionDistance * Math.sin(angleRad);
    const dLon = dispersionDistance * Math.cos(angleRad);

    // Evaluate values across each coordinate grid square
    mapGridLayers.forEach(grid => {
        let maxCalculatedAQI = 45; // Baseline green target value

        industrialZones.forEach(source => {
            // Shift the center of the pollution cloud outward along the wind path vector
            const plumeCenterLat = source.lat + dLat;
            const plumeCenterLon = source.lon + dLon;

            // Compute distance from grid square center to plume core position
            const distance = Math.sqrt(
                Math.pow(grid.centerLat - plumeCenterLat, 2) + 
                Math.pow(grid.centerLon - plumeCenterLon, 2)
            );

            // Pollution degrades inverse-exponentially with spatial distance
            const localImpact = source.emissionBase / (1 + (distance * 120));
            if (localImpact > maxCalculatedAQI) {
                maxCalculatedAQI = localImpact;
            }
        });

        // Determine dynamic grid styling based on calculated local AQI values
        let gridColor = "#22c55e"; // Healthy Green
        let opacity = 0.15;

        if (maxCalculatedAQI > 150) {
            gridColor = "#ef4444"; // Severe Red Alert
            opacity = 0.6;
        } else if (maxCalculatedAQI > 100) {
            gridColor = "#f97316"; // Unhealthy Orange
            opacity = 0.45;
        } else if (maxCalculatedAQI > 60) {
            gridColor = "#eab308"; // Moderate Yellow
            opacity = 0.3;
        }

        grid.layer.setStyle({
            fillColor: gridColor,
            fillOpacity: opacity
        });

        // Cross-Reference Vulnerable Infrastructure Coordinates
        assets.forEach(asset => {
            const distanceToAsset = Math.sqrt(
                Math.pow(grid.centerLat - asset.lat, 2) + 
                Math.pow(grid.centerLon - asset.lon, 2)
            );

            // Intercept grid squares containing assets that cross danger parameters
            if (distanceToAsset < 0.006 && maxCalculatedAQI > 140) {
                safetyIncidentCount++;
                alertWidget.innerHTML += `
                    <div class="danger-ticket">
                        <strong>⚠️ High Exposure Hazard</strong>
                        <span>Plume trajectory entering vicinity of <b>${asset.name}</b> (+${hoursAhead}h forecast index). AQI: <b>${Math.round(maxCalculatedAQI)}</b>. Immediate mitigation advised.</span>
                    </div>
                `;
            }
        });
    });

    if (safetyIncidentCount === 0) {
        alertWidget.innerHTML = `<p class="status-nominal">⚡ System Nominal: No sensitive zones threatened at this timestamp coordinates.</p>`;
    }
}

// 5. Connect Backend Data Pulling Sequences
async function initLiveDashboard() {
    buildCityMesh();

    try {
        const response = await fetch('/api/backend/get-aqi-data');
        const weatherData = await response.json();

        // Update basic text components
        document.getElementById('weather-widget').innerHTML = `
            <div class="stat-row"><span>Temperature:</span><span class="stat-value">${weatherData.temperature_c}°C</span></div>
            <div class="stat-row"><span>Humidity:</span><span class="stat-value">${weatherData.humidity_percent}%</span></div>
            <div class="stat-row"><span>Wind Speed:</span><span class="stat-value">${weatherData.wind_speed_m_s} m/s</span></div>
        `;

        // Initialize default dispersion maps using current live vectors
        recalculatePollutionPlume(weatherData.wind_speed_m_s, 220, 0);

        // Map timeline range scrubber updates directly to calculations
        const slider = document.getElementById('timeline-slider');
        slider.addEventListener('input', (e) => {
            const index = parseInt(e.target.value);
            const hours = index * 3;
            
            document.getElementById('timeline-time-display').innerText = `Forecast: +${hours} Hours`;
            
            // Re-render dispersion shapes dynamically matching index movement
            recalculatePollutionPlume(weatherData.wind_speed_m_s, 220, hours);
        });

    } catch (err) {
        console.error("Connection failed. Initializing standard loop simulation parameters.", err);
        // Fallback default variables to keep application running offline
        recalculatePollutionPlume(6.5, 220, 0);
        
        document.getElementById('timeline-slider').addEventListener('input', (e) => {
            const hours = parseInt(e.target.value) * 3;
            document.getElementById('timeline-time-display').innerText = `Simulation: +${hours} Hours`;
            recalculatePollutionPlume(6.5, 220, hours);
        });
    }
}

// Run engine initialization routine
initLiveDashboard();