import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import s from './Summary.module.css';
import { isGood } from '../lib/geo.js';

export default function TrackMap({ points }) {
  const el = useRef(null);
  const [offline, setOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const good = points.filter(isGood).map((p) => [p.lat, p.lon]);
    if (!el.current || good.length === 0) return undefined;
    const map = L.map(el.current, { zoomControl: false, attributionControl: true });
    const tiles = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '© OpenStreetMap' });
    tiles.on('tileerror', () => setOffline(true));
    tiles.addTo(map);
    L.polyline(good, { color: '#E5484D', weight: 5 }).addTo(map);
    L.circleMarker(good[0], { radius: 7, color: '#fff', weight: 2, fillColor: '#3FB27F', fillOpacity: 1 }).addTo(map);
    L.circleMarker(good[good.length - 1], { radius: 7, color: '#fff', weight: 2, fillColor: '#1E2227', fillOpacity: 1 }).addTo(map);
    map.fitBounds(L.latLngBounds(good), { padding: [24, 24], maxZoom: 18 });
    return () => map.remove();
  }, [points]);

  if (!points.some(isGood)) return <div className={s.mapEmpty}>No usable GPS points in this walk.</div>;
  return (
    <div className={s.mapWrap}>
      <div ref={el} className={s.map} role="img" aria-label="Map of the walk" />
      {offline && <span className={s.mapNote}>Map tiles need a connection. The track is still saved.</span>}
    </div>
  );
}
