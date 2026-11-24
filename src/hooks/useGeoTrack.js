import { useEffect, useRef, useState } from 'react';

// Watches position for as long as the walk screen is open, so the first fix
// is already warm when recording starts. Each fix goes to onFix.
export function useGeoTrack(active, onFix, attempt = 0) {
  const [last, setLast] = useState(null);
  const [error, setError] = useState(null);
  const cb = useRef(onFix);
  cb.current = onFix;

  useEffect(() => {
    if (!active) return undefined;
    if (!('geolocation' in navigator)) { setError('unavailable'); return undefined; }
    setError(null);
    const id = navigator.geolocation.watchPosition(
      (pos) => {
        const c = pos.coords;
        const fix = {
          t: pos.timestamp || Date.now(),
          lat: c.latitude, lon: c.longitude, accM: c.accuracy,
          altM: c.altitude, speed: c.speed, heading: c.heading,
        };
        setError(null);
        setLast(fix);
        if (cb.current) cb.current(fix);
      },
      (err) => setError(err.code === 1 ? 'denied' : 'weak'),
      { enableHighAccuracy: true, maximumAge: 0, timeout: 20000 },
    );
    return () => navigator.geolocation.clearWatch(id);
  }, [active, attempt]);

  return { last, error };
}
