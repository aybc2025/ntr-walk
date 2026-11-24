import s from './SessionList.module.css';
import { fmtBytes, fmtDate, fmtDistance, fmtDuration } from '../lib/format.js';

const SIDE = { west: 'west side', east: 'east side', middle: 'middle' };

export default function SessionCard({ session: x, onOpen }) {
  const st = x.stats;
  const bytes = st ? st.bytes : x.segments.reduce((a, g) => a + (g.bytes || 0), 0);
  const bits = [fmtDate(x.startedAt)];
  if (st) bits.push(fmtDistance(st.distanceM), fmtDuration(st.durationS * 1000));
  bits.push(fmtBytes(bytes));
  return (
    <button type="button" className={s.card} onClick={onOpen}>
      <span className={s.name}>{x.name} · {SIDE[x.side] || x.side}</span>
      <span className={`${s.meta} num`}>{bits.join(' · ')}</span>
      {x.status !== 'done' && <span className={s.flag}>Recording was interrupted. The saved part can still be exported.</span>}
    </button>
  );
}
