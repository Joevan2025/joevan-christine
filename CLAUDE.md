# rsvp_joe_tin — project notes for future sessions

Static wedding site (Joevan & Christine, 21 Nov 2026, Bacolod). Vanilla HTML/CSS/JS, no build step.
**LIVE at https://joevan2025.github.io/joevan-christine/** (repo `Joevan2025/joevan-christine` — the
groom owns it; Mark pushes as collaborator `markashlee-de`, never the client account `markcallcorzo`). Every push to `main`
redeploys in ~1 min. Photos/audio arrive by pushing files (couple can use github.com's upload UI —
steps in README). Design rationale: `docs/design-spec.md`. Owner's notes: `README.md`.
Backend: **v2 LIVE** — `RSVP_ENDPOINT_V2` in `js/config.js` points at **Joevan's** deployment of
`backend/Code.gs` (`AKfycbyyJ8Jjf…`, switched 2026-08-26); replies land in the `RSVPs v2` tab and
accepting guests get a receipt email **from j.cponce.me92@gmail.com**. Mark's earlier deployment
(`AKfycbxtyvd…`) is retired — it still exists and would send mail as Mark if anything called it.
Rule: **mail comes from whoever created the deployment, and every new deployment has a new
`/exec` URL that must be pasted into config** (the "still my email" bug was exactly this).
Verified from the live origin: readable `{ok:true}`, no preflight, `text/plain` POST.
Editing `backend/Code.gs` needs a redeploy by Joevan (*Manage deployments → New version*) or
nothing changes.
Claude artifacts are retired for this project — the Pages URL is the preview.

## Invariants — do not reintroduce these bugs

- **Google Fonts family names must be exact.** The original page requested `Cormorant+Garant`
  (a typo for `Cormorant Garamond`). Google Fonts returns 400 for an unknown family and, because all
  families share one `<link>`, *silently drops every font on the page*. Verify with
  `curl -s -o /dev/null -w "%{http_code}" "https://fonts.googleapis.com/css2?family=<Family>"` → must be 200.
- **The RSVP JSON contract is fixed**: `{timestamp, firstName, lastName, email, phone,
  attending:'Yes'|'No', guests, message, companions:[strings]}`. `buildPayload()` in `js/rsvp.js`
  is the ONLY place that builds it (exposed as `window.buildPayload`). The backend
  (`backend/Code.gs`) validates it server-side (incl. the `website` honeypot) and legacy-accepts a
  payload with NO `companions` key (old cached frontends).
- **The v2 POST must stay a CORS *simple request***: JSON string body with **no Content-Type
  header** (browser sends text/plain). Apps Script web apps cannot answer a preflight OPTIONS, so
  "fixing" it to `application/json` breaks every submission. Success is shown ONLY on a parsed
  `{ok:true}` response; every other outcome (ok:false, non-JSON login page, network failure) keeps
  the form visible with `data-rsvp-status="error"` and the button re-enabled. The legacy
  `mode:'no-cors'` path runs only while `RSVP_ENDPOINT_V2` in `js/config.js` is `''` — never
  re-add a no-cors fallback to the v2 path (it resurrects "success proves nothing").
- **Apps Script deploys are versioned**: editing `backend/Code.gs` changes nothing live until
  *Deploy → Manage deployments → New version*. Venue lines / deadline / hashtag are duplicated as
  constants in Code.gs (it cannot read `js/config.js`) — change both, then redeploy. Receipt
  emails go only to accepting guests; an email failure must never fail the row append.
- **No `alert()`, no emoji as icons, no clickable `<div>`s.** Icons are `<use href="#ico-…">` from the
  inline sprite; disclosure is native `<details>`; dialogs are `<dialog>` + `showModal()`.
- **Every fact lives in `js/config.js`** (dates, venues with lat/lon + `mapQuery`, tracks,
  contacts, hashtag, gallery count). `index.html` holds copy, not constants. Hashtag text is
  rendered from config. Venue maps: ONLY official
  `google.com/maps/embed?pb=…` URLs may be put in an iframe — built from each venue's `ftid`
  place token (`pbEmbed()` in js/media.js; static overview iframe in index.html). The legacy
  `output=embed` endpoints (directions saddr/daddr AND ?q=) render in headless Chrome but are
  REFUSED framing in real browsers (redirect → X-Frame-Options; guests saw a broken grey frame) —
  never reintroduce them, and never swap the overview back to a drawing: the couple asked for the
  actual Google Map to be visible. `YOUTUBE_ID` accepts a
  bare ID or any pasted YouTube URL (`ytId()` in `js/media.js` extracts it).
- **The page must never be blank without JS.** Reveal/hidden states are gated on `html.js`
  (set by the inline script in `<head>`). Keep that gate on any new animated-in element.
- **Groom's parents conflict is unresolved by design** (Tagolimot in Details vs Rikkerink in
  Entourage). Leave both; the `TODO (couple)` comments and README flag it. Don't "fix" one silently.

## Sound: the cover, the background music, and who may pause whom

- **The cover (`#cover`) is the autoplay gesture.** Browsers only allow sound after a trusted
  tap; the "Open the invitation" button is that tap and the music player is created inside its
  click. Never auto-dismiss the cover, never create the player before it, never start it muted
  "to be safe" (the original tap-for-sound pill was retired for exactly this reason).
- **The hidden player (`#bgm`) must stay ≥200×200 and never `display:none`.** YouTube refuses
  smaller players and stalls hidden ones; it is 300×200 at `opacity:0; pointer-events:none`.
  This is outside YouTube's letter-of-the-terms (players "should be visible") — accepted by the
  couple for a personal invitation; don't shrink it further.
- **All audio coordination goes through `window.BGM.holdFor(src)` / `releaseFor(src)`** (film =
  `'film'`, ceremony songs = `'tracks'`). Never call pause/play on the music directly from
  another module. `apply()` is debounced 150 ms on purpose: pause-then-play sent to YouTube in
  the same tick makes it drop one — the race is real, it showed up in tests.
- **The YouTube IFrame API loads only on the first tap** (`BGM.loadApi`). Nothing from
  youtube.* may be requested before the cover is opened — keeps first paint and Lighthouse intact.
- The film section is tap-to-play only; its `YT.Player` lives at `#film.ytPlayer`. Config:
  `MUSIC_VIDEO` ('' = use `YOUTUBE_ID`), parsed by `window.ytId` (now in js/bgm.js).

## How the botanicals work

- `svg/sprite.svg` is the source; it is pasted inline between `<!-- SPRITE:START -->` / `END` in
  `index.html`. Re-paste after editing (python one-liner in git history / session notes).
- CSS selectors cannot reach inside `<use>` shadow trees. Drawing state is driven by **inherited
  custom properties** set on the host `<svg>`: `--draw` (1 = undrawn, 0 = drawn), `--wash-o`,
  `--wash`, `--wash2`, `--w1..3`, `--sea`, `--land`. The sprite's paths read them via inline
  `style="…var(--draw,0)…"`. The sprite's own `<style>` (`.sp-d`, `.sp-w`) applies to instances.
- Section spines are per-section `<svg class="spine">` with `--p` (0..1) written by `js/main.js`;
  `stroke-dashoffset: calc(1 - var(--p))`. Sections abut, so the line reads as continuous.
- Reduced motion / `html[data-lite="1"]` (Save-Data) force everything fully drawn and kill listeners.

## Layout traps

- The page grid is `[gutter | content | gutter]` on `.section/.hero/.footer`; the spine lives in
  the left gutter (`--gutter`, 20px at ≤420px). Sprigs/buds are positioned relative to the content
  column with `left: calc(-1 * var(--container-pad) - var(--gutter) / 2)`.
- The mobile thumb bar hides while `#rsvp-card` intersects the viewport (threshold 0). A 50%-ratio
  rule never fires on phones because the card is taller than the screen.
- Hero: `.hero::before` (lavender wash) and `.hero-arch` (drawn arch) share the same box
  (`width: min(74vw,740px)`, `aspect-ratio: 400/520`, `top: 4%`; mobile `98vw`, `top: -9%`).
  Change them together or the line no longer traces the wash.

## Verifying

- Serve: `python3 -m http.server 8765` → http://127.0.0.1:8765/
- Headless checks used in the build: CDP scripts (screenshots per section; functional pass that
  mocks `script.google.com` with `Fetch.enable`) — see session scratchpad `shot.mjs` / `test.mjs`
  patterns if they need recreating.
- Font check: devtools → Computed on any `.section-title` → `Cormorant Garamond`.
