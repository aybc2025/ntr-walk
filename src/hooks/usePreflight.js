import { useEffect, useMemo, useState } from 'react';
import { MIME_CANDIDATES } from '../constants/config.js';
import { storageInfo } from '../lib/opfs.js';

export function pickMime() {
  if (typeof MediaRecorder === 'undefined') return null;
  return MIME_CANDIDATES.find((m) => MediaRecorder.isTypeSupported(m)) || null;
}

export function usePreflight() {
  const [storage, setStorage] = useState(null);
  const mime = useMemo(pickMime, []);
  const opfsOK = !!(navigator.storage && navigator.storage.getDirectory);

  useEffect(() => {
    storageInfo().then(setStorage).catch(() => setStorage({ free: null, persisted: false }));
  }, []);

  return { storage, mime, opfsOK, recorderOK: !!mime };
}
