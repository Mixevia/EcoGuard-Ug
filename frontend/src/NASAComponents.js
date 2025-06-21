import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Fix Leaflet default markers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// NASA Climate Dashboard Component
export const NASAClimateDashboard = ({ darkMode }) => {
  const [nasaOverview, setNasaOverview] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchNASAOverview = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching NASA overview from:', `${API}/nasa/overview`);
      
      const response = await fetch(`${API}/nasa/overview`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('NASA overview response:', data);
      setNasaOverview(data);
    } catch (err) {
      console.error('Error fetching NASA overview:', err);
      setError('Failed to load NASA climate data: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchLocationClimate = async (locationId) => {
    try {
      console.log('Fetching climate for location:', locationId);
      const response = await fetch(`${API}/nasa/climate/${locationId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Location climate response:', data);
      setSelectedLocation(data);
    } catch (err) {
      console.error('Error fetching location climate:', err);
    }
  };

  useEffect(() => {
    fetchNASAOverview();
  }, [fetchNASAOverview]);

  if (loading) {
    return (
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 shadow-lg`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-300 rounded mb-4"></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-20 bg-gray-300 rounded"></div>
            <div className="h-20 bg-gray-300 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 shadow-lg`}>
        <div className="text-center">
          <div className="text-red-500 mb-2 text-4xl">🛰️</div>
          <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-3`}>{error}</p>
          <button 
            onClick={fetchNASAOverview}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!nasaOverview || !nasaOverview.locations) {
    return (
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 shadow-lg`}>
        <div className="text-center">
          <div className="text-yellow-500 mb-2 text-4xl">⚠️</div>
          <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>No NASA data available</p>
        </div>
      </div>
    );
  }

  const avgTemp = nasaOverview.locations.reduce((sum, loc) => sum + (loc.current_temp || 0), 0) / nasaOverview.locations.length;

  return (
    <div className="space-y-6">
      {/* NASA Overview Header */}
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 shadow-lg`}>
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">🛰️</span>
          </div>
          <div>
            <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              NASA Climate Monitoring
            </h2>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Real-time satellite data for Uganda • Last updated: {new Date(nasaOverview.last_updated).toLocaleTimeString()}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg">
            <div className={`text-2xl font-bold ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
              {nasaOverview.total_locations}
            </div>
            <div className={`text-sm ${darkMode ? 'text-blue-300' : 'text-blue-800'}`}>Monitored Cities</div>
          </div>
          <div className="text-center p-4 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg">
            <div className={`text-2xl font-bold ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
              {nasaOverview.locations.filter(l => l.current_temp).length}
            </div>
            <div className={`text-sm ${darkMode ? 'text-green-300' : 'text-green-800'}`}>Active Sensors</div>
          </div>
          <div className="text-center p-4 bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 rounded-lg">
            <div className={`text-2xl font-bold ${darkMode ? 'text-yellow-400' : 'text-yellow-600'}`}>
              {avgTemp.toFixed(1)}°C
            </div>
            <div className={`text-sm ${darkMode ? 'text-yellow-300' : 'text-yellow-800'}`}>Avg Temperature</div>
          </div>
          <div className="text-center p-4 bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg">
            <div className={`text-2xl font-bold ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>
              Normal
            </div>
            <div className={`text-sm ${darkMode ? 'text-purple-300' : 'text-purple-800'}`}>Climate Status</div>
          </div>
        </div>
      </div>

      {/* Location Climate Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {nasaOverview.locations.map((location) => (
          <div 
            key={location.location_id}
            className={`${darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'} rounded-xl p-4 shadow-lg transition-colors cursor-pointer`}
            onClick={() => fetchLocationClimate(location.location_id)}
          >
            <div className="flex justify-between items-start mb-3">
              <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                {location.location_name}
              </h3>
              <span className={`px-2 py-1 text-xs rounded-full ${
                location.climate_status === 'normal' 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                  : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
              }`}>
                {location.climate_status}
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Temperature:</span>
                <span className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                  {location.current_temp ? `${location.current_temp.toFixed(1)}°C` : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Precipitation:</span>
                <span className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                  {location.current_precipitation ? `${location.current_precipitation.toFixed(1)}mm` : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Humidity:</span>
                <span className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                  {location.current_humidity ? `${location.current_humidity.toFixed(0)}%` : 'N/A'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Selected Location Detail */}
      {selectedLocation && (
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 shadow-lg`}>
          <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-800'} mb-4`}>
            NASA Climate Data: {selectedLocation.location_name}
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                {selectedLocation.temperature ? `${selectedLocation.temperature.toFixed(1)}°C` : 'N/A'}
              </div>
              <div className="text-sm text-red-800 dark:text-red-300">Temperature</div>
            </div>
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {selectedLocation.precipitation ? `${selectedLocation.precipitation.toFixed(1)}mm` : 'N/A'}
              </div>
              <div className="text-sm text-blue-800 dark:text-blue-300">Precipitation</div>
            </div>
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {selectedLocation.humidity ? `${selectedLocation.humidity.toFixed(0)}%` : 'N/A'}
              </div>
              <div className="text-sm text-green-800 dark:text-green-300">Humidity</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                {selectedLocation.wind_speed ? `${selectedLocation.wind_speed.toFixed(1)}m/s` : 'N/A'}
              </div>
              <div className="text-sm text-yellow-800 dark:text-yellow-300">Wind Speed</div>
            </div>
            <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {selectedLocation.solar_radiation ? `${selectedLocation.solar_radiation.toFixed(1)}` : 'N/A'}
              </div>
              <div className="text-sm text-purple-800 dark:text-purple-300">Solar Radiation</div>
            </div>
            <div className="text-center p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
              <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                {selectedLocation.pressure ? `${selectedLocation.pressure.toFixed(1)}kPa` : 'N/A'}
              </div>
              <div className="text-sm text-indigo-800 dark:text-indigo-300">Pressure</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Real NASA Satellite Map Component
export const NASASatelliteMap = ({ darkMode, onLocationSelect, selectedCity, cities }) => {
  const [nasaData, setNasaData] = useState({});
  const [showSatellite, setShowSatellite] = useState(true);
  const [locationMapping, setLocationMapping] = useState({});
  const [mapReady, setMapReady] = useState(false);

  // Uganda bounds
  const ugandaBounds = [
    [-1.4433, 29.5795], // Southwest
    [4.2499, 35.0360]   // Northeast
  ];

  // Fetch location mapping from backend to match frontend cities with backend IDs
  useEffect(() => {
    const fetchLocationMapping = async () => {
      try {
        const response = await axios.get(`${API}/locations`);
        const backendLocations = response.data;
        const mapping = {};
        
        // Map frontend city names to backend location IDs
        backendLocations.forEach(location => {
          const frontendCity = cities?.find(city => 
            city.name.toLowerCase() === location.name.toLowerCase()
          );
          if (frontendCity) {
            mapping[frontendCity.id] = location.id;
          }
        });
        
        setLocationMapping(mapping);
        setMapReady(true);
      } catch (error) {
        console.error('Error fetching location mapping:', error);
        setMapReady(true); // Still show map even if mapping fails
      }
    };

    if (cities && cities.length > 0) {
      fetchLocationMapping();
    }
  }, [cities]);

  const fetchNASAData = async (cityId) => {
    try {
      const backendLocationId = locationMapping[cityId];
      if (!backendLocationId) {
        console.warn(`No backend location ID found for frontend city ID: ${cityId}`);
        return;
      }
      
      const response = await axios.get(`${API}/locations/${backendLocationId}/enhanced`);
      setNasaData(prev => ({
        ...prev,
        [cityId]: response.data
      }));
    } catch (error) {
      console.error('Error fetching NASA data:', error);
    }
  };

  const handleCityClick = (city) => {
    onLocationSelect(city);
    fetchNASAData(city.id);
  };

  const getClimateStatusColor = (climateData) => {
    if (!climateData?.nasa_climate) return "#dc2626"; // red default
    
    const temp = climateData.nasa_climate.temperature;
    if (temp > 35) return "#ef4444"; // red - very hot
    if (temp > 30) return "#f59e0b"; // amber - hot
    if (temp > 25) return "#10b981"; // green - normal
    return "#3b82f6"; // blue - cool
  };

  // Custom marker icons based on temperature
  const createCustomIcon = (city, climateData) => {
    const temp = climateData?.nasa_climate?.temperature;
    const color = getClimateStatusColor(climateData);
    
    return L.divIcon({
      className: 'custom-marker',
      html: `
        <div style="
          background-color: ${color};
          width: 30px;
          height: 30px;
          border-radius: 50%;
          border: 3px solid white;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 12px;
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        ">
          ${temp ? Math.round(temp) + '°' : '?'}
        </div>
      `,
      iconSize: [30, 30],
      iconAnchor: [15, 15],
      popupAnchor: [0, -15],
    });
  };

  if (!mapReady) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-100 dark:bg-gray-800 rounded-xl">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-3"></div>
          <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Loading NASA Satellite Map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Enhanced Controls */}
      <div className="flex justify-between items-center">
        <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
          NASA Satellite Map - Uganda
        </h3>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowSatellite(!showSatellite)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              showSatellite 
                ? 'bg-blue-500 text-white' 
                : darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            🛰️ {showSatellite ? 'Satellite' : 'Standard'}
          </button>
        </div>
      </div>

      {/* Real Satellite Map */}
      <div className="relative h-96 rounded-xl overflow-hidden shadow-lg">
        <MapContainer 
          bounds={ugandaBounds}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={true}
          className="rounded-xl"
        >
          {/* Satellite or Standard Tile Layer */}
          <TileLayer
            url={showSatellite 
              ? "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            }
            attribution={showSatellite 
              ? '&copy; <a href="https://www.esri.com/">Esri</a> &mdash; Source: Esri, Maxar, GeoEye, Earthstar Geographics, CNES/Airbus DS, USDA, USGS, AeroGRID, IGN, and the GIS User Community'
              : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }
          />

          {/* City Markers with NASA Climate Data */}
          {cities?.map((city) => {
            const climateData = nasaData[city.id];
            const isSelected = selectedCity?.id === city.id;
            
            return (
              <Marker
                key={city.id}
                position={[city.lat, city.lng]}
                icon={createCustomIcon(city, climateData)}
                eventHandlers={{
                  click: () => handleCityClick(city),
                }}
              >
                <Popup>
                  <div className="text-center">
                    <h3 className="font-bold text-lg">{city.name}</h3>
                    <p className="text-sm text-gray-600">{city.district} District</p>
                    <div className="mt-2 space-y-1">
                      {climateData?.nasa_climate && (
                        <>
                          <div className="text-sm">
                            <strong>NASA Temperature:</strong> {climateData.nasa_climate.temperature?.toFixed(1)}°C
                          </div>
                          <div className="text-sm">
                            <strong>Precipitation:</strong> {climateData.nasa_climate.precipitation?.toFixed(1)}mm
                          </div>
                          <div className="text-sm">
                            <strong>Humidity:</strong> {climateData.nasa_climate.humidity?.toFixed(0)}%
                          </div>
                        </>
                      )}
                      <div className="text-sm">
                        <strong>Population:</strong> {city.population.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>

        {/* NASA Legend */}
        <div className="absolute bottom-4 right-4 bg-white/95 rounded-lg p-3 text-xs shadow-lg">
          <div className="font-medium text-gray-700 mb-2">NASA Climate Status</div>
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-gray-600">Very Hot (&gt;35°C)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
              <span className="text-gray-600">Hot (30-35°C)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-gray-600">Normal (25-30°C)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-gray-600">Cool (&lt;25°C)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Selected City NASA Data Panel */}
      {selectedCity && nasaData[selectedCity.id] && (
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-4 shadow-lg`}>
          <h4 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'} mb-3`}>
            NASA Data: {selectedCity.name}
          </h4>
          <div className="grid grid-cols-4 gap-3 text-sm">
            <div className="text-center">
              <div className="font-medium text-red-500">
                {nasaData[selectedCity.id]?.nasa_climate?.temperature?.toFixed(1) || 'N/A'}°C
              </div>
              <div className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Temp</div>
            </div>
            <div className="text-center">
              <div className="font-medium text-blue-500">
                {nasaData[selectedCity.id]?.nasa_climate?.precipitation?.toFixed(1) || 'N/A'}mm
              </div>
              <div className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Rain</div>
            </div>
            <div className="text-center">
              <div className="font-medium text-green-500">
                {nasaData[selectedCity.id]?.nasa_climate?.humidity?.toFixed(0) || 'N/A'}%
              </div>
              <div className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Humidity</div>
            </div>
            <div className="text-center">
              <div className="font-medium text-yellow-500">
                {nasaData[selectedCity.id]?.nasa_climate?.wind_speed?.toFixed(1) || 'N/A'}m/s
              </div>
              <div className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Wind</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};