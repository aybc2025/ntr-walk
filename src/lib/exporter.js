import { zipSync, strToU8 } from 'fflate';
import { toGPX } from './gpx.js';
import { pointsCSV } from './csv.js';
import { getVideoFile } from './opfs.js';
import { slug } from './format.js';

export function baseName(session) {
  return `${session.startedAt.slice(0, 10)}_${slug(session.name)}_${session.side}`;
}

// Small files in one zip. Video stays separate: too big to zip in phone memory.
export function buildZip(session, points) {
  const base = baseName(session);
  const meta = { ...session, exportedAt: new Date().toISOString(), pointCount: points.length, format: 'ntr-walk/1' };
  const data = zipSync({
    [`${base}.gpx`]: strToU8(toGPX(session, points)),
    'points.csv': strToU8(pointsCSV(points)),
    'session.json': strToU8(JSON.stringify(meta, null, 2)),
  }, { level: 6 });
  return new File([data], `${base}.zip`, { type: 'application/zip' });
}

export async function videoFiles(session) {
  const base = baseName(session);
  const out = [];
  for (const seg of session.segments) {
    try {
      const f = await getVideoFile(session.id, seg.file);
      if (f.size === 0) continue;
      const ext = seg.file.split('.').pop();
      out.push(new File([f], `${base}_${String(seg.index + 1).padStart(2, '0')}.${ext}`, { type: f.type || seg.mime.split(';')[0] }));
    } catch { /* missing segment: skip */ }
  }
  return out;
}

export const canShareFiles = (files) => !!(navigator.canShare && navigator.canShare({ files }));

export async function shareFiles(files, title) {
  await navigator.share({ files, title });
}

export function downloadFile(file) {
  const url = URL.createObjectURL(file);
  const a = document.createElement('a');
  a.href = url; a.download = file.name;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}
