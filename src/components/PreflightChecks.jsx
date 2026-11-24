import s from './NewWalk.module.css';
import { fmtBytes } from '../lib/format.js';
import { VIDEO_BPS, extFor } from '../constants/config.js';

function Row({ label, ok, text }) {
  return (
    <div className={s.check}>
      <span>{label}</span>
      <span className={`num ${ok === true ? s.ok : ok === false ? s.bad : s.wait}`}>{text}</span>
    </div>
  );
}

export default function PreflightChecks({ walk }) {
  const { cam, geo, preflight } = walk;
  const fmt = preflight.mime ? ({ mp4: 'MP4', mkv: 'MKV', webm: 'WebM' }[extFor(preflight.mime)] + (/h264|avc1/.test(preflight.mime) ? ' · H.264' : '')) : null;
  const free = preflight.storage?.free;
  const hours = free != null ? free / (VIDEO_BPS / 8) / 3600 : null;
  const gps = geo.last;
  return (
    <div className={s.checks}>
      <Row label="Camera"
        ok={cam.error ? false : cam.info ? !!fmt : undefined}
        text={cam.error ? 'Not available' : !fmt ? 'Can’t record video here' : cam.info ? `${cam.info.width}×${cam.info.height} · ${fmt}` : 'Starting…'} />
      <Row label="Location"
        ok={gps ? gps.accM <= 30 : geo.error === 'unavailable' ? false : undefined}
        text={gps ? `±${Math.round(gps.accM)} m${gps.accM > 30 ? ' · wait for a better fix' : ''}` : geo.error === 'weak' ? 'Searching…' : 'Searching…'} />
      <Row label="Storage"
        ok={free == null ? undefined : free > 2e9}
        text={free == null ? 'Checking…' : `${fmtBytes(free)} · about ${hours >= 1 ? `${hours.toFixed(1)} h` : `${Math.round(hours * 60)} min`}`} />
      <Row label="Screen stays on" ok text="Automatic while recording" />
    </div>
  );
}
