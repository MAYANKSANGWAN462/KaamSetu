// Purpose: Requests browser geolocation once, persists coordinates, and supports manual location override.
import { useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'geoLocation';

const readStoredGeo = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    return null;
  }
};

const useGeolocation = () => {
  const [geo, setGeo] = useState(() => readStoredGeo() || {
    latitude: null,
    longitude: null,
    manualLocation: ''
  });
  const [permissionAsked, setPermissionAsked] = useState(() => Boolean(readStoredGeo()));

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(geo));
  }, [geo]);

  useEffect(() => {
    if (permissionAsked) return;
    if (!navigator.geolocation) {
      setPermissionAsked(true);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setGeo((prev) => ({
          ...prev,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        }));
        setPermissionAsked(true);
      },
      () => {
        setPermissionAsked(true);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }, [permissionAsked]);

  const updateManualLocation = (manualLocation) => {
    setGeo((prev) => ({ ...prev, manualLocation }));
  };

  return useMemo(() => ({ ...geo, updateManualLocation }), [geo]);
};

export default useGeolocation;
