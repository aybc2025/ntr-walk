import { useCallback, useEffect, useRef, useState } from 'react';
import { useCamera } from './useCamera.js';
import { useGeoTrack } from './useGeoTrack.js';
import { useRecorder } from './useRecorder.js';
import { useWakeLock } from './useWakeLock.js';
import { usePreflight } from './usePreflight.js';
import { putSession, addPoint, getPoints } from '../lib/db.js';
import { haversine, isGood, summarize } from '../lib/geo.js';

// Owns one walk from setup to saved session. Components only render it.
export function useWalk() {
  const [phase, setPhase] = useState('setup'); // setup | recording | saving
  const [attempt, setAttempt] = useState(0);
  const [distanceM, setDistanceM] = useState(0);
  const [background, setBackground] = useState(null); // ms spent hidden, shown once
  const session = useRef(null);
  const dist = useRef({ d: 0, last: null });

  const preflight = usePreflight();
  const cam = useCamera(true, attempt);
  const rec = useRecorder({
    stream: cam.stream, mime: preflight.mime, info: cam.info,
    onSegment: (segments) => { if (session.current) { session.current.segments = segments; putSession({ ...session.current }); } },
  });

  const onFix = useCallback((fix) => {
    const c = rec.clock(fix.t);
    if (!c || !session.current) return;
    const p = { ...fix, ...c, sessionId: session.current.id };
    addPoint(p);
    if (isGood(p)) {
      const d = dist.current;
      if (d.last) d.d += haversine(d.last, p);
      d.last = p;
      setDistanceM(d.d);
    }
  }, [rec.clock]);

  const geo = useGeoTrack(true, onFix, attempt);
  const wake = useWakeLock(phase === 'recording');

  useEffect(() => {
    if (phase !== 'recording') return undefined;
    let hiddenAt = null;
    const onVis = () => {
      if (document.visibilityState === 'hidden') hiddenAt = Date.now();
      else if (hiddenAt) { setBackground(Date.now() - hiddenAt); hiddenAt = null; }
    };
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, [phase]);

  const start = useCallback(async ({ name, side, direction }) => {
    const s = {
      id: crypto.randomUUID(), name: name.trim() || 'Walk', side, direction,
      startedAt: new Date().toISOString(), endedAt: null, status: 'recording',
      segments: [], pauses: [], stats: null,
      device: { userAgent: navigator.userAgent, camera: cam.info?.label || null, width: cam.info?.width, height: cam.info?.height },
    };
    session.current = s;
    dist.current = { d: 0, last: null };
    await putSession(s);
    await rec.start(s.id);
    setPhase('recording');
  }, [cam.info, rec]);

  const finish = useCallback(async () => {
    setPhase('saving');
    const out = await rec.stop();
    const s = session.current;
    const pts = await getPoints(s.id);
    const stats = { ...summarize(pts), durationS: Math.round(out.activeMs / 1000), bytes: out.segments.reduce((a, x) => a + (x.bytes || 0), 0) };
    await putSession({ ...s, segments: out.segments, pauses: out.pauses, endedAt: new Date().toISOString(), status: 'done', stats });
    return s.id;
  }, [rec]);

  return {
    phase, preflight, cam, geo, rec, wake, distanceM, start, finish,
    background, clearBackground: () => setBackground(null),
    retry: () => setAttempt((a) => a + 1),
  };
}
