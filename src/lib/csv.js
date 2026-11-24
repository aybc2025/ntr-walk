const COLS = ['t_iso', 't_epoch_ms', 'segment', 'segment_ms', 'lat', 'lon', 'acc_m', 'alt_m', 'speed_mps', 'heading_deg'];
const v = (x) => (x == null || Number.isNaN(x) ? '' : x);

export function pointsCSV(points) {
  const rows = points.map((p) => [
    new Date(p.t).toISOString(), p.t, v(p.segment), v(p.segmentMs), p.lat, p.lon, v(p.accM), v(p.altM), v(p.speed), v(p.heading),
  ].join(','));
  return [COLS.join(','), ...rows].join('\n') + '\n';
}
