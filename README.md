# NTR Walk

Field app for **Narrow the Road**: records a street walk as video plus a GPS track
that is synced to the video, then exports both for processing on a computer.
Android + Chrome. No accounts, no server: everything stays on the phone until you export.

**App:** https://aybc2025.github.io/ntr-walk/

## Install on Android
1. Open the link above in **Chrome**.
2. Chrome ⋮ menu → **Install app** (not "Add to home screen", which only makes a shortcut).
3. Open **NTR Walk** from the home screen. Allow **Camera** and **Location** (precise) when asked.

## Use
1. **New walk** → name, side of the street, direction. Wait for the GPS check to turn green.
2. **Start recording** and walk. Keep the app open; the screen stays on by itself.
3. **Finish walk**: press and hold for one second.
4. **Share to Google Drive** (or **Save to phone**). You get the video file(s) plus a small zip
   with the GPS track (`.gpx`), `points.csv` and `session.json`.

## What the export contains
| File | Content |
|---|---|
| `<date>_<name>_<side>_01.webm` … | Video, H.264, one file per 10 minutes |
| `<date>_<name>_<side>.gpx` | Full GPS track with times |
| `points.csv` | Every GPS fix with `segment` (video file) and `segment_ms` (moment inside it) |
| `session.json` | Side, direction, file start times, pauses, phone and camera details |

See `CLAUDE.md` for how the code is organised.
