import { useState, useEffect } from 'react';
import { ProfilesAPI } from '../lib/api';

interface LocationState {
  latitude: number | null;
  longitude: number | null;
  address: string | null;
  error: string | null;
  loading: boolean;
}

export const useLocation = () => {
  const [location, setLocation] = useState<LocationState>({
    latitude: null,
    longitude: null,
    address: null,
    error: null,
    loading: true,
  });

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocation((prev) => ({
        ...prev,
        error: 'Geolocation is not supported by your browser',
        loading: false,
      }));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          // Using a free reverse geocoding API (OpenStreetMap Nominatim)
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await response.json();
          
          const addressComp = data.address.city || data.address.town || data.address.village || data.address.county || 'Unknown Location';
          const fullAddress = `${addressComp}, ${data.address.state || ''}`;
          
          setLocation({
            latitude,
            longitude,
            address: fullAddress,
            error: null,
            loading: false,
          });

          // Sync with backend (fire and forget)
          ProfilesAPI.update({
             address: fullAddress
          }).catch(console.error);

        } catch (err) {
          setLocation({
            latitude,
            longitude,
            address: 'Coordinates Fetch Success (Address lookup failed)',
            error: null,
            loading: false,
          });
        }
      },
      (error) => {
        setLocation((prev) => ({
          ...prev,
          error: error.message,
          loading: false,
        }));
      }
    );
  }, []);

  return location;
};
