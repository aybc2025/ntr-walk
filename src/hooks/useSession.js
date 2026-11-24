import { useEffect, useState } from 'react';
import { getSession, getPoints } from '../lib/db.js';
import { summarize } from '../lib/geo.js';

export function useSession(id) {
  const [state, setState] = useState({ session: null, points: [], stats: null, loading: true });

  useEffect(() => {
    let live = true;
    (async () => {
      const session = await getSession(id);
      const points = session ? await getPoints(id) : [];
      // Interrupted walks have no saved stats: work them out from the points.
      const stats = session && (session.stats || { ...summarize(points), bytes: session.segments.reduce((a, x) => a + (x.bytes || 0), 0), durationS: null });
      if (live) setState({ session, points, stats, loading: false });
    })();
    return () => { live = false; };
  }, [id]);

  return state;
}
