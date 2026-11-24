import { useCallback, useEffect, useRef, useState } from 'react';
import { SEGMENT_MS, SEGMENT_MS_BUFFERED, TIMESLICE_MS, VIDEO_BPS, extFor, isBuffered } from '../constants/config.js';
import { createSegmentWriter } from '../lib/opfs.js';

// Records the camera stream to OPFS in 10-minute files and keeps the clock
// that ties every GPS fix to a file and a moment inside it.
export function useRecorder({ stream, mime, info, onSegment }) {
  const r = useRef({ status: 'idle', segments: [], pauses: [], chain: Promise.resolve() });
  const segCb = useRef(onSegment);
  segCb.current = onSegment;
  const [ui, setUi] = useState({ status: 'idle', elapsedMs: 0, bytes: 0, segIndex: 0, error: null });

  const activeMs = useCallback(() => {
    const s = r.current;
    if (!s.startedAt) return 0;
    const now = s.endedAt || Date.now();
    return now - s.startedAt - s.pausedTotal - (s.pauseAt ? now - s.pauseAt : 0);
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      const s = r.current;
      if (s.status === 'idle') return;
      setUi((u) => ({ ...u, status: s.status, elapsedMs: activeMs(), bytes: (s.bytesDone || 0) + (s.segBytes || 0), segIndex: s.segIndex }));
    }, 500);
    return () => clearInterval(id);
  }, [activeMs]);

  const fail = useCallback((err) => setUi((u) => ({ ...u, error: String((err && err.message) || err) })), []);
  const emit = () => segCb.current && segCb.current(r.current.segments.map((x) => ({ ...x })));

  const startSegment = useCallback(async () => {
    const s = r.current;
    s.segIndex = (s.segIndex ?? -1) + 1;
    const ext = extFor(mime);
    const file = `seg-${String(s.segIndex + 1).padStart(2, '0')}.${ext}`;
    await s.writer.open(s.sessionId, file);
    const seg = { index: s.segIndex, file, mime, width: info?.width, height: info?.height, startEpochMs: null, endEpochMs: null, bytes: 0 };
    s.segments.push(seg);
    s.segBytes = 0; s.segPaused = 0;
    const mr = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: VIDEO_BPS });
    s.mr = mr;
    mr.ondataavailable = (e) => {
      if (!e.data || !e.data.size) return;
      s.chain = s.chain
        .then(async () => { const res = await s.writer.write(await e.data.arrayBuffer()); seg.bytes = res.bytes; s.segBytes = res.bytes; })
        .catch(fail);
    };
    mr.onerror = (e) => fail(e.error || 'Recording error');
    await new Promise((res) => { mr.onstart = () => { seg.startEpochMs = Date.now(); s.segStart = seg.startEpochMs; res(); }; mr.start(TIMESLICE_MS); });
    emit();
    s.rotateTimer = setTimeout(() => rotateRef.current(), isBuffered(mime) ? SEGMENT_MS_BUFFERED : SEGMENT_MS);
  }, [stream, mime, info, fail]);

  const endSegment = useCallback(async () => {
    const s = r.current;
    const mr = s.mr;
    if (!mr) return;
    clearTimeout(s.rotateTimer);
    await new Promise((res) => { mr.onstop = res; if (mr.state !== 'inactive') mr.stop(); else res(); });
    await s.chain;
    const seg = s.segments[s.segments.length - 1];
    seg.endEpochMs = Date.now();
    const res = await s.writer.close();
    seg.bytes = res.bytes;
    s.bytesDone = (s.bytesDone || 0) + res.bytes;
    s.segBytes = 0; s.mr = null;
    emit();
  }, []);

  const rotateRef = useRef(null);
  rotateRef.current = async () => {
    const s = r.current;
    if (s.status === 'paused') { s.rotateDue = true; return; }
    if (s.status !== 'recording') return;
    s.status = 'rotating';
    try { await endSegment(); await startSegment(); } catch (e) { fail(e); }
    if (s.status === 'rotating') s.status = 'recording';
  };

  const start = useCallback(async (sessionId) => {
    const s = r.current;
    Object.assign(s, { sessionId, segments: [], pauses: [], segIndex: -1, bytesDone: 0, pausedTotal: 0, pauseAt: null, startedAt: Date.now(), endedAt: null, writer: createSegmentWriter() });
    await startSegment();
    s.status = 'recording';
    setUi({ status: 'recording', elapsedMs: 0, bytes: 0, segIndex: 0, error: null });
  }, [startSegment]);

  const pause = useCallback(() => {
    const s = r.current;
    if (s.status !== 'recording' || !s.mr) return;
    s.mr.pause(); s.pauseAt = Date.now(); s.status = 'paused';
    s.pauses.push({ fromEpochMs: s.pauseAt, toEpochMs: null });
    setUi((u) => ({ ...u, status: 'paused' }));
  }, []);

  const resume = useCallback(() => {
    const s = r.current;
    if (s.status !== 'paused' || !s.mr) return;
    const now = Date.now();
    s.pausedTotal += now - s.pauseAt; s.segPaused += now - s.pauseAt; s.pauseAt = null;
    s.pauses[s.pauses.length - 1].toEpochMs = now;
    s.mr.resume(); s.status = 'recording';
    setUi((u) => ({ ...u, status: 'recording' }));
    if (s.rotateDue) { s.rotateDue = false; rotateRef.current(); }
  }, []);

  const stop = useCallback(async () => {
    const s = r.current;
    if (s.pauseAt) { s.pausedTotal += Date.now() - s.pauseAt; s.pauses[s.pauses.length - 1].toEpochMs = Date.now(); s.pauseAt = null; }
    s.status = 'stopping';
    await endSegment();
    s.endedAt = Date.now();
    s.writer.terminate();
    s.status = 'idle';
    return { segments: s.segments.map((x) => ({ ...x })), pauses: s.pauses.slice(), activeMs: activeMs() };
  }, [endSegment, activeMs]);

  // Where in the video a moment falls. Null while paused or between files.
  const clock = useCallback((t) => {
    const s = r.current;
    if (s.status !== 'recording' || !s.segStart) return null;
    return { segment: s.segIndex, segmentMs: Math.max(0, Math.round(t - s.segStart - s.segPaused)) };
  }, []);

  return { ...ui, start, pause, resume, stop, clock, activeMs };
}
