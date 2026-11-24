import ui from './ui.module.css';
import s from './Recorder.module.css';
import { fmtDuration } from '../lib/format.js';
import { ACC_BAD_M, GAP_MS } from '../constants/config.js';

export default function StatusPills({ rec, gps, now }) {
  const paused = rec.status === 'paused';
  const fresh = gps && now - gps.t <= GAP_MS;
  const good = fresh && gps.accM <= ACC_BAD_M;
  return (
    <div className={s.hud}>
      <span className={`${ui.pill} ${s.shade}`}>
        <span className={`${ui.dot} ${paused ? '' : s.blink}`} style={{ background: paused ? 'var(--dust)' : 'var(--rec)' }} />
        <span className="num">{paused ? 'Paused' : fmtDuration(rec.elapsedMs)}</span>
      </span>
      <span className={`${ui.pill} ${s.shade}`} style={good ? undefined : { boxShadow: 'inset 0 0 0 1px var(--warn)' }}>
        <span className={ui.dot} style={{ background: good ? 'var(--go)' : 'var(--warn)' }} />
        <span className="num">{fresh ? `GPS ±${Math.round(gps.accM)} m` : 'No GPS'}</span>
      </span>
    </div>
  );
}
