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

// Components
const LocationCard = ({ location, onSelectLocation, isSelected }) => {
  const getWasteLevel = (collectionRate) => {
    const rate = parseInt(collectionRate);
    if (rate >= 60) return { level: 'Low', color: 'text-green-600 bg-green-100', icon: '✅' };
    if (rate >= 40) return { level: 'Medium', color: 'text-yellow-600 bg-yellow-100', icon: '⚠️' };
    return { level: 'High', color: 'text-red-600 bg-red-100', icon: '🚨' };
  };

  const wasteLevel = getWasteLevel(location.plastic_waste?.collection_rate || "0%");

  return (
    <div className={`bg-white rounded-xl shadow-lg p-6 cursor-pointer transition-all duration-300 hover:shadow-xl border-2 relative overflow-hidden ${
      isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
    }`} onClick={() => onSelectLocation(location.id)}>
      {/* Background Pattern */}
      <div className="absolute top-0 right-0 w-32 h-32 opacity-5">
        <div className="text-8xl transform rotate-12">🏙️</div>
      </div>
      
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              📍 {location.name}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm text-gray-600">{location.region} Region</span>
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                {location.population}
              </span>
            </div>
          </div>
          <div className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${wasteLevel.color}`}>
            <span>{wasteLevel.icon}</span>
            {wasteLevel.level} Risk
          </div>
        </div>

        {location.plastic_waste && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-red-50 p-3 rounded-lg">
                <div className="text-lg font-bold text-red-600">{location.plastic_waste.daily_generation}</div>
                <div className="text-xs text-red-800">Daily Waste Generated</div>
              </div>
              <div className="bg-green-50 p-3 rounded-lg">
                <div className="text-lg font-bold text-green-600">{location.plastic_waste.collection_rate}</div>
                <div className="text-xs text-green-800">Collection Rate</div>
              </div>
            </div>
            
            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium text-gray-700">Recycling:</span>
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                {location.plastic_waste.recycling_rate}
              </span>
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium text-gray-700">Main Sources:</div>
              <div className="flex flex-wrap gap-1">
                {location.plastic_waste.main_sources?.slice(0, 2).map((source, i) => (
                  <span key={i} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                    {source}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium text-gray-700">Solutions in Place:</div>
              <div className="space-y-1">
                {location.plastic_waste.solutions_implemented?.slice(0, 2).map((solution, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-green-700">
                    <span className="text-green-500">✓</span>
                    {solution}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const AirQualityCard = ({ data }) => {
  const getAQIColor = (aqi) => {
    if (aqi <= 50) return 'bg-green-500';
    if (aqi <= 100) return 'bg-yellow-500';
    if (aqi <= 150) return 'bg-orange-500';
    if (aqi <= 200) return 'bg-red-500';
    if (aqi <= 300) return 'bg-purple-500';
    return 'bg-red-800';
  };

  const getRecommendation = (aqi) => {
    if (aqi <= 50) return "🌟 Excellent air quality! Perfect for outdoor activities and reducing plastic waste collection efforts.";
    if (aqi <= 100) return "😊 Good air quality. Normal waste management activities can proceed safely.";
    if (aqi <= 150) return "😷 Sensitive groups should limit outdoor waste collection activities.";
    return "⚠️ Limit outdoor activities. Focus on indoor waste sorting and processing.";
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 relative overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 opacity-10">
        <img src={IMAGES.plasticPollution} alt="Environmental" className="w-full h-full object-cover" />
      </div>
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            🌤️ Air Quality - {data.location_name}
          </h3>
          <div className={`px-4 py-2 rounded-full text-white text-lg font-bold ${getAQIColor(data.aqi)}`}>
            {data.aqi}
          </div>
        </div>
        
        <div className="mb-4">
          <div className="text-lg font-semibold text-gray-700 mb-2">{data.category}</div>
          <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border-l-4 border-blue-500">
            {getRecommendation(data.aqi)}
          </div>
        </div>
        
        {(data.pm25 || data.ozone) && (
          <div className="grid grid-cols-2 gap-4 mb-4">
            {data.pm25 && (
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-blue-600">{data.pm25}</div>
                <div className="text-sm text-blue-800">PM2.5 (μg/m³)</div>
                <div className="text-xs text-blue-600 mt-1">Fine Particles</div>
              </div>
            )}
            {data.ozone && (
              <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-purple-600">{data.ozone}</div>
                <div className="text-sm text-purple-800">Ozone (ppb)</div>
                <div className="text-xs text-purple-600 mt-1">Ground Level</div>
              </div>
            )}
          </div>
        )}
        
        <div className="text-xs text-gray-500 text-center flex items-center justify-center gap-2">
          <span>🕐</span>
          Updated: {new Date(data.timestamp).toLocaleString()}
        </div>
      </div>
    </div>
  );
};

const WasteManagementInfoCard = ({ solutionsData }) => {
  const [selectedCategory, setSelectedCategory] = useState('reduction_strategies');
  const [selectedIndex, setSelectedIndex] = useState(0);
  
  if (!solutionsData) return null;

  const categories = [
    { key: 'reduction_strategies', title: '🎯 Reduction Strategies', icon: '🚫' },
    { key: 'recycling_initiatives', title: '♻️ Recycling Solutions', icon: '🔄' },
    { key: 'innovation_approaches', title: '💡 Innovation Hub', icon: '🚀' }
  ];

  const currentData = solutionsData[selectedCategory] || [];

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-blue-600 via-green-600 to-blue-800 text-white rounded-xl p-8 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <img src={IMAGES.sustainability} alt="Sustainability" className="w-full h-full object-cover" />
        </div>
        <div className="relative z-10">
          <h2 className="text-3xl font-bold mb-4 flex items-center gap-3">
            🌍 Plastic Waste Management in Uganda
          </h2>
          <p className="text-lg text-blue-100 mb-6">
            Transforming waste challenges into sustainable solutions through innovation, community action, and policy reform
          </p>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white/20 rounded-lg p-4 text-center backdrop-blur-sm">
              <div className="text-2xl font-bold">1,200+</div>
              <div className="text-sm">Tons Daily Waste</div>
            </div>
            <div className="bg-white/20 rounded-lg p-4 text-center backdrop-blur-sm">
              <div className="text-2xl font-bold">45%</div>
              <div className="text-sm">Average Collection</div>
            </div>
            <div className="bg-white/20 rounded-lg p-4 text-center backdrop-blur-sm">
              <div className="text-2xl font-bold">8%</div>
              <div className="text-sm">Current Recycling</div>
            </div>
          </div>
        </div>
      </div>

      {/* Category Selection */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-6">Solution Categories</h3>
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          {categories.map((category) => (
            <button
              key={category.key}
              onClick={() => {
                setSelectedCategory(category.key);
                setSelectedIndex(0);
              }}
              className={`p-4 rounded-lg text-left transition-all duration-300 ${
                selectedCategory === category.key
                  ? 'bg-gradient-to-r from-blue-500 to-green-500 text-white shadow-lg transform scale-105'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <div className="text-2xl mb-2">{category.icon}</div>
              <div className="font-semibold">{category.title}</div>
            </button>
          ))}
        </div>
        
        {/* Solutions Grid */}
        {currentData.length > 0 && (
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              {categories.find(c => c.key === selectedCategory)?.icon}
              {categories.find(c => c.key === selectedCategory)?.title}
            </h4>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentData.map((item, index) => (
                <div key={index} className="bg-gradient-to-br from-gray-50 to-white rounded-lg p-6 border border-gray-200 hover:shadow-lg transition-shadow">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-2xl">
                      {selectedCategory === 'reduction_strategies' ? '🎯' : 
                       selectedCategory === 'recycling_initiatives' ? '♻️' : '💡'}
                    </span>
                    <h5 className="font-bold text-gray-800">{item.title}</h5>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-4">{item.description}</p>
                  
                  {selectedCategory === 'reduction_strategies' && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500">Effectiveness:</span>
                        <span className={`font-medium ${
                          item.effectiveness === 'Very High' ? 'text-green-600' : 
                          item.effectiveness === 'High' ? 'text-blue-600' : 'text-yellow-600'
                        }`}>{item.effectiveness}</span>
                      </div>
                      <div className="bg-blue-50 p-2 rounded text-xs text-blue-800">
                        🇺🇬 {item.uganda_applicability}
                      </div>
                    </div>
                  )}
                  
                  {selectedCategory === 'recycling_initiatives' && (
                    <div className="space-y-2">
                      <div className="text-xs text-gray-600">Benefits:</div>
                      <div className="space-y-1">
                        {item.benefits?.slice(0, 2).map((benefit, i) => (
                          <div key={i} className="flex items-center gap-2 text-xs text-green-700">
                            <span className="text-green-500">✓</span>
                            {benefit}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {selectedCategory === 'innovation_approaches' && (
                    <div className="space-y-2">
                      <div className="bg-purple-50 p-2 rounded text-xs">
                        <span className="text-purple-700 font-medium">Potential: </span>
                        <span className="text-purple-600">{item.potential}</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Success Stories */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          🏆 Success Stories & Impact
        </h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="relative bg-gradient-to-r from-green-100 to-blue-100 rounded-lg p-6">
            <div className="absolute top-2 right-2">
              <img src={IMAGES.recyclingBins} alt="Recycling" className="w-12 h-12 rounded-lg object-cover" />
            </div>
            <h4 className="font-bold text-green-800 mb-2">🌟 Entebbe Airport Initiative</h4>
            <p className="text-green-700 text-sm mb-3">
              Achieved 65% collection rate through comprehensive tourist education and improved infrastructure.
            </p>
            <div className="text-xs text-green-600">
              Result: 18% recycling rate - highest in Uganda
            </div>
          </div>
          
          <div className="relative bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg p-6">
            <div className="absolute top-2 right-2">
              <img src={IMAGES.renewableEnergy} alt="Innovation" className="w-12 h-12 rounded-lg object-cover" />
            </div>
            <h4 className="font-bold text-blue-800 mb-2">🚀 Kampala Youth Programs</h4>
            <p className="text-blue-700 text-sm mb-3">
              Community-led upcycling workshops creating income opportunities while reducing waste.
            </p>
            <div className="text-xs text-blue-600">
              Impact: 350+ jobs created, 120 tons waste diverted
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const WasteAnalysisCard = ({ analysis }) => {
  const getAnalysisIcon = (type) => {
    switch(type) {
      case 'impact_assessment': return '📊';
      case 'solution_recommendations': return '💡';
      case 'trend_analysis': return '📈';
      default: return '📋';
    }
  };

  const getFocusColor = (focus) => {
    switch(focus) {
      case 'reduction': return 'bg-red-100 text-red-800';
      case 'recycling': return 'bg-green-100 text-green-800';
      case 'innovation': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            {getAnalysisIcon(analysis.analysis_type)}
            {analysis.location_name} Analysis
          </h3>
          <p className="text-sm text-gray-600">
            {analysis.analysis_type.replace('_', ' ').toUpperCase()}
          </p>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-medium ${getFocusColor(analysis.focus_area)}`}>
          {analysis.focus_area}
        </div>
      </div>
      
      <div className="space-y-4">
        <div>
          <h4 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
            🔍 Key Findings
          </h4>
          <div className="space-y-2">
            {Object.entries(analysis.findings).slice(0, 3).map(([key, value], i) => (
              <div key={i} className="bg-gray-50 p-3 rounded-lg">
                <div className="text-sm font-medium text-gray-700 capitalize mb-1">
                  {key.replace(/_/g, ' ')}
                </div>
                <div className="text-sm text-gray-600">
                  {typeof value === 'object' ? Object.values(value)[0] : value}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <h4 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
            🎯 Priority Actions
          </h4>
          <ul className="space-y-1">
            {analysis.priority_actions?.slice(0, 2).map((action, i) => (
              <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                <span className="text-orange-500 font-bold">•</span>
                {action}
              </li>
            ))}
          </ul>
        </div>
      </div>
      
      <div className="mt-4 text-xs text-gray-500 flex items-center gap-2">
        <span>📅</span>
        Generated: {new Date(analysis.created_at).toLocaleDateString()}
      </div>
    </div>
  );
};

const AlertCard = ({ alert, onAcknowledge }) => {
  const getSeverityColor = (severity) => {
    switch(severity) {
      case 'critical': return 'bg-red-600';
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-orange-500';
      case 'low': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getAlertIcon = (type) => {
    switch(type) {
      case 'air_quality': return '🌤️';
      case 'plastic_waste_critical': return '🗑️';
      default: return '⚠️';
    }
  };

  return (
    <div className={`rounded-lg p-4 mb-3 transition-all ${alert.acknowledged ? 'bg-gray-100 opacity-60' : 'bg-white shadow-md hover:shadow-lg'}`}>
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">{getAlertIcon(alert.alert_type)}</span>
            <div>
              <span className={`px-3 py-1 rounded-full text-white text-xs font-bold ${getSeverityColor(alert.severity)}`}>
                {alert.severity.toUpperCase()}
              </span>
              <span className="ml-2 text-sm text-gray-600 font-medium">{alert.location_name}</span>
            </div>
          </div>
          <p className="text-gray-800 mb-2">{alert.message}</p>
          <p className="text-sm text-gray-500 flex items-center gap-2">
            <span>🕐</span>
            {new Date(alert.timestamp).toLocaleString()}
          </p>
        </div>
        {!alert.acknowledged && (
          <button
            onClick={() => onAcknowledge(alert.id)}
            className="ml-4 px-4 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
          >
            <span>✓</span>
            Acknowledge
          </button>
        )}
      </div>
    </div>
  );
};

const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-white rounded-xl p-6 max-w-lg w-full mx-4 max-h-90vh overflow-y-auto shadow-2xl">
        <div className="flex justify-end mb-4">
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl font-bold">
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

// Main App Component
const App = () => {
  const [locations, setLocations] = useState([]);
  const [selectedLocationId, setSelectedLocationId] = useState(null);
  const [airQualityData, setAirQualityData] = useState(null);
  const [wasteManagementSolutions, setWasteManagementSolutions] = useState(null);
  const [wasteAnalyses, setWasteAnalyses] = useState([]);
  const [alerts, setAlerts] = useState([]);
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
      
      // If no locations, initialize Uganda cities
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

  const fetchAlerts = useCallback(async () => {
    try {
      const response = await axios.get(`${API}/alerts`);
      setAlerts(response.data);
    } catch (error) {
      console.error('Error fetching alerts:', error);
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
      await axios.post(`${API}/waste-management/analysis`, analysisForm);
      setAnalysisForm({
        location_id: '', location_name: '', analysis_type: 'impact_assessment',
        focus_area: 'reduction'
      });
      setShowAnalysisModal(false);
      fetchWasteAnalyses();
    } catch (error) {
      console.error('Error creating analysis:', error);
    }
  };

  const handleAcknowledgeAlert = async (alertId) => {
    try {
      await axios.patch(`${API}/alerts/${alertId}/acknowledge`);
      fetchAlerts();
    } catch (error) {
      console.error('Error acknowledging alert:', error);
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
    fetchAlerts();
    fetchDashboardSummary();
  }, [fetchLocations, fetchWasteManagementSolutions, fetchWasteAnalyses, fetchAlerts, fetchDashboardSummary]);

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
      fetchAlerts();
      fetchDashboardSummary();
    }, 30000);

    return () => clearInterval(interval);
  }, [selectedLocationId, fetchAirQuality, fetchAlerts, fetchDashboardSummary]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-blue-100">
      {/* Header */}
      <header className="relative bg-white shadow-lg overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <img src={IMAGES.plasticPollution} alt="Header Background" className="w-full h-full object-cover" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="text-4xl font-bold">🇺🇬</div>
              <div className="ml-4">
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                  <span>🌍</span>
                  EcoGuard Uganda
                </h1>
                <span className="text-sm text-gray-600 flex items-center gap-2">
                  <span>♻️</span>
                  Plastic Waste Monitoring & Environmental Protection
                </span>
              </div>
            </div>
            <div className="text-right bg-white/80 backdrop-blur-sm rounded-lg p-3">
              <div className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <span>📍</span>
                {locations.length} Cities
              </div>
              <div className="text-sm text-red-600 flex items-center gap-1">
                <span>⚠️</span>
                {dashboardSummary?.total_daily_plastic_waste || "1,200+"} Daily Waste
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {[
              { key: 'dashboard', label: 'Dashboard', icon: '📊' },
              { key: 'locations', label: 'City Waste Data', icon: '🏙️' },
              { key: 'waste-management', label: 'Waste Solutions', icon: '♻️' },
              { key: 'alerts', label: 'Alerts', icon: '🚨' }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`py-4 px-2 border-b-3 font-medium text-sm flex items-center gap-2 transition-all ${
                  activeTab === tab.key
                    ? 'border-blue-500 text-blue-600 bg-blue-50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="text-lg">{tab.icon}</span>
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
                  <div className="text-3xl mb-2">🏙️</div>
                  <div className="text-3xl font-bold">{dashboardSummary.locations_count}</div>
                  <div className="text-blue-100">Cities Monitored</div>
                </div>
                <div className="bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl shadow-lg p-6 text-center">
                  <div className="text-3xl mb-2">🗑️</div>
                  <div className="text-3xl font-bold">{dashboardSummary.total_daily_plastic_waste}</div>
                  <div className="text-red-100">Daily Plastic Waste</div>
                </div>
                <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl shadow-lg p-6 text-center">
                  <div className="text-3xl mb-2">📊</div>
                  <div className="text-3xl font-bold">{dashboardSummary.analysis_count}</div>
                  <div className="text-green-100">Waste Analyses</div>
                </div>
                <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl shadow-lg p-6 text-center">
                  <div className="text-3xl mb-2">🚨</div>
                  <div className="text-3xl font-bold">{dashboardSummary.unacknowledged_alerts}</div>
                  <div className="text-orange-100">Active Alerts</div>
                </div>
              </div>
            )}

            {/* Current Air Quality */}
            {airQualityData && (
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                  🌤️ Environmental Conditions
                </h2>
                <AirQualityCard data={airQualityData} />
              </div>
            )}

            {/* Recent Analyses */}
            {dashboardSummary?.recent_analyses && dashboardSummary.recent_analyses.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                  📊 Recent Waste Management Analyses
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {dashboardSummary.recent_analyses.map((analysis) => (
                    <WasteAnalysisCard key={analysis.id} analysis={analysis} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'locations' && (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                🏙️ Uganda Cities - Plastic Waste Analysis
              </h2>
              <div className="bg-white rounded-lg p-3 shadow-md">
                <div className="text-sm text-gray-600">{locations.length} cities across 4 regions</div>
                <div className="text-xs text-red-600">Critical waste management needed</div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {locations.map((location) => (
                <LocationCard
                  key={location.id}
                  location={location}
                  onSelectLocation={handleSelectLocation}
                  isSelected={selectedLocationId === location.id}
                />
              ))}
            </div>

            {selectedLocationId && airQualityData && (
              <div className="mt-8">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  🌤️ Environmental Conditions
                </h3>
                <AirQualityCard data={airQualityData} />
              </div>
            )}
          </div>
        )}

        {activeTab === 'waste-management' && (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                ♻️ Waste Management Solutions
              </h2>
              <button
                onClick={() => setShowAnalysisModal(true)}
                className="bg-gradient-to-r from-green-600 to-blue-600 text-white px-6 py-3 rounded-lg hover:from-green-700 hover:to-blue-700 transition-all shadow-lg flex items-center gap-2"
              >
                <span>📊</span>
                Generate Analysis Report
              </button>
            </div>
            
            {/* Waste Management Information */}
            <WasteManagementInfoCard solutionsData={wasteManagementSolutions} />
            
            {/* Analysis Results */}
            {wasteAnalyses.length > 0 && (
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                  📊 Analysis Reports
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {wasteAnalyses.map((analysis) => (
                    <WasteAnalysisCard key={analysis.id} analysis={analysis} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'alerts' && (
          <div className="space-y-8">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              🚨 Environmental Alerts & Warnings
            </h2>
            
            {alerts.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl shadow-lg">
                <div className="text-6xl mb-4">✅</div>
                <h3 className="text-xl text-gray-600 mb-2">No Active Alerts</h3>
                <p className="text-gray-500">All environmental conditions are within acceptable ranges</p>
                <div className="mt-4 text-sm text-green-600">
                  System monitoring 24/7 for environmental changes
                </div>
              </div>
            ) : (
              <div className="max-w-4xl">
                {alerts.map((alert) => (
                  <AlertCard
                    key={alert.id}
                    alert={alert}
                    onAcknowledge={handleAcknowledgeAlert}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Analysis Generation Modal */}
      <Modal isOpen={showAnalysisModal} onClose={() => setShowAnalysisModal(false)}>
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          📊 Generate Waste Management Analysis
        </h3>
        <form onSubmit={handleCreateAnalysis}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select a location</option>
                {locations.map((location) => (
                  <option key={location.id} value={location.id}>
                    {location.name} ({location.region} Region)
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Analysis Type</label>
              <select
                value={analysisForm.analysis_type}
                onChange={(e) => setAnalysisForm({...analysisForm, analysis_type: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="impact_assessment">📊 Impact Assessment</option>
                <option value="solution_recommendations">💡 Solution Recommendations</option>
                <option value="trend_analysis">📈 Trend Analysis</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Focus Area</label>
              <select
                value={analysisForm.focus_area}
                onChange={(e) => setAnalysisForm({...analysisForm, focus_area: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="reduction">🎯 Waste Reduction</option>
                <option value="recycling">♻️ Recycling Solutions</option>
                <option value="innovation">💡 Innovation Approaches</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={() => setShowAnalysisModal(false)}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-md hover:from-blue-700 hover:to-green-700 transition-all shadow-lg"
            >
              Generate Report
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default App;