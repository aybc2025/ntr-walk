const esc = (s) => String(s).replace(/[<>&'"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' }[c]));

export function toGPX(session, points) {
  const pts = points.map((p) => {
    const ele = p.altM != null ? `<ele>${p.altM.toFixed(1)}</ele>` : '';
    const acc = p.accM != null ? `<extensions><accuracy_m>${p.accM.toFixed(1)}</accuracy_m></extensions>` : '';
    return `      <trkpt lat="${p.lat.toFixed(7)}" lon="${p.lon.toFixed(7)}">${ele}<time>${new Date(p.t).toISOString()}</time>${acc}</trkpt>`;
  });
  return `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="NTR Walk" xmlns="http://www.topografix.com/GPX/1/1">
  <metadata><name>${esc(session.name)}</name><time>${session.startedAt}</time></metadata>
  <trk>
    <name>${esc(session.name)} (${session.side}, ${session.direction})</name>
    <trkseg>
${pts.join('\n')}
    </trkseg>
  </trk>
</gpx>
`;
}
