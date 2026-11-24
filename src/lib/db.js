import { openDB } from 'idb';
import { APP } from '../constants/config.js';

// Key prefixed with the app name: every app on <user>.github.io shares storage.
const dbp = openDB(`${APP}:db`, 1, {
  upgrade(db) {
    db.createObjectStore('sessions', { keyPath: 'id' });
    const pts = db.createObjectStore('points', { autoIncrement: true });
    pts.createIndex('bySession', 'sessionId');
  },
});

export async function listSessions() {
  const all = await (await dbp).getAll('sessions');
  return all.sort((a, b) => b.startedAt.localeCompare(a.startedAt));
}
export const getSession = async (id) => (await dbp).get('sessions', id);
export const putSession = async (s) => (await dbp).put('sessions', s);
export const addPoint = async (p) => (await dbp).add('points', p);
export const getPoints = async (id) =>
  (await (await dbp).getAllFromIndex('points', 'bySession', id)).sort((a, b) => a.t - b.t);

export async function deleteSession(id) {
  const db = await dbp;
  const tx = db.transaction(['sessions', 'points'], 'readwrite');
  let cur = await tx.objectStore('points').index('bySession').openCursor(id);
  while (cur) { await cur.delete(); cur = await cur.continue(); }
  await tx.objectStore('sessions').delete(id);
  await tx.done;
}
