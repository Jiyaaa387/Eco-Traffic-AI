import React from 'react';
import { DATASET } from '../services/dataService';
import { Download, Database } from 'lucide-react';

const DatasetView: React.FC = () => {
  const downloadCSV = () => {
    const headers = ["TimeSlot", "VehicleCount", "HeavyVehicleCount", "AvgSpeed", "AQI", "PM2.5"];
    const rows = DATASET.map(d => [d.timeSlot, d.vehicleCount, d.heavyVehicleCount, d.avgSpeed, d.aqi, d.pm25]);
    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n" 
      + rows.map(e => e.join(",")).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "traffic_aqi_data.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex justify-between items-center bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-full">
            <Database className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Training Dataset</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              Synthetic data generated based on urban traffic patterns (N={DATASET.length})
            </p>
          </div>
        </div>
        <button 
          onClick={downloadCSV}
          className="flex items-center gap-2 px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg hover:opacity-90 transition-opacity font-medium text-sm"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-6 py-4">Time</th>
                <th className="px-6 py-4">Vehicles (hr)</th>
                <th className="px-6 py-4">Heavy Vehicles</th>
                <th className="px-6 py-4">Avg Speed (km/h)</th>
                <th className="px-6 py-4">PM 2.5</th>
                <th className="px-6 py-4 text-right">AQI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {DATASET.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                  <td className="px-6 py-3 font-medium text-slate-900 dark:text-white">{row.timeSlot}</td>
                  <td className="px-6 py-3 text-slate-600 dark:text-slate-300">{row.vehicleCount}</td>
                  <td className="px-6 py-3 text-slate-600 dark:text-slate-300">{row.heavyVehicleCount}</td>
                  <td className="px-6 py-3 text-slate-600 dark:text-slate-300">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${row.avgSpeed < 20 ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'}`}>
                      {row.avgSpeed}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-slate-600 dark:text-slate-300">{row.pm25}</td>
                  <td className="px-6 py-3 text-right">
                    <span className={`px-2 py-1 rounded-md font-bold text-xs text-white
                      ${row.aqi <= 50 ? 'bg-emerald-500' : 
                        row.aqi <= 100 ? 'bg-lime-500' :
                        row.aqi <= 200 ? 'bg-yellow-500' :
                        row.aqi <= 300 ? 'bg-orange-500' : 'bg-red-600'
                      }
                    `}>
                      {row.aqi}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DatasetView;