import React, { useMemo } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  ScatterChart, Scatter, ZAxis
} from 'recharts';
import { generateCityData } from '../services/dataService';
import { City } from '../types';
import { Activity, Wind, Car, AlertTriangle, MapPin } from 'lucide-react';

interface DashboardProps {
  city: City;
}

const Dashboard: React.FC<DashboardProps> = ({ city }) => {
  
  // Generate data specific to the selected city
  const cityData = useMemo(() => generateCityData(city.id), [city.id]);
  
  // Calculate some aggregate stats
  const avgAQI = Math.round(cityData.reduce((acc, curr) => acc + curr.aqi, 0) / cityData.length);
  const peakAQI = Math.max(...cityData.map(d => d.aqi));
  const peakTraffic = Math.max(...cityData.map(d => d.vehicleCount));
  const currentStat = cityData[cityData.length - 1]; // Latest hour

  const StatCard = ({ title, value, subtext, icon: Icon, colorClass }: any) => (
    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 transition-all hover:shadow-md">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
          <p className="text-2xl font-bold mt-1 text-slate-900 dark:text-white">{value}</p>
        </div>
        <div className={`p-3 rounded-full ${colorClass} bg-opacity-20`}>
          <Icon className={`w-6 h-6 ${colorClass.replace('bg-', 'text-')}`} />
        </div>
      </div>
      <p className="text-xs text-slate-500 mt-2">{subtext}</p>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <header className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <MapPin className="w-6 h-6 text-emerald-500" />
            {city.name} Analytics
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">Real-time traffic density vs AQI correlation analysis.</p>
        </div>
        <div className="hidden md:block text-right">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Current Status</span>
            <div className={`text-xl font-bold ${currentStat.aqi > 200 ? 'text-red-500' : 'text-emerald-500'}`}>
                AQI {currentStat.aqi}
            </div>
        </div>
      </header>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Average AQI" 
          value={avgAQI} 
          subtext="Past 24 hours average" 
          icon={Wind} 
          colorClass="bg-yellow-500 text-yellow-600" 
        />
        <StatCard 
          title="Peak Traffic" 
          value={`${peakTraffic} v/hr`} 
          subtext="Highest recorded density" 
          icon={Car} 
          colorClass="bg-blue-500 text-blue-600" 
        />
        <StatCard 
          title="Max AQI Spike" 
          value={peakAQI} 
          subtext="Occurred during peak rush" 
          icon={AlertTriangle} 
          colorClass="bg-red-500 text-red-600" 
        />
        <StatCard 
          title="Current Speed" 
          value={`${currentStat.avgSpeed} km/h`} 
          subtext="Avg network velocity" 
          icon={Activity} 
          colorClass="bg-emerald-500 text-emerald-600" 
        />
      </div>

      {/* Main Chart Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Line Chart: Temporal Trends */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold mb-6 text-slate-800 dark:text-white">24-Hour Trend: {city.name}</h3>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={cityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" vertical={false} opacity={0.3} />
                <XAxis 
                  dataKey="timeSlot" 
                  tick={{fontSize: 12, fill: '#64748b'}} 
                  interval={3}
                />
                <YAxis yAxisId="left" stroke="#ef4444" label={{ value: 'AQI', angle: -90, position: 'insideLeft', fill: '#ef4444' }} />
                <YAxis yAxisId="right" orientation="right" stroke="#3b82f6" label={{ value: 'Vehicles/hr', angle: 90, position: 'insideRight', fill: '#3b82f6' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                  labelStyle={{ color: '#1e293b', fontWeight: 'bold' }}
                />
                <Legend />
                <Line 
                  yAxisId="left" 
                  type="monotone" 
                  dataKey="aqi" 
                  stroke="#ef4444" 
                  strokeWidth={2} 
                  dot={false} 
                  activeDot={{ r: 6 }} 
                  name="AQI Level" 
                  animationDuration={1500}
                />
                <Line 
                  yAxisId="right" 
                  type="monotone" 
                  dataKey="vehicleCount" 
                  stroke="#3b82f6" 
                  strokeWidth={2} 
                  dot={false} 
                  name="Traffic Volume" 
                  animationDuration={1500}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Scatter Plot: Correlation */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold mb-2 text-slate-800 dark:text-white">Impact Analysis</h3>
          <p className="text-sm text-slate-500 mb-4">Correlation between vehicular density and AQI levels in {city.name}.</p>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis type="number" dataKey="vehicleCount" name="Vehicles" unit=" v/h" tick={{fontSize: 10}} domain={['auto', 'auto']} />
                <YAxis type="number" dataKey="aqi" name="AQI" unit="" tick={{fontSize: 10}} domain={['auto', 'auto']} />
                <ZAxis type="number" dataKey="heavyVehicleCount" range={[50, 400]} name="Heavy Vehicles" />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} 
                   content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white dark:bg-slate-700 p-2 border border-slate-200 dark:border-slate-600 rounded shadow-lg text-xs">
                          <p className="font-bold text-slate-800 dark:text-white">AQI: {data.aqi}</p>
                          <p className="text-slate-500 dark:text-slate-300">Traffic: {data.vehicleCount}</p>
                          <p className="text-slate-500 dark:text-slate-300">Speed: {data.avgSpeed} km/h</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Scatter name="Traffic vs AQI" data={cityData} fill="#10b981" fillOpacity={0.6} />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
            <h4 className="text-xs font-bold uppercase text-slate-400">Regional Insight</h4>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
              {city.name} baseline AQI is {city.baseAQI}. Traffic spikes contribute approx {Math.round((peakAQI - city.baseAQI)/peakAQI * 100)}% to pollution peaks.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;