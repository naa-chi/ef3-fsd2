import { useState, useEffect } from 'react';

export function useLocation() {
  const [location, setLocation] = useState({ city: 'Santiago', loading: true, error: null });

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocation({ city: 'Santiago', loading: false, error: null });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&zoom=10`
          );
          const data = await res.json();
          const city =
            data.address?.city ||
            data.address?.town ||
            data.address?.municipality ||
            data.address?.county ||
            'Santiago';
          setLocation({ city, loading: false, error: null });
        } catch (e) {
          setLocation({ city: 'Santiago', loading: false, error: null });
        }
      },
      () => {
        // Gracefully handle permission denied or timeout without breaking UI
        setLocation({ city: 'Santiago', loading: false, error: null });
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 600000 }
    );
  }, []);

  return location;
}