import { useRegisterSW } from 'virtual:pwa-register/react';
import ui from './ui.module.css';

// Shown on the walks list only, never mid-recording: reloading would end a walk.
export default function UpdateBanner() {
  const { needRefresh: [needRefresh], updateServiceWorker } = useRegisterSW();
  if (!needRefresh) return null;
  return (
    <div role="status" style={{
      position: 'fixed', insetInline: 'var(--sp-4)', bottom: 'calc(var(--sp-4) + 64px)', background: 'var(--chalk)', color: 'var(--asphalt)',
      borderRadius: 'var(--r)', padding: 'var(--sp-3) var(--sp-4)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--sp-3)',
    }}>
      <span style={{ fontFamily: 'var(--font-ui)', fontWeight: 500 }}>New version available</span>
      <button type="button" className={`${ui.btn} ${ui.primary}`} style={{ width: 'auto' }} onClick={() => updateServiceWorker(true)}>Reload</button>
    </div>
  );
}
