import ui from './ui.module.css';
import s from './Summary.module.css';
import { useExport } from '../hooks/useExport.js';
import { fmtBytes } from '../lib/format.js';

export default function ExportPanel({ session, points, stats }) {
  const ex = useExport(session, points);
  const segs = session.segments.filter((g) => g.bytes > 0);
  const busy = ex.status?.kind === 'busy';
  return (
    <section className={s.export} aria-labelledby="exp-h">
      <h2 id="exp-h" className={s.h2}>Export</h2>
      <div className={s.file}><span>Video ({segs.length} {segs.length === 1 ? 'file' : 'files'})</span><span className="num">{fmtBytes(stats.bytes)}</span></div>
      <div className={s.file}><span>GPS track + walk details</span><span className="num">{points.length} points · zip</span></div>
      {ex.status && <p className={s[ex.status.kind]} role="status">{ex.status.text}</p>}
      <div className={ui.footer}>
        <button type="button" className={`${ui.btn} ${ui.primary}`} onClick={ex.shareAll} disabled={busy}>Share to Google Drive</button>
        <button type="button" className={`${ui.btn} ${ui.secondary}`} onClick={ex.saveAll} disabled={busy}>Save to phone (Downloads)</button>
      </div>
    </section>
  );
}
