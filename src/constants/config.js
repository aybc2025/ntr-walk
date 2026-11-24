// Tuned constants. See CLAUDE.md "Intentional decisions" before changing.
export const APP = 'ntr-walk';
export const SEGMENT_MS = 10 * 60 * 1000; // new video file every 10 min (~600 MB at 8 Mbps)
// Chrome's MP4 recorder holds the whole file in memory until stop: if MP4 is the only
// option, cut files short so a crash loses at most 2 min and memory stays bounded.
export const SEGMENT_MS_BUFFERED = 2 * 60 * 1000;
export const TIMESLICE_MS = 1000; // recorder hands over data every second
export const VIDEO_BPS = 8_000_000;
export const ACC_BAD_M = 30; // fixes worse than this are kept but not counted in distance
export const GAP_MS = 10_000; // no fix for this long = a GPS gap
export const LOW_STORAGE_BYTES = 1.5e9;
// Order matters. H.264 inside WebM/Matroska first: hardware encoder AND data written
// to disk every second. MP4 last: Chrome buffers it in memory until the file ends.
export const MIME_CANDIDATES = [
  'video/webm;codecs=h264',
  'video/x-matroska;codecs=avc1',
  'video/webm;codecs=vp9',
  'video/webm;codecs=vp8',
  'video/webm',
  'video/mp4;codecs=avc1.640028',
  'video/mp4',
];
export const extFor = (mime) => (mime.startsWith('video/mp4') ? 'mp4' : mime.startsWith('video/x-matroska') ? 'mkv' : 'webm');
export const isBuffered = (mime) => mime.startsWith('video/mp4');
export const VIDEO_CONSTRAINTS = {
  audio: false,
  video: {
    facingMode: { ideal: 'environment' },
    width: { ideal: 1920 },
    height: { ideal: 1080 },
    frameRate: { ideal: 30 },
  },
};
export const SIDES = [
  { value: 'west', label: 'West' },
  { value: 'east', label: 'East' },
  { value: 'middle', label: 'Middle' },
];
export const DIRECTIONS = [
  { value: 'north', label: 'Northbound' },
  { value: 'south', label: 'Southbound' },
];
