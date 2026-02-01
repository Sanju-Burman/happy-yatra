import React, { useEffect, useState } from 'react';
import { MapPin } from 'lucide-react';
import { getConfig } from '../api';

const MapPlaceholder = ({ destinations = [] }) => {
  const [apiKey, setApiKey] = useState('');

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const config = await getConfig();
        setApiKey(config.google_maps_api_key);
      } catch (error) {
        console.error('Error fetching config:', error);
      }
    };
    fetchConfig();
  }, []);

  const hasValidApiKey = apiKey && apiKey !== 'placeholder-google-maps-api-key' && apiKey.trim() !== '';

  if (!hasValidApiKey) {
    return (
      <div data-testid="map-placeholder" className="w-full h-96 bg-[#F2EFE9] rounded-xl flex items-center justify-center border-2 border-dashed border-gray-300">
        <div className="text-center p-8">
          <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" strokeWidth={1.5} />
          <h3 className="font-heading text-xl font-semibold text-secondary mb-2">Interactive Map</h3>
          <p className="text-gray-600 text-sm max-w-md">
            Google Maps integration is configured but requires an API key to be set in the environment.
          </p>
          {destinations.length > 0 && (
            <div className="mt-6">
              <p className="text-sm font-medium text-gray-700 mb-2">Destinations to display:</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {destinations.map((dest, idx) => (
                  <span key={idx} className="bg-white px-3 py-1 rounded-full text-xs font-medium text-secondary">
                    {dest.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div data-testid="google-map" className="w-full h-96 bg-gray-200 rounded-xl overflow-hidden">
      <p className="p-4 text-center text-gray-600">Google Maps will load here with API key</p>
    </div>
  );
};

export default MapPlaceholder;