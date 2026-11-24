import { useEffect, useState } from 'react';
import { useWalk } from '../hooks/useWalk.js';
import NewWalk from './NewWalk.jsx';
import Recorder from './Recorder.jsx';
import PermissionError from './PermissionError.jsx';
import ui from './ui.module.css';

export default function WalkFlow({ onCancel, onDone, setBackLock }) {
  const walk = useWalk();
  const [backTried, setBackTried] = useState(0);

  useEffect(() => {
    setBackLock(walk.phase === 'setup' ? null : () => setBackTried(Date.now()));
    return () => setBackLock(null);
  }, [walk.phase, setBackLock]);

  const denied = walk.cam.error === 'denied' ? 'camera' : walk.geo.error === 'denied' ? 'location' : null;
  if (walk.phase === 'setup' && denied) return <PermissionError kind={denied} onRetry={walk.retry} onCancel={onCancel} />;

  if (walk.phase === 'saving') {
    return <main className={ui.screen}><p style={{ margin: 'auto', textAlign: 'center' }}>Saving the walk…</p></main>;
  }
  if (walk.phase === 'recording') {
    return <Recorder walk={walk} backTried={backTried} onFinish={async () => onDone(await walk.finish())} />;
  }
  return <NewWalk walk={walk} onCancel={onCancel} />;
}
