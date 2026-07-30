# 🌍 VayuVision – Autonomous AI Environmental Command Center

> An intelligent, hybrid AI-driven environmental command center that shifts urban pollution management from reactive monitoring to proactive mitigation through hyper-local forecasting and targeted enforcement.

### 🚀 [CLICK HERE TO VIEW LIVE DEPLOYMENT](https://your-vercel-deploy-link-here.vercel.app) 🚀

---

## 📖 Overview

VayuVision is a full-stack, serverless web application developed to empower city administrators and environmental agencies. The platform ingests live meteorological and air quality telemetry, visualizes it on a high-resolution 1km hexagonal geospatial grid, and uses autonomous AI agents to predict, pinpoint, and prescribe actions to stop urban pollution spikes before they happen.

The system follows a **decoupled client-server architecture**, where a highly responsive Next.js frontend communicates with a blazing-fast Python FastAPI backend. The intelligence layer is powered by a unique hybrid of **XGBoost Machine Learning** for numerical forecasting and **Google Gemini LLMs** for complex spatial reasoning.

---

## 🚀 Key Features

- 🌍 **High-Resolution Geospatial Dashboard:** 1km hexagonal grid over OpenStreetMap.
- ⛅ **Meteorological Data Hub:** Live ingestion of Open-Meteo and WAQI telemetry.
- 🎯 **AI Source Apportionment:** Dynamically infers dominant pollution sources (Traffic vs. Industrial).
- 🚨 **Enforcement Intelligence:** Correlates hotspots with registered POIs to generate autonomous enforcement actions.
- ⏱️ **72-Hour Predictive Forecasting:** Anticipates air quality degradation days in advance.
- 📢 **Citizen Health Risk Advisory:** Multi-lingual (English/Telugu) public health warnings.
- 🏙️ **Multi-City Comparative Intelligence:** Track trends across multiple urban centers simultaneously.

---

# 🛠️ Tech Stack

| Category | Technologies |
|-----------|--------------|
| **Frontend** | Next.js (React), Tailwind CSS, Lucide Icons, Leaflet/OSM |
| **Backend** | Python, FastAPI |
| **AI / Machine Learning** | Google Gemini LLM, XGBoost |
| **Data Ingestion** | WAQI API, Open-Meteo API |
| **Deployment** | Vercel (Serverless Edge & Python Functions) |
| **Tools** | Git, GitHub, VS Code |

---

# 🏗️ System Architecture

```text
                    City Administrator
                            │
                            ▼
           Next.js Frontend (React, Tailwind CSS)
                            │
                    REST API Requests
                            │
                            ▼
                 FastAPI Backend (Python)
          ├── Open-Meteo & WAQI Data Ingestion
          ├── XGBoost ML Forecasting Engine
          ├── Gemini AI Source Apportionment
          ├── Enforcement Intelligence Agent
          ├── Citizen Health Advisory Engine
          └── Multi-City Data Aggregator
                            │
                            ▼
          Geospatial POI Data & Cloud LLM Prompts
```

---

# ⚙️ How VayuVision Works

### 1️⃣ Data Ingestion
VayuVision constantly polls live meteorological data (wind speed, temperature) and Air Quality Indices from external APIs (Open-Meteo, WAQI).
↓
### 2️⃣ Machine Learning Preprocessing
The raw numerical data is fed through a custom XGBoost model trained on 6 months of historical data to establish a highly accurate atmospheric baseline (8.81 MAE).
↓
### 3️⃣ AI Inference (The Brains)
When a user requests analysis, the backend constructs complex system prompts injecting live telemetry and spatial context. It queries the Google Gemini LLM to reason *why* pollution is happening and *who* is causing it.
↓
### 4️⃣ Autonomous Enforcement Generation
The system outputs strictly formatted JSON prescribing exact, localized enforcement actions (e.g., "Dispatch inspection teams to Jeedimetla Industrial Park").
↓
### 5️⃣ User Interface
The Next.js frontend dynamically renders these insights via interactive glassmorphism modals and glowing geospatial map overlays.

---

# 🔧 REST APIs

The backend exposes serverless RESTful APIs for communication between the frontend and the AI intelligence layer. 

Major endpoints include:
- `/api/aqi` - Fetches live baseline air quality data.
- `/api/source-attribution` - Triggers the Gemini LLM for pollution source breakdown.
- `/api/enforcement-agent` - Correlates hotspots to generate enforcement recommendations.
- `/api/predictive-forecast` - Runs the 72-hour dual-model (XGBoost + LLM) forecasting.

*Note: The backend features a robust fallback architecture that seamlessly injects context-aware mock JSON data in the event of API rate limits, ensuring zero UI downtime.*

---

# 🤖 Autonomous AI Agents

VayuVision doesn't just display data; it acts as an autonomous advisor powered by **Google Gemini**.

Instead of hardcoded rules, our AI Agents utilize **Probabilistic Reasoning**. By understanding the city's geography and reading live wind trajectories, the agents dynamically assign confidence scores to likely pollution sources (e.g., Traffic vs. Construction) and generate actionable municipal directives without human intervention.

---

# 📸 Project Preview

## 🏠 Main Command Center Dashboard
<img width="1445" height="937" alt="Screenshot 2026-07-06 203128" src="https://github.com/user-attachments/assets/c9da3b62-583d-4959-9741-6cd940dab61b" />
<img width="1445" height="937" alt="Screenshot 2026-07-06 203128" src="https://github.com/user-attachments/assets/c9da3b62-583d-4959-9741-6cd940dab61b" />

---
## 🎯 AI Source Apportionment
*[ Insert Screenshot Here ]*

---
## 🚨 Enforcement Intelligence
*[ Insert Screenshot Here ]*

---
## ⏱️ Predictive AQI Forecasting
*[ Insert Screenshot Here ]*

---
## 📢 Citizen Health Advisory (Multi-Lingual)
*[ Insert Screenshot Here ]*


---

# 🎯 Concepts Demonstrated

- Hybrid AI Architecture (Deterministic ML + Probabilistic Generative AI)
- Serverless Full-Stack Web Development
- B2G (Business-to-Government) Software Engineering
- Prompt Engineering & JSON Schema constraints
- Advanced REST API Development with Python/FastAPI
- Geospatial Mapping and Data Visualization
- Responsive, Dark-Mode Glassmorphism UI Design

---

⭐ *If you found this project innovative, consider giving it a star!*
