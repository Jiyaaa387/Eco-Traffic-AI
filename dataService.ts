import { TrafficDataPoint, City } from '../types';

const API_KEY = '87e038691de7446cbb5101111250812';

export const INDIAN_CITIES: City[] = [
  { id: 'delhi', name: 'New Delhi', lat: 28.61, lng: 77.20, baseAQI: 180, baseTraffic: 2200, description: "Capital territory with extremely high vehicular density." },
  { id: 'mumbai', name: 'Mumbai', lat: 19.07, lng: 72.87, baseAQI: 120, baseTraffic: 2500, description: "Coastal metropolis with high congestion but better airflow." },
  { id: 'bangalore', name: 'Bengaluru', lat: 12.97, lng: 77.59, baseAQI: 90, baseTraffic: 2000, description: "IT Hub with notorious slow-moving peak hour traffic." },
  { id: 'chennai', name: 'Chennai', lat: 13.08, lng: 80.27, baseAQI: 80, baseTraffic: 1600, description: "Major port city with moderate humidity and density." },
  { id: 'kolkata', name: 'Kolkata', lat: 22.57, lng: 88.36, baseAQI: 140, baseTraffic: 1500, description: "Dense urban fabric with older vehicle fleet." },
  { id: 'hyderabad', name: 'Hyderabad', lat: 17.38, lng: 78.48, baseAQI: 100, baseTraffic: 1700, description: "Growing metro with expanding orbital traffic." },
  { id: 'pune', name: 'Pune', lat: 18.52, lng: 73.85, baseAQI: 95, baseTraffic: 1400, description: "Educational hub with high two-wheeler density." },
  { id: 'jaipur', name: 'Jaipur', lat: 26.91, lng: 75.78, baseAQI: 110, baseTraffic: 1100, description: "Tourist center with seasonal traffic spikes." },
  { id: 'lucknow', name: 'Lucknow', lat: 26.84, lng: 80.94, baseAQI: 150, baseTraffic: 1200, description: "Northern plains city with low wind speeds." },
  { id: 'ahmedabad', name: 'Ahmedabad', lat: 23.02, lng: 72.57, baseAQI: 115, baseTraffic: 1600, description: "Industrial hub with heavy transport movement." },
];

// Helper to fetch live data
export const fetchRealAirQuality = async (lat: number, lng: number) => {
  try {
    const res = await fetch(`https://api.waqi.info/feed/geo:${lat};${lng}/?token=${API_KEY}`);
    const data = await res.json();
    if (data.status === 'ok') {
      const aqi = parseInt(data.data.aqi, 10);
      // WAQI returns 'iaqi' for individual components. fallback to aqi if pm25 not explicitly present
      const pm25 = data.data.iaqi?.pm25?.v || aqi; 
      
      return {
        aqi: isNaN(aqi) ? 0 : aqi,
        pm25: isNaN(pm25) ? 0 : pm25,
        lastUpdated: new Date().toLocaleTimeString()
      };
    }
  } catch (e) {
    console.error("API Error", e);
  }
  return null;
}

// Helper to estimate traffic based on real AQI (Reverse correlation)
export const estimateTrafficFromAQI = (realAQI: number, baseTraffic: number) => {
    // Logic: If Real AQI is 200 and Base AQI is 100, Traffic is likely 1.5x - 2x normal
    // If Real AQI is 50, Traffic is likely low.
    
    // Clamp factor between 0.3 (Empty roads) and 2.5 (Gridlock)
    // We assume 100 AQI is a 'standard' baseline for moderate traffic
    const factor = Math.min(2.5, Math.max(0.3, realAQI / 100));
    return Math.floor(baseTraffic * factor);
}

export const generateCityData = (cityId: string, count: number = 24): TrafficDataPoint[] => {
  const city = INDIAN_CITIES.find(c => c.id === cityId) || INDIAN_CITIES[0];
  const data: TrafficDataPoint[] = [];
  
  // Current hour to shift the 'live' window
  const currentHour = new Date().getHours();
  
  for (let i = 0; i < count; i++) {
    // Generate data for the last 'count' hours, ending at current hour
    const hourIndex = (currentHour - (count - 1) + i + 24) % 24;
    const isPeak = (hourIndex >= 8 && hourIndex <= 11) || (hourIndex >= 17 && hourIndex <= 20);
    const isNight = hourIndex >= 23 || hourIndex <= 5;
    
    // Traffic Variation based on City Baseline
    let hourlyTraffic = city.baseTraffic;
    if (isPeak) hourlyTraffic *= 1.8; // Peak multiplier
    else if (isNight) hourlyTraffic *= 0.2; // Night multiplier
    else hourlyTraffic *= 0.9; // Day normal

    // Random daily variance
    hourlyTraffic += (Math.random() * 200 - 100);
    
    // Heavy Vehicle Ratio (Cities like Mumbai/Delhi have restrictive entry hours)
    let heavyRatio = isNight ? 0.40 : 0.10; 
    // Delhi specific: higher heavy vehicles at night
    if (city.id === 'delhi' && isNight) heavyRatio = 0.55;

    const heavyVehicleCount = Math.floor(hourlyTraffic * heavyRatio);
    const vehicleCount = Math.floor(hourlyTraffic);

    // Speed calculation (Inversely proportional to traffic density)
    // Formula: MaxSpeed - (Traffic / CapacityFactor)
    const capacity = 3000; 
    let avgSpeed = 60 - ((vehicleCount / capacity) * 50);
    avgSpeed = Math.max(5, avgSpeed + (Math.random() * 10 - 5));

    // AQI Calculation Logic
    // Base Pollution (City specific) + Traffic Contribution
    // Traffic Impact: Vehicles * EmissionFactor
    // Speed Impact: Slower speed = Higher emission (idling)
    
    const speedPenalty = avgSpeed < 15 ? 1.5 : 1.0; // Idling penalty
    
    let simulatedAQI = city.baseAQI * 0.4; // Background pollution (dust, industry)
    simulatedAQI += (vehicleCount * 0.05 * speedPenalty); // Car contribution
    simulatedAQI += (heavyVehicleCount * 0.35); // Truck contribution
    
    // Random weather factor
    simulatedAQI += (Math.random() * 20 - 10);

    data.push({
      id: i,
      timeSlot: `${String(hourIndex).padStart(2, '0')}:00`,
      vehicleCount,
      heavyVehicleCount,
      avgSpeed: Math.floor(avgSpeed),
      aqi: Math.floor(Math.max(30, simulatedAQI)),
      pm25: Math.floor(Math.max(15, simulatedAQI * 0.55))
    });
  }
  
  return data;
};

export const getCurrentCityStats = (cityId: string) => {
  const data = generateCityData(cityId, 1);
  return data[0];
};

// Initial Default
export const DEFAULT_CITY = INDIAN_CITIES[0];

// Export Dataset
export const DATASET = generateCityData(DEFAULT_CITY.id);