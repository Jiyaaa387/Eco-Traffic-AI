import React, { useState, useEffect } from 'react';
import { predictAQI } from '../services/mlService';
import { PredictionInput, PredictionResult, City } from '../types';
import { Info, Zap, Truck, MapPin, Sliders } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface PredictorProps {
  city: City;
}

const Predictor: React.FC<PredictorProps> = ({ city }) => {
  // Initialize with city-specific defaults
  const [input, setInput] = useState<PredictionInput>({
    vehicleCount: city.baseTraffic,
    heavyVehicleRatio: 0.15,
    avgSpeed: 30,
    evAdoption: 0.05,
    isOddEvenPolicy: false,
  });

  // Update defaults when city changes
  useEffect(() => {
    setInput(prev => ({
        ...prev,
        vehicleCount: city.baseTraffic
    }));
  }, [city]);

  const [result, setResult] = useState<PredictionResult | null>(null);

  useEffect(() => {
    // We adjust the prediction logic slightly to account for the city's base AQI implicitly
    // In a real app, the predictAQI function would take the city ID.
    // Here we will rely on the generic model but understand the inputs are based on city context
    const res = predictAQI(input);
    setResult(res);
  }, [input]);

  const handleSliderChange = (key: keyof PredictionInput, value: number) => {
    setInput(prev => ({ ...prev, [key]: value }));
  };

  const GaugeChart = ({ value, max = 500 }: { value: number; max?: number }) => {
    const data = [
      { name: 'Value', value: Math.min(value, max) },
      { name: 'Remaining', value: Math.max(0, max - value) }
    ];
    // Color based on value
    const color = result?.color || '#cbd5e1';

    return (
      <div className="relative h-48 w-full flex justify-center items-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="70%"
              startAngle={180}
              endAngle={0}
              innerRadius={60}
              outerRadius={90}
              paddingAngle={0}
              dataKey="value"
              stroke="none"
            >
              <Cell fill={color} />
              <Cell fill="#e2e8f0" />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute bottom-6 flex flex-col items-center">
          <span className="text-4xl font-bold text-slate-800 dark:text-white">{value}</span>
          <span className="text-xs uppercase tracking-wider text-slate-500">Predicted AQI</span>
        </div>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in">
      
      {/* Control Panel */}
      <div className="lg:col-span-5 space-y-6">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2 mb-6 border-b border-slate-100 dark:border-slate-700 pb-4">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Sliders className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
                <h2 className="text-xl font-bold text-slate-800 dark:text-white">Simulation: {city.name}</h2>
                <p className="text-xs text-slate-500">Adjust parameters to see impact on {city.name}'s air quality.</p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Vehicle Count Slider */}
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Vehicle Volume</label>
                <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{input.vehicleCount} v/hr</span>
              </div>
              <input
                type="range"
                min="100"
                max={Math.max(3500, city.baseTraffic * 1.5)}
                step="50"
                value={input.vehicleCount}
                onChange={(e) => handleSliderChange('vehicleCount', parseInt(e.target.value))}
                className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <div className="flex justify-between text-xs text-slate-400 mt-1">
                <span>Light</span>
                <span>Gridlock ({Math.round(city.baseTraffic * 1.5)})</span>
              </div>
            </div>

            {/* Avg Speed Slider */}
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Avg Speed</label>
                <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{input.avgSpeed} km/h</span>
              </div>
              <input
                type="range"
                min="5"
                max="100"
                step="5"
                value={input.avgSpeed}
                onChange={(e) => handleSliderChange('avgSpeed', parseInt(e.target.value))}
                className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
              <div className="flex justify-between text-xs text-slate-400 mt-1">
                <span>Stalled</span>
                <span>Highway</span>
              </div>
            </div>

            {/* Heavy Vehicle % */}
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Heavy Vehicle Ratio</label>
                <span className="text-sm font-bold text-orange-600 dark:text-orange-400">{(input.heavyVehicleRatio * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="0.5"
                step="0.05"
                value={input.heavyVehicleRatio}
                onChange={(e) => handleSliderChange('heavyVehicleRatio', parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
              />
            </div>
          </div>
        </div>

        {/* Policy & EV Controls */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2 mb-6">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Zap className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">Mitigation Strategies</h2>
          </div>

          <div className="space-y-6">
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">EV Adoption</label>
                <span className="text-sm font-bold text-purple-600 dark:text-purple-400">{(input.evAdoption * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={input.evAdoption}
                onChange={(e) => handleSliderChange('evAdoption', parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Apply "Odd-Even" Policy</span>
              <button
                onClick={() => setInput(prev => ({ ...prev, isOddEvenPolicy: !prev.isOddEvenPolicy }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${input.isOddEvenPolicy ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${input.isOddEvenPolicy ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Results Panel */}
      <div className="lg:col-span-7 space-y-6">
        <div className="bg-white dark:bg-slate-800 p-8 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 h-full flex flex-col">
          <div className="flex justify-between items-start mb-4">
             <div>
               <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Prediction Model</h2>
               <div className="flex items-center gap-1.5 mt-1">
                 <MapPin className="w-3 h-3 text-slate-400" />
                 <p className="text-slate-500 text-sm font-medium">{city.name} Context</p>
               </div>
             </div>
             <div className="px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wide border" 
                  style={{ borderColor: result?.color, color: result?.color, backgroundColor: `${result?.color}15` }}>
               {result?.category}
             </div>
          </div>

          <div className="flex-grow flex flex-col justify-center items-center">
            <GaugeChart value={result?.predictedAQI || 0} />
            
            <p className="text-center text-slate-600 dark:text-slate-300 max-w-md mx-auto mt-4 text-lg">
              {result?.description}
            </p>

            <div className="mt-8 bg-slate-50 dark:bg-slate-700/50 p-6 rounded-lg w-full border border-slate-100 dark:border-slate-600">
              <div className="flex items-start gap-3">
                <Info className="w-6 h-6 text-blue-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-slate-800 dark:text-white mb-1">Impact Analysis</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {result?.impactAnalysis}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Predictor;