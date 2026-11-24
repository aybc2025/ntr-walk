import ui from './ui.module.css';

const COPY = {
  camera: { title: 'No access to the camera', why: 'The walk can’t be recorded without it.', perm: 'Camera' },
  location: { title: 'No access to location', why: 'Without it the video can’t be matched to the street.', perm: 'Location' },
};

export default function PermissionError({ kind, onRetry, onCancel }) {
  const c = COPY[kind];
  return (
    <main className={ui.screen}>
      <div style={{ margin: 'auto 0', display: 'grid', gap: 'var(--sp-3)' }}>
        <span className={ui.pill} style={{ justifySelf: 'start' }}><span className={ui.dot} style={{ background: 'var(--rec)' }} />{c.perm} blocked</span>
        <h1 className={ui.title}>{c.title}</h1>
        <p style={{ color: 'var(--dust)' }}>{c.why}</p>
        <ol style={{ margin: 0, paddingInlineStart: 20, lineHeight: 1.7 }}>
          <li>Open Android <b>Settings</b> › <b>Apps</b> › <b>NTR Walk</b> (or <b>Chrome</b> if you opened it in a tab)</li>
          <li><b>Permissions</b> › <b>{c.perm}</b> › <b>Allow</b>{kind === 'location' ? ' and turn on Use precise location' : ''}</li>
          <li>Come back here</li>
        </ol>
      </div>
      <div className={ui.footer}>
        <button type="button" className={`${ui.btn} ${ui.primary}`} onClick={onRetry}>Try again</button>
        <button type="button" className={`${ui.btn} ${ui.secondary}`} onClick={onCancel}>Back to walks</button>
      </div>
    </main>
  );
}
