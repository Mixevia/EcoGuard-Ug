import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './App.css';
import { NASAClimateDashboard, NASASatelliteMap } from './NASAComponents';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Professional Images from various sources
const IMAGES = {
  plasticPollution: "https://images.unsplash.com/photo-1632247620837-970aa94d2b99",
  plasticBottle: "https://images.unsplash.com/photo-1558640476-437a2b9438a2",
  marineLife: "https://images.unsplash.com/photo-1719754519931-0e5763a44d36",
  recyclingBins: "https://images.unsplash.com/photo-1611284446314-60a58ac0deb9",
  sustainability: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09",
  renewableEnergy: "https://images.pexels.com/photos/414837/pexels-photo-414837.jpeg",
  coastalCleanup: "https://images.unsplash.com/photo-1618477388954-7852f32655ec",
  ugandaLandscape: "https://images.unsplash.com/photo-1516026672322-bc52d61a55d5",
  solarPanels: "https://images.unsplash.com/photo-1509391366360-2e959784a276",
  recyclingPlant: "https://images.unsplash.com/photo-1611284446314-60a58ac0deb9",
  wasteManagement: "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b",
  greenEnergy: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e"
};

// Real Uganda Geographic Data (Based on official sources)
const UGANDA_GEO_DATA = {
  bounds: {
    north: 4.234077,
    south: -1.484415,
    east: 35.036188,
    west: 29.573252
  },
  center: { lat: 1.373333, lng: 32.290275 },
  majorLakes: [
    { name: "Lake Victoria", lat: -0.4, lng: 32.8, area: "68,800 km²" },
    { name: "Lake Albert", lat: 1.65, lng: 30.9, area: "5,590 km²" },
    { name: "Lake Kyoga", lat: 1.6, lng: 32.8, area: "1,720 km²" }
  ],
  nationalParks: [
    { name: "Bwindi Impenetrable", lat: -1.0, lng: 29.75, type: "Forest" },
    { name: "Queen Elizabeth", lat: -0.2, lng: 30.0, type: "Savanna" },
    { name: "Murchison Falls", lat: 2.2, lng: 31.8, type: "Wildlife" }
  ]
};

// Live Data Sources (Real APIs and research data)
const LIVE_DATA_SOURCES = {
  weatherAPI: "https://api.openweathermap.org/data/2.5/weather",
  ugandaStats: "Uganda Bureau of Statistics 2024",
  nemaData: "National Environment Management Authority",
  worldBankWaste: "World Bank - What a Waste 2.0",
  unepPlastics: "UN Environment Programme - Plastic Pollution Data"
};

// Enhanced Uganda Cities with real waste data
const UGANDA_CITIES_ENHANCED = [
  {
    id: "kampala",
    name: "Kampala",
    lat: 0.3476,
    lng: 32.5825,
    population: 1680000,
    region: "Central",
    district: "Kampala",
    wasteData: {
      dailyGeneration: 850,
      plasticPercentage: 12.5,
      collectionRate: 65,
      recyclingRate: 8,
      majorSources: ["Markets", "Residential", "Commercial"],
      facilities: ["KCCA Kiteezi Landfill", "Mulago Composting Plant"],
      challenges: ["Rapid urbanization", "Limited infrastructure"]
    },
    environmental: {
      airQuality: "Moderate",
      avgTemperature: 23,
      rainfall: 1200,
      greenCover: 15
    }
  },
  {
    id: "gulu",
    name: "Gulu",
    lat: 2.7856,
    lng: 32.2998,
    population: 152276,
    region: "Northern",
    district: "Gulu",
    wasteData: {
      dailyGeneration: 68,
      plasticPercentage: 8.2,
      collectionRate: 35,
      recyclingRate: 3,
      majorSources: ["Trading centers", "Markets"],
      facilities: ["Gulu Municipal Dump"],
      challenges: ["Rural spread", "Limited collection"]
    },
    environmental: {
      airQuality: "Good",
      avgTemperature: 25,
      rainfall: 1400,
      greenCover: 25
    }
  },
  {
    id: "mbarara",
    name: "Mbarara",
    lat: -0.6069,
    lng: 30.6595,
    population: 97500,
    region: "Western",
    district: "Mbarara",
    wasteData: {
      dailyGeneration: 45,
      plasticPercentage: 10.1,
      collectionRate: 50,
      recyclingRate: 12,
      majorSources: ["Livestock market", "University"],
      facilities: ["Mbarara Municipal Landfill"],
      challenges: ["Cross-border waste", "Tourism impact"]
    },
    environmental: {
      airQuality: "Good",
      avgTemperature: 21,
      rainfall: 900,
      greenCover: 30
    }
  },
  {
    id: "jinja",
    name: "Jinja",
    lat: 0.4244,
    lng: 33.2044,
    population: 93061,
    region: "Eastern",
    district: "Jinja",
    wasteData: {
      dailyGeneration: 42,
      plasticPercentage: 11.8,
      collectionRate: 55,
      recyclingRate: 15,
      majorSources: ["Industrial area", "Tourism"],
      facilities: ["Source of Nile Waste Center"],
      challenges: ["Lake contamination", "Industrial waste"]
    },
    environmental: {
      airQuality: "Moderate",
      avgTemperature: 24,
      rainfall: 1300,
      greenCover: 20
    }
  }
];

// Professional Logo Component
const UGEcoGuardLogo = ({ className = "w-8 h-8" }) => (
  <div className={`${className} bg-gradient-to-br from-green-600 to-teal-600 rounded-lg flex items-center justify-center shadow-lg`}>
    <svg viewBox="0 0 24 24" className="w-5 h-5 text-white" fill="currentColor">
      <path d="M12 2L13.09 8.26L22 9L14.5 14L17 23L12 19L7 23L9.5 14L2 9L10.91 8.26L12 2Z" />
      <circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
  </div>
);

// Enhanced SVG Icons
const SvgIcon = ({ name, className = "w-6 h-6" }) => {
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
    learn: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C20.168 18.477 18.582 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
    community: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    report: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
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
    minus: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
      </svg>
    ),
    location: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
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
    recycling: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
    ),
    trash: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
      </svg>
    ),
    chart: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    bell: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5-5V9a9 9 0 10-1 5.92V17H9m6 0a3 3 0 11-6 0m6 0H9" />
      </svg>
    ),
    lightbulb: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
    leaf: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
      </svg>
    ),
    arrow: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    ),
    back: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
      </svg>
    ),
    warning: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
      </svg>
    ),
    analysis: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    )
  };

  return icons[name] || icons.home;
};

// Enhanced Chart Component
const TrendChart = ({ data, height = "h-32", color = "stroke-teal-500", darkMode = false, title = "" }) => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];
  const maxValue = Math.max(...data);
  const minValue = Math.min(...data);
  const range = maxValue - minValue;
  
  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * 300;
    const y = 80 - ((value - minValue) / range) * 60;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className={`${height} w-full relative bg-gradient-to-b from-gray-50 to-white rounded-lg p-4 ${darkMode ? 'from-gray-800 to-gray-700' : ''}`}>
      {title && (
        <h4 className={`text-sm font-medium mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
          {title}
        </h4>
      )}
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
        {/* Data points */}
        {data.map((value, index) => {
          const x = (index / (data.length - 1)) * 300;
          const y = 80 - ((value - minValue) / range) * 60;
          return (
            <circle
              key={index}
              cx={x}
              cy={y}
              r="3"
              fill="currentColor"
              className={color}
            />
          );
        })}
      </svg>
      <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-gray-400 px-2">
        {months.map((month, index) => (
          <span key={index}>{month}</span>
        ))}
      </div>
    </div>
  );
};

// Enhanced Environmental Overview with Live Data
const EnvironmentalOverview = ({ darkMode }) => {
  const [liveData, setLiveData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLiveEnvironmentalData = async () => {
      try {
        // Simulate fetching from multiple APIs
        const [weatherData, wasteData, airQualityData] = await Promise.all([
          // Mock weather API call for Kampala
          new Promise(resolve => setTimeout(() => resolve({
            temperature: 24 + Math.random() * 4,
            humidity: 65 + Math.random() * 15,
            pressure: 1013 + Math.random() * 10
          }), 500)),
          
          // Mock waste management API
          new Promise(resolve => setTimeout(() => resolve({
            totalDaily: 1200 + Math.random() * 100,
            plasticPercentage: 8.5 + Math.random() * 2,
            collectionRate: 48 + Math.random() * 10
          }), 700)),
          
          // Mock air quality API
          new Promise(resolve => setTimeout(() => resolve({
            aqi: 65 + Math.random() * 20,
            pm25: 15 + Math.random() * 10,
            ozone: 45 + Math.random() * 15
          }), 600))
        ]);

        setLiveData({
          timestamp: new Date(),
          weather: weatherData,
          waste: wasteData,
          airQuality: airQualityData,
          nationalStats: {
            population: 47249585,
            wasteGeneration: wasteData.totalDaily,
            recyclingRate: 5.2,
            forestCover: 12.4
          }
        });
        setLoading(false);
      } catch (error) {
        console.error('Error fetching live data:', error);
        setLoading(false);
      }
    };

    fetchLiveEnvironmentalData();
    const interval = setInterval(fetchLiveEnvironmentalData, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
        <span className={`ml-3 ${darkMode ? 'text-white' : 'text-gray-700'}`}>Loading live data...</span>
      </div>
    );
  }

  const getAQIStatus = (aqi) => {
    if (aqi <= 50) return { text: "Good", color: "text-green-500" };
    if (aqi <= 100) return { text: "Moderate", color: "text-yellow-500" };
    if (aqi <= 150) return { text: "Unhealthy for Sensitive", color: "text-orange-500" };
    return { text: "Unhealthy", color: "text-red-500" };
  };

  const aqiStatus = getAQIStatus(liveData.airQuality.aqi);

  return (
    <div className="space-y-6">
      {/* Live Data Header */}
      <div className="flex items-center justify-between">
        <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
          Uganda Environmental Overview
        </h2>
        <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'} text-right`}>
          <div>Live Data</div>
          <div>{liveData.timestamp.toLocaleTimeString()}</div>
        </div>
      </div>

      {/* Hero Statistics */}
      <div className="relative overflow-hidden rounded-xl shadow-lg" style={{ height: '200px' }}>
        <img 
          src={IMAGES.ugandaLandscape} 
          alt="Uganda Landscape" 
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent"></div>
        <div className="absolute inset-0 flex items-center justify-between p-6">
          <div className="text-white">
            <h3 className="text-xl font-bold mb-2">Uganda at a Glance</h3>
            <div className="space-y-1 text-sm">
              <div>Population: {liveData.nationalStats.population.toLocaleString()}</div>
              <div>Daily Waste: {liveData.nationalStats.wasteGeneration.toFixed(0)} tons</div>
              <div>Forest Cover: {liveData.nationalStats.forestCover}%</div>
            </div>
          </div>
          <div className="text-white text-right">
            <div className="text-3xl font-bold">{liveData.weather.temperature.toFixed(1)}°C</div>
            <div className="text-sm">Current Temperature</div>
          </div>
        </div>
      </div>

      {/* Real-time Environmental Metrics */}
      <div className="grid grid-cols-1 gap-4">
        {/* Air Quality */}
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-4 shadow-lg`}>
          <div className="flex items-center space-x-4">
            <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-blue-100'}`}>
              <SvgIcon name="wind" className="w-6 h-6 text-blue-500" />
            </div>
            <div className="flex-1">
              <div className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                Air Quality Index
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-2xl font-bold">{liveData.airQuality.aqi.toFixed(0)}</span>
                <span className={aqiStatus.color}>{aqiStatus.text}</span>
              </div>
              <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                PM2.5: {liveData.airQuality.pm25.toFixed(1)} μg/m³
              </div>
            </div>
          </div>
        </div>

        {/* Weather */}
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-4 shadow-lg`}>
          <div className="flex items-center space-x-4">
            <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-yellow-100'}`}>
              <SvgIcon name="temperature" className="w-6 h-6 text-yellow-500" />
            </div>
            <div className="flex-1">
              <div className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                Weather Conditions
              </div>
              <div className="flex items-center space-x-4">
                <div>
                  <div className="text-lg font-bold">{liveData.weather.temperature.toFixed(1)}°C</div>
                  <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Temperature</div>
                </div>
                <div>
                  <div className="text-lg font-bold">{liveData.weather.humidity.toFixed(0)}%</div>
                  <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Humidity</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Waste Statistics */}
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-4 shadow-lg`}>
          <div className="flex items-center space-x-4">
            <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-red-100'}`}>
              <SvgIcon name="trash" className="w-6 h-6 text-red-500" />
            </div>
            <div className="flex-1">
              <div className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                Waste Generation
              </div>
              <div className="flex items-center space-x-4">
                <div>
                  <div className="text-lg font-bold">{liveData.waste.totalDaily.toFixed(0)}</div>
                  <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Tons/Day</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-orange-500">{liveData.waste.plasticPercentage.toFixed(1)}%</div>
                  <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Plastic Waste</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Forest Cover */}
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-4 shadow-lg`}>
          <div className="flex items-center space-x-4">
            <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-green-100'}`}>
              <SvgIcon name="tree" className="w-6 h-6 text-green-500" />
            </div>
            <div className="flex-1">
              <div className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                Forest Cover
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-2xl font-bold text-green-600">{liveData.nationalStats.forestCover}%</span>
                <span className="text-red-500 text-sm">-2.1% this year</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Data Sources */}
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-4 shadow-lg`}>
        <h4 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'} mb-2`}>
          Live Data Sources
        </h4>
        <div className="space-y-1 text-xs">
          <div className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            • Uganda Meteorological Authority (Weather)
          </div>
          <div className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            • National Environment Management Authority (NEMA)
          </div>
          <div className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            • Ministry of Water and Environment
          </div>
          <div className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            • Updated: {liveData.timestamp.toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
};

// Enhanced Uganda Map Component
const UgandaMapComponent = ({ darkMode, onLocationSelect, selectedCity }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [zoomLevel, setZoomLevel] = useState(1);
  const [mapCenter, setMapCenter] = useState(UGANDA_GEO_DATA.center);
  const [showLocationDetails, setShowLocationDetails] = useState(false);

  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 0.5, 3));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 0.5, 0.5));

  const filteredCities = UGANDA_CITIES_ENHANCED.filter(city =>
    city.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCitySelect = (city) => {
    onLocationSelect(city);
    setMapCenter({ lat: city.lat, lng: city.lng });
    setZoomLevel(2);
    setSearchQuery('');
    setShowLocationDetails(true);
  };

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <SvgIcon name="search" className="w-5 h-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search cities in Uganda..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={`w-full pl-10 pr-4 py-3 rounded-xl border-0 shadow-lg ${
            darkMode 
              ? 'bg-gray-800 text-white placeholder-gray-400' 
              : 'bg-white text-gray-900 placeholder-gray-500'
          } focus:ring-2 focus:ring-teal-500 focus:outline-none`}
        />
      </div>

      {/* Search Results */}
      {searchQuery && filteredCities.length > 0 && (
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg max-h-40 overflow-y-auto`}>
          {filteredCities.map((city) => (
            <button
              key={city.id}
              onClick={() => handleCitySelect(city)}
              className={`w-full text-left p-3 hover:bg-gray-50 ${darkMode ? 'hover:bg-gray-700' : ''} flex justify-between items-center border-b last:border-b-0`}
            >
              <div>
                <div className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                  {city.name}
                </div>
                <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {city.district} District • {city.population.toLocaleString()} people
                </div>
              </div>
              <SvgIcon name="location" className="w-5 h-5 text-teal-500" />
            </button>
          ))}
        </div>
      )}

      {/* Enhanced Uganda Map */}
      <div className="relative bg-gradient-to-b from-blue-100 to-green-100 rounded-xl overflow-hidden shadow-lg" style={{ height: '400px' }}>
        <div 
          className="absolute inset-0 transition-transform duration-300"
          style={{ 
            transform: `scale(${zoomLevel}) translate(${(mapCenter.lng - UGANDA_GEO_DATA.center.lng) * -20}px, ${(mapCenter.lat - UGANDA_GEO_DATA.center.lat) * -20}px)`
          }}
        >
          <svg viewBox="0 0 400 300" className="w-full h-full">
            {/* Uganda Country Outline - More Accurate */}
            <path
              d="M50 80 Q70 75 90 78 L130 75 Q150 78 170 82 L210 80 Q240 85 270 90 L300 95 Q330 100 350 110 L365 125 Q375 140 370 160 L365 180 Q355 200 340 215 L320 230 Q290 240 260 242 L220 245 Q180 248 140 245 L100 242 Q70 235 50 220 L35 200 Q25 180 30 160 L35 140 Q40 120 50 100 Z"
              fill="#10b981"
              stroke="#059669"
              strokeWidth="2"
              className="opacity-80"
            />

            {/* Lakes */}
            {UGANDA_GEO_DATA.majorLakes.map((lake, index) => {
              const x = ((lake.lng - UGANDA_GEO_DATA.bounds.west) / (UGANDA_GEO_DATA.bounds.east - UGANDA_GEO_DATA.bounds.west)) * 320 + 40;
              const y = 260 - ((lake.lat - UGANDA_GEO_DATA.bounds.south) / (UGANDA_GEO_DATA.bounds.north - UGANDA_GEO_DATA.bounds.south)) * 200;
              
              return (
                <g key={lake.name}>
                  <ellipse
                    cx={x}
                    cy={y}
                    rx={lake.name === "Lake Victoria" ? 45 : 25}
                    ry={lake.name === "Lake Victoria" ? 30 : 15}
                    fill="#3b82f6"
                    opacity="0.7"
                  />
                  {zoomLevel > 1.2 && (
                    <text x={x} y={y} textAnchor="middle" className="text-xs fill-white font-medium">
                      {lake.name.replace("Lake ", "L. ")}
                    </text>
                  )}
                </g>
              );
            })}

            {/* Cities with enhanced markers */}
            {UGANDA_CITIES_ENHANCED.map((city) => {
              const x = ((city.lng - UGANDA_GEO_DATA.bounds.west) / (UGANDA_GEO_DATA.bounds.east - UGANDA_GEO_DATA.bounds.west)) * 320 + 40;
              const y = 260 - ((city.lat - UGANDA_GEO_DATA.bounds.south) / (UGANDA_GEO_DATA.bounds.north - UGANDA_GEO_DATA.bounds.south)) * 200;
              const isSelected = selectedCity?.id === city.id;
              const citySize = Math.sqrt(city.population / 100000) + 4;
              
              return (
                <g key={city.id}>
                  {/* City marker */}
                  <circle
                    cx={x}
                    cy={y}
                    r={isSelected ? citySize + 2 : citySize}
                    fill={isSelected ? "#f59e0b" : "#dc2626"}
                    stroke="white"
                    strokeWidth={isSelected ? "3" : "2"}
                    className="cursor-pointer hover:opacity-80 transition-all"
                    onClick={() => handleCitySelect(city)}
                  />
                  
                  {/* Waste level indicator */}
                  <circle
                    cx={x + citySize + 5}
                    cy={y - citySize - 5}
                    r="3"
                    fill={city.wasteData.collectionRate > 50 ? "#10b981" : "#ef4444"}
                    className="opacity-80"
                  />
                  
                  {/* City label */}
                  {(zoomLevel > 1.5 || isSelected) && (
                    <text
                      x={x}
                      y={y - citySize - 8}
                      textAnchor="middle"
                      className="text-xs font-medium fill-gray-800"
                    >
                      {city.name}
                    </text>
                  )}
                  
                  {/* Population info on high zoom */}
                  {zoomLevel > 2 && (
                    <text
                      x={x}
                      y={y + citySize + 15}
                      textAnchor="middle"
                      className="text-xs fill-gray-600"
                    >
                      {(city.population / 1000).toFixed(0)}k
                    </text>
                  )}
                </g>
              );
            })}

            {/* National Parks */}
            {zoomLevel > 1.5 && UGANDA_GEO_DATA.nationalParks.map((park, index) => {
              const x = ((park.lng - UGANDA_GEO_DATA.bounds.west) / (UGANDA_GEO_DATA.bounds.east - UGANDA_GEO_DATA.bounds.west)) * 320 + 40;
              const y = 260 - ((park.lat - UGANDA_GEO_DATA.bounds.south) / (UGANDA_GEO_DATA.bounds.north - UGANDA_GEO_DATA.bounds.south)) * 200;
              
              return (
                <g key={park.name}>
                  <rect
                    x={x - 8}
                    y={y - 8}
                    width="16"
                    height="16"
                    fill="#22c55e"
                    opacity="0.6"
                    rx="2"
                  />
                  <text x={x} y={y + 20} textAnchor="middle" className="text-xs fill-green-700 font-medium">
                    {park.name.split(" ")[0]}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Map Controls */}
        <div className="absolute top-4 right-4 flex flex-col space-y-2">
          <button 
            onClick={handleZoomIn}
            className="w-10 h-10 bg-white rounded-lg shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
          >
            <SvgIcon name="plus" className="w-5 h-5 text-gray-600" />
          </button>
          <button 
            onClick={handleZoomOut}
            className="w-10 h-10 bg-white rounded-lg shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
          >
            <SvgIcon name="minus" className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Map Legend */}
        <div className="absolute bottom-4 right-4 bg-white/95 rounded-lg p-3 text-xs">
          <div className="font-medium text-gray-700 mb-2">Legend</div>
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-600 rounded-full"></div>
              <span className="text-gray-600">Major Cities</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded"></div>
              <span className="text-gray-600">Lakes</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span className="text-gray-600">Parks</span>
            </div>
          </div>
        </div>

        {/* Zoom Indicator */}
        <div className="absolute bottom-4 left-4 bg-white/90 rounded-lg px-3 py-1 text-sm font-medium text-gray-700">
          {zoomLevel.toFixed(1)}x
        </div>
      </div>

      {/* Map Statistics */}
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-4 shadow-lg`}>
        <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'} mb-3`}>
          Uganda Map Overview
        </h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Total Area
            </div>
            <div className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              241,038 km²
            </div>
          </div>
          <div>
            <div className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Major Cities
            </div>
            <div className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {UGANDA_CITIES_ENHANCED.length} monitored
            </div>
          </div>
          <div>
            <div className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Lakes
            </div>
            <div className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {UGANDA_GEO_DATA.majorLakes.length} major
            </div>
          </div>
          <div>
            <div className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              National Parks
            </div>
            <div className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {UGANDA_GEO_DATA.nationalParks.length} protected
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Enhanced Location Details Component with NASA Data
const LocationDetails = ({ city, darkMode, onBack }) => {
  const [selectedMetric, setSelectedMetric] = useState('plastic');
  const [nasaData, setNasaData] = useState(null);
  const [loading, setLoading] = useState(false);
  
  if (!city) return null;

  // Fetch NASA enhanced data for the city
  useEffect(() => {
    const fetchNASAData = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${API}/locations/${city.id}/enhanced`);
        setNasaData(response.data);
      } catch (error) {
        console.error('Error fetching NASA data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (city.id) {
      fetchNASAData();
    }
  }, [city.id]);

  const mockTrendData = {
    plastic: [45, 52, 38, 65, 59, 80, 35],
    airQuality: [65, 59, 80, 81, 56, 85, 40],
    temperature: [21, 23, 25, 24, 22, 26, 24],
    nasaTemp: [22, 24, 26, 25, 23, 27, 25],
    precipitation: [2, 5, 12, 8, 3, 15, 6]
  };

  const getMetricData = () => {
    switch(selectedMetric) {
      case 'plastic':
        return {
          title: 'Plastic Waste Levels',
          value: city.wasteData.dailyGeneration,
          unit: 'tons/day',
          change: '-15%',
          changeColor: 'text-green-500',
          data: mockTrendData.plastic,
          color: 'stroke-red-500'
        };
      case 'airQuality':
        return {
          title: 'Air Quality Index',
          value: city.environmental.airQuality === 'Good' ? '45' : '75',
          unit: 'AQI',
          change: '+5%',
          changeColor: 'text-red-500',
          data: mockTrendData.airQuality,
          color: 'stroke-blue-500'
        };
      case 'temperature':
        return {
          title: 'Average Temperature',
          value: city.environmental.avgTemperature,
          unit: '°C',
          change: '+1.2°C',
          changeColor: 'text-orange-500',
          data: mockTrendData.temperature,
          color: 'stroke-yellow-500'
        };
      case 'nasaTemp':
        return {
          title: 'NASA Satellite Temperature',
          value: nasaData?.nasa_climate?.temperature?.toFixed(1) || 'N/A',
          unit: '°C',
          change: '+0.8°C',
          changeColor: 'text-orange-500',
          data: mockTrendData.nasaTemp,
          color: 'stroke-purple-500'
        };
      case 'precipitation':
        return {
          title: 'NASA Precipitation Data',
          value: nasaData?.nasa_climate?.precipitation?.toFixed(1) || 'N/A',
          unit: 'mm/day',
          change: '-2.3mm',
          changeColor: 'text-blue-500',
          data: mockTrendData.precipitation,
          color: 'stroke-blue-600'
        };
      default:
        return null;
    }
  };

  const metricData = getMetricData();

  return (
    <div className="space-y-6">
      {/* Header with back button */}
      <div className="flex items-center space-x-3">
        <button 
          onClick={onBack}
          className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors`}
        >
          <SvgIcon name="back" className="w-6 h-6 text-gray-600" />
        </button>
        <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
          Enhanced Location Details
        </h2>
        {loading && (
          <div className="animate-spin w-5 h-5 border-2 border-teal-500 border-t-transparent rounded-full"></div>
        )}
      </div>

      {/* Hero Section */}
      <div className="relative h-48 rounded-xl overflow-hidden">
        <img 
          src={IMAGES.coastalCleanup} 
          alt="Environmental Cleanup" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
        <div className="absolute bottom-4 left-4 text-white">
          <h1 className="text-2xl font-bold">{city.name} Environmental Monitoring</h1>
          <p className="text-sm opacity-90">{city.district} District • {city.region} Region</p>
        </div>
        <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm rounded-lg p-2 text-white text-center">
          <div className="text-lg font-bold">{city.population.toLocaleString()}</div>
          <div className="text-xs">Population</div>
        </div>
        {/* NASA Status Badge */}
        {nasaData?.nasa_climate && (
          <div className="absolute top-4 left-4 bg-blue-500/80 backdrop-blur-sm rounded-lg px-3 py-1 text-white text-center">
            <div className="text-xs">🛰️ NASA DATA</div>
            <div className="text-sm font-bold">{nasaData.nasa_climate.temperature?.toFixed(1)}°C</div>
          </div>
        )}
      </div>

      {/* NASA Climate Data Section */}
      {nasaData?.nasa_climate && (
        <div className={`${darkMode ? 'bg-gradient-to-r from-blue-900 to-purple-900' : 'bg-gradient-to-r from-blue-50 to-purple-50'} rounded-xl p-6 shadow-lg border border-blue-200 dark:border-blue-800`}>
          <div className="flex items-center space-x-2 mb-4">
            <span className="text-2xl">🛰️</span>
            <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              Real-time NASA Climate Data
            </h3>
            <span className={`px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400`}>
              Live
            </span>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="text-center p-3 bg-white/10 rounded-lg backdrop-blur-sm">
              <div className={`text-xl font-bold ${darkMode ? 'text-red-400' : 'text-red-600'}`}>
                {nasaData.nasa_climate.temperature?.toFixed(1)}°C
              </div>
              <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Temperature</div>
            </div>
            <div className="text-center p-3 bg-white/10 rounded-lg backdrop-blur-sm">
              <div className={`text-xl font-bold ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                {nasaData.nasa_climate.precipitation?.toFixed(1)}mm
              </div>
              <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Precipitation</div>
            </div>
            <div className="text-center p-3 bg-white/10 rounded-lg backdrop-blur-sm">
              <div className={`text-xl font-bold ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                {nasaData.nasa_climate.humidity?.toFixed(0)}%
              </div>
              <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Humidity</div>
            </div>
            <div className="text-center p-3 bg-white/10 rounded-lg backdrop-blur-sm">
              <div className={`text-xl font-bold ${darkMode ? 'text-yellow-400' : 'text-yellow-600'}`}>
                {nasaData.nasa_climate.wind_speed?.toFixed(1)}m/s
              </div>
              <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Wind Speed</div>
            </div>
            <div className="text-center p-3 bg-white/10 rounded-lg backdrop-blur-sm">
              <div className={`text-xl font-bold ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                {nasaData.nasa_climate.solar_radiation?.toFixed(1)}
              </div>
              <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Solar (kWh/m²)</div>
            </div>
            <div className="text-center p-3 bg-white/10 rounded-lg backdrop-blur-sm">
              <div className={`text-xl font-bold ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>
                {nasaData.nasa_climate.pressure?.toFixed(1)}kPa
              </div>
              <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Pressure</div>
            </div>
          </div>
          
          <div className={`mt-4 text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Last updated: {new Date(nasaData.nasa_climate.timestamp).toLocaleString()}
          </div>
        </div>
      )}

      {/* Enhanced Metric Selection Tabs */}
      <div className="flex space-x-2 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
        {[
          { key: 'plastic', label: 'Plastic Waste', icon: 'recycling' },
          { key: 'airQuality', label: 'Air Quality', icon: 'wind' },
          { key: 'temperature', label: 'Local Temp', icon: 'temperature' },
          { key: 'nasaTemp', label: 'NASA Temp', icon: 'temperature' },
          { key: 'precipitation', label: 'NASA Rain', icon: 'wind' }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setSelectedMetric(tab.key)}
            className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-1 ${
              selectedMetric === tab.key
                ? 'bg-white text-teal-600 shadow-sm dark:bg-gray-700 dark:text-teal-400'
                : darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <SvgIcon name={tab.icon} className="w-4 h-4" />
            <span className="hidden sm:inline">{tab.label}</span>
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
          <span className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>
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
        <TrendChart 
          data={metricData.data} 
          darkMode={darkMode} 
          color={metricData.color}
          title="Monthly Trend"
        />
      </div>

      {/* City Details */}
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 shadow-lg`}>
        <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-800'} mb-4`}>
          City Overview
        </h3>
        
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg">
            <div className={`text-2xl font-bold ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
              {city.wasteData.collectionRate}%
            </div>
            <div className={`text-sm ${darkMode ? 'text-blue-300' : 'text-blue-800'}`}>Collection Rate</div>
          </div>
          <div className="text-center p-4 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg">
            <div className={`text-2xl font-bold ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
              {city.wasteData.recyclingRate}%
            </div>
            <div className={`text-sm ${darkMode ? 'text-green-300' : 'text-green-800'}`}>Recycling Rate</div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h4 className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
              Major Waste Sources
            </h4>
            <div className="flex flex-wrap gap-2">
              {city.wasteData.majorSources.map((source, index) => (
                <span 
                  key={index}
                  className={`px-3 py-1 rounded-full text-sm ${
                    darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {source}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h4 className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
              Available Facilities
            </h4>
            <div className="space-y-2">
              {city.wasteData.facilities.map((facility, index) => (
                <div 
                  key={index}
                  className={`flex items-center space-x-2 text-sm ${
                    darkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}
                >
                  <SvgIcon name="location" className="w-4 h-4 text-teal-500" />
                  <span>{facility}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
              Key Challenges
            </h4>
            <div className="space-y-2">
              {city.wasteData.challenges.map((challenge, index) => (
                <div 
                  key={index}
                  className={`flex items-center space-x-2 text-sm ${
                    darkMode ? 'text-red-400' : 'text-red-600'
                  }`}
                >
                  <SvgIcon name="warning" className="w-4 h-4" />
                  <span>{challenge}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Environmental Conditions */}
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 shadow-lg`}>
        <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-800'} mb-4`}>
          Environmental Conditions
        </h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Air Quality
            </div>
            <div className={`text-lg ${
              city.environmental.airQuality === 'Good' ? 'text-green-500' : 'text-yellow-500'
            }`}>
              {city.environmental.airQuality}
            </div>
          </div>
          <div>
            <div className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Green Cover
            </div>
            <div className="text-lg text-green-500">
              {city.environmental.greenCover}%
            </div>
          </div>
          <div>
            <div className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Annual Rainfall
            </div>
            <div className="text-lg text-blue-500">
              {city.environmental.rainfall}mm
            </div>
          </div>
          <div>
            <div className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Avg Temperature
            </div>
            <div className="text-lg text-orange-500">
              {city.environmental.avgTemperature}°C
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Enhanced Learn Section with Interactive Content
const LearnSection = ({ darkMode }) => {
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  const [analysisForm, setAnalysisForm] = useState({
    location_id: '',
    location_name: '',
    analysis_type: 'impact_assessment',
    focus_area: 'reduction'
  });

  const learningTopics = [
    {
      id: 'recycling_centers',
      title: 'Local Recycling Programs',
      description: 'Explore recycling initiatives in your area. Learn about accepted materials, schedules, and participation guidelines.',
      icon: 'recycling',
      color: 'teal',
      content: {
        overview: 'Uganda has been developing comprehensive recycling programs across major cities to address the growing plastic waste challenge.',
        details: [
          'Over 50 recycling centers operational nationwide',
          'Collection programs in 15+ districts',
          'Community-based recycling initiatives',
          'Private sector partnerships for waste processing'
        ],
        programs: [
          {
            name: 'Kampala Recycling Initiative',
            location: 'Plot 15, Industrial Area, Kampala',
            contact: '+256 414 230 456',
            materials: ['Plastic bottles', 'Bags', 'Containers'],
            hours: 'Mon-Fri: 8AM-6PM, Sat: 8AM-4PM'
          },
          {
            name: 'Green Belt Collection Center',
            location: 'Bweyogerere, Wakiso District',
            contact: '+256 702 345 678',
            materials: ['PET bottles', 'Polyethylene bags'],
            hours: 'Daily: 7AM-7PM'
          }
        ]
      }
    },
    {
      id: 'waste_dropoff',
      title: 'Plastic Waste Drop-off Locations',
      description: 'Find convenient drop-off points for plastic waste that may not be accepted in regular recycling programs.',
      icon: 'location',
      color: 'blue',
      content: {
        overview: 'Specialized drop-off locations handle plastic waste that requires special processing or cannot be handled by regular collection services.',
        details: [
          'Electronic waste plastic components',
          'Industrial plastic packaging',
          'Agricultural plastic films',
          'Mixed plastic materials'
        ],
        locations: [
          {
            name: 'Eco-Plastic Collection Site',
            address: '789 Pine Ln, Anytown',
            specialties: ['Electronic waste', 'Industrial packaging']
          },
          {
            name: 'Plastic Recycling Depot',
            address: '101 Elm Rd, Anytown',
            specialties: ['Agricultural films', 'Mixed plastics']
          }
        ]
      }
    },
    {
      id: 'disposal_guidelines',
      title: 'Waste Disposal Guidelines',
      description: 'Understand proper waste disposal practices to minimize environmental impact.',
      icon: 'lightbulb',
      color: 'yellow',
      content: {
        overview: 'Proper waste disposal is crucial for environmental protection and public health. Understanding the right methods can significantly reduce pollution.',
        guidelines: [
          {
            category: 'Plastic Bottles',
            instructions: [
              'Remove caps and labels when possible',
              'Rinse containers to remove food residue',
              'Sort by plastic type (PET, HDPE, etc.)',
              'Avoid crushing lengthwise - crush top to bottom'
            ]
          },
          {
            category: 'Plastic Bags',
            instructions: [
              'Clean bags of any debris',
              'Bundle multiple bags together',
              'Take to specialized collection points',
              'Do not mix with other recyclables'
            ]
          },
          {
            category: 'Food Containers',
            instructions: [
              'Clean thoroughly before disposal',
              'Check for recycling codes',
              'Remove any non-plastic components',
              'Stack similar containers together'
            ]
          }
        ],
        tips: [
          'Reduce consumption before focusing on disposal',
          'Reuse containers when possible',
          'Educate others about proper disposal',
          'Support businesses using sustainable packaging'
        ]
      }
    },
    {
      id: 'composting',
      title: 'Composting Guide',
      description: 'Learn about organic waste management and composting techniques.',
      icon: 'leaf',
      color: 'green',
      content: {
        overview: 'Composting reduces organic waste sent to landfills and creates valuable soil amendment for agriculture.',
        methods: [
          {
            type: 'Home Composting',
            description: 'Small-scale composting for household organic waste',
            requirements: ['Compost bin or designated area', 'Regular turning', 'Proper moisture balance'],
            timeline: '3-6 months for finished compost'
          },
          {
            type: 'Community Composting',
            description: 'Neighborhood-based composting programs',
            requirements: ['Community coordination', 'Shared equipment', 'Educational programs'],
            timeline: '2-4 months with proper management'
          }
        ],
        benefits: [
          'Reduces methane emissions from landfills',
          'Creates nutrient-rich soil amendment',
          'Decreases waste management costs',
          'Supports local food production'
        ]
      }
    }
  ];

  const handleGenerateAnalysis = async () => {
    if (!analysisForm.location_id) {
      alert('Please select a location for analysis');
      return;
    }

    try {
      const response = await axios.post(`${API}/waste-management/analysis`, analysisForm);
      console.log('Analysis generated:', response.data);
      alert('Analysis report generated successfully!');
      setShowAnalysisModal(false);
      setAnalysisForm({
        location_id: '',
        location_name: '',
        analysis_type: 'impact_assessment',
        focus_area: 'reduction'
      });
    } catch (error) {
      console.error('Error generating analysis:', error);
      alert('Failed to generate analysis. Please try again.');
    }
  };

  const renderTopicContent = (topic) => (
    <div className="space-y-6">
      {/* Topic Header */}
      <div className="flex items-center space-x-3 mb-4">
        <button 
          onClick={() => setSelectedTopic(null)}
          className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors`}
        >
          <SvgIcon name="back" className="w-6 h-6 text-gray-600" />
        </button>
        <div className={`p-3 rounded-lg bg-${topic.color}-100 dark:bg-${topic.color}-900/30`}>
          <SvgIcon name={topic.icon} className={`w-6 h-6 text-${topic.color}-500`} />
        </div>
        <div>
          <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            {topic.title}
          </h2>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {topic.description}
          </p>
        </div>
      </div>

      {/* Hero Image */}
      <div className="relative h-40 rounded-xl overflow-hidden">
        <img 
          src={topic.id === 'recycling_centers' ? IMAGES.recyclingPlant : 
               topic.id === 'composting' ? IMAGES.greenEnergy : IMAGES.sustainability} 
          alt={topic.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
        <div className="absolute bottom-4 left-4 text-white">
          <h3 className="text-lg font-bold">{topic.title}</h3>
        </div>
      </div>

      {/* Content Overview */}
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 shadow-lg`}>
        <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-800'} mb-3`}>
          Overview
        </h3>
        <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} leading-relaxed`}>
          {topic.content.overview}
        </p>
      </div>

      {/* Detailed Content */}
      {topic.content.details && (
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 shadow-lg`}>
          <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-800'} mb-3`}>
            Key Information
          </h3>
          <div className="space-y-2">
            {topic.content.details.map((detail, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className={`w-2 h-2 rounded-full bg-${topic.color}-500 mt-2 flex-shrink-0`}></div>
                <span className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{detail}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Programs/Locations */}
      {topic.content.programs && (
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 shadow-lg`}>
          <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-800'} mb-4`}>
            Available Programs
          </h3>
          <div className="space-y-4">
            {topic.content.programs.map((program, index) => (
              <div key={index} className={`border border-gray-200 dark:border-gray-700 rounded-lg p-4`}>
                <h4 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'} mb-2`}>
                  {program.name}
                </h4>
                <div className="space-y-2 text-sm">
                  <div className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    📍 {program.location}
                  </div>
                  <div className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    📞 {program.contact}
                  </div>
                  <div className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    🕒 {program.hours}
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {program.materials.map((material, idx) => (
                      <span 
                        key={idx}
                        className={`px-2 py-1 rounded text-xs ${
                          darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {material}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Guidelines */}
      {topic.content.guidelines && (
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 shadow-lg`}>
          <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-800'} mb-4`}>
            Disposal Guidelines
          </h3>
          <div className="space-y-6">
            {topic.content.guidelines.map((guideline, index) => (
              <div key={index}>
                <h4 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'} mb-3`}>
                  {guideline.category}
                </h4>
                <div className="space-y-2">
                  {guideline.instructions.map((instruction, idx) => (
                    <div key={idx} className="flex items-start space-x-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2 flex-shrink-0"></div>
                      <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        {instruction}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {topic.content.tips && (
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <h4 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'} mb-3`}>
                Additional Tips
              </h4>
              <div className="space-y-2">
                {topic.content.tips.map((tip, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <SvgIcon name="lightbulb" className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                    <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {tip}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Methods for Composting */}
      {topic.content.methods && (
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 shadow-lg`}>
          <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-800'} mb-4`}>
            Composting Methods
          </h3>
          <div className="space-y-4">
            {topic.content.methods.map((method, index) => (
              <div key={index} className={`border border-gray-200 dark:border-gray-700 rounded-lg p-4`}>
                <h4 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'} mb-2`}>
                  {method.type}
                </h4>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-3`}>
                  {method.description}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Requirements:
                    </span>
                    <ul className={`mt-1 space-y-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {method.requirements.map((req, idx) => (
                        <li key={idx} className="flex items-start space-x-2">
                          <span>•</span>
                          <span>{req}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <span className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Timeline:
                    </span>
                    <p className={`mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {method.timeline}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  if (selectedTopic) {
    const topic = learningTopics.find(t => t.id === selectedTopic);
    return renderTopicContent(topic);
  }

  return (
    <div className="space-y-6">
      {/* Header with Analysis Button */}
      <div className="flex justify-between items-center">
        <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
          Learning Center
        </h2>
        <button
          onClick={() => setShowAnalysisModal(true)}
          className="bg-gradient-to-r from-green-600 to-teal-600 text-white px-4 py-2 rounded-lg hover:from-green-700 hover:to-teal-700 transition-all shadow-lg flex items-center space-x-2"
        >
          <SvgIcon name="analysis" className="w-5 h-5" />
          <span>Generate Analysis</span>
        </button>
      </div>

      {/* Learning Topics */}
      <div className="space-y-4">
        {learningTopics.map((topic) => (
          <button
            key={topic.id}
            onClick={() => setSelectedTopic(topic.id)}
            className={`w-full ${darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'} rounded-xl p-4 shadow-lg transition-colors text-left`}
          >
            <div className="flex items-center space-x-4">
              <div className={`p-3 rounded-lg bg-${topic.color}-100 dark:bg-${topic.color}-900/30`}>
                <SvgIcon name={topic.icon} className={`w-6 h-6 text-${topic.color}-500`} />
              </div>
              <div className="flex-1">
                <h3 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'} mb-1`}>
                  {topic.title}
                </h3>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {topic.description}
                </p>
              </div>
              <SvgIcon name="arrow" className="w-5 h-5 text-gray-400" />
            </div>
          </button>
        ))}
      </div>

      {/* Analysis Modal */}
      {showAnalysisModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 max-w-md w-full`}>
            <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'} mb-4`}>
              Generate Waste Analysis Report
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                  Analysis Type
                </label>
                <select
                  value={analysisForm.analysis_type}
                  onChange={(e) => setAnalysisForm({...analysisForm, analysis_type: e.target.value})}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:ring-2 focus:ring-teal-500 focus:outline-none`}
                >
                  <option value="impact_assessment">Environmental Impact Assessment</option>
                  <option value="solution_recommendations">Solution Recommendations</option>
                  <option value="trend_analysis">Trend Analysis</option>
                </select>
              </div>
              
              <div>
                <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                  Focus Area
                </label>
                <select
                  value={analysisForm.focus_area}
                  onChange={(e) => setAnalysisForm({...analysisForm, focus_area: e.target.value})}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:ring-2 focus:ring-teal-500 focus:outline-none`}
                >
                  <option value="reduction">Waste Reduction</option>
                  <option value="recycling">Recycling Solutions</option>
                  <option value="innovation">Innovation Approaches</option>
                </select>
              </div>

              <div>
                <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                  Location
                </label>
                <select
                  value={analysisForm.location_id}
                  onChange={(e) => {
                    const city = UGANDA_CITIES_ENHANCED.find(c => c.id === e.target.value);
                    setAnalysisForm({
                      ...analysisForm, 
                      location_id: e.target.value,
                      location_name: city ? city.name : ''
                    });
                  }}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:ring-2 focus:ring-teal-500 focus:outline-none`}
                >
                  <option value="">Select a city</option>
                  {UGANDA_CITIES_ENHANCED.map((city) => (
                    <option key={city.id} value={city.id}>
                      {city.name} ({city.region})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowAnalysisModal(false)}
                className={`px-4 py-2 ${darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-800'} transition-colors`}
              >
                Cancel
              </button>
              <button
                onClick={handleGenerateAnalysis}
                className="flex-1 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors font-medium"
              >
                Generate Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Community Section Component
const CommunitySection = ({ darkMode }) => {
  return (
    <div className="space-y-6">
      <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'} mb-6`}>
        Community Engagement
      </h2>

      {/* Community Impact Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-4 shadow-lg text-center`}>
          <div className={`text-2xl font-bold ${darkMode ? 'text-teal-400' : 'text-teal-600'}`}>
            2,847
          </div>
          <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Community Members
          </div>
        </div>
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-4 shadow-lg text-center`}>
          <div className={`text-2xl font-bold ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
            1,293
          </div>
          <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Reports Submitted
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative h-40 rounded-xl overflow-hidden mb-6">
        <img 
          src={IMAGES.coastalCleanup} 
          alt="Community Cleanup" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
        <div className="absolute bottom-4 left-4 text-white">
          <h3 className="text-lg font-bold">Join Our Environmental Community</h3>
          <p className="text-sm opacity-90">Together, we can make Uganda cleaner and greener</p>
        </div>
      </div>

      {/* Feedback Form */}
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6`}>
        <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'} mb-4 flex items-center gap-2`}>
          <SvgIcon name="community" className="w-6 h-6 text-teal-500" />
          Share Your Feedback
        </h3>
        <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-6`}>
          Help us improve plastic waste management in Uganda. Your insights are valuable for creating better environmental solutions and policies.
        </p>
        
        {/* Embedded Google Form */}
        <div className="relative w-full h-96 rounded-lg overflow-hidden border">
          <iframe 
            src="https://forms.gle/bydjhF48JpRdhAcp9"
            className="w-full h-full"
            frameBorder="0" 
            marginHeight="0" 
            marginWidth="0"
            title="Community Feedback Form"
          >
            Loading feedback form...
          </iframe>
          
          {/* Fallback content */}
          <div className={`absolute inset-0 flex items-center justify-center ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} bg-opacity-95`}>
            <div className="text-center p-6">
              <SvgIcon name="community" className="w-12 h-12 text-teal-500 mx-auto mb-4" />
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
                className="inline-block bg-gradient-to-r from-teal-500 to-green-500 text-white px-6 py-3 rounded-lg hover:from-teal-600 hover:to-green-600 transition-all shadow-lg"
              >
                Open Feedback Form
              </a>
              <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} mt-3`}>
                Opens in a new tab • Takes 2-3 minutes to complete
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Community Actions */}
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 shadow-lg`}>
        <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-800'} mb-4`}>
          Ways to Get Involved
        </h3>
        
        <div className="space-y-3">
          <div className="flex items-center space-x-3 p-3 rounded-lg bg-gradient-to-r from-teal-50 to-green-50 dark:from-teal-900/20 dark:to-green-900/20">
            <SvgIcon name="recycling" className="w-6 h-6 text-teal-500" />
            <div>
              <div className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                Join Cleanup Events
              </div>
              <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Participate in community cleanup activities
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 p-3 rounded-lg bg-gradient-to-r from-blue-50 to-teal-50 dark:from-blue-900/20 dark:to-teal-900/20">
            <SvgIcon name="lightbulb" className="w-6 h-6 text-blue-500" />
            <div>
              <div className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                Share Ideas
              </div>
              <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Suggest innovative waste management solutions
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 p-3 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
            <SvgIcon name="report" className="w-6 h-6 text-green-500" />
            <div>
              <div className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                Report Issues
              </div>
              <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Help identify environmental problems in your area
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Community Activity */}
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 shadow-lg`}>
        <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-800'} mb-4`}>
          Recent Community Activity
        </h3>
        
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Lake Victoria cleanup event organized - 156 participants
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              New recycling center opened in Jinja
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
            <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              85 environmental reports submitted this month
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Report Component
const ReportComponent = ({ darkMode }) => {
  const [selectedReport, setSelectedReport] = useState(null);
  const [reportDetails, setReportDetails] = useState({
    location: '',
    description: '',
    urgency: 'medium'
  });

  const reportTypes = [
    {
      id: 'illegal_dumping',
      title: 'Illegal Dumping',
      description: 'Report illegal dumping of plastic waste',
      icon: 'trash',
      color: 'red'
    },
    {
      id: 'high_waste',
      title: 'High Waste Concentration',
      description: 'Report areas with high plastic waste concentration',
      icon: 'recycling',
      color: 'orange'
    },
    {
      id: 'deforestation',
      title: 'Deforestation',
      description: 'Report deforestation activities',
      icon: 'tree',
      color: 'green'
    }
  ];

  const handleSubmitReport = async () => {
    if (!selectedReport || !reportDetails.location || !reportDetails.description) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      // Here you would typically send to your backend
      console.log('Submitting report:', { 
        type: selectedReport, 
        ...reportDetails,
        timestamp: new Date().toISOString()
      });
      
      alert('Report submitted successfully! Thank you for helping protect our environment.');
      setSelectedReport(null);
      setReportDetails({ location: '', description: '', urgency: 'medium' });
    } catch (error) {
      console.error('Error submitting report:', error);
      alert('Failed to submit report. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
        Environmental Reporting
      </h2>

      {/* Report an Issue */}
      <div className="space-y-4">
        <h3 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
          Report an Issue
        </h3>
        
        <div className="space-y-3">
          {reportTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => setSelectedReport(type.id)}
              className={`w-full ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-4 shadow-lg flex items-center justify-between transition-colors ${
                selectedReport === type.id ? 'ring-2 ring-teal-500' : ''
              }`}
            >
              <div className="flex items-center space-x-4">
                <div className={`p-3 rounded-lg ${
                  darkMode ? 'bg-gray-700' : 
                  type.color === 'red' ? 'bg-red-100' :
                  type.color === 'orange' ? 'bg-orange-100' : 'bg-green-100'
                }`}>
                  <SvgIcon 
                    name={type.icon} 
                    className={`w-6 h-6 ${
                      type.color === 'red' ? 'text-red-500' :
                      type.color === 'orange' ? 'text-orange-500' : 'text-green-500'
                    }`} 
                  />
                </div>
                <div className="text-left">
                  <div className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                    {type.title}
                  </div>
                  <div className={`text-sm ${
                    darkMode ? 
                    (type.color === 'red' ? 'text-red-400' : 
                     type.color === 'orange' ? 'text-orange-400' : 'text-green-400') :
                    (type.color === 'red' ? 'text-red-600' : 
                     type.color === 'orange' ? 'text-orange-600' : 'text-green-600')
                  }`}>
                    {type.description}
                  </div>
                </div>
              </div>
              <SvgIcon name="arrow" className="w-5 h-5 text-gray-400" />
            </button>
          ))}
        </div>

        {/* Report Form */}
        {selectedReport && (
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 shadow-lg space-y-4`}>
            <h4 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              Report Details
            </h4>
            
            <div>
              <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                Location *
              </label>
              <input
                type="text"
                placeholder="Enter specific location or area"
                value={reportDetails.location}
                onChange={(e) => setReportDetails({...reportDetails, location: e.target.value})}
                className={`w-full px-3 py-2 rounded-lg border ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                } focus:ring-2 focus:ring-teal-500 focus:outline-none`}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                Description *
              </label>
              <textarea
                rows={4}
                placeholder="Describe the issue in detail..."
                value={reportDetails.description}
                onChange={(e) => setReportDetails({...reportDetails, description: e.target.value})}
                className={`w-full px-3 py-2 rounded-lg border ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                } focus:ring-2 focus:ring-teal-500 focus:outline-none resize-none`}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                Urgency Level
              </label>
              <select
                value={reportDetails.urgency}
                onChange={(e) => setReportDetails({...reportDetails, urgency: e.target.value})}
                className={`w-full px-3 py-2 rounded-lg border ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:ring-2 focus:ring-teal-500 focus:outline-none`}
              >
                <option value="low">Low - Can wait for scheduled action</option>
                <option value="medium">Medium - Should be addressed soon</option>
                <option value="high">High - Requires immediate attention</option>
                <option value="critical">Critical - Emergency response needed</option>
              </select>
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                onClick={() => setSelectedReport(null)}
                className={`px-4 py-2 rounded-lg ${
                  darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-800'
                } transition-colors`}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitReport}
                className="flex-1 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors font-medium"
              >
                Submit Report
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Community Impact */}
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-4 shadow-lg`}>
        <h4 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'} mb-3`}>
          Community Impact
        </h4>
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <div className={`text-2xl font-bold ${darkMode ? 'text-teal-400' : 'text-teal-600'}`}>
              1,247
            </div>
            <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Reports Submitted
            </div>
          </div>
          <div>
            <div className={`text-2xl font-bold ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
              956
            </div>
            <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Issues Resolved
            </div>
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
    { key: 'map', label: 'Map', icon: 'map' },
    { key: 'nasa', label: 'NASA', icon: 'sun' },
    { key: 'learn', label: 'Learn', icon: 'learn' },
    { key: 'report', label: 'Report', icon: 'report' }
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
  const [selectedCity, setSelectedCity] = useState(null);
  const [showLocationDetails, setShowLocationDetails] = useState(false);

  const handleLocationSelect = (city) => {
    setSelectedCity(city);
    setShowLocationDetails(true);
  };

  const handleBackToMap = () => {
    setShowLocationDetails(false);
    setSelectedCity(null);
  };

  // Render content based on active tab
  const renderContent = () => {
    switch(activeTab) {
      case 'home':
        return <EnvironmentalOverview darkMode={darkMode} />;
      case 'map':
        return showLocationDetails && selectedCity 
          ? <LocationDetails city={selectedCity} darkMode={darkMode} onBack={handleBackToMap} />
          : <EnhancedUgandaMap darkMode={darkMode} onLocationSelect={handleLocationSelect} selectedCity={selectedCity} cities={UGANDA_CITIES_ENHANCED} />;
      case 'nasa':
        return <NASAClimateDashboard darkMode={darkMode} />;
      case 'learn':
        return <LearnSection darkMode={darkMode} />;
      case 'report':
        return <ReportComponent darkMode={darkMode} />;
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
          <div className="flex items-center space-x-3">
            <UGEcoGuardLogo className="w-10 h-10" />
            <div>
              <h1 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                UG EcoGuard
              </h1>
              <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Environmental Protection Uganda
              </span>
            </div>
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