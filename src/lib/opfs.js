import { APP } from '../constants/config.js';

async function appDir() {
  const root = await navigator.storage.getDirectory();
  return root.getDirectoryHandle(APP, { create: true });
}

export async function getVideoFile(sessionId, name) {
  const dir = await (await appDir()).getDirectoryHandle(sessionId);
  return (await dir.getFileHandle(name)).getFile();
}

export async function removeSessionFiles(sessionId) {
  try { await (await appDir()).removeEntry(sessionId, { recursive: true }); } catch { /* already gone */ }
}

// One worker per recording; messages are answered in order.
export function createSegmentWriter() {
  const worker = new Worker(new URL('../workers/segmentWriter.js', import.meta.url), { type: 'module' });
  let seq = 0;
  const waiting = new Map();
  worker.onmessage = ({ data }) => {
    const w = waiting.get(data.id);
    waiting.delete(data.id);
    if (w) (data.ok ? w.resolve(data) : w.reject(new Error(data.error)));
  };
  const call = (msg, transfer) => new Promise((resolve, reject) => {
    const id = ++seq;
    waiting.set(id, { resolve, reject });
    worker.postMessage({ ...msg, id }, transfer || []);
  });
  return {
    open: (dir, name) => call({ cmd: 'open', app: APP, dir, name }),
    write: (buf) => call({ cmd: 'write', buf }, [buf]),
    close: () => call({ cmd: 'close' }),
    terminate: () => worker.terminate(),
  };
}

export async function storageInfo() {
  let persisted = false;
  try { persisted = (await navigator.storage.persisted()) || (await navigator.storage.persist()); } catch { /* unsupported */ }
  const est = await navigator.storage.estimate();
  return { free: Math.max(0, (est.quota || 0) - (est.usage || 0)), persisted };
}
