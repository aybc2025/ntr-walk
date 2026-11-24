# CLAUDE.md: NTR Walk

Field PWA for the Narrow the Road project. Records a street walk on an Android phone:
camera video + GPS, synced, exported as files for a separate local (Windows, Python)
processing tool. English UI. No backend, no auth, no secrets.

## On opening this repo, run automatically
`npm install && npm run build`. The build was verified clean in the build sandbox and
`package-lock.json` is committed, so CI is in **locked state** (`npm ci` + `cache: 'npm'`).
`npm install` also runs the `prepare` script, which points git at `.githooks/`.

## What you can NOT do here, even if asked
- Enable GitHub Pages (owner: Settings → Pages → Source = **GitHub Actions**, once).
- Test the install or recording on a real Android phone. Say so; don't claim it.
- Push straight to `main` with an unreviewed change to recording code: a bug there loses
  someone's walk. Test with the headless flow below first.

## Secret scan before commit
Run `bash .githooks/secret-scan.sh` before every commit and `bash .githooks/secret-scan.sh --all`
before a first push. Never `--no-verify` or `git add -f`. This app has no secrets and no env vars;
if one ever appears it must not be committed.

## Architecture
- `src/hooks/useWalk.js` owns a walk end to end (camera, GPS, recorder, wake lock, session save).
  Components only render it.
- `src/hooks/useRecorder.js` MediaRecorder → `src/workers/segmentWriter.js` (OPFS sync access
  handle) → one file per segment. Also exposes `clock(t)` = `{segment, segmentMs}` used to stamp
  every GPS fix. That pair is the sync contract with the local tool; don't change its meaning.
- `src/lib/` pure helpers: IndexedDB (`db.js`), OPFS (`opfs.js`), geo math, GPX/CSV, exporter.
- `src/components/` screens: SessionList → WalkFlow (NewWalk / Recorder) → Summary.

## Intentional decisions: do not revert without asking
- **Video format order** (`MIME_CANDIDATES`): H.264 inside WebM/Matroska first. Tested: Chrome's
  MP4 MediaRecorder emits NO data until stop (whole file in RAM, lost on crash). WebM streams a
  chunk every second. MP4 is last resort and then files are cut every 2 min (`SEGMENT_MS_BUFFERED`).
- **Sync access handle in a worker** instead of `createWritable()`: writable streams only commit
  on close, so a crash would lose the current file.
- **10-minute files** (`SEGMENT_MS`): bounded file size, a crash costs at most the unflushed second.
- **Keep-awake**: Screen Wake Lock, re-requested on release; backup is a muted looping 16×16 video
  (`public/keepawake.mp4`). The user must never be told to tap the screen.
- **Finish needs a 1 s hold** so a brush of the thumb can't end a walk. Android Back is blocked while
  recording (App.jsx `backLock`).
- **Update banner only on the walks list**: reloading mid-walk would end the recording.
- **Points with accuracy > 30 m** are kept in exports but not counted in distance.
- **No tagging, no snapshots** in the app. The owner decided all analysis happens in the local tool.
- No router; screen state in App.jsx. Leaflet map only on the summary, online only.

## Visual system (approved)
Palette: asphalt #1E2227 (bg), curb #2C3238 (surfaces), edge #454D55, chalk #F2F1EC (text, 14:1),
dust #A9B0B7 (secondary, 7.6:1), line #F5C518 (primary action; asphalt text on it 10:1),
rec #E5484D (record/stop; white bold text), go #3FB27F (GPS ok), warn #F08A24.
Type: Rubik 500/700 (UI, numbers tabular), Heebo 400/500 (body), bundled via @fontsource.
Scale 13/16/20/25/31/39. Spacing 4/8/12/16/24/32/48. Radius 10px, pills 999px. One elevation level.
Motion: almost none. Record dot blink, hold-fill 1 s linear / release 200 ms ease-out. Reduced motion respected.

## App icons
Concept: a street running to the horizon (asphalt, sidewalks, yellow centre line) plus a red record
dot. Generator: `icon-design/make_icons.py` (8× then LANCZOS). Full set in `public/icons/`
(192, 512, 512 maskable at 72% safe zone, apple-touch 180, favicon 32), viewed at full size,
through a circular mask, and at 96/48/32 px. Wired into the manifest and index.html.

## PWA install identity
- manifest `id` = `/ntr-walk/app` (differs from `start_url` on purpose), `start_url` = `scope` = `/ntr-walk/`.
- Workbox `cacheId` = `ntr-walk`; IndexedDB `ntr-walk:db`; OPFS folder `ntr-walk/`. All prefixed:
  every repo on aybc2025.github.io shares one origin.
- Headless check (served at `/ntr-walk/`): no manifest errors, no installability errors, SW activated,
  all icon URLs 200 image/png. The Android install itself was not tested.
- If the owner sees "This app is already installed" with no app: change `id`, remove old shortcut,
  Android Settings → Apps → uninstall leftovers, reopen and use ⋮ → Install app.

## Commands
`npm run dev` · `npm run build` · `npm run preview` (serves at http://localhost:8765/ntr-walk/)
Headless test used during the build: Chrome with `--use-fake-device-for-media-stream
--use-fake-ui-for-media-stream`, camera+geolocation granted, `set_geolocation` steps along 12th St,
hold Finish, Save → check zip, `points.csv` segment/segment_ms, and `ffprobe` the video.

## Deployment
Push to `main` → `.github/workflows/deploy.yml` builds and deploys to GitHub Pages. One-time owner
step: Settings → Pages → Source = GitHub Actions. No Netlify, no Firebase.
