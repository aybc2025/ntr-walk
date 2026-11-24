import { useEffect, useState } from 'react';

const KEEPAWAKE_SRC = `${import.meta.env.BASE_URL}keepawake.mp4`;

// Keeps the screen on while recording, with no tapping: Chrome stops GPS when the screen turns off.
// 1) The Screen Wake Lock API, re-requested whenever Android drops it.
// 2) Backup: a tiny muted looping video. Android keeps the screen on while a video plays.
function startVideoBackup() {
  const v = document.createElement('video');
  v.src = KEEPAWAKE_SRC;
  v.muted = true; v.loop = true; v.playsInline = true;
  v.setAttribute('aria-hidden', 'true');
  Object.assign(v.style, { position: 'fixed', width: '1px', height: '1px', opacity: '0.01', bottom: '0', left: '0', pointerEvents: 'none' });
  document.body.appendChild(v);
  const play = v.play();
  return { el: v, ready: play ? play.then(() => true).catch(() => false) : Promise.resolve(true) };
}

export function useWakeLock(active) {
  const [state, setState] = useState('off'); // off | held | video | failed

  useEffect(() => {
    if (!active) { setState('off'); return undefined; }
    let lock = null;
    let backup = null;
    let dead = false;

    const useBackup = async () => {
      if (backup || dead) return;
      backup = startVideoBackup();
      const ok = await backup.ready;
      if (!dead) setState(ok ? 'video' : 'failed');
    };
    const request = async () => {
      if (dead || document.visibilityState !== 'visible') return;
      if (!('wakeLock' in navigator)) { useBackup(); return; }
      try {
        lock = await navigator.wakeLock.request('screen');
        if (dead) { lock.release(); return; }
        setState('held');
        lock.addEventListener('release', () => { if (!dead) { setState('off'); request(); } });
      } catch {
        useBackup();
      }
    };
    const onVisible = () => {
      if (document.visibilityState !== 'visible') return;
      request();
      if (backup) backup.el.play().catch(() => {});
    };

    request();
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      dead = true;
      document.removeEventListener('visibilitychange', onVisible);
      if (lock) lock.release().catch(() => {});
      if (backup) { backup.el.pause(); backup.el.remove(); }
    };
  }, [active]);

  return state;
}
