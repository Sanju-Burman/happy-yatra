import React, { useEffect, useState } from 'react';
import { MapPin } from 'lucide-react';
import { getConfig } from '@/api.jsx';

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
      <div data-testid="map-placeholder" className="w-full h-96 bg-card rounded-xl flex items-center justify-center border-2 border-dashed border-border">
        <div className="text-center p-8">
          <MapPin className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" strokeWidth={1.5} />
          <h3 className="font-heading text-xl font-semibold text-foreground mb-2">Interactive Map</h3>
          <p className="text-muted-foreground text-sm max-w-md">
            Google Maps integration is configured but requires an API key to be set in the environment.
          </p>
          {destinations.length > 0 && (
            <div className="mt-6">
              <p className="text-sm font-medium text-muted-foreground mb-2">Destinations to display:</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {destinations.map((dest, idx) => (
                  <span key={idx} className="bg-muted px-3 py-1 rounded-full text-xs font-medium text-foreground border border-border">
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
    <div data-testid="google-map" className="w-full h-96 bg-muted rounded-xl overflow-hidden border border-border">
      <p className="p-4 text-center text-muted-foreground">Google Maps will load here with API key</p>
    </div>
  );
};

export default MapPlaceholder;