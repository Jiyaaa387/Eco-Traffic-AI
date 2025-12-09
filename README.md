# 🌿 EcoTraffic AI: Traffic Density vs. AQI Visual Explorer

![React](https://img.shields.io/badge/React-19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Leaflet](https://img.shields.io/badge/Leaflet-199900?style=for-the-badge&logo=Leaflet&logoColor=white)

**EcoTraffic AI** is an advanced interactive dashboard designed to visualize and predict the impact of urban traffic density on Air Quality Index (AQI). 

By combining **real-time environmental data** with a **multivariate linear regression simulator**, this application helps policymakers and citizens understand how variables like vehicle volume, heavy transport ratios, and traffic speed contribute to urban pollution in major Indian cities.

---

## 🚀 Key Features

### 1. 🌍 Interactive Live Map
*   **Powered by Leaflet:** A fully interactive map centered on India.
*   **Real-Time Data:** Integrates with the **WAQI (World Air Quality Index) API** to fetch live AQI and PM2.5 data for major cities.
*   **Drill-Down Analysis:** Click on any city marker to view specific data, or **click anywhere on the map** to fetch real-time pollution data for that exact coordinate (neighborhood level).
*   **Traffic Estimation:** Uses a reverse-correlation algorithm to estimate current traffic density based on real-time pollution signatures.

### 2. 🧠 ML-Based AQI Predictor (Simulator)
*   **Interactive Controls:** Users can adjust sliders for:
    *   Vehicle Volume (Vehicles/hr)
    *   Average Traffic Speed (km/h)
    *   Heavy Vehicle Ratio (Trucks/Buses)
    *   EV Adoption %
*   **Policy Simulation:** Test the impact of specific policies like the **"Odd-Even" scheme** or aggressive EV subsidies.
*   **Instant Feedback:** A gauge chart and text analysis engine provide immediate feedback on the predicted AQI category and potential health impacts.

### 3. 📊 Analytics Dashboard
*   **Temporal Trends:** Visualizes 24-hour trends comparing traffic volume vs. AQI levels using **Recharts**.
*   **Correlation Analysis:** Scatter plots demonstrating the relationship between congestion and particulate matter.
*   **Key Metrics:** Displays calculated averages, peak pollution times, and network velocity.

### 4. 💾 Dataset Management
*   **Transparent Data:** View the underlying synthetic training dataset used for the simulation.
*   **CSV Export:** Download the data matrix for external analysis in Python/Excel.

---

## 🛠️ Tech Stack

*   **Frontend Framework:** React 19
*   **Language:** TypeScript
*   **Styling:** Tailwind CSS (Glassmorphism UI, Dark/Light Mode)
*   **Mapping Engine:** Leaflet & React-Leaflet
*   **Visualization:** Recharts
*   **Icons:** Lucide React
*   **Data Provider:** World Air Quality Index (WAQI) API

---

## 📐 The Simulation Logic

While the app fetches *real* AQI data, the *Predictive Model* runs on a frontend simulation of a Linear Regression algorithm. The logic follows this core formula:

```math
AQI = \beta_0 + (\beta_1 \times Vehicles) + (\beta_2 \times HeavyVehicles) - (\beta_3 \times AvgSpeed) + \epsilon
Vehicle Count (+): Higher density increases AQI.
Avg Speed (-): Lower speeds (idling/congestion) drastically increase emissions due to incomplete combustion.
Heavy Vehicles (+): Diesel trucks are weighted significantly higher for PM2.5 contribution.
EV Adoption: Applies a reduction coefficient to the total emission score.
⚡ Getting Started
Prerequisites
Node.js (v16 or higher)
npm or yarn
Installation
Clone the repository
code
Bash
git clone https://github.com/yourusername/ecotraffic-ai.git
cd ecotraffic-ai
Install dependencies
code
Bash
npm install
Run the development server
code
Bash
npm start
Open in Browser
Navigate to http://localhost:3000 to interact with the application.
📂 Project Structure
code
Text
src/
├── components/
│   ├── CityMap.tsx       # Leaflet map implementation
│   ├── Dashboard.tsx     # Charts and Analytics views
│   ├── Predictor.tsx     # ML Simulator controls
│   ├── Navbar.tsx        # Navigation and Dark Mode toggle
│   └── DatasetView.tsx   # Data table and Export
├── services/
│   ├── dataService.ts    # WAQI API integration & Synthetic data generation
│   └── mlService.ts      # Prediction algorithm & logic
├── types.ts              # TypeScript interfaces
└── App.tsx               # Main entry point
