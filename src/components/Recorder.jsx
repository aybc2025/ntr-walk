import { useEffect, useState } from 'react';
import ui from './ui.module.css';
import s from './Recorder.module.css';
import CameraView from './CameraView.jsx';
import StatusPills from './StatusPills.jsx';
import StatsBar from './StatsBar.jsx';
import HoldButton from './HoldButton.jsx';
import Notice from './Notice.jsx';
import { ACC_BAD_M, GAP_MS, LOW_STORAGE_BYTES } from '../constants/config.js';

function useNow(ms) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => { const id = setInterval(() => setNow(Date.now()), ms); return () => clearInterval(id); }, [ms]);
  return now;
}

// The single notice that matters most right now.
function pickNotice(walk, now, backTried) {
  const { rec, geo, wake, preflight } = walk;
  if (rec.error) return { tone: 'bad', text: `Recording problem: ${rec.error}. Hold Finish to save what was recorded.` };
  if (backTried && now - backTried < 4000) return { tone: 'info', text: 'Hold Finish to end the walk.' };
  if (walk.background != null) return { tone: 'warn', text: `The app was in the background for ${Math.round(walk.background / 1000)} s. GPS has a gap there.`, dismiss: walk.clearBackground };
  if (wake === 'failed') return { tone: 'warn', text: 'Android won’t keep the screen on. Set Settings › Display › Screen timeout to 10 minutes for this walk.' };
  const last = geo.last;
  if (!last || now - last.t > GAP_MS) return { tone: 'warn', text: 'No GPS fix right now. Still recording.' };
  if (last.accM > ACC_BAD_M) return { tone: 'warn', text: 'Weak GPS signal. Still recording.' };
  const free = preflight.storage?.free;
  if (free != null && free - rec.bytes < LOW_STORAGE_BYTES) return { tone: 'warn', text: 'Storage is almost full. Finish soon.' };
  return null;
}

export default function Recorder({ walk, onFinish, backTried }) {
  const now = useNow(1000);
  const [finishing, setFinishing] = useState(false);
  const { rec } = walk;
  const paused = rec.status === 'paused';
  const notice = pickNotice(walk, now, backTried);

  return (
    <main className={s.wrap}>
      <div className={s.stage}>
        <CameraView stream={walk.cam.stream} />
        <StatusPills rec={rec} gps={walk.geo.last} now={now} />
        {notice && <Notice {...notice} />}
      </div>
      <StatsBar distanceM={walk.distanceM} rec={rec} side={walk.side} />
      <div className={s.controls}>
        <button type="button" className={`${ui.btn} ${ui.secondary}`} onClick={paused ? rec.resume : rec.pause} disabled={finishing}>
          {paused ? 'Resume' : 'Pause'}
        </button>
        <HoldButton disabled={finishing} onHold={() => { setFinishing(true); onFinish(); }}>Finish walk</HoldButton>
      </div>
    </main>
  );
}
