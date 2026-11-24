import { useEffect, useRef, useState } from 'react';
import ui from './ui.module.css';
import s from './NewWalk.module.css';
import Segmented from './Segmented.jsx';
import PreflightChecks from './PreflightChecks.jsx';
import { SIDES, DIRECTIONS } from '../constants/config.js';

export default function NewWalk({ walk, onCancel }) {
  const [name, setName] = useState('12th St');
  const [side, setSide] = useState('west');
  const [direction, setDirection] = useState('north');
  const [starting, setStarting] = useState(false);
  const video = useRef(null);

  useEffect(() => { if (video.current && walk.cam.stream) video.current.srcObject = walk.cam.stream; }, [walk.cam.stream]);

  const ready = !!walk.cam.stream && !!walk.preflight.mime && walk.preflight.opfsOK && !!walk.geo.last;
  const begin = async () => {
    setStarting(true);
    try { await walk.start({ name, side, direction }); } catch { setStarting(false); }
  };

  return (
    <main className={ui.screen}>
      <header className={ui.bar}>
        <h1 className={ui.title}>New walk</h1>
        <button type="button" className={`${ui.btn} ${ui.quiet}`} onClick={onCancel}>Cancel</button>
      </header>
      <video ref={video} className={s.preview} muted playsInline autoPlay aria-label="Camera preview" />
      <div className={s.field}>
        <label className={s.label} htmlFor="walk-name">Name</label>
        <input id="walk-name" className={s.input} value={name} onChange={(e) => setName(e.target.value)} autoComplete="off" />
      </div>
      <Segmented id="side" label="Side of the street" options={SIDES} value={side} onChange={setSide} />
      <Segmented id="dir" label="Walking direction" options={DIRECTIONS} value={direction} onChange={setDirection} />
      <PreflightChecks walk={walk} />
      <div className={ui.footer}>
        {!walk.geo.last && <p className={ui.muted}>Waiting for the first GPS fix. Stand outside with a clear view of the sky.</p>}
        <button type="button" className={`${ui.btn} ${ui.stop}`} disabled={!ready || starting} onClick={begin}>
          <span className={ui.dot} style={{ background: '#fff' }} />{starting ? 'Starting…' : 'Start recording'}
        </button>
      </div>
    </main>
  );
}
