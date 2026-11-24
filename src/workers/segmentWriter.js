// Writes video chunks straight to disk with a sync access handle.
// Unlike createWritable(), nothing waits in a temp file until close(),
// so a crash or a killed tab keeps everything written so far.
let handle = null;
let offset = 0;

self.onmessage = async ({ data }) => {
  try {
    if (data.cmd === 'open') {
      const root = await navigator.storage.getDirectory();
      const app = await root.getDirectoryHandle(data.app, { create: true });
      const dir = await app.getDirectoryHandle(data.dir, { create: true });
      const file = await dir.getFileHandle(data.name, { create: true });
      handle = await file.createSyncAccessHandle();
      handle.truncate(0);
      offset = 0;
      self.postMessage({ id: data.id, ok: true });
    } else if (data.cmd === 'write') {
      offset += handle.write(new Uint8Array(data.buf), { at: offset });
      handle.flush();
      self.postMessage({ id: data.id, ok: true, bytes: offset });
    } else if (data.cmd === 'close') {
      if (handle) { handle.flush(); handle.close(); handle = null; }
      self.postMessage({ id: data.id, ok: true, bytes: offset });
    }
  } catch (err) {
    self.postMessage({ id: data.id, ok: false, error: String(err && err.message || err) });
  }
};
