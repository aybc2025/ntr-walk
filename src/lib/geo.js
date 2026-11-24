import { ACC_BAD_M, GAP_MS } from '../constants/config.js';

const R = 6371000;
const rad = (d) => (d * Math.PI) / 180;

export function haversine(a, b) {
  const dLat = rad(b.lat - a.lat);
  const dLon = rad(b.lon - a.lon);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export const isGood = (p) => p.accM != null && p.accM <= ACC_BAD_M;

export function summarize(points) {
  let dist = 0, last = null, accSum = 0, accN = 0, gaps = 0, prevT = null;
  for (const p of points) {
    if (prevT != null && p.t - prevT > GAP_MS) gaps += 1;
    prevT = p.t;
    if (p.accM != null) { accSum += p.accM; accN += 1; }
    if (!isGood(p)) continue;
    if (last) dist += haversine(last, p);
    last = p;
  }
  return { distanceM: Math.round(dist), meanAccM: accN ? Math.round(accSum / accN) : null, gpsGaps: gaps };
}
