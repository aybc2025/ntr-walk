import { useEffect, useState } from 'react';
import { VIDEO_CONSTRAINTS } from '../constants/config.js';

// Rear camera at the best supported resolution. `attempt` re-runs after a permission fix.
export function useCamera(active, attempt = 0) {
  const [stream, setStream] = useState(null);
  const [error, setError] = useState(null);
  const [info, setInfo] = useState(null);

  useEffect(() => {
    if (!active) return undefined;
    let own = null;
    let cancelled = false;
    setError(null);
    navigator.mediaDevices.getUserMedia(VIDEO_CONSTRAINTS)
      .then((st) => {
        if (cancelled) { st.getTracks().forEach((t) => t.stop()); return; }
        own = st;
        const track = st.getVideoTracks()[0];
        const set = track.getSettings();
        setInfo({ width: set.width, height: set.height, label: track.label });
        setStream(st);
      })
      .catch((e) => setError(e && e.name === 'NotAllowedError' ? 'denied' : 'unavailable'));
    return () => {
      cancelled = true;
      if (own) own.getTracks().forEach((t) => t.stop());
      setStream(null);
    };
  }, [active, attempt]);

  return { stream, error, info };
}
