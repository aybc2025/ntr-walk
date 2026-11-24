import { useCallback, useState } from 'react';
import { buildZip, videoFiles, canShareFiles, shareFiles, downloadFile } from '../lib/exporter.js';

export function useExport(session, points) {
  const [status, setStatus] = useState(null); // { kind: 'busy'|'done'|'error', text }

  const collect = useCallback(async () => {
    const videos = await videoFiles(session);
    return { videos, zip: buildZip(session, points) };
  }, [session, points]);

  const shareAll = useCallback(async () => {
    setStatus({ kind: 'busy', text: 'Preparing files…' });
    try {
      const { videos, zip } = await collect();
      const files = [...videos, zip];
      if (!canShareFiles(files)) { setStatus({ kind: 'error', text: 'This phone can’t share these files. Use Save to phone.' }); return; }
      await shareFiles(files, session.name);
      setStatus({ kind: 'done', text: 'Shared.' });
    } catch (e) {
      if (e && e.name === 'AbortError') setStatus(null);
      else setStatus({ kind: 'error', text: `Sharing failed: ${e.message || e}. Try Save to phone.` });
    }
  }, [collect, session]);

  const saveAll = useCallback(async () => {
    setStatus({ kind: 'busy', text: 'Saving…' });
    try {
      const { videos, zip } = await collect();
      for (const f of [zip, ...videos]) { downloadFile(f); await new Promise((r) => setTimeout(r, 800)); }
      setStatus({ kind: 'done', text: `Saved ${videos.length + 1} files to Downloads.` });
    } catch (e) {
      setStatus({ kind: 'error', text: `Saving failed: ${e.message || e}` });
    }
  }, [collect]);

  return { status, shareAll, saveAll };
}
