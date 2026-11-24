import ui from './ui.module.css';
import s from './SessionList.module.css';
import SessionCard from './SessionCard.jsx';
import { useSessions } from '../hooks/useSessions.js';
import { fmtBytes } from '../lib/format.js';

export default function SessionList({ onNew, onOpen }) {
  const { list, free } = useSessions();
  return (
    <main className={ui.screen}>
      <header className={ui.bar}>
        <h1 className={ui.title}>Walks</h1>
        {free != null && <span className={ui.pill}><span className={ui.dot} style={{ background: free > 3e9 ? 'var(--go)' : 'var(--warn)' }} />{fmtBytes(free)} free</span>}
      </header>
      {list && list.length === 0 && (
        <div className={s.empty}>
          <p className={s.emptyTitle}>No walks yet</p>
          <p className={ui.muted}>Start one at the corner where you want the street to begin.</p>
        </div>
      )}
      {list && list.length > 0 && (
        <ul className={s.list}>{list.map((x) => <li key={x.id}><SessionCard session={x} onOpen={() => onOpen(x.id)} /></li>)}</ul>
      )}
      <div className={ui.footer}><button type="button" className={`${ui.btn} ${ui.primary}`} onClick={onNew}>New walk</button></div>
    </main>
  );
}
