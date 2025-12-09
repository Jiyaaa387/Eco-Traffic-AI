export interface City {
  id: string;
  name: string;
  lat: number;
  lng: number;
  baseAQI: number; // Intrinsic pollution baseline (e.g., Delhi > Pune)
  baseTraffic: number; // Intrinsic traffic baseline
  description: string;
}

export interface TrafficDataPoint {
  id: number;
  timeSlot: string;
  vehicleCount: number; // vehicles per hour
  heavyVehicleCount: number; // heavy vehicles
  avgSpeed: number; // km/h
  aqi: number; // Measured AQI
  pm25: number; // PM 2.5 concentration
}

export interface PredictionInput {
  vehicleCount: number;
  heavyVehicleRatio: number; // 0 to 1
  avgSpeed: number;
  evAdoption: number; // 0 to 1 (percentage of EVs)
  isOddEvenPolicy: boolean;
}

export interface PredictionResult {
  predictedAQI: number;
  category: AQICategory;
  color: string;
  description: string;
  impactAnalysis: string;
}

export enum AQICategory {
  Good = "Good",
  Satisfactory = "Satisfactory",
  Moderate = "Moderate",
  Poor = "Poor",
  VeryPoor = "Very Poor",
  Severe = "Severe"
}

export const AQI_COLORS = {
  [AQICategory.Good]: "#10b981", // Emerald 500
  [AQICategory.Satisfactory]: "#84cc16", // Lime 500
  [AQICategory.Moderate]: "#eab308", // Yellow 500
  [AQICategory.Poor]: "#f97316", // Orange 500
  [AQICategory.VeryPoor]: "#ef4444", // Red 500
  [AQICategory.Severe]: "#7f1d1d", // Red 900
};

export const AQI_THRESHOLDS = [
  { limit: 50, category: AQICategory.Good },
  { limit: 100, category: AQICategory.Satisfactory },
  { limit: 200, category: AQICategory.Moderate },
  { limit: 300, category: AQICategory.Poor },
  { limit: 400, category: AQICategory.VeryPoor },
  { limit: 9999, category: AQICategory.Severe },
];