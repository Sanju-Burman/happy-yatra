import React, { useEffect, useState, useMemo } from 'react';
import { MapPin } from 'lucide-react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import { getConfig } from '@/api.jsx';

const containerStyle = {
  width: '100%',
  height: '100%'
};

const defaultCenter = {
  lat: 20.5937,
  lng: 78.9629 // Center of India approximate
};

const ActiveMap = ({ apiKey, destinations }) => {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: apiKey
  });

  const center = useMemo(() => {
    if (destinations && destinations.length > 0) {
      if (destinations[0].latitude && destinations[0].longitude) {
        return { lat: destinations[0].latitude, lng: destinations[0].longitude };
      }
    }
    return defaultCenter;
  }, [destinations]);

  if (!isLoaded) {
    return (
      <div className="w-full h-96 bg-muted animate-pulse rounded-xl flex items-center justify-center border border-border">
        <p className="text-muted-foreground font-medium">Loading Map...</p>
      </div>
    );
  }

  return (
    <div data-testid="google-map" className="w-full h-96 rounded-xl overflow-hidden border border-border">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={5}
        options={{ disableDefaultUI: true, zoomControl: true }}
      >
        {destinations.map((dest, idx) => {
          if (dest.latitude && dest.longitude) {
            return (
              <Marker 
                key={dest._id || idx}
                position={{ lat: dest.latitude, lng: dest.longitude }}
                title={dest.name}
              />
            );
          }
          return null;
        })}
      </GoogleMap>
    </div>
  );
};

const MapPlaceholder = ({ destinations = [] }) => {
  const [apiKey, setApiKey] = useState('');

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const config = await getConfig();
        if (config && config.google_maps_api_key) {
          setApiKey(config.google_maps_api_key);
        }
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

  return <ActiveMap apiKey={apiKey} destinations={destinations} />;
};

export default MapPlaceholder;