# Joevan & Christine — wedding website

A single-page invitation and RSVP site. **Live at <https://markashlee-de.github.io/joevan-christine/>**
(repo: `markashlee-de/joevan-christine`). No build step — every push to `main` redeploys the site
within a minute or two.

## For Joevan & Christine

Things to add or confirm before sharing the link:

1. **Photos** — see `images/README.md` (six prenup photos, optional hero/poster, and `og.jpg` for link previews).
2. **Songs** — see `audio/README.md`, then type titles and artists in `js/config.js`.
3. **Save-the-date film** — `YOUTUBE_ID` in `js/config.js` holds your film. If it ever changes, paste the new YouTube link in any form (the full `watch?v=` link, a `youtu.be` share link, or just the ID) — the site extracts the right ID itself.
4. **Parents of the groom** — the Details section says *Mr. Jose Tagolimot & Mrs. Evalyn Ponce Tagolimot*; the Entourage section says *Mr. Erik Rikkerink & Mrs. Grace Rikkerink*. One is a leftover. Search `index.html` for `TODO (couple)` and fix both places.
5. **After-party spelling** — the page says *Rombuhan Restobar*; Google Maps lists it as *ROMBOHAN Restobar*. Confirm.
6. **Drive times** — shown as "about 25 min / 15 min (approximate)". Adjust in `js/config.js` (`DRIVE_MINUTES`) or set a value to `null` to hide it.
7. **Link preview** — already wired to the live URL; it lights up as soon as `images/og.jpg` exists.

Everything else (dates, times, venues, contacts, hashtag, RSVP deadline) lives in `js/config.js` and at the top of each section in `index.html`.

## Adding photos or songs without any tools (github.com upload)

1. Open <https://github.com/markashlee-de/joevan-christine>, click the `images` folder
   (or `audio` for songs).
2. **Add file → Upload files**, drag the pictures in (named exactly as `images/README.md` lists,
   e.g. `prenup-01.jpg`, `og.jpg`), then **Commit changes**.
3. Wait a minute or two and refresh the site — the drawings are replaced by your photos.

## How RSVPs are stored (and receipts sent)

The reply form posts JSON to a Google Apps Script web app. Two endpoints exist in `js/config.js`:

- `RSVP_ENDPOINT` — the original script (writes a row; the browser cannot see whether it worked).
- `RSVP_ENDPOINT_V2` — the new backend in `backend/Code.gs`. Once deployed (follow
  `backend/DEPLOY.md`, about 10 minutes) and pasted here, the form gets real success/failure
  feedback, rows land in a fresh `RSVPs v2` tab, and **accepting guests automatically receive a
  receipt email** sent from your own Gmail (no passwords stored anywhere; declining guests get no
  email). Leave it `''` to keep the old behaviour.

Fields sent: `timestamp, firstName, lastName, email, phone, attending, guests, message, companions`
(the form asks for each companion's name when the party is 2 or more).

## Folder map

```
index.html               the page (the botanical sprite from svg/sprite.svg is pasted inline near the top of <body>)
css/                     tokens → base → botanicals → components → sections
js/config.js             every fact that may change
js/main.js               countdown, navigation, spine drawing, reveals, copy/share
js/rsvp.js               the reply form (buildPayload() is the single JSON builder)
js/media.js              gallery, lightbox, film, music, map
svg/sprite.svg           the drawings (edit here, then re-paste between the SPRITE markers in index.html)
images/  audio/          drop-in folders with their own READMEs
docs/design-spec.md      the design rationale
backend/                 the Google Apps Script backend (Code.gs) + its deploy guide (DEPLOY.md)
wedding-invitation.html  the old page; now just redirects to index.html
```
