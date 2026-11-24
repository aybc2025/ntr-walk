export const fmtDuration = (ms) => {
  const s = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
  const mm = String(m).padStart(h ? 2 : 1, '0'), ss = String(sec).padStart(2, '0');
  return h ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
};
export const fmtBytes = (b) => {
  if (b == null) return '–';
  if (b === 0) return '0 MB';
  if (b >= 1e9) return `${(b / 1e9).toFixed(1)} GB`;
  if (b >= 1e6) return `${Math.round(b / 1e6)} MB`;
  return `${Math.max(1, Math.round(b / 1e3))} KB`;
};
export const fmtDistance = (m) => (m == null ? '–' : m >= 1000 ? `${(m / 1000).toFixed(1)} km` : `${Math.round(m)} m`);
export const fmtDate = (iso) => new Date(iso).toLocaleDateString('en-CA', { year: 'numeric', month: 'short', day: 'numeric' });
export const slug = (s) => (s || 'walk').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'walk';
