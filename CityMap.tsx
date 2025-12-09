import React, { useEffect, useRef, useState } from 'react';
import { INDIAN_CITIES, getCurrentCityStats, fetchRealAirQuality, estimateTrafficFromAQI } from '../services/dataService';
import { City, AQI_THRESHOLDS, TrafficDataPoint } from '../types';
import { MapPin, Wind, Car, Navigation, Layers, RefreshCw } from 'lucide-react';

// Declaration for Leaflet global
declare const L: any;

interface CityMapProps {
  selectedCity: City;
  onSelectCity: (city: City) => void;
}

const CityMap: React.FC<CityMapProps> = ({ selectedCity, onSelectCity }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const markersRef = useRef<{[key: string]: any}>({}); // Store markers by ID
  const [mapStats, setMapStats] = useState<TrafficDataPoint | null>(null);
  const [viewMode, setViewMode] = useState<'national' | 'city'>('national');
  const [hoveredInfo, setHoveredInfo] = useState<{name: string, aqi: number} | null>(null);
  const [realTimeData, setRealTimeData] = useState<{[key: string]: {aqi: number, pm25: number}}>({});
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  // Fetch real data for all initial cities
  const fetchAllCitiesData = async () => {
    setIsLoading(true);
    const newData: {[key: string]: {aqi: number, pm25: number}} = {};
    
    // Parallel fetch for better performance
    await Promise.all(INDIAN_CITIES.map(async (city) => {
       const data = await fetchRealAirQuality(city.lat, city.lng);
       if (data) {
           newData[city.id] = { aqi: data.aqi, pm25: data.pm25 };
       }
    }));
    
    setRealTimeData(prev => ({...prev, ...newData}));
    setLastUpdated(new Date().toLocaleTimeString());
    setIsLoading(false);
  };

  // Initial Fetch
  useEffect(() => {
     fetchAllCitiesData();
  }, []);

  // Initialize Map
  useEffect(() => {
    if (!mapRef.current) return;
    if (mapInstance.current) return; // Prevent double init

    // Default to Center of India
    const map = L.map(mapRef.current, {
        zoomControl: false,
        attributionControl: false
    }).setView([20.5937, 78.9629], 5);

    // Use OpenStreetMap tiles (Standard Look)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
    }).addTo(map);

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    mapInstance.current = map;

    // Map Click Handler for Area Selection
    map.on('click', (e: any) => {
        handleMapClick(e.latlng);
    });

    return () => {
      map.remove();
      mapInstance.current = null;
    };
  }, []);

  // Initialize/Update Markers
  useEffect(() => {
    if (!mapInstance.current) return;
    const map = mapInstance.current;

    INDIAN_CITIES.forEach(city => {
      // Get Real Data if available, else simulated
      const realData = realTimeData[city.id];
      const stats = getCurrentCityStats(city.id);
      const displayAQI = realData ? realData.aqi : stats.aqi;
      
      const color = getAQIColor(displayAQI);
      
      // Create or Update Marker
      if (markersRef.current[city.id]) {
          // Update existing marker icon color
          const marker = markersRef.current[city.id];
          const newIcon = createCustomIcon(color);
          marker.setIcon(newIcon);
          marker.setTooltipContent(`<b>${city.name}</b><br>Real AQI: ${displayAQI}`);
      } else {
          // Create new marker
          const customIcon = createCustomIcon(color);
          const marker = L.marker([city.lat, city.lng], { icon: customIcon })
            .addTo(map)
            .on('click', (e: any) => {
               L.DomEvent.stopPropagation(e); // Prevent map click
               handleCitySelect(city);
            })
            .on('mouseover', () => {
                setHoveredInfo({ name: city.name, aqi: displayAQI });
            })
            .on('mouseout', () => {
                setHoveredInfo(null);
            });

          marker.bindTooltip(`<b>${city.name}</b><br>Real AQI: ${displayAQI}`, { 
              direction: 'top',
              offset: [0, -10],
              opacity: 0.9
          });

          markersRef.current[city.id] = marker;
      }
    });

  }, [realTimeData]); // Re-run when real data updates

  const createCustomIcon = (color: string) => {
      return L.divIcon({
        className: 'custom-div-icon',
        html: `<div style="background-color: ${color}; width: 14px; height: 14px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 10px ${color};"></div>`,
        iconSize: [14, 14],
        iconAnchor: [7, 7]
      });
  };

  // Sync Map View with Selected City
  useEffect(() => {
      if(!mapInstance.current) return;
      if(selectedCity.id === 'custom_area') return; // Don't auto-move for custom clicks

      if (viewMode === 'city') {
          mapInstance.current.flyTo([selectedCity.lat, selectedCity.lng], 12, { duration: 1.5 });
          
          // Also update the Side Panel with real data for this city if we have it
          const realData = realTimeData[selectedCity.id];
          const baseStats = getCurrentCityStats(selectedCity.id);
          
          if (realData) {
              setMapStats({
                  ...baseStats,
                  aqi: realData.aqi,
                  pm25: realData.pm25,
                  vehicleCount: estimateTrafficFromAQI(realData.aqi, selectedCity.baseTraffic)
              });
          } else {
              setMapStats(baseStats);
          }
      }
  }, [selectedCity, viewMode, realTimeData]);


  const handleCitySelect = (city: City) => {
    setViewMode('city');
    onSelectCity(city);
  };

  const handleMapClick = async (latlng: any) => {
      if (mapInstance.current.getZoom() > 7) {
          const { lat, lng } = latlng;
          setIsLoading(true);

          // Fetch REAL data for this specific point
          const liveData = await fetchRealAirQuality(lat, lng);
          setIsLoading(false);

          let displayAQI = 0;
          let displayPM25 = 0;
          let trafficEstimate = 0;

          if (liveData) {
              displayAQI = liveData.aqi;
              displayPM25 = liveData.pm25;
              trafficEstimate = estimateTrafficFromAQI(liveData.aqi, 1500); // Assume 1500 base traffic for random spot
          } else {
              // Fallback to simulation if API fails or no station nearby
              const seed = lat + lng;
              displayAQI = 50 + Math.floor((seed * 5000) % 200);
              displayPM25 = Math.floor(displayAQI * 0.6);
              trafficEstimate = estimateTrafficFromAQI(displayAQI, 1500);
          }

          const customLocation: City = {
              id: 'custom_area',
              name: `Area (${lat.toFixed(3)}, ${lng.toFixed(3)})`,
              lat: lat,
              lng: lng,
              baseAQI: displayAQI,
              baseTraffic: trafficEstimate,
              description: "Custom selected location on map"
          };

          const color = getAQIColor(displayAQI);
          const selectionIcon = L.divIcon({
              className: 'selection-icon',
              html: `<div style="background-color: ${color}; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; animation: pulse 2s infinite;"></div>`,
              iconSize: [20, 20],
              iconAnchor: [10, 10]
          });
          
          L.marker([lat, lng], { icon: selectionIcon }).addTo(mapInstance.current);
          
          onSelectCity(customLocation);
          
          // Update side panel
          const dummyStats = getCurrentCityStats(INDIAN_CITIES[0].id);
          setMapStats({
              ...dummyStats,
              vehicleCount: trafficEstimate,
              aqi: displayAQI,
              pm25: displayPM25
          });
      }
  };

  const resetView = () => {
      setViewMode('national');
      mapInstance.current.flyTo([20.5937, 78.9629], 5, { duration: 1.5 });
  };

  const getAQIColor = (aqi: number) => {
    const threshold = AQI_THRESHOLDS.find(t => aqi <= t.limit) || AQI_THRESHOLDS[AQI_THRESHOLDS.length - 1];
    switch(threshold.category) {
      case 'Good': return '#10b981';
      case 'Satisfactory': return '#84cc16';
      case 'Moderate': return '#eab308';
      case 'Poor': return '#f97316';
      case 'Very Poor': return '#ef4444';
      default: return '#7f1d1d';
    }
  };

  // derived display stats
  const displayStats = mapStats || (selectedCity ? getCurrentCityStats(selectedCity.id) : null);
  const displayColor = displayStats ? getAQIColor(displayStats.aqi) : '#cbd5e1';

  return (
    <div className="relative w-full h-[500px] md:h-[600px] bg-slate-100 dark:bg-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 flex">
      
      {/* The Map Container */}
      <div ref={mapRef} className="w-full h-full z-0" />

      {/* Floating Control - Top Left */}
      <div className="absolute top-4 left-4 z-[400] flex flex-col gap-2">
        <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur p-4 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 max-w-xs">
            <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-500" />
                Live Traffic & AQI Map
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
               {viewMode === 'national' 
                 ? "Select a city marker to inspect regional data." 
                 : "Click anywhere on the map to analyze a specific local area."}
            </p>
            <div className="mt-2 flex items-center gap-2">
                <button 
                    onClick={fetchAllCitiesData}
                    className="p-1.5 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-emerald-100 text-slate-600 hover:text-emerald-600 transition-colors"
                    title="Refresh Live Data"
                >
                   <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
                </button>
                <span className="text-[10px] text-slate-400">Updated: {lastUpdated || '...'}</span>
            </div>
        </div>
        {viewMode === 'city' && (
            <button 
                onClick={resetView}
                className="flex items-center gap-2 px-3 py-2 bg-slate-800 text-white text-xs font-bold rounded-lg shadow hover:bg-slate-700 transition-colors w-fit"
            >
                <Navigation className="w-3 h-3" /> Back to National View
            </button>
        )}
      </div>

      {/* Floating Data Box - Side (Right) */}
      <div className="absolute top-4 right-4 z-[400] flex flex-col gap-3">
         {/* Live Hover/Selection Box */}
         <div className="w-64 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden animate-fade-in-up">
            <div className="h-2 w-full" style={{ backgroundColor: displayColor }}></div>
            <div className="p-4">
                <div className="flex justify-between items-start">
                    <div>
                        <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider">
                            {viewMode === 'national' ? 'Selected City' : 'Local Area'}
                        </h4>
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white truncate">
                            {selectedCity.name}
                        </h2>
                    </div>
                    <div className="text-right">
                        <span className="block text-2xl font-black" style={{ color: displayColor }}>
                            {displayStats?.aqi || '--'}
                        </span>
                        <span className="text-[10px] font-bold uppercase text-slate-400">Live AQI</span>
                    </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2">
                    <div className="bg-slate-50 dark:bg-slate-800 p-2 rounded-lg text-center">
                        <Car className="w-4 h-4 mx-auto text-blue-500 mb-1" />
                        <div className="text-sm font-bold text-slate-700 dark:text-slate-200">{displayStats?.vehicleCount || '--'}</div>
                        <div className="text-[10px] text-slate-400">Vehicles/hr (Est)</div>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800 p-2 rounded-lg text-center">
                        <Wind className="w-4 h-4 mx-auto text-emerald-500 mb-1" />
                        <div className="text-sm font-bold text-slate-700 dark:text-slate-200">{displayStats?.pm25 || '--'}</div>
                        <div className="text-[10px] text-slate-400">PM 2.5</div>
                    </div>
                </div>
            </div>
         </div>
         
         {/* Hover Tooltip (if hovering a different city) */}
         {hoveredInfo && hoveredInfo.name !== selectedCity.name && (
             <div className="bg-slate-900 text-white px-3 py-2 rounded-lg shadow-lg text-xs font-medium self-end animate-fade-in">
                 {hoveredInfo.name}: AQI {hoveredInfo.aqi}
             </div>
         )}
      </div>

    </div>
  );
};

export default CityMap;