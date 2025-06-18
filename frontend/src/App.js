import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './App.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Components
const LocationCard = ({ location, onSelectLocation, isSelected }) => (
  <div className={`bg-white rounded-xl shadow-lg p-6 cursor-pointer transition-all duration-300 hover:shadow-xl border-2 ${
    isSelected ? 'border-green-500 bg-green-50' : 'border-gray-200'
  }`} onClick={() => onSelectLocation(location.id)}>
    <div className="flex justify-between items-start">
      <div>
        <h3 className="text-xl font-bold text-gray-800">{location.name}</h3>
        <div className="flex items-center text-gray-600 mt-1">
          <span className="text-sm">{location.region} Region</span>
          {location.population && (
            <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
              {location.population}
            </span>
          )}
        </div>
        <p className="text-gray-500 text-sm mt-1">
          {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
        </p>
      </div>
      <div className="text-2xl">📍</div>
    </div>
  </div>
);

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
    if (aqi <= 50) return "Air quality is excellent. Great for outdoor activities!";
    if (aqi <= 100) return "Air quality is acceptable. Normal activities recommended.";
    if (aqi <= 150) return "Sensitive individuals should limit outdoor exertion.";
    if (aqi <= 200) return "Everyone should avoid prolonged outdoor activities.";
    return "Health warnings - everyone should avoid outdoor activities.";
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-800">Air Quality - {data.location_name}</h3>
        <div className={`px-4 py-2 rounded-full text-white text-lg font-bold ${getAQIColor(data.aqi)}`}>
          {data.aqi}
        </div>
      </div>
      
      <div className="mb-4">
        <div className="text-lg font-semibold text-gray-700 mb-2">{data.category}</div>
        <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
          {getRecommendation(data.aqi)}
        </div>
      </div>
      
      {(data.pm25 || data.ozone) && (
        <div className="grid grid-cols-2 gap-4 mb-4">
          {data.pm25 && (
            <div className="bg-blue-50 p-3 rounded-lg text-center">
              <div className="text-2xl font-bold text-blue-600">{data.pm25}</div>
              <div className="text-sm text-blue-800">PM2.5 (μg/m³)</div>
            </div>
          )}
          {data.ozone && (
            <div className="bg-purple-50 p-3 rounded-lg text-center">
              <div className="text-2xl font-bold text-purple-600">{data.ozone}</div>
              <div className="text-sm text-purple-800">Ozone (ppb)</div>
            </div>
          )}
        </div>
      )}
      
      <div className="text-xs text-gray-500 text-center">
        Updated: {new Date(data.timestamp).toLocaleString()}
      </div>
    </div>
  );
};

const BioplasticsInfoCard = ({ bioplasticInfo }) => {
  const [selectedType, setSelectedType] = useState(0);
  
  if (!bioplasticInfo) return null;

  return (
    <div className="space-y-6">
      {/* Overview */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-xl p-6">
        <h2 className="text-2xl font-bold mb-4">🌱 Bioplastics in Uganda</h2>
        <p className="text-green-100">
          Exploring sustainable plastic alternatives using Uganda's abundant agricultural resources
        </p>
      </div>

      {/* Types Selection */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Bioplastic Types</h3>
        <div className="flex flex-wrap gap-2 mb-6">
          {bioplasticInfo.types.map((type, index) => (
            <button
              key={index}
              onClick={() => setSelectedType(index)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedType === index
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {type.name.split(' ')[0]}
            </button>
          ))}
        </div>
        
        {/* Selected Type Details */}
        <div className="border-l-4 border-green-500 pl-6">
          <h4 className="text-lg font-semibold text-gray-800 mb-2">
            {bioplasticInfo.types[selectedType].name}
          </h4>
          <p className="text-gray-600 mb-4">{bioplasticInfo.types[selectedType].description}</p>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h5 className="font-medium text-gray-700 mb-2">Applications</h5>
              <ul className="text-sm text-gray-600 space-y-1">
                {bioplasticInfo.types[selectedType].applications.map((app, i) => (
                  <li key={i} className="flex items-center">
                    <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                    {app}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h5 className="font-medium text-gray-700 mb-2">Uganda Relevance</h5>
              <p className="text-sm text-green-700 bg-green-50 p-3 rounded-lg">
                {bioplasticInfo.types[selectedType].uganda_relevance}
              </p>
            </div>
          </div>
          
          <div className="mt-4 flex flex-wrap gap-4 text-sm">
            <div className="bg-blue-50 px-3 py-2 rounded-lg">
              <span className="font-medium text-blue-800">Degradation: </span>
              <span className="text-blue-600">{bioplasticInfo.types[selectedType].degradation_time}</span>
            </div>
            <div className="bg-green-50 px-3 py-2 rounded-lg">
              <span className="font-medium text-green-800">Impact: </span>
              <span className="text-green-600">{bioplasticInfo.types[selectedType].environmental_impact}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Opportunities for Uganda */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">🇺🇬 Opportunities for Uganda</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-green-700 mb-3">Benefits</h4>
            <ul className="space-y-2">
              {bioplasticInfo.benefits.slice(0, 3).map((benefit, i) => (
                <li key={i} className="flex items-start text-sm text-gray-700">
                  <span className="text-green-500 mr-2">✓</span>
                  {benefit}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-blue-700 mb-3">Strategic Advantages</h4>
            <ul className="space-y-2">
              {bioplasticInfo.uganda_opportunities.slice(0, 3).map((opportunity, i) => (
                <li key={i} className="flex items-start text-sm text-gray-700">
                  <span className="text-blue-500 mr-2">→</span>
                  {opportunity}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

const BioplasticResearchCard = ({ research }) => (
  <div className="bg-white rounded-xl shadow-lg p-6">
    <div className="flex justify-between items-start mb-4">
      <div>
        <h3 className="text-lg font-bold text-gray-800">{research.bioplastic_type} Research</h3>
        <p className="text-sm text-gray-600">{research.location_name} • {research.research_focus.replace('_', ' ').toUpperCase()}</p>
      </div>
      <div className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium">
        {research.research_focus.replace('_', ' ')}
      </div>
    </div>
    
    <div className="space-y-3">
      <h4 className="font-semibold text-gray-700">Key Findings</h4>
      {Object.entries(research.findings).slice(0, 3).map(([key, value], i) => (
        <div key={i} className="bg-gray-50 p-3 rounded-lg">
          <div className="text-sm font-medium text-gray-700 capitalize mb-1">
            {key.replace('_', ' ')}
          </div>
          <div className="text-sm text-gray-600">{value}</div>
        </div>
      ))}
    </div>
    
    <div className="mt-4">
      <h4 className="font-semibold text-gray-700 mb-2">Recommendations</h4>
      <ul className="space-y-1">
        {research.recommendations.slice(0, 2).map((rec, i) => (
          <li key={i} className="text-sm text-gray-600 flex items-start">
            <span className="text-green-500 mr-2 flex-shrink-0">•</span>
            {rec}
          </li>
        ))}
      </ul>
    </div>
    
    <div className="mt-4 text-xs text-gray-500">
      Generated: {new Date(research.created_at).toLocaleDateString()}
    </div>
  </div>
);

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

  return (
    <div className={`rounded-lg p-4 mb-3 ${alert.acknowledged ? 'bg-gray-100' : 'bg-white shadow-md'}`}>
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className={`px-2 py-1 rounded text-white text-xs font-medium ${getSeverityColor(alert.severity)}`}>
              {alert.severity.toUpperCase()}
            </span>
            <span className="text-sm text-gray-600">{alert.location_name}</span>
          </div>
          <p className="text-gray-800">{alert.message}</p>
          <p className="text-sm text-gray-500 mt-1">
            {new Date(alert.timestamp).toLocaleString()}
          </p>
        </div>
        {!alert.acknowledged && (
          <button
            onClick={() => onAcknowledge(alert.id)}
            className="ml-4 px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-lg w-full mx-4 max-h-90vh overflow-y-auto">
        <div className="flex justify-end mb-4">
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-xl">
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
  const [bioplasticsInfo, setBioplasticsInfo] = useState(null);
  const [bioplasticResearch, setBioplasticResearch] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [dashboardSummary, setDashboardSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Modal states
  const [showResearchModal, setShowResearchModal] = useState(false);
  
  // Form states
  const [researchForm, setResearchForm] = useState({
    location_id: '', location_name: '', research_focus: 'production_feasibility', 
    bioplastic_type: 'PLA'
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

  const fetchBioplasticsInfo = useCallback(async () => {
    try {
      const response = await axios.get(`${API}/bioplastics/info`);
      setBioplasticsInfo(response.data);
    } catch (error) {
      console.error('Error fetching bioplastics info:', error);
    }
  }, []);

  const fetchBioplasticResearch = useCallback(async () => {
    try {
      const response = await axios.get(`${API}/bioplastics/research`);
      setBioplasticResearch(response.data);
    } catch (error) {
      console.error('Error fetching bioplastic research:', error);
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
  const handleCreateResearch = async (e) => {
    e.preventDefault();
    if (!researchForm.location_id) {
      alert('Please select a location first');
      return;
    }
    
    try {
      await axios.post(`${API}/bioplastics/research`, researchForm);
      setResearchForm({
        location_id: '', location_name: '', research_focus: 'production_feasibility',
        bioplastic_type: 'PLA'
      });
      setShowResearchModal(false);
      fetchBioplasticResearch();
    } catch (error) {
      console.error('Error creating research:', error);
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
      setResearchForm(prev => ({
        ...prev,
        location_id: locationId,
        location_name: location.name
      }));
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchLocations();
    fetchBioplasticsInfo();
    fetchBioplasticResearch();
    fetchAlerts();
    fetchDashboardSummary();
  }, [fetchLocations, fetchBioplasticsInfo, fetchBioplasticResearch, fetchAlerts, fetchDashboardSummary]);

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
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-green-100">
      {/* Header */}
      <header className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="text-3xl font-bold">🇺🇬</div>
              <div className="ml-3">
                <h1 className="text-2xl font-bold text-gray-900">Uganda EcoMonitor</h1>
                <span className="text-sm text-gray-500">Environmental Research & Bioplastics Development</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600">Monitoring {locations.length} locations</div>
              <div className="text-xs text-green-600">Focus: Sustainable Bioplastics</div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {[
              { key: 'dashboard', label: 'Dashboard', icon: '📊' },
              { key: 'locations', label: 'Locations', icon: '📍' },
              { key: 'bioplastics', label: 'Bioplastics Research', icon: '🌱' },
              { key: 'alerts', label: 'Alerts', icon: '🔔' }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                  activeTab === tab.key
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span>{tab.icon}</span>
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                  <div className="text-3xl font-bold text-blue-600">{dashboardSummary.locations_count}</div>
                  <div className="text-gray-600">Ugandan Cities</div>
                </div>
                <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                  <div className="text-3xl font-bold text-green-600">{dashboardSummary.research_count}</div>
                  <div className="text-gray-600">Research Studies</div>
                </div>
                <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                  <div className="text-3xl font-bold text-red-600">{dashboardSummary.unacknowledged_alerts}</div>
                  <div className="text-gray-600">Active Alerts</div>
                </div>
              </div>
            )}

            {/* Current Air Quality */}
            {airQualityData && (
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Current Air Quality</h2>
                <AirQualityCard data={airQualityData} />
              </div>
            )}

            {/* Recent Research */}
            {dashboardSummary?.recent_research && dashboardSummary.recent_research.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-6">🌱 Recent Bioplastics Research</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {dashboardSummary.recent_research.map((research) => (
                    <BioplasticResearchCard key={research.id} research={research} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'locations' && (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800">🇺🇬 Uganda Monitoring Locations</h2>
              <div className="text-sm text-gray-600">
                {locations.length} cities across 4 regions
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                <h3 className="text-xl font-bold text-gray-800 mb-4">Air Quality Data</h3>
                <AirQualityCard data={airQualityData} />
              </div>
            )}
          </div>
        )}

        {activeTab === 'bioplastics' && (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800">🌱 Bioplastics Research Center</h2>
              <button
                onClick={() => setShowResearchModal(true)}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <span>📋</span>
                Generate Research Report
              </button>
            </div>
            
            {/* Bioplastics Information */}
            <BioplasticsInfoCard bioplasticInfo={bioplasticsInfo} />
            
            {/* Research Results */}
            {bioplasticResearch.length > 0 && (
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-6">Research Studies</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {bioplasticResearch.map((research) => (
                    <BioplasticResearchCard key={research.id} research={research} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'alerts' && (
          <div className="space-y-8">
            <h2 className="text-2xl font-bold text-gray-800">Environmental Alerts</h2>
            
            {alerts.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">✅</div>
                <h3 className="text-xl text-gray-600 mb-2">No active alerts</h3>
                <p className="text-gray-500">All environmental conditions are within acceptable ranges</p>
              </div>
            ) : (
              <div className="max-w-3xl">
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

      {/* Research Generation Modal */}
      <Modal isOpen={showResearchModal} onClose={() => setShowResearchModal(false)}>
        <h3 className="text-xl font-bold mb-4">Generate Bioplastics Research Report</h3>
        <form onSubmit={handleCreateResearch}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <select
                value={researchForm.location_id}
                onChange={(e) => {
                  const location = locations.find(l => l.id === e.target.value);
                  setResearchForm({
                    ...researchForm, 
                    location_id: e.target.value,
                    location_name: location ? location.name : ''
                  });
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Research Focus</label>
              <select
                value={researchForm.research_focus}
                onChange={(e) => setResearchForm({...researchForm, research_focus: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="production_feasibility">Production Feasibility</option>
                <option value="environmental_impact">Environmental Impact</option>
                <option value="market_analysis">Market Analysis</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bioplastic Type</label>
              <select
                value={researchForm.bioplastic_type}
                onChange={(e) => setResearchForm({...researchForm, bioplastic_type: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="PLA">PLA (Polylactic Acid)</option>
                <option value="PHA">PHA (Polyhydroxyalkanoates)</option>
                <option value="Starch-based">Starch-based Plastics</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={() => setShowResearchModal(false)}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
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