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
  plasticFreePackaging: "https://images.unsplash.com/photo-1602340197834-ad96c1340839"
};

// Animated Icons Component
const AnimatedIcon = ({ icon, className = "" }) => {
  const iconMap = {
    dashboard: "📊",
    location: "📍", 
    waste: "♻️",
    feedback: "💬",
    sun: "☀️",
    moon: "🌙",
    menu: "☰",
    close: "✕",
    chart: "📈",
    city: "🏙️",
    analysis: "🔍",
    report: "📋",
    recycle: "🔄",
    alert: "⚠️",
    check: "✓",
    arrow: "→"
  };

  return (
    <span className={`animated-icon ${className}`}>
      {iconMap[icon] || icon}
    </span>
  );
};

// Components
const LocationCard = ({ location, onSelectLocation, isSelected, darkMode }) => {
  const getWasteLevel = (collectionRate) => {
    const rate = parseInt(collectionRate);
    if (rate >= 60) return { 
      level: 'Low Risk', 
      color: darkMode ? 'text-green-400 bg-green-900/30' : 'text-green-600 bg-green-100', 
      gradient: 'from-green-500 to-emerald-500' 
    };
    if (rate >= 40) return { 
      level: 'Medium Risk', 
      color: darkMode ? 'text-yellow-400 bg-yellow-900/30' : 'text-yellow-600 bg-yellow-100', 
      gradient: 'from-yellow-500 to-orange-500' 
    };
    return { 
      level: 'High Risk', 
      color: darkMode ? 'text-red-400 bg-red-900/30' : 'text-red-600 bg-red-100', 
      gradient: 'from-red-500 to-pink-500' 
    };
  };

  const wasteLevel = getWasteLevel(location.plastic_waste?.collection_rate || "0%");

  return (
    <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-lg p-6 cursor-pointer transition-all duration-300 hover:shadow-xl border-2 relative overflow-hidden ${
      isSelected ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50' : ''
    } ${darkMode && isSelected ? 'bg-gradient-to-br from-blue-900/20 to-indigo-900/20' : ''}`} 
    onClick={() => onSelectLocation(location.id)}>
      
      {/* Background Pattern */}
      <div className="absolute top-0 right-0 w-32 h-32 opacity-5">
        <AnimatedIcon icon="city" className="text-8xl transform rotate-12 animated-pulse" />
      </div>
      
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'} flex items-center gap-2`}>
              <AnimatedIcon icon="location" className="animated-bounce" />
              {location.name}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{location.region} Region</span>
              <span className={`px-2 py-1 ${darkMode ? 'bg-blue-900/50 text-blue-300' : 'bg-blue-100 text-blue-800'} text-xs rounded-full`}>
                {location.population}
              </span>
            </div>
          </div>
          <div className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${wasteLevel.color}`}>
            <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${wasteLevel.gradient} animated-pulse`}></div>
            {wasteLevel.level}
          </div>
        </div>

        {location.plastic_waste && (
          <div className="space-y-4">
            {/* Main Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className={`${darkMode ? 'bg-red-900/30' : 'bg-red-50'} p-4 rounded-lg relative overflow-hidden`}>
                <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-pink-500/10"></div>
                <div className="relative z-10">
                  <div className={`text-xl font-bold ${darkMode ? 'text-red-400' : 'text-red-600'}`}>
                    {location.plastic_waste.daily_generation}
                  </div>
                  <div className={`text-xs ${darkMode ? 'text-red-300' : 'text-red-800'}`}>Daily Generation</div>
                </div>
              </div>
              <div className={`${darkMode ? 'bg-green-900/30' : 'bg-green-50'} p-4 rounded-lg relative overflow-hidden`}>
                <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-emerald-500/10"></div>
                <div className="relative z-10">
                  <div className={`text-xl font-bold ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                    {location.plastic_waste.collection_rate}
                  </div>
                  <div className={`text-xs ${darkMode ? 'text-green-300' : 'text-green-800'}`}>Collection Rate</div>
                </div>
              </div>
            </div>
            
            {/* Recycling Rate with Progress Bar */}
            <div className={`${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'} p-4 rounded-lg`}>
              <div className="flex justify-between items-center mb-2">
                <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Recycling Rate</span>
                <span className={`text-sm font-bold ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                  {location.plastic_waste.recycling_rate}
                </span>
              </div>
              <div className={`w-full ${darkMode ? 'bg-gray-600' : 'bg-gray-200'} rounded-full h-2`}>
                <div 
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-1000 animated-fill"
                  style={{ width: location.plastic_waste.recycling_rate }}
                ></div>
              </div>
            </div>

            {/* Detailed Stats Grid */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className={`${darkMode ? 'bg-purple-900/30' : 'bg-purple-50'} p-3 rounded-lg`}>
                <div className={`text-lg font-bold ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                  {location.plastic_waste.main_sources?.length || 0}
                </div>
                <div className={`text-xs ${darkMode ? 'text-purple-300' : 'text-purple-800'}`}>Sources</div>
              </div>
              <div className={`${darkMode ? 'bg-orange-900/30' : 'bg-orange-50'} p-3 rounded-lg`}>
                <div className={`text-lg font-bold ${darkMode ? 'text-orange-400' : 'text-orange-600'}`}>
                  {location.plastic_waste.hotspots?.length || 0}
                </div>
                <div className={`text-xs ${darkMode ? 'text-orange-300' : 'text-orange-800'}`}>Hotspots</div>
              </div>
              <div className={`${darkMode ? 'bg-teal-900/30' : 'bg-teal-50'} p-3 rounded-lg`}>
                <div className={`text-lg font-bold ${darkMode ? 'text-teal-400' : 'text-teal-600'}`}>
                  {location.plastic_waste.solutions_implemented?.length || 0}
                </div>
                <div className={`text-xs ${darkMode ? 'text-teal-300' : 'text-teal-800'}`}>Solutions</div>
              </div>
            </div>

            {/* Expandable Details */}
            <details className="group">
              <summary className={`cursor-pointer ${darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'} text-sm font-medium flex items-center gap-2`}>
                <AnimatedIcon icon="arrow" className="group-open:rotate-90 transition-transform" />
                View Detailed Breakdown
              </summary>
              <div className="mt-3 space-y-3">
                <div>
                  <div className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>Main Sources:</div>
                  <div className="flex flex-wrap gap-1">
                    {location.plastic_waste.main_sources?.map((source, i) => (
                      <span key={i} className={`px-2 py-1 ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'} text-xs rounded`}>
                        {source}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div>
                  <div className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>Active Solutions:</div>
                  <div className="space-y-1">
                    {location.plastic_waste.solutions_implemented?.map((solution, i) => (
                      <div key={i} className={`flex items-center gap-2 text-xs ${darkMode ? 'text-green-400' : 'text-green-700'}`}>
                        <AnimatedIcon icon="check" className="animated-check" />
                        {solution}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <div className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>Key Challenges:</div>
                  <div className="space-y-1">
                    {location.plastic_waste.challenges?.map((challenge, i) => (
                      <div key={i} className={`flex items-center gap-2 text-xs ${darkMode ? 'text-red-400' : 'text-red-700'}`}>
                        <AnimatedIcon icon="alert" className="animated-pulse" />
                        {challenge}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </details>
          </div>
        )}
      </div>
    </div>
  );
};

const AirQualityCard = ({ data, darkMode }) => {
  const getAQIColor = (aqi) => {
    if (aqi <= 50) return darkMode ? 'from-green-600 to-green-400' : 'from-green-500 to-green-600';
    if (aqi <= 100) return darkMode ? 'from-yellow-600 to-yellow-400' : 'from-yellow-500 to-yellow-600';
    if (aqi <= 150) return darkMode ? 'from-orange-600 to-orange-400' : 'from-orange-500 to-orange-600';
    if (aqi <= 200) return darkMode ? 'from-red-600 to-red-400' : 'from-red-500 to-red-600';
    if (aqi <= 300) return darkMode ? 'from-purple-600 to-purple-400' : 'from-purple-500 to-purple-600';
    return darkMode ? 'from-red-800 to-red-600' : 'from-red-700 to-red-800';
  };

  const getRecommendation = (aqi) => {
    if (aqi <= 50) return "Excellent air quality! Perfect for outdoor activities and waste collection efforts.";
    if (aqi <= 100) return "Good air quality. Normal waste management activities can proceed safely.";
    if (aqi <= 150) return "Sensitive groups should limit outdoor waste collection activities.";
    return "Limit outdoor activities. Focus on indoor waste sorting and processing.";
  };

  return (
    <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6 relative overflow-hidden`}>
      {/* Background Image */}
      <div className="absolute inset-0 opacity-5">
        <img src={IMAGES.plasticPollution} alt="Environmental" className="w-full h-full object-cover" />
      </div>
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'} flex items-center gap-2`}>
            <AnimatedIcon icon="chart" className="animated-bounce" />
            Air Quality - {data.location_name}
          </h3>
          <div className={`px-4 py-2 rounded-full text-white text-lg font-bold bg-gradient-to-r ${getAQIColor(data.aqi)} shadow-lg animated-pulse`}>
            {data.aqi}
          </div>
        </div>
        
        <div className="mb-4">
          <div className={`text-lg font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-700'} mb-2`}>{data.category}</div>
          <div className={`text-sm ${darkMode ? 'text-gray-300 bg-gray-700/50' : 'text-gray-600 bg-gray-50'} p-3 rounded-lg border-l-4 border-blue-500`}>
            {getRecommendation(data.aqi)}
          </div>
        </div>
        
        {(data.pm25 || data.ozone) && (
          <div className="grid grid-cols-2 gap-4 mb-4">
            {data.pm25 && (
              <div className={`bg-gradient-to-r from-blue-500/20 to-blue-600/20 p-4 rounded-lg text-center relative overflow-hidden`}>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-blue-600/10"></div>
                <div className="relative z-10">
                  <div className={`text-2xl font-bold ${darkMode ? 'text-blue-400' : 'text-blue-600'} animated-count`}>{data.pm25}</div>
                  <div className={`text-sm ${darkMode ? 'text-blue-300' : 'text-blue-800'}`}>PM2.5 (μg/m³)</div>
                  <div className={`text-xs ${darkMode ? 'text-blue-400' : 'text-blue-600'} mt-1`}>Fine Particles</div>
                </div>
              </div>
            )}
            {data.ozone && (
              <div className={`bg-gradient-to-r from-purple-500/20 to-purple-600/20 p-4 rounded-lg text-center relative overflow-hidden`}>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-purple-600/10"></div>
                <div className="relative z-10">
                  <div className={`text-2xl font-bold ${darkMode ? 'text-purple-400' : 'text-purple-600'} animated-count`}>{data.ozone}</div>
                  <div className={`text-sm ${darkMode ? 'text-purple-300' : 'text-purple-800'}`}>Ozone (ppb)</div>
                  <div className={`text-xs ${darkMode ? 'text-purple-400' : 'text-purple-600'} mt-1`}>Ground Level</div>
                </div>
              </div>
            )}
          </div>
        )}
        
        <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} text-center flex items-center justify-center gap-2`}>
          <AnimatedIcon icon="chart" className="animated-spin-slow" />
          Updated: {new Date(data.timestamp).toLocaleString()}
        </div>
      </div>
    </div>
  );
};

const WasteManagementInfoCard = ({ solutionsData, darkMode }) => {
  const [selectedCategory, setSelectedCategory] = useState('reduction_strategies');
  
  if (!solutionsData) return null;

  const categories = [
    { key: 'reduction_strategies', title: 'Reduction Strategies', gradient: 'from-red-500 to-pink-500' },
    { key: 'recycling_initiatives', title: 'Recycling Solutions', gradient: 'from-green-500 to-emerald-500' },
    { key: 'innovation_approaches', title: 'Innovation Hub', gradient: 'from-purple-500 to-indigo-500' }
  ];

  const currentData = solutionsData[selectedCategory] || [];

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className={`relative bg-gradient-to-r from-blue-600 via-green-600 to-blue-800 text-white rounded-xl p-8 overflow-hidden`}>
        <div className="absolute inset-0 opacity-20">
          <img src={IMAGES.sustainability} alt="Sustainability" className="w-full h-full object-cover" />
        </div>
        <div className="relative z-10">
          <h2 className="text-3xl font-bold mb-4 flex items-center gap-3">
            <AnimatedIcon icon="recycle" className="animated-spin-slow" />
            Plastic Waste Management in Uganda
          </h2>
          <p className="text-lg text-blue-100 mb-6">
            Transforming waste challenges into sustainable solutions through innovation, community action, and policy reform
          </p>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white/20 rounded-lg p-4 text-center backdrop-blur-sm">
              <div className="text-2xl font-bold animated-count">1,200+</div>
              <div className="text-sm">Tons Daily Waste</div>
            </div>
            <div className="bg-white/20 rounded-lg p-4 text-center backdrop-blur-sm">
              <div className="text-2xl font-bold animated-count">45%</div>
              <div className="text-sm">Average Collection</div>
            </div>
            <div className="bg-white/20 rounded-lg p-4 text-center backdrop-blur-sm">
              <div className="text-2xl font-bold animated-count">8%</div>
              <div className="text-sm">Current Recycling</div>
            </div>
          </div>
        </div>
      </div>

      {/* Category Selection */}
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6`}>
        <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'} mb-6`}>Solution Categories</h3>
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          {categories.map((category) => (
            <button
              key={category.key}
              onClick={() => setSelectedCategory(category.key)}
              className={`p-4 rounded-lg text-left transition-all duration-300 ${
                selectedCategory === category.key
                  ? `bg-gradient-to-r ${category.gradient} text-white shadow-lg transform scale-105`
                  : darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <div className="text-2xl mb-2">
                <AnimatedIcon icon="recycle" className="animated-bounce" />
              </div>
              <div className="font-semibold">{category.title}</div>
            </button>
          ))}
        </div>
        
        {/* Solutions Grid */}
        {currentData.length > 0 && (
          <div className="space-y-4">
            <h4 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-800'} flex items-center gap-2`}>
              <AnimatedIcon icon="analysis" className="animated-pulse" />
              {categories.find(c => c.key === selectedCategory)?.title}
            </h4>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentData.map((item, index) => (
                <div key={index} className={`${darkMode ? 'bg-gray-700' : 'bg-gradient-to-br from-gray-50 to-white'} rounded-lg p-6 border ${darkMode ? 'border-gray-600' : 'border-gray-200'} hover:shadow-lg transition-shadow`}>
                  <div className="flex items-center gap-2 mb-3">
                    <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${categories.find(c => c.key === selectedCategory)?.gradient} flex items-center justify-center`}>
                      <AnimatedIcon icon="check" className="text-white animated-check" />
                    </div>
                    <h5 className={`font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{item.title}</h5>
                  </div>
                  
                  <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} text-sm mb-4`}>{item.description}</p>
                  
                  {selectedCategory === 'reduction_strategies' && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>Effectiveness:</span>
                        <span className={`font-medium ${
                          item.effectiveness === 'Very High' ? 'text-green-400' : 
                          item.effectiveness === 'High' ? 'text-blue-400' : 'text-yellow-400'
                        }`}>{item.effectiveness}</span>
                      </div>
                      <div className={`${darkMode ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-50 text-blue-800'} p-2 rounded text-xs`}>
                        {item.uganda_applicability}
                      </div>
                    </div>
                  )}
                  
                  {selectedCategory === 'recycling_initiatives' && (
                    <div className="space-y-2">
                      <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Benefits:</div>
                      <div className="space-y-1">
                        {item.benefits?.slice(0, 2).map((benefit, i) => (
                          <div key={i} className={`flex items-center gap-2 text-xs ${darkMode ? 'text-green-400' : 'text-green-700'}`}>
                            <AnimatedIcon icon="check" className="animated-check" />
                            {benefit}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {selectedCategory === 'innovation_approaches' && (
                    <div className="space-y-2">
                      <div className={`${darkMode ? 'bg-purple-900/30 text-purple-300' : 'bg-purple-50 text-purple-700'} p-2 rounded text-xs`}>
                        <span className="font-medium">Potential: </span>
                        <span>{item.potential}</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const WasteAnalysisCard = ({ analysis, darkMode }) => {
  const getAnalysisIcon = (type) => {
    switch(type) {
      case 'impact_assessment': return 'chart';
      case 'solution_recommendations': return 'analysis';
      case 'trend_analysis': return 'chart';
      default: return 'report';
    }
  };

  const getFocusGradient = (focus) => {
    switch(focus) {
      case 'reduction': return 'from-red-500 to-pink-500';
      case 'recycling': return 'from-green-500 to-emerald-500';
      case 'innovation': return 'from-purple-500 to-indigo-500';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const analysisTypeNames = {
    'impact_assessment': 'Environmental Impact Analysis',
    'solution_recommendations': 'Strategic Solutions Report',
    'trend_analysis': 'Waste Management Trends'
  };

  return (
    <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow border relative overflow-hidden`}>
      {/* Background gradient */}
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-l ${getFocusGradient(analysis.focus_area)} opacity-10 rounded-full -translate-y-16 translate-x-16`}></div>
      
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-800'} flex items-center gap-2`}>
              <AnimatedIcon icon={getAnalysisIcon(analysis.analysis_type)} className="animated-pulse" />
              {analysis.location_name} Report
            </h3>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {analysisTypeNames[analysis.analysis_type] || analysis.analysis_type}
            </p>
          </div>
          <div className={`px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${getFocusGradient(analysis.focus_area)} text-white`}>
            {analysis.focus_area}
          </div>
        </div>
        
        <div className="space-y-4">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 gap-3">
            <div className={`${darkMode ? 'bg-gray-700/50' : 'bg-blue-50'} p-3 rounded-lg text-center`}>
              <div className={`text-lg font-bold ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                {Object.keys(analysis.findings).length}
              </div>
              <div className={`text-xs ${darkMode ? 'text-blue-300' : 'text-blue-800'}`}>Key Findings</div>
            </div>
            <div className={`${darkMode ? 'bg-gray-700/50' : 'bg-green-50'} p-3 rounded-lg text-center`}>
              <div className={`text-lg font-bold ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                {analysis.priority_actions?.length || 0}
              </div>
              <div className={`text-xs ${darkMode ? 'text-green-300' : 'text-green-800'}`}>Priority Actions</div>
            </div>
          </div>
          
          <div>
            <h4 className={`font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-700'} mb-2 flex items-center gap-2`}>
              <AnimatedIcon icon="analysis" className="animated-spin-slow" />
              Executive Summary
            </h4>
            <div className="space-y-2">
              {Object.entries(analysis.findings).slice(0, 2).map(([key, value], i) => (
                <div key={i} className={`${darkMode ? 'bg-gray-700/30' : 'bg-gray-50'} p-3 rounded-lg border-l-4 border-gradient-to-b ${getFocusGradient(analysis.focus_area)}`}>
                  <div className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} capitalize mb-1`}>
                    {key.replace(/_/g, ' ')}
                  </div>
                  <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {typeof value === 'object' ? Object.values(value)[0] : value}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className={`font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-700'} mb-2 flex items-center gap-2`}>
              <AnimatedIcon icon="check" className="animated-check" />
              Immediate Actions Required
            </h4>
            <ul className="space-y-1">
              {analysis.priority_actions?.slice(0, 2).map((action, i) => (
                <li key={i} className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'} flex items-start gap-2`}>
                  <div className={`w-1 h-1 rounded-full bg-gradient-to-r ${getFocusGradient(analysis.focus_area)} mt-2 animated-pulse`}></div>
                  {action}
                </li>
              ))}
            </ul>
          </div>

          {/* Impact Score */}
          <div className={`${darkMode ? 'bg-gray-700/30' : 'bg-gradient-to-r from-gray-50 to-gray-100'} p-3 rounded-lg`}>
            <div className="flex justify-between items-center">
              <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Urgency Level</span>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${getFocusGradient(analysis.focus_area)} animated-pulse`}></div>
                <span className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>High Priority</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className={`mt-4 text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'} flex items-center gap-2`}>
          <AnimatedIcon icon="chart" className="animated-spin-slow" />
          Generated: {new Date(analysis.created_at).toLocaleDateString()}
        </div>
      </div>
    </div>
  );
};

const FeedbackSection = ({ darkMode }) => {
  return (
    <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6`}>
      <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'} mb-4 flex items-center gap-2`}>
        <AnimatedIcon icon="feedback" className="animated-bounce" />
        Share Your Feedback
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
        >
          Loading feedback form...
        </iframe>
        
        {/* Fallback content - shows when iframe doesn't load */}
        <div className={`absolute inset-0 flex items-center justify-center ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} bg-opacity-95`}>
          <div className="text-center p-6">
            <AnimatedIcon icon="feedback" className="text-4xl animated-bounce mb-4" />
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
              <AnimatedIcon icon="feedback" className="animated-pulse" />
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

const Modal = ({ isOpen, onClose, children, darkMode }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 max-w-lg w-full mx-4 max-h-90vh overflow-y-auto shadow-2xl`}>
        <div className="flex justify-end mb-4">
          <button onClick={onClose} className={`${darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'} text-2xl font-bold animated-bounce`}>
            <AnimatedIcon icon="close" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

// Main App Component
const App = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [locations, setLocations] = useState([]);
  const [selectedLocationId, setSelectedLocationId] = useState(null);
  const [airQualityData, setAirQualityData] = useState(null);
  const [wasteManagementSolutions, setWasteManagementSolutions] = useState(null);
  const [wasteAnalyses, setWasteAnalyses] = useState([]);
  const [dashboardSummary, setDashboardSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Modal states
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  
  // Form states
  const [analysisForm, setAnalysisForm] = useState({
    location_id: '', location_name: '', analysis_type: 'impact_assessment', 
    focus_area: 'reduction'
  });

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

  const fetchAirQuality = useCallback(async (locationId) => {
    if (!locationId) return;
    setLoading(true);
    try {
      const response = await axios.get(`${API}/air-quality/${locationId}`);
      setAirQualityData(response.data);
    } catch (error) {
      console.error('Error fetching air quality:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchWasteManagementSolutions = useCallback(async () => {
    try {
      const response = await axios.get(`${API}/waste-management/solutions`);
      setWasteManagementSolutions(response.data);
    } catch (error) {
      console.error('Error fetching waste management solutions:', error);
    }
  }, []);

  const fetchWasteAnalyses = useCallback(async () => {
    try {
      const response = await axios.get(`${API}/waste-management/analysis`);
      setWasteAnalyses(response.data);
    } catch (error) {
      console.error('Error fetching waste analyses:', error);
    }
  }, []);

  const fetchDashboardSummary = useCallback(async () => {
    try {
      const response = await axios.get(`${API}/dashboard/summary`);
      setDashboardSummary(response.data);
    } catch (error) {
      console.error('Error fetching dashboard summary:', error);
    }
  }, []);

  // Action functions
  const handleCreateAnalysis = async (e) => {
    e.preventDefault();
    if (!analysisForm.location_id) {
      alert('Please select a location first');
      return;
    }
    
    try {
      setLoading(true);
      await axios.post(`${API}/waste-management/analysis`, analysisForm);
      setAnalysisForm({
        location_id: '', location_name: '', analysis_type: 'impact_assessment',
        focus_area: 'reduction'
      });
      setShowAnalysisModal(false);
      fetchWasteAnalyses();
    } catch (error) {
      console.error('Error creating analysis:', error);
      alert('Failed to generate analysis. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectLocation = (locationId) => {
    setSelectedLocationId(locationId);
    const location = locations.find(l => l.id === locationId);
    if (location) {
      setAnalysisForm(prev => ({
        ...prev,
        location_id: locationId,
        location_name: location.name
      }));
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchLocations();
    fetchWasteManagementSolutions();
    fetchWasteAnalyses();
    fetchDashboardSummary();
  }, [fetchLocations, fetchWasteManagementSolutions, fetchWasteAnalyses, fetchDashboardSummary]);

  useEffect(() => {
    if (selectedLocationId) {
      fetchAirQuality(selectedLocationId);
    }
  }, [selectedLocationId, fetchAirQuality]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (selectedLocationId) {
        fetchAirQuality(selectedLocationId);
      }
      fetchDashboardSummary();
    }, 30000);

    return () => clearInterval(interval);
  }, [selectedLocationId, fetchAirQuality, fetchDashboardSummary]);

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      darkMode 
        ? 'bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900' 
        : 'bg-gradient-to-br from-blue-50 via-green-50 to-blue-100'
    }`}>
      {/* Header */}
      <header className={`relative ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg overflow-hidden transition-colors duration-300`}>
        <div className="absolute inset-0 opacity-5">
          <img src={IMAGES.plasticPollution} alt="Header Background" className="w-full h-full object-cover" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="text-4xl font-bold animated-bounce">🇺🇬</div>
              <div className="ml-4">
                <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} flex items-center gap-2`}>
                  <AnimatedIcon icon="recycle" className="animated-spin-slow" />
                  EcoGuard Uganda
                </h1>
                <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'} flex items-center gap-2`}>
                  <AnimatedIcon icon="chart" className="animated-pulse" />
                  Plastic Waste Monitoring & Environmental Protection
                </span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {/* Dark Mode Toggle */}
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`p-3 rounded-lg transition-all duration-300 ${
                  darkMode 
                    ? 'bg-yellow-500 text-yellow-900 hover:bg-yellow-400' 
                    : 'bg-gray-800 text-yellow-400 hover:bg-gray-700'
                }`}
              >
                <AnimatedIcon icon={darkMode ? 'sun' : 'moon'} className="text-xl animated-bounce" />
              </button>
              
              <div className={`text-right ${darkMode ? 'bg-gray-700/80' : 'bg-white/80'} backdrop-blur-sm rounded-lg p-3 transition-colors duration-300`}>
                <div className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-800'} flex items-center gap-2`}>
                  <AnimatedIcon icon="location" className="animated-pulse" />
                  {locations.length} Cities
                </div>
                <div className={`text-sm ${darkMode ? 'text-red-400' : 'text-red-600'} flex items-center gap-1`}>
                  <AnimatedIcon icon="alert" className="animated-pulse" />
                  {dashboardSummary?.total_daily_plastic_waste || "1,200+"} Daily Waste
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b shadow-sm transition-colors duration-300`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {[
              { key: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
              { key: 'locations', label: 'City Waste Data', icon: 'city' },
              { key: 'waste-management', label: 'Waste Solutions', icon: 'recycle' },
              { key: 'feedback', label: 'Feedback', icon: 'feedback' }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`py-4 px-2 border-b-3 font-medium text-sm flex items-center gap-2 transition-all ${
                  activeTab === tab.key
                    ? `border-blue-500 ${darkMode ? 'text-blue-400 bg-blue-900/20' : 'text-blue-600 bg-blue-50'}`
                    : `border-transparent ${darkMode ? 'text-gray-400 hover:text-gray-200 hover:border-gray-600' : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'}`
                }`}
              >
                <AnimatedIcon icon={tab.icon} className="text-lg animated-pulse" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            {/* Dashboard Summary */}
            {dashboardSummary && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl shadow-lg p-6 text-center">
                  <div className="text-3xl mb-2">
                    <AnimatedIcon icon="city" className="animated-bounce" />
                  </div>
                  <div className="text-3xl font-bold animated-count">{dashboardSummary.locations_count}</div>
                  <div className="text-blue-100">Cities Monitored</div>
                </div>
                <div className="bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl shadow-lg p-6 text-center">
                  <div className="text-3xl mb-2">
                    <AnimatedIcon icon="waste" className="animated-spin-slow" />
                  </div>
                  <div className="text-3xl font-bold animated-count">{dashboardSummary.total_daily_plastic_waste}</div>
                  <div className="text-red-100">Daily Plastic Waste</div>
                </div>
                <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl shadow-lg p-6 text-center">
                  <div className="text-3xl mb-2">
                    <AnimatedIcon icon="chart" className="animated-pulse" />
                  </div>
                  <div className="text-3xl font-bold animated-count">{dashboardSummary.analysis_count}</div>
                  <div className="text-green-100">Waste Analyses</div>
                </div>
                <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl shadow-lg p-6 text-center">
                  <div className="text-3xl mb-2">
                    <AnimatedIcon icon="recycle" className="animated-spin-slow" />
                  </div>
                  <div className="text-3xl font-bold animated-count">12%</div>
                  <div className="text-purple-100">Avg Recycling Rate</div>
                </div>
              </div>
            )}

            {/* Current Air Quality */}
            {airQualityData && (
              <div>
                <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'} mb-6 flex items-center gap-2`}>
                  <AnimatedIcon icon="chart" className="animated-bounce" />
                  Environmental Conditions
                </h2>
                <AirQualityCard data={airQualityData} darkMode={darkMode} />
              </div>
            )}

            {/* Enhanced Recent Analyses */}
            {dashboardSummary?.recent_analyses && dashboardSummary.recent_analyses.length > 0 && (
              <div>
                <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'} mb-6 flex items-center gap-2`}>
                  <AnimatedIcon icon="analysis" className="animated-pulse" />
                  Latest Waste Management Insights
                </h2>
                
                {/* Summary Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6 text-center`}>
                    <div className={`text-2xl font-bold ${darkMode ? 'text-green-400' : 'text-green-600'} mb-2`}>
                      {wasteAnalyses.filter(a => a.analysis_type === 'impact_assessment').length}
                    </div>
                    <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Impact Assessments</div>
                  </div>
                  <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6 text-center`}>
                    <div className={`text-2xl font-bold ${darkMode ? 'text-blue-400' : 'text-blue-600'} mb-2`}>
                      {wasteAnalyses.filter(a => a.analysis_type === 'solution_recommendations').length}
                    </div>
                    <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Solution Reports</div>
                  </div>
                  <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6 text-center`}>
                    <div className={`text-2xl font-bold ${darkMode ? 'text-purple-400' : 'text-purple-600'} mb-2`}>
                      {wasteAnalyses.filter(a => a.analysis_type === 'trend_analysis').length}
                    </div>
                    <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Trend Analyses</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {dashboardSummary.recent_analyses.map((analysis) => (
                    <WasteAnalysisCard key={analysis.id} analysis={analysis} darkMode={darkMode} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'locations' && (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'} flex items-center gap-2`}>
                <AnimatedIcon icon="city" className="animated-bounce" />
                Uganda Cities - Comprehensive Waste Analytics
              </h2>
              <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-3 shadow-md`}>
                <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{locations.length} cities across 4 regions</div>
                <div className={`text-xs ${darkMode ? 'text-red-400' : 'text-red-600'}`}>Comprehensive monitoring active</div>
              </div>
            </div>
            
            {/* City Statistics Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6 text-center`}>
                <div className={`text-2xl font-bold ${darkMode ? 'text-red-400' : 'text-red-600'} mb-2`}>
                  {locations.reduce((sum, loc) => sum + parseFloat(loc.plastic_waste?.daily_generation?.split(' ')[0] || 0), 0).toFixed(0)}
                </div>
                <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Total Daily Waste (tons)</div>
              </div>
              <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6 text-center`}>
                <div className={`text-2xl font-bold ${darkMode ? 'text-yellow-400' : 'text-yellow-600'} mb-2`}>
                  {(locations.reduce((sum, loc) => sum + parseInt(loc.plastic_waste?.collection_rate?.replace('%', '') || 0), 0) / locations.length).toFixed(0)}%
                </div>
                <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Average Collection Rate</div>
              </div>
              <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6 text-center`}>
                <div className={`text-2xl font-bold ${darkMode ? 'text-green-400' : 'text-green-600'} mb-2`}>
                  {(locations.reduce((sum, loc) => sum + parseInt(loc.plastic_waste?.recycling_rate?.replace('%', '') || 0), 0) / locations.length).toFixed(0)}%
                </div>
                <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Average Recycling Rate</div>
              </div>
              <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6 text-center`}>
                <div className={`text-2xl font-bold ${darkMode ? 'text-blue-400' : 'text-blue-600'} mb-2`}>
                  {locations.reduce((sum, loc) => sum + (loc.plastic_waste?.solutions_implemented?.length || 0), 0)}
                </div>
                <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Active Solutions</div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {locations.map((location) => (
                <LocationCard
                  key={location.id}
                  location={location}
                  onSelectLocation={handleSelectLocation}
                  isSelected={selectedLocationId === location.id}
                  darkMode={darkMode}
                />
              ))}
            </div>

            {selectedLocationId && airQualityData && (
              <div className="mt-8">
                <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'} mb-4 flex items-center gap-2`}>
                  <AnimatedIcon icon="chart" className="animated-pulse" />
                  Environmental Conditions
                </h3>
                <AirQualityCard data={airQualityData} darkMode={darkMode} />
              </div>
            )}
          </div>
        )}

        {activeTab === 'waste-management' && (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'} flex items-center gap-2`}>
                <AnimatedIcon icon="recycle" className="animated-spin-slow" />
                Waste Management Solutions
              </h2>
              <button
                onClick={() => setShowAnalysisModal(true)}
                disabled={loading}
                className={`bg-gradient-to-r from-green-600 to-blue-600 text-white px-6 py-3 rounded-lg hover:from-green-700 hover:to-blue-700 transition-all shadow-lg flex items-center gap-2 ${
                  loading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <AnimatedIcon icon="analysis" className={loading ? "animated-spin" : "animated-pulse"} />
                {loading ? 'Generating...' : 'Generate Analysis Report'}
              </button>
            </div>
            
            {/* Waste Management Information */}
            <WasteManagementInfoCard solutionsData={wasteManagementSolutions} darkMode={darkMode} />
            
            {/* Analysis Results */}
            {wasteAnalyses.length > 0 && (
              <div>
                <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'} mb-6 flex items-center gap-2`}>
                  <AnimatedIcon icon="report" className="animated-pulse" />
                  Comprehensive Analysis Reports
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {wasteAnalyses.map((analysis) => (
                    <WasteAnalysisCard key={analysis.id} analysis={analysis} darkMode={darkMode} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'feedback' && (
          <div className="space-y-8">
            <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'} flex items-center gap-2`}>
              <AnimatedIcon icon="feedback" className="animated-bounce" />
              Community Feedback & Engagement
            </h2>
            
            <FeedbackSection darkMode={darkMode} />
          </div>
        )}
      </main>

      {/* Analysis Generation Modal */}
      <Modal isOpen={showAnalysisModal} onClose={() => setShowAnalysisModal(false)} darkMode={darkMode}>
        <h3 className={`text-xl font-bold mb-4 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
          <AnimatedIcon icon="analysis" className="animated-pulse" />
          Generate Comprehensive Waste Analysis
        </h3>
        <form onSubmit={handleCreateAnalysis}>
          <div className="space-y-4">
            <div>
              <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>Select Location</label>
              <select
                value={analysisForm.location_id}
                onChange={(e) => {
                  const location = locations.find(l => l.id === e.target.value);
                  setAnalysisForm({
                    ...analysisForm, 
                    location_id: e.target.value,
                    location_name: location ? location.name : ''
                  });
                }}
                className={`w-full px-3 py-2 border ${
                  darkMode 
                    ? 'border-gray-600 bg-gray-700 text-white' 
                    : 'border-gray-300 bg-white text-gray-900'
                } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                required
              >
                <option value="">Choose a city for analysis</option>
                {locations.map((location) => (
                  <option key={location.id} value={location.id}>
                    {location.name} ({location.region} Region) - {location.plastic_waste?.daily_generation}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>Analysis Type</label>
              <select
                value={analysisForm.analysis_type}
                onChange={(e) => setAnalysisForm({...analysisForm, analysis_type: e.target.value})}
                className={`w-full px-3 py-2 border ${
                  darkMode 
                    ? 'border-gray-600 bg-gray-700 text-white' 
                    : 'border-gray-300 bg-white text-gray-900'
                } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
              >
                <option value="impact_assessment">Environmental Impact Assessment</option>
                <option value="solution_recommendations">Strategic Solution Recommendations</option>
                <option value="trend_analysis">Waste Management Trend Analysis</option>
              </select>
            </div>
            <div>
              <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>Focus Area</label>
              <select
                value={analysisForm.focus_area}
                onChange={(e) => setAnalysisForm({...analysisForm, focus_area: e.target.value})}
                className={`w-full px-3 py-2 border ${
                  darkMode 
                    ? 'border-gray-600 bg-gray-700 text-white' 
                    : 'border-gray-300 bg-white text-gray-900'
                } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
              >
                <option value="reduction">Waste Reduction Strategies</option>
                <option value="recycling">Recycling & Recovery Solutions</option>
                <option value="innovation">Innovation & Technology Approaches</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={() => setShowAnalysisModal(false)}
              className={`px-4 py-2 ${darkMode ? 'text-gray-300 hover:text-gray-100' : 'text-gray-600 hover:text-gray-800'} transition-colors`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-6 py-2 bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-md hover:from-blue-700 hover:to-green-700 transition-all shadow-lg flex items-center gap-2 ${
                loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <AnimatedIcon icon="analysis" className={loading ? "animated-spin" : "animated-pulse"} />
              {loading ? 'Generating Report...' : 'Generate Report'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default App;