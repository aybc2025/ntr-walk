import s from './Recorder.module.css';
import { fmtBytes, fmtDistance } from '../lib/format.js';

export default function StatsBar({ distanceM, rec }) {
  const items = [
    [fmtDistance(distanceM), 'distance'],
    [String(rec.segIndex + 1), 'file'],
    [fmtBytes(rec.bytes), 'recorded'],
  ];
  return (
    <dl className={s.stats}>
      {items.map(([v, l]) => <div key={l}><dt>{l}</dt><dd className="num">{v}</dd></div>)}
    </dl>
  );
}
