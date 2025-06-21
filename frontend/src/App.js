import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './App.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Image URLs from vision expert
const IMAGES = {
  plasticPollution: "https://images.unsplash.com/photo-1632247620837-970aa94d2b99",
  plasticBottle: "https://images.unsplash.com/photo-1558640476-437a2b9438a2",
  marineLife: "https://images.unsplash.com/photo-1719754519931-0e5763a44d36",
  recyclingBins: "https://images.unsplash.com/photo-1611284446314-60a58ac0deb9",
  sustainability: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09",
  renewableEnergy: "https://images.pexels.com/photos/414837/pexels-photo-414837.jpeg",
  plasticFreePackaging: "https://images.unsplash.com/photo-1602340197834-ad96c1340839",
  coastalCleanup: "https://images.unsplash.com/photo-1618477388954-7852f32655ec"
};

// Animated Icons Component using CSS icons instead of emojis
const AnimatedIcon = ({ icon, className = "" }) => {
  const getIconClass = (iconType) => {
    const baseClass = "inline-block transition-all duration-300";
    switch(iconType) {
      case 'dashboard': return `${baseClass} dashboard-icon`;
      case 'location': return `${baseClass} location-icon`;
      case 'waste': return `${baseClass} waste-icon`;
      case 'feedback': return `${baseClass} feedback-icon`;
      case 'sun': return `${baseClass} sun-icon`;
      case 'moon': return `${baseClass} moon-icon`;
      case 'menu': return `${baseClass} menu-icon`;
      case 'map': return `${baseClass} map-icon`;
      case 'track': return `${baseClass} track-icon`;
      case 'chart': return `${baseClass} chart-icon`;
      case 'search': return `${baseClass} search-icon`;
      case 'plus': return `${baseClass} plus-icon`;
      case 'arrow': return `${baseClass} arrow-icon`;
      default: return baseClass;
    }
  };

  return <div className={`${getIconClass(icon)} ${className}`}></div>;
};

// SVG Icons Component
const SvgIcon = ({ name, className = "w-6 h-6", darkMode = false }) => {
  const iconColor = darkMode ? "#9CA3AF" : "#6B7280";
  
  const icons = {
    home: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
    map: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
      </svg>
    ),
    track: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    community: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
    profile: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
    search: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
    plus: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
      </svg>
    ),
    wind: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h1m4 0h1m-7-7h.01M19 8h.01M12 2v2m8.66 1.34l-1.42 1.42M21 12h-2m1.34 8.66l-1.42-1.42M12 21v-2m-8.66-1.34l1.42-1.42M3 12h2m1.34-8.66l1.42 1.42" />
      </svg>
    ),
    temperature: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
    volume: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M9 12H5a1 1 0 01-1-1V8a1 1 0 011-1h4l5-3v12l-5-3z" />
      </svg>
    ),
    tree: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2l3.09 6.26L22 9l-5 4.87L18.18 21 12 17.77 5.82 21 7 13.87 2 9l6.91-.74L12 2z" />
      </svg>
    ),
    sun: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
    moon: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
      </svg>
    ),
    menu: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    ),
    recycling: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
    )
  };

  return icons[name] || icons.home;
};

// Chart Component for displaying trends
const TrendChart = ({ data, height = "h-32", color = "stroke-teal-500", darkMode = false }) => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];
  const maxValue = Math.max(...data);
  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * 300;
    const y = 80 - (value / maxValue) * 60;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className={`${height} w-full relative`}>
      <svg className="w-full h-full" viewBox="0 0 300 80">
        <defs>
          <linearGradient id={`gradient-${color}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.3"/>
            <stop offset="100%" stopColor="currentColor" stopOpacity="0.0"/>
          </linearGradient>
        </defs>
        <path
          d={`M 0,80 L ${points} L 300,80 Z`}
          fill={`url(#gradient-${color})`}
          className="text-teal-200"
        />
        <polyline
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          points={points}
          className={color}
        />
      </svg>
      <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-gray-400 px-2">
        {months.map((month, index) => (
          <span key={index}>{month}</span>
        ))}
      </div>
    </div>
  );
};

// Environmental Overview Component
const EnvironmentalOverview = ({ darkMode }) => {
  const [environmentalData, setEnvironmentalData] = useState({
    airQuality: { value: 'Moderate', level: 75, color: 'text-yellow-500' },
    temperature: { value: '25°C', color: 'text-blue-500' },
    noiseLevel: { value: '45 dB', color: 'text-green-500' },
    weather: { value: 'Partly Cloudy', color: 'text-blue-400' },
    deforestation: { value: '10%', color: 'text-red-500' }
  });

  return (
    <div className="space-y-6">
      <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'} mb-6`}>
        Environmental Overview
      </h2>
      
      {/* Air Quality Section */}
      <div className="space-y-4">
        <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
          Air Quality
        </h3>
        
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-4 shadow-lg flex items-center space-x-4`}>
          <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
            <SvgIcon name="wind" className="w-6 h-6 text-blue-500" />
          </div>
          <div className="flex-1">
            <div className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              Air Quality Index (AQI)
            </div>
            <div className={environmentalData.airQuality.color}>
              {environmentalData.airQuality.value}
            </div>
          </div>
        </div>

        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-4 shadow-lg flex items-center space-x-4`}>
          <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
            <SvgIcon name="temperature" className="w-6 h-6 text-red-500" />
          </div>
          <div className="flex-1">
            <div className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              Temperature
            </div>
            <div className={environmentalData.temperature.color}>
              {environmentalData.temperature.value}
            </div>
          </div>
        </div>

        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-4 shadow-lg flex items-center space-x-4`}>
          <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
            <SvgIcon name="volume" className="w-6 h-6 text-green-500" />
          </div>
          <div className="flex-1">
            <div className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              Noise Level
            </div>
            <div className={environmentalData.noiseLevel.color}>
              {environmentalData.noiseLevel.value}
            </div>
          </div>
        </div>
      </div>

      {/* Weather Section */}
      <div className="space-y-4">
        <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
          Weather
        </h3>
        
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-4 shadow-lg flex items-center space-x-4`}>
          <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
            <SvgIcon name="sun" className="w-6 h-6 text-yellow-500" />
          </div>
          <div className="flex-1">
            <div className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              Weather Report
            </div>
            <div className={environmentalData.weather.color}>
              {environmentalData.weather.value}
            </div>
          </div>
        </div>
      </div>

      {/* Deforestation Section */}
      <div className="space-y-4">
        <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
          Deforestation
        </h3>
        
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-4 shadow-lg flex items-center space-x-4`}>
          <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
            <SvgIcon name="tree" className="w-6 h-6 text-green-600" />
          </div>
          <div className="flex-1">
            <div className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              Deforestation Rate
            </div>
            <div className={environmentalData.deforestation.color}>
              {environmentalData.deforestation.value}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Location Details Component
const LocationDetails = ({ location, darkMode }) => {
  const [selectedMetric, setSelectedMetric] = useState('plastic');
  
  if (!location) return null;

  const mockData = {
    plastic: [45, 52, 38, 65, 59, 80, 35],
    airQuality: [65, 59, 80, 81, 56, 85, 40],
    deforestation: [2.1, 2.3, 1.8, 2.7, 2.2, 2.8, 1.9]
  };

  const getMetricData = () => {
    switch(selectedMetric) {
      case 'plastic':
        return {
          title: 'Plastic Waste Levels',
          value: '120',
          unit: 'tons',
          change: '-15%',
          changeColor: 'text-green-500',
          data: mockData.plastic
        };
      case 'airQuality':
        return {
          title: 'Air Quality Index',
          value: '55',
          unit: 'AQI',
          change: '+5%',
          changeColor: 'text-red-500',
          data: mockData.airQuality
        };
      case 'deforestation':
        return {
          title: 'Deforestation Rate',
          value: '2.5',
          unit: '%',
          change: '-10%',
          changeColor: 'text-green-500',
          data: mockData.deforestation
        };
      default:
        return mockData.plastic;
    }
  };

  const metricData = getMetricData();

  return (
    <div className="space-y-6">
      {/* Header with background image */}
      <div className="relative h-48 rounded-xl overflow-hidden">
        <img 
          src={IMAGES.coastalCleanup} 
          alt="Coastal Cleanup" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
        <div className="absolute bottom-4 left-4 text-white">
          <h1 className="text-2xl font-bold">Coastal Cleanup</h1>
        </div>
      </div>

      {/* Metric Selection Tabs */}
      <div className="flex space-x-4 mb-6">
        {[
          { key: 'plastic', label: 'Plastic Waste' },
          { key: 'airQuality', label: 'Air Quality' },
          { key: 'deforestation', label: 'Deforestation' }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setSelectedMetric(tab.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedMetric === tab.key
                ? 'bg-teal-500 text-white'
                : darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Selected Metric Display */}
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 shadow-lg`}>
        <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-800'} mb-4`}>
          {metricData.title}
        </h3>
        
        <div className="flex items-end space-x-2 mb-2">
          <span className={`text-4xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            {metricData.value}
          </span>
          <span className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {metricData.unit}
          </span>
        </div>
        
        <div className="flex items-center space-x-2 mb-6">
          <span className="text-sm text-teal-500">Last 12 Months</span>
          <span className={`text-sm font-medium ${metricData.changeColor}`}>
            {metricData.change}
          </span>
        </div>

        {/* Trend Chart */}
        <TrendChart data={metricData.data} darkMode={darkMode} />
      </div>
    </div>
  );
};

// Plastic Tracker Component
const PlasticTracker = ({ darkMode }) => {
  const weeklyData = [20, 35, 80, 65, 25, 15, 10];
  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div className="space-y-6">
      <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'} mb-6`}>
        Plastic Tracker
      </h2>

      {/* Weekly Progress */}
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 shadow-lg`}>
        <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-800'} mb-4`}>
          Weekly Progress
        </h3>
        
        <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-4 mb-6`}>
          <div className="flex items-end space-x-2 mb-2">
            <span className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              150g
            </span>
          </div>
          <span className="text-sm text-teal-500">Last 7 Days</span>
          
          {/* Bar Chart */}
          <div className="flex items-end justify-between mt-6 h-32">
            {weeklyData.map((value, index) => (
              <div key={index} className="flex flex-col items-center space-y-2">
                <div 
                  className="bg-teal-200 rounded-t relative"
                  style={{ 
                    height: `${(value / Math.max(...weeklyData)) * 100}px`,
                    width: '24px'
                  }}
                >
                  <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs text-gray-500">
                    {value}
                  </div>
                </div>
                <span className="text-xs text-teal-500">{weekDays[index]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Monthly Overview */}
      <div className="grid grid-cols-2 gap-4">
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 shadow-lg`}>
          <h4 className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-2`}>
            Total Plastic Used
          </h4>
          <span className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            600g
          </span>
        </div>
        
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 shadow-lg`}>
          <h4 className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-2`}>
            Plastic Recycled
          </h4>
          <span className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            250g
          </span>
        </div>
      </div>

      {/* Yearly Trends */}
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 shadow-lg`}>
        <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-800'} mb-4`}>
          Yearly Trends
        </h3>
        
        <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-4`}>
          <div className="flex items-end space-x-2 mb-2">
            <span className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              2kg
            </span>
          </div>
          <span className="text-sm text-teal-500 mb-4 block">Last 12 Months</span>
          
          <TrendChart data={[45, 65, 55, 40, 60, 80, 70]} darkMode={darkMode} />
        </div>
      </div>
    </div>
  );
};

// Interactive Map Component
const InteractiveMap = ({ darkMode, onLocationSelect }) => {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <SvgIcon name="search" className="w-5 h-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search for a location"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={`w-full pl-10 pr-4 py-3 rounded-xl border-0 shadow-lg ${
            darkMode 
              ? 'bg-gray-800 text-white placeholder-gray-400' 
              : 'bg-white text-gray-900 placeholder-gray-500'
          } focus:ring-2 focus:ring-teal-500 focus:outline-none`}
        />
      </div>

      {/* Map Container */}
      <div className="relative h-96 bg-teal-400 rounded-xl overflow-hidden shadow-lg">
        {/* Simplified world map representation */}
        <div className="absolute inset-0 bg-gradient-to-b from-teal-300 to-teal-500">
          {/* Africa representation */}
          <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 w-20 h-24 bg-white opacity-80 rounded-lg">
            {/* Uganda marker */}
            <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
          </div>
          
          {/* Other continents */}
          <div className="absolute top-1/4 left-1/4 w-16 h-20 bg-white opacity-60 rounded-lg"></div>
          <div className="absolute top-1/2 right-1/4 w-24 h-16 bg-white opacity-60 rounded-lg"></div>
        </div>

        {/* Map Controls */}
        <div className="absolute top-4 right-4 flex flex-col space-y-2">
          <button className="w-10 h-10 bg-white rounded-lg shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors">
            <SvgIcon name="plus" className="w-5 h-5 text-gray-600" />
          </button>
          <button className="w-10 h-10 bg-white rounded-lg shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors">
            <span className="text-gray-600 font-bold">−</span>
          </button>
        </div>

        {/* Location Button */}
        <div className="absolute bottom-4 right-4">
          <button className="w-12 h-12 bg-white rounded-lg shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors">
            <SvgIcon name="map" className="w-6 h-6 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Add Location Button */}
      <button className="w-16 h-16 bg-teal-500 rounded-2xl shadow-lg flex items-center justify-center hover:bg-teal-600 transition-colors ml-auto">
        <SvgIcon name="plus" className="w-8 h-8 text-white" />
      </button>
    </div>
  );
};

// Feedback Section Component
const FeedbackSection = ({ darkMode }) => {
  return (
    <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6`}>
      <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'} mb-4 flex items-center gap-2`}>
        💬 Share Your Feedback
      </h3>
      <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-6`}>
        Help us improve plastic waste management in Uganda. Your insights are valuable for creating better environmental solutions.
      </p>
      
      {/* Embedded Google Form */}
      <div className="relative w-full h-96 rounded-lg overflow-hidden border">
        <iframe 
          src="https://forms.gle/bydjhF48JpRdhAcp9"
          className="w-full h-full"
          frameBorder="0" 
          marginHeight="0" 
          marginWidth="0"
          title="Feedback Form"
        >
          Loading feedback form...
        </iframe>
        
        {/* Fallback content - shows when iframe doesn't load */}
        <div className={`absolute inset-0 flex items-center justify-center ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} bg-opacity-95`}>
          <div className="text-center p-6">
            <div className="text-4xl mb-4">💬</div>
            <h4 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-800'} mb-2`}>
              Community Feedback Form
            </h4>
            <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-4`}>
              Share your thoughts on waste management in your area and help us improve our environmental solutions.
            </p>
            <a 
              href="https://forms.gle/bydjhF48JpRdhAcp9"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-gradient-to-r from-blue-500 to-green-500 text-white px-6 py-3 rounded-lg hover:from-blue-600 hover:to-green-600 transition-all shadow-lg flex items-center gap-2"
            >
              <span>💬</span>
              Open Feedback Form
            </a>
            <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} mt-3`}>
              Opens in a new tab • Takes 2-3 minutes to complete
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Bottom Navigation Component
const BottomNavigation = ({ activeTab, onTabChange, darkMode }) => {
  const tabs = [
    { key: 'home', label: 'Home', icon: 'home' },
    { key: 'track', label: 'Track', icon: 'track' },
    { key: 'map', label: 'Map', icon: 'map' },
    { key: 'community', label: 'Community', icon: 'community' },
    { key: 'profile', label: 'Profile', icon: 'profile' }
  ];

  return (
    <div className={`fixed bottom-0 left-0 right-0 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-t px-4 py-2 safe-area-pb`}>
      <div className="flex justify-around items-center max-w-md mx-auto">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => onTabChange(tab.key)}
            className={`flex flex-col items-center space-y-1 p-2 rounded-lg transition-colors ${
              activeTab === tab.key
                ? 'text-teal-500'
                : darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <SvgIcon name={tab.icon} className="w-6 h-6" />
            <span className="text-xs font-medium">{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

// Main App Component
const App = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch functions
  const fetchLocations = useCallback(async () => {
    try {
      const response = await axios.get(`${API}/locations`);
      setLocations(response.data);
      
      if (response.data.length === 0) {
        await axios.post(`${API}/initialize-uganda-locations`);
        const ugandaResponse = await axios.get(`${API}/locations`);
        setLocations(ugandaResponse.data);
      }
    } catch (error) {
      console.error('Error fetching locations:', error);
    }
  }, []);

  const handleLocationSelect = (locationId) => {
    const location = locations.find(l => l.id === locationId);
    setSelectedLocation(location);
  };

  // Initial data fetch
  useEffect(() => {
    fetchLocations();
  }, [fetchLocations]);

  // Render content based on active tab
  const renderContent = () => {
    switch(activeTab) {
      case 'home':
        return <EnvironmentalOverview darkMode={darkMode} />;
      case 'track':
        return <PlasticTracker darkMode={darkMode} />;
      case 'map':
        return selectedLocation 
          ? <LocationDetails location={selectedLocation} darkMode={darkMode} />
          : <InteractiveMap darkMode={darkMode} onLocationSelect={handleLocationSelect} />;
      case 'community':
        return <FeedbackSection darkMode={darkMode} />;
      case 'profile':
        return (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">👤</div>
            <h3 className={`text-xl ${darkMode ? 'text-white' : 'text-gray-800'} mb-2`}>Profile</h3>
            <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Coming soon...</p>
          </div>
        );
      default:
        return <EnvironmentalOverview darkMode={darkMode} />;
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 pb-20 ${
      darkMode 
        ? 'bg-gray-900' 
        : 'bg-gray-50'
    }`}>
      {/* Header */}
      <header className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b px-4 py-4 safe-area-pt transition-colors duration-300`}>
        <div className="flex items-center justify-between max-w-md mx-auto">
          <button className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
            <SvgIcon name="menu" className="w-6 h-6" />
          </button>
          
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-teal-500 to-green-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">🌍</span>
            </div>
            <h1 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              EcoWatch
            </h1>
          </div>
          
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`p-2 rounded-lg transition-all duration-300 ${
              darkMode 
                ? 'text-yellow-400 hover:bg-gray-700' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <SvgIcon name={darkMode ? 'sun' : 'moon'} className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-6 max-w-md mx-auto">
        {renderContent()}
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
        darkMode={darkMode} 
      />
    </div>
  );
};

export default App;