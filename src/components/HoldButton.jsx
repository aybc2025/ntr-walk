import { useEffect, useRef, useState } from 'react';
import ui from './ui.module.css';
import s from './Recorder.module.css';

const HOLD_MS = 1000;

// Ends the walk only after a one-second press, so a brush of the thumb can't stop a recording.
export default function HoldButton({ onHold, disabled, children }) {
  const [holding, setHolding] = useState(false);
  const timer = useRef(null);

  const begin = () => {
    if (disabled) return;
    setHolding(true);
    timer.current = setTimeout(() => { setHolding(false); onHold(); }, HOLD_MS);
  };
  const cancel = () => { clearTimeout(timer.current); setHolding(false); };
  useEffect(() => () => clearTimeout(timer.current), []);

  return (
    <button type="button" disabled={disabled}
      className={`${ui.btn} ${ui.stop} ${s.hold} ${holding ? s.holding : ''}`}
      onPointerDown={begin} onPointerUp={cancel} onPointerLeave={cancel} onPointerCancel={cancel}
      onKeyDown={(e) => { if ((e.key === 'Enter' || e.key === ' ') && !e.repeat) { e.preventDefault(); begin(); } }}
      onKeyUp={(e) => { if (e.key === 'Enter' || e.key === ' ') cancel(); }}
      onContextMenu={(e) => e.preventDefault()}>
      <span className={s.fill} aria-hidden="true" />
      <span className={s.holdLabel}>{children} <small>(hold)</small></span>
    </button>
  );
}
