import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './App.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Components
const LocationCard = ({ location, onSelectLocation, onDeleteLocation, isSelected }) => (
  <div className={`bg-white rounded-xl shadow-lg p-6 cursor-pointer transition-all duration-300 hover:shadow-xl border-2 ${
    isSelected ? 'border-green-500 bg-green-50' : 'border-gray-200'
  }`} onClick={() => onSelectLocation(location.id)}>
    <div className="flex justify-between items-start">
      <div>
        <h3 className="text-xl font-bold text-gray-800">{location.name}</h3>
        <p className="text-gray-600 mt-1">
          Lat: {location.latitude.toFixed(4)}, Lon: {location.longitude.toFixed(4)}
        </p>
        {location.zip_code && (
          <p className="text-gray-500 text-sm">ZIP: {location.zip_code}</p>
        )}
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDeleteLocation(location.id);
        }}
        className="text-red-500 hover:text-red-700 transition-colors"
      >
        🗑️
      </button>
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

  const getTextColor = (aqi) => {
    if (aqi <= 50) return 'text-green-700';
    if (aqi <= 100) return 'text-yellow-700';
    if (aqi <= 150) return 'text-orange-700';
    if (aqi <= 200) return 'text-red-700';
    if (aqi <= 300) return 'text-purple-700';
    return 'text-red-900';
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-800">Air Quality - {data.location_name}</h3>
        <div className={`px-3 py-1 rounded-full text-white text-sm font-medium ${getAQIColor(data.aqi)}`}>
          AQI {data.aqi}
        </div>
      </div>
      
      <div className={`text-lg font-semibold mb-4 ${getTextColor(data.aqi)}`}>
        {data.category}
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {data.pm25 && (
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-800">{data.pm25}</div>
            <div className="text-sm text-gray-600">PM2.5</div>
          </div>
        )}
        {data.pm10 && (
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-800">{data.pm10}</div>
            <div className="text-sm text-gray-600">PM10</div>
          </div>
        )}
        {data.ozone && (
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-800">{data.ozone}</div>
            <div className="text-sm text-gray-600">Ozone</div>
          </div>
        )}
        {data.no2 && (
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-800">{data.no2}</div>
            <div className="text-sm text-gray-600">NO2</div>
          </div>
        )}
      </div>
      
      <div className="mt-4 text-sm text-gray-500">
        Last updated: {new Date(data.timestamp).toLocaleString()}
      </div>
    </div>
  );
};

const BioplasticCard = ({ sample }) => {
  const getDegradationColor = (percentage) => {
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 60) return 'bg-blue-500';
    if (percentage >= 40) return 'bg-yellow-500';
    if (percentage >= 20) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getImpactColor = (score) => {
    if (score >= 80) return 'text-red-600';
    if (score >= 60) return 'text-orange-600';
    if (score >= 40) return 'text-yellow-600';
    if (score >= 20) return 'text-blue-600';
    return 'text-green-600';
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-800">{sample.sample_type} Sample</h3>
          <p className="text-gray-600">{sample.location_name}</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-gray-800">{sample.degradation_percentage}%</div>
          <div className="text-sm text-gray-600">Degraded</div>
        </div>
      </div>
      
      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
        <div 
          className={`h-3 rounded-full transition-all duration-500 ${getDegradationColor(sample.degradation_percentage)}`}
          style={{ width: `${sample.degradation_percentage}%` }}
        ></div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <div className="text-sm text-gray-600">Current Weight</div>
          <div className="text-lg font-semibold">{sample.current_weight}g</div>
        </div>
        <div>
          <div className="text-sm text-gray-600">Days Active</div>
          <div className="text-lg font-semibold">{sample.days_since_start}</div>
        </div>
        <div>
          <div className="text-sm text-gray-600">Degradation Rate</div>
          <div className="text-lg font-semibold">{sample.biodegradation_rate}%/day</div>
        </div>
        <div>
          <div className="text-sm text-gray-600">Impact Score</div>
          <div className={`text-lg font-semibold ${getImpactColor(sample.environmental_impact_score)}`}>
            {sample.environmental_impact_score}
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-2 text-sm">
        <div>
          <span className="text-gray-600">Temp:</span> {sample.composting_temperature}°C
        </div>
        <div>
          <span className="text-gray-600">Humidity:</span> {sample.composting_humidity}%
        </div>
        <div>
          <span className="text-gray-600">pH:</span> {sample.composting_ph}
        </div>
      </div>
      
      {sample.microplastic_detected && (
        <div className="mt-3 bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded text-sm">
          ⚠️ Microplastics detected
        </div>
      )}
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
      <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
        <div className="flex justify-end mb-4">
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
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
  const [bioplasticSamples, setBioplasticSamples] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [dashboardSummary, setDashboardSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Modal states
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showBioplasticModal, setShowBioplasticModal] = useState(false);
  
  // Form states
  const [locationForm, setLocationForm] = useState({
    name: '', latitude: '', longitude: '', zip_code: ''
  });
  const [bioplasticForm, setBioplasticForm] = useState({
    location_id: '', location_name: '', sample_type: 'PLA', 
    initial_weight: '', composting_temperature: '25', 
    composting_humidity: '60', composting_ph: '7'
  });

  // Fetch functions
  const fetchLocations = useCallback(async () => {
    try {
      const response = await axios.get(`${API}/locations`);
      setLocations(response.data);
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

  const fetchBioplasticSamples = useCallback(async () => {
    try {
      const response = await axios.get(`${API}/bioplastics`);
      setBioplasticSamples(response.data);
    } catch (error) {
      console.error('Error fetching bioplastic samples:', error);
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
  const handleCreateLocation = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/locations`, {
        name: locationForm.name,
        latitude: parseFloat(locationForm.latitude),
        longitude: parseFloat(locationForm.longitude),
        zip_code: locationForm.zip_code || null
      });
      setLocationForm({ name: '', latitude: '', longitude: '', zip_code: '' });
      setShowLocationModal(false);
      fetchLocations();
    } catch (error) {
      console.error('Error creating location:', error);
    }
  };

  const handleDeleteLocation = async (locationId) => {
    try {
      await axios.delete(`${API}/locations/${locationId}`);
      fetchLocations();
      if (selectedLocationId === locationId) {
        setSelectedLocationId(null);
        setAirQualityData(null);
      }
    } catch (error) {
      console.error('Error deleting location:', error);
    }
  };

  const handleCreateBioplasticSample = async (e) => {
    e.preventDefault();
    if (!bioplasticForm.location_id) {
      alert('Please select a location first');
      return;
    }
    
    try {
      await axios.post(`${API}/bioplastics`, {
        location_id: bioplasticForm.location_id,
        location_name: bioplasticForm.location_name,
        sample_type: bioplasticForm.sample_type,
        initial_weight: parseFloat(bioplasticForm.initial_weight),
        composting_temperature: parseFloat(bioplasticForm.composting_temperature),
        composting_humidity: parseFloat(bioplasticForm.composting_humidity),
        composting_ph: parseFloat(bioplasticForm.composting_ph)
      });
      setBioplasticForm({
        location_id: '', location_name: '', sample_type: 'PLA',
        initial_weight: '', composting_temperature: '25', 
        composting_humidity: '60', composting_ph: '7'
      });
      setShowBioplasticModal(false);
      fetchBioplasticSamples();
    } catch (error) {
      console.error('Error creating bioplastic sample:', error);
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
      setBioplasticForm(prev => ({
        ...prev,
        location_id: locationId,
        location_name: location.name
      }));
    }
  };

  // Auto-refresh data
  useEffect(() => {
    fetchLocations();
    fetchBioplasticSamples();
    fetchAlerts();
    fetchDashboardSummary();
  }, [fetchLocations, fetchBioplasticSamples, fetchAlerts, fetchDashboardSummary]);

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
      fetchBioplasticSamples();
      fetchAlerts();
      fetchDashboardSummary();
    }, 30000);

    return () => clearInterval(interval);
  }, [selectedLocationId, fetchAirQuality, fetchBioplasticSamples, fetchAlerts, fetchDashboardSummary]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-blue-100">
      {/* Header */}
      <header className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="text-3xl font-bold text-green-600">🌍</div>
              <h1 className="ml-3 text-2xl font-bold text-gray-900">EcoMonitor</h1>
              <span className="ml-2 text-sm text-gray-500">Environmental & Bioplastics Monitoring</span>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => setShowLocationModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                + Add Location
              </button>
              <button
                onClick={() => setShowBioplasticModal(true)}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                + Add Bioplastic Sample
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {['dashboard', 'locations', 'bioplastics', 'alerts'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-1 border-b-2 font-medium text-sm capitalize ${
                  activeTab === tab
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab}
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
                <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                  <div className="text-3xl font-bold text-blue-600">{dashboardSummary.locations_count}</div>
                  <div className="text-gray-600">Monitoring Locations</div>
                </div>
                <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                  <div className="text-3xl font-bold text-green-600">{dashboardSummary.bioplastics_count}</div>
                  <div className="text-gray-600">Bioplastic Samples</div>
                </div>
                <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                  <div className="text-3xl font-bold text-red-600">{dashboardSummary.unacknowledged_alerts}</div>
                  <div className="text-gray-600">Active Alerts</div>
                </div>
                <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                  <div className="text-3xl font-bold text-purple-600">
                    {dashboardSummary.top_degraded_bioplastics.length > 0 
                      ? Math.round(dashboardSummary.top_degraded_bioplastics[0]?.degradation_percentage || 0)
                      : 0}%
                  </div>
                  <div className="text-gray-600">Top Degradation</div>
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

            {/* Top Bioplastic Samples */}
            {dashboardSummary?.top_degraded_bioplastics.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-6">🌱 Top Bioplastic Degradation</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {dashboardSummary.top_degraded_bioplastics.slice(0, 3).map((sample) => (
                    <BioplasticCard key={sample.id} sample={sample} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'locations' && (
          <div className="space-y-8">
            <h2 className="text-2xl font-bold text-gray-800">Monitoring Locations</h2>
            
            {locations.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📍</div>
                <h3 className="text-xl text-gray-600 mb-2">No locations added yet</h3>
                <p className="text-gray-500 mb-4">Add your first monitoring location to get started</p>
                <button
                  onClick={() => setShowLocationModal(true)}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add First Location
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {locations.map((location) => (
                  <LocationCard
                    key={location.id}
                    location={location}
                    onSelectLocation={handleSelectLocation}
                    onDeleteLocation={handleDeleteLocation}
                    isSelected={selectedLocationId === location.id}
                  />
                ))}
              </div>
            )}

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
              <h2 className="text-2xl font-bold text-gray-800">🌱 Bioplastic Monitoring</h2>
              <div className="text-sm text-gray-600">
                Tracking biodegradation progress and environmental impact
              </div>
            </div>
            
            {bioplasticSamples.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🧪</div>
                <h3 className="text-xl text-gray-600 mb-2">No bioplastic samples yet</h3>
                <p className="text-gray-500 mb-4">Start monitoring bioplastic degradation</p>
                <button
                  onClick={() => setShowBioplasticModal(true)}
                  className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Add First Sample
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {bioplasticSamples.map((sample) => (
                  <BioplasticCard key={sample.id} sample={sample} />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'alerts' && (
          <div className="space-y-8">
            <h2 className="text-2xl font-bold text-gray-800">Environmental Alerts</h2>
            
            {alerts.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🔔</div>
                <h3 className="text-xl text-gray-600 mb-2">No alerts</h3>
                <p className="text-gray-500">All environmental conditions are within normal ranges</p>
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

      {/* Location Modal */}
      <Modal isOpen={showLocationModal} onClose={() => setShowLocationModal(false)}>
        <h3 className="text-xl font-bold mb-4">Add New Location</h3>
        <form onSubmit={handleCreateLocation}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location Name</label>
              <input
                type="text"
                value={locationForm.name}
                onChange={(e) => setLocationForm({...locationForm, name: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
                <input
                  type="number"
                  step="any"
                  value={locationForm.latitude}
                  onChange={(e) => setLocationForm({...locationForm, latitude: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
                <input
                  type="number"
                  step="any"
                  value={locationForm.longitude}
                  onChange={(e) => setLocationForm({...locationForm, longitude: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ZIP Code (Optional)</label>
              <input
                type="text"
                value={locationForm.zip_code}
                onChange={(e) => setLocationForm({...locationForm, zip_code: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={() => setShowLocationModal(false)}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Add Location
            </button>
          </div>
        </form>
      </Modal>

      {/* Bioplastic Sample Modal */}
      <Modal isOpen={showBioplasticModal} onClose={() => setShowBioplasticModal(false)}>
        <h3 className="text-xl font-bold mb-4">Add Bioplastic Sample</h3>
        <form onSubmit={handleCreateBioplasticSample}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <select
                value={bioplasticForm.location_id}
                onChange={(e) => {
                  const location = locations.find(l => l.id === e.target.value);
                  setBioplasticForm({
                    ...bioplasticForm, 
                    location_id: e.target.value,
                    location_name: location ? location.name : ''
                  });
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              >
                <option value="">Select a location</option>
                {locations.map((location) => (
                  <option key={location.id} value={location.id}>{location.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sample Type</label>
              <select
                value={bioplasticForm.sample_type}
                onChange={(e) => setBioplasticForm({...bioplasticForm, sample_type: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="PLA">PLA (Polylactic Acid)</option>
                <option value="PHA">PHA (Polyhydroxyalkanoates)</option>
                <option value="PBS">PBS (Polybutylene Succinate)</option>
                <option value="Starch-based">Starch-based</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Initial Weight (grams)</label>
              <input
                type="number"
                step="0.1"
                value={bioplasticForm.initial_weight}
                onChange={(e) => setBioplasticForm({...bioplasticForm, initial_weight: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Temperature (°C)</label>
                <input
                  type="number"
                  step="0.1"
                  value={bioplasticForm.composting_temperature}
                  onChange={(e) => setBioplasticForm({...bioplasticForm, composting_temperature: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Humidity (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={bioplasticForm.composting_humidity}
                  onChange={(e) => setBioplasticForm({...bioplasticForm, composting_humidity: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">pH</label>
                <input
                  type="number"
                  step="0.1"
                  value={bioplasticForm.composting_ph}
                  onChange={(e) => setBioplasticForm({...bioplasticForm, composting_ph: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={() => setShowBioplasticModal(false)}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              Add Sample
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default App;