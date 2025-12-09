import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import Predictor from './components/Predictor';
import DatasetView from './components/DatasetView';
import CityMap from './components/CityMap';
import { getModelMetrics } from './services/mlService';
import { DEFAULT_CITY } from './services/dataService';
import { City } from './types';
import { Brain, CheckCircle, Map as MapIcon, ChevronRight, LayoutDashboard } from 'lucide-react';

const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [darkMode, setDarkMode] = useState(false);
  const [selectedCity, setSelectedCity] = useState<City>(DEFAULT_CITY);

  // Toggle Dark Mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode(!darkMode);

  // Function to handle map selection and auto-scroll
  const handleCitySelection = (city: City) => {
      setSelectedCity(city);
      // Optional: Smooth scroll to stats
      // document.getElementById('analytics-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  const AboutView = () => {
    const metrics = getModelMetrics();
    return (
      <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <Brain className="w-8 h-8 text-emerald-400" />
              <h2 className="text-3xl font-bold">Model Architecture</h2>
            </div>
            <p className="text-slate-300 max-w-2xl leading-relaxed">
              This application uses a multivariate linear regression model to predict Air Quality Index (AQI) based on real-time traffic inputs. It demonstrates the direct correlation between congestion, vehicle types, and environmental health.
            </p>
          </div>
          <div className="absolute right-0 top-0 w-64 h-64 bg-emerald-500 blur-3xl opacity-10 rounded-full transform translate-x-1/3 -translate-y-1/3"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
            <p className="text-sm text-slate-500">Model Accuracy (R²)</p>
            <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{metrics.rSquared}</p>
          </div>
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
            <p className="text-sm text-slate-500">Mean Absolute Error</p>
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{metrics.mae}</p>
          </div>
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
            <p className="text-sm text-slate-500">Training Samples</p>
            <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">{metrics.trainingSize}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-8 rounded-xl border border-slate-200 dark:border-slate-700">
          <h3 className="text-xl font-bold mb-4 text-slate-800 dark:text-white">Formula logic</h3>
          <code className="block bg-slate-100 dark:bg-slate-900 p-4 rounded-lg text-slate-700 dark:text-slate-300 font-mono text-sm overflow-x-auto">
            AQI = β₀ + (β₁ × VehicleCount) + (β₂ × HeavyVehicles) - (β₃ × AvgSpeed) + ε
          </code>
          <div className="mt-6 space-y-3">
             <div className="flex items-start gap-3">
               <CheckCircle className="w-5 h-5 text-emerald-500 mt-0.5" />
               <p className="text-slate-600 dark:text-slate-300 text-sm"><strong>Low speeds</strong> (idling) drastically increase AQI due to incomplete combustion.</p>
             </div>
             <div className="flex items-start gap-3">
               <CheckCircle className="w-5 h-5 text-emerald-500 mt-0.5" />
               <p className="text-slate-600 dark:text-slate-300 text-sm"><strong>Heavy vehicles</strong> (diesel) contribute 6x more particulates than standard cars in this model.</p>
             </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen pb-12 bg-slate-50 dark:bg-slate-950">
      <Navbar currentTab={currentTab} setCurrentTab={setCurrentTab} darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        {/* Global Map Selector - The "Hero" Section */}
        {(currentTab === 'dashboard' || currentTab === 'predict') && (
          <div className="mb-8 animate-fade-in">
             <CityMap selectedCity={selectedCity} onSelectCity={handleCitySelection} />
          </div>
        )}

        {/* Dynamic Content Section */}
        <div id="analytics-section" className="scroll-mt-24 transition-all duration-500">
          
          {/* Section Header */}
          {(currentTab === 'dashboard' || currentTab === 'predict') && (
            <div className="flex items-center gap-2 mb-6 border-b border-slate-200 dark:border-slate-800 pb-4">
               <LayoutDashboard className="w-5 h-5 text-emerald-500" />
               <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                 Analytics: {selectedCity.name}
               </h2>
               <span className="text-xs px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full font-medium ml-2">Live Data</span>
            </div>
          )}

          {currentTab === 'dashboard' && <Dashboard city={selectedCity} />}
          {currentTab === 'predict' && <Predictor city={selectedCity} />}
          {currentTab === 'dataset' && <DatasetView />}
          {currentTab === 'about' && <AboutView />}
        </div>
      </main>
    </div>
  );
};

export default App;