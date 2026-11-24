import { useCallback, useEffect, useState } from 'react';
import { listSessions, deleteSession } from '../lib/db.js';
import { removeSessionFiles, storageInfo } from '../lib/opfs.js';

export function useSessions() {
  const [list, setList] = useState(null);
  const [free, setFree] = useState(null);

  const refresh = useCallback(async () => {
    setList(await listSessions());
    try { setFree((await storageInfo()).free); } catch { setFree(null); }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const remove = useCallback(async (id) => {
    await removeSessionFiles(id);
    await deleteSession(id);
    refresh();
  }, [refresh]);

  return { list, free, refresh, remove };
}
