import { useState } from 'react';
import ui from './ui.module.css';
import s from './Summary.module.css';
import TrackMap from './TrackMap.jsx';
import ExportPanel from './ExportPanel.jsx';
import { useSession } from '../hooks/useSession.js';
import { deleteSession } from '../lib/db.js';
import { removeSessionFiles } from '../lib/opfs.js';
import { fmtDistance, fmtDuration } from '../lib/format.js';

const SIDE = { west: 'West', east: 'East', middle: 'Middle' };

export default function Summary({ id, onBack }) {
  const { session, points, stats, loading } = useSession(id);
  const [confirm, setConfirm] = useState(false);
  if (loading) return <main className={ui.screen} />;
  if (!session) return <main className={ui.screen}><p>This walk no longer exists.</p><button type="button" className={`${ui.btn} ${ui.secondary}`} onClick={onBack}>Back to walks</button></main>;

  const remove = async () => { await removeSessionFiles(id); await deleteSession(id); onBack(); };
  const items = [
    [fmtDistance(stats.distanceM), 'distance'],
    [stats.durationS != null ? fmtDuration(stats.durationS * 1000) : '–', 'time'],
    [stats.meanAccM != null ? `±${stats.meanAccM} m` : '–', 'mean GPS'],
    [String(stats.gpsGaps), 'GPS gaps'],
  ];

  return (
    <main className={ui.screen}>
      <header className={ui.bar}>
        <h1 className={ui.title}>{session.name} · {SIDE[session.side] || session.side}</h1>
        <button type="button" className={`${ui.btn} ${ui.quiet}`} onClick={onBack}>Walks</button>
      </header>
      <TrackMap points={points} />
      <dl className={s.stats}>{items.map(([v, l]) => <div key={l}><dt>{l}</dt><dd className="num">{v}</dd></div>)}</dl>
      {session.status !== 'done' && <p className={s.flag}>Recording was interrupted. Everything up to that point was saved.</p>}
      <ExportPanel session={session} points={points} stats={stats} />
      <div className={s.danger}>
        {!confirm && <button type="button" className={`${ui.btn} ${ui.quiet}`} onClick={() => setConfirm(true)}>Delete this walk</button>}
        {confirm && (
          <div className={s.confirm}>
            <p>Delete the video and GPS from this phone? Export first if you still need them.</p>
            <div className={s.row}>
              <button type="button" className={`${ui.btn} ${ui.secondary}`} onClick={() => setConfirm(false)}>Keep</button>
              <button type="button" className={`${ui.btn} ${ui.stop}`} onClick={remove}>Delete</button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
