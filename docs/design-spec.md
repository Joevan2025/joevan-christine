# FINAL DESIGN SPEC — Joevan & Christine, "Botanical Editorial"

Spine: **guest-journey**. Grafts from **stationery** and **garden** as flagged by the judges. Every conflict resolved inline, marked **[RESOLVED]**. Source reviewed read-only: `/Users/markashleemori/Library/CloudStorage/OneDrive-Personal/Desktop/rsvp_joe_tin/wedding-invitation.html`. No files written.

## 0. LOAD-BEARING BUGS (fix in Task 1, before any styling)

| Line | Defect | Fix |
|---|---|---|
| 7 | `Cormorant+Garant` is not a Google font | `Cormorant+Garamond` |
| 1076–1101 | first three `.entourage-group` divs never closed | rebuilt markup |
| 1079–1080 | Parents of Groom "Erik & Grace Rikkerink" vs line 1009 "Jose & Evalyn Ponce Tagolimot" | use Tagolimot; flag in README for couple to confirm |
| 1330 | `YOUTUBE_VIDEO_ID` holds a full watch URL | `'JW0poKrqtCA'` |
| 1331 | Apps Script endpoint | keep verbatim, move to `js/config.js` |
| 1434–1436 | `setAttending()` reads missing `#meal-group`, throws on Decline | real radios + `hidden` on the stepper |
| 1443 | `alert()` validation, no `<label for>`, div "buttons" | native form semantics |
| 1222 | "Semi-formal / Cocktail" contradicts brief | "Formal or semi-formal" |
| 1058–1063 | parking card has no heading | parking moves into Venue stop + FAQ |
| 1138–1142 | emoji avatars, duplicate "RJ" initials | no avatars at all |
| petal canvas | perpetual rAF loop, ignores reduced-motion | removed |
| 1162/1170/1177 | lat/lon available: 10.6806389,122.9591336 / 10.726085,122.964096 / 10.788289,122.9709472 | reuse for Waze |

---

## 1. TOKENS

### Color

| Token | Hex | Role |
|---|---|---|
| `--paper` | `#FBF8F2` | Page ground. Warm linen. |
| `--vellum` | `#F3EEE5` | Second sheet: RSVP card, alternating bands (Details, Hashtag), input backgrounds. |
| `--ink` | `#2A2636` | Body text, h1/h2. 13.5:1 on paper. |
| `--ink-soft` | `#5B5567` | Captions, secondary. 6.7:1. |
| `--pencil` | `#8C8597` | Hairlines at 60% opacity; never text below 18px. |
| `--wisteria-ink` | `#6E4BA0` | The ONLY action color: buttons, links, focus ring, selected chips, the `&` axis. White on it 6.4:1. |
| `--stem` | `#6F8F78` | **[from garden]** The ONE drawing ink for every botanical stroke. A deepened sage. |
| `--moss` | `#4C6B5A` | Eyebrows, programme times. 7.3:1. |

Mandated pastels unchanged as `--purple #9B72C8`, `--purple-mid #C5A8E0`, `--lavender #E8D5F5`, `--blue #A8C5E8`, `--blue-light #D8E8F8`, `--blue-deep #6A9DC8`, `--sage #A8C5A8`, `--sage-light #D5E8D5`, `--sage-deep #7A9E8A`. Rule: pastels are washes and fills only; they never carry text.

**[RESOLVED] Single ink vs "ink lines are --ink":** garden's single-ink rule wins (one hand drew everything), but Judge 2's worry that green demotes purple is answered by the washes: the wisteria arch and all sprigs at RSVP/Entourage/FAQ carry purple washes at 100% opacity behind the stem line; the hero arch alone uses a double wash (`--purple-mid` + `--lavender`). Purple is the visible color; sage is the line. No foil, no gold (stationery's `--foil` rejected: outside the palette).

### Type (two families, not three)

**[RESOLVED] Three families → two.** Judges 0/1/2 all flagged Instrument Sans + the opsz axis. Dropped Instrument Sans and Newsreader. Final:

- **Cormorant Garamond** (display AND body): `ital,wght@0,500;0,600;1,300;1,400`. Body set at 18px/1.6 because of the small x-height; at that size it is the book face of a printed invitation.
- **Jost** 400/500 (utility: eyebrows, labels, buttons, nav, countdown unit labels, times). Geometric with humanist warmth; reads as engraved caps, not SaaS. Taken from stationery/garden.
- **No script face.** Great Vibes removed. The romance is Cormorant ital 300.

`<link rel="preconnect">` both Google hosts; `display=swap`; `@font-face` fallback overrides with `size-adjust: 88%` (Cormorant→Georgia) and `size-adjust: 96%` (Jost→Helvetica/Arial) so swap does not jump. Font budget ≈ 75 KB.

| Role | Face | Size |
|---|---|---|
| h1 names | Cormorant ital 300, lh 0.95, tracking -0.01em | `clamp(3.25rem, 12vw, 7.5rem)` |
| h2 | Cormorant ital 300, lh 1.05 | `clamp(2.125rem, 6vw, 3.5rem)` |
| h3 / group label | Cormorant 600, small caps via `font-variant-caps` | `clamp(1.25rem, 2.5vw, 1.5rem)` |
| Countdown line | Cormorant 500 `tabular-nums` | `clamp(2.5rem, 9vw, 4.5rem)` number; unit labels Jost 500 0.75rem |
| Body | Cormorant 500 | `1.125rem`, measure 62ch |
| Eyebrow | Jost 500, uppercase, 0.2em tracking, `--moss` | `0.72rem` |
| Label / button | Jost 500, 0.06em, sentence case | `0.875rem` (inputs 16px min) |
| Caption | Cormorant ital 400, `--ink-soft` | `0.9375rem` |

Why it is theirs: the hashtag pun is set from Cormorant's own upright 600 vs italic 300, so the type choice is literally what makes "#DisTINedtobewithJOE" legible as TIN & JOE; and Cormorant italic + Jost caps is the hierarchy of a Filipino printed invitation, which the ninongs will recognise.

### Spacing, radius, shadow, border
- 8px base. Section rhythm `clamp(4rem, 10vw, 8rem)`. Container 68rem; prose 40rem.
- Left gutter reserved for the spine: `clamp(1.25rem, 5vw, 4.5rem)`. **[RESOLVED] 360px gutter theft (Judge 0/2 on garden):** at ≤420px the gutter is 20px and the spine is a straight hairline with no sway; sprigs are 18px and overlap the gutter edge. Content column keeps 320px.
- Radius `0` everywhere except pill controls (`999px`) and **[from garden]** the arch frame (`50% 50% 0 0`), the ONLY non-rectangular shape, used in gallery, video poster and the hero wash. No other radius values exist.
- Shadows: none. Depth = paper tone change + 1px hairline.
- Borders: horizontal hairlines only, except the RSVP card (the one object you "fill out"), which gets a full hairline frame with a drawn corner sprig. No texture filter, no deckle mask (stationery's `feTurbulence` rejected: compositor cost on cheap Android).
- Focus: `outline: 2px solid var(--wisteria-ink); outline-offset: 3px`, never removed.

---

## 2. SIGNATURE — The Vine Spine that becomes structure

One eucalyptus-and-wisteria stem runs down the left gutter from hero to footer, drawing in as the guest scrolls. **[from garden, RESOLVED]** It is not only a gutter ornament: the same stem becomes (a) the Programme stem in Details, where the `<ol>` buds sit on it, (b) the branch rule in Entourage, where each tier's indent line on mobile is the vine, and (c) the terminal hydrangea bloom in the Footer. Remove it and those three sections lose their skeleton.

Technical (guest-journey's cheap build, garden's drift problem solved):
- **Per-section spines, not one document-height path.** Each `<section>` contains its own `<svg class="spine" aria-hidden="true">` absolutely positioned in the gutter, `height:100%`, viewBox `0 0 40 1000` `preserveAspectRatio="none"`, stroke via `vector-effect: non-scaling-stroke` at 1.25px (1.5px ≤420px). Sections abut, so the segments read as one line; no ResizeObserver, no offsetTop math, layout drift is impossible.
- Each segment's path has `pathLength="1"`, `stroke-dasharray:1`. Draw progress per section: **[RESOLVED] single code path** (Judge 1): one passive scroll listener → rAF → writes `--p` (0–1 = how far the section has passed the viewport's 80% line) onto that section; CSS: `stroke-dashoffset: calc(1 - var(--p))`. No `animation-timeline`.
- The sprig at each section's heading is `<use href="#sprig-…">` at y=0 of that segment; `IntersectionObserver` at 35% adds `.is-grown`, CSS animates dashoffset 1→0 over 1.4s, then the wash fades in 400ms later.
- Cost: ~2 KB per segment of reused path, one custom-property write per frame.
- Reduced motion / `data-lite`: all dashoffsets 0, listener never attached.

---

## 3. BOTANICAL SYSTEM

One sprite, inline at top of `<body>`, ~11 KB, all `<symbol>`s. Stroke `var(--stem)`, 1.25px non-scaling, round caps/joins, `fill:none`. Every stroke path has `pathLength="1"`.

| Symbol | Plant | Wash | Where |
|---|---|---|---|
| `#arch-wisteria` | two mirrored wisteria racemes meeting at top | `--purple-mid` + `--lavender` | Hero (behind names); 20% scale as RSVP card corner |
| `#sprig-eucalyptus` | stem, 5 round leaves | `--sage` | Spine sprigs: Details, Venue, Dress code, Music; gallery empty frame; programme stem |
| `#sprig-lavender` | 3 stems of dash buds | `--purple` / `--blue` alternating | Spine sprigs: RSVP, Entourage, FAQ; FAQ marker; RSVP success accent |
| `#bloom-hydrangea` | mophead, 7 florets | `--blue-light` + `--lavender` | Venue pins (3), RSVP success, gallery empty, footer terminal, hashtag ornament |
| `#arch-frame` | arched frame with eucalyptus along crown | none | Gallery slots, video poster frame |
| `#glyph-veil #glyph-cord #glyph-candle #glyph-arrhae` | 16px line glyphs | none | Secondary sponsors only **[from stationery]** |
| `#route-north` | coast line, sea wash, 3 pins | `--blue-light` sea, `--sage-light` land | Venue |
| UI: `#ico-check #ico-play #ico-pause #ico-plus #ico-minus #ico-close #ico-chevron` | | | controls |

Misregistered wash: fill path offset **3px right, 3px down** (not 2; Judge 1's DPR note) with a 6% looser outline, at 100% pastel opacity. Fades in 400ms after its line draws.

Motion: spine + sprigs draw on scroll; hero arch draws on load (1.8s); programme buds scale 0.6→1 on view; everything else still. No parallax. Reduced-motion: one block forces dashoffset 0, durations 1ms. `data-lite` (set when `navigator.connection.saveData` is true) additionally skips the hero arch animation.

---

## 4. LAYOUT PER SECTION

Legend: `|`=spine, `~`=sprig, `(( ))`=arch frame.

### 4.1 Nav
Concept: desktop masthead like a running head; mobile is a thumb bar because the top of a 6.7" phone is unreachable one-handed.
```
DESKTOP │ J & C · 21 · XI · 2026     Reply Details Entourage Venue Colours Attire Gallery Film Music FAQ │ hairline
MOBILE  top: "J & C" wordmark, 48px, not sticky
        bottom, sticky, env(safe-area-inset-bottom):
        ┌────────────┬──────────────────────┬────────────┐
        │  Schedule  │  ● Send our RSVP     │   Menu     │   64px, 44px targets
        └────────────┴──────────────────────┴────────────┘
```
**[RESOLVED] App grammar (Judge 0):** bar stays (all three judges steal it) but is styled as paper: `--vellum` ground, hairline top, Jost labels, only the middle button filled `--wisteria-ink`. No icons except the check after reply. Hides while RSVP ≥50% in view. **[RESOLVED] localStorage unreliable in Messenger:** "Replied" state is set in memory for the session AND tried in localStorage in try/catch; if it resets, the guest just sees "Send our RSVP" again, which is harmless. Menu = `<dialog>` bottom sheet, 12 anchors in Cormorant ital 1.6rem.

### 4.2 Hero
Concept: title page of a printed invitation under a wisteria arbor; the countdown is one typeset line, not boxes.
```
|      ( #arch-wisteria, 60vw, draws in behind the names )
|               TOGETHER WITH THEIR FAMILIES
|                      Joevan
|                        &
|                     Christine
|      Saturday, the twenty-first of November, 2026 · Bacolod City
|      ────────────────────────────────────────────────────
|               90 days · 14 hrs · 02 min          ← one tabular line [stationery], updates every 60s
|               and 37 days left to reply          ← contextual second line [guest-journey]
|        [ Send our RSVP ]   [ See the day ↓ ]
```
**[RESOLVED] big "90" vs sentence vs typeset line:** stationery's single tabular line wins; garden's word-sentence rejected (Judges 0/2: guests want a number); guest-journey's contextual second line kept: before 15 Oct "and {n} days left to reply"; after: "replies are closed, see you in Bacolod"; on the day: "today, 2:00 PM, Queen of Peace". Mobile: arch 92vw at 35% wash, `min-height:100svh`, names 3 lines, buttons stack. Optional `images/hero.jpg` shows inside the arch at 18% opacity if present.

### 4.3 RSVP (second, as required)
Concept: a reply card on vellum with one drawn corner, fewest fields, phone first.
```
|  ~   KINDLY REPLY BY 15 OCTOBER
|      Will you be with us?
|      ╭──────────────────────────────────────────────────╮ ← arch-wisteria corner, hairline frame
|      │ ( ) Joyfully accepts     ( ) Regretfully declines │ real radios, chips 48px
|      │ First name ________   Last name ________          │
|      │ Mobile number ________  so we can text you the details
|      │ Email ________          for your confirmation     │
|      │ We're coming as  [ − ]  2  [ + ]  including you   │ hidden on decline
|      │ A note for Joevan & Christine (optional) ________ │
|      │ [ Send our reply ]                                │ full-width button, --wisteria-ink
|      │ Questions? Message Joevan or Christine.           │ tel: links
|      ╰──────────────────────────────────────────────────╯
```
**[RESOLVED] Wax seal submit (stationery):** rejected as the control (Judges 0/2: doesn't read as "send" to a tita). Kept its idea: `data-rsvp-status="idle|sending|sent|error"` on the card drives all states, and the success micro-animation (button presses 0.96→1, pastel ring radiates once). Success replaces interior with `#bloom-hydrangea` drawing in + "We have your reply, {firstName}. See you on the 21st." / decline "Thank you for telling us, {firstName}. We'll miss you." Empty `<p id="rsvp-followup" role="status">` reserved for phase 2. `buildPayload()` is the single seam producing exactly `{firstName,lastName,email,phone,attending,guests,message,timestamp}`; POST `no-cors` to the existing Apps Script URL. Inputs: 48px, 16px font, `autocomplete` given-name/family-name/tel/email, `inputmode="tel"`, honeypot `website`, inline errors with `aria-describedby` + `aria-live="polite"` summary, first invalid field focused.

### 4.4 Details
Concept: families typeset as invitation wording (colophon), then the day as a true `<ol>` stem on the spine, the one honest numbering.
```
|  ~   THE WEDDING OF
|      Joevan & Christine
|      Christine Mae A. Simene, daughter of Mr. Hector Simene & Mrs. Ma. Cynthia Alvarez Simene
|      Joevan Ponce, son of Mr. Jose Tagolimot & Mrs. Evalyn Ponce Tagolimot
|      Together since 19 Dec 2018 · Engaged 14 Dec 2025
|
|      THE DAY
|  ●─  01  1:30 PM   Doors open, be seated        Queen of Peace Parish
|  ●─  02  2:00 PM   Holy Mass & wedding rites
|  ●─  03  3:30 PM   Photos with the couple
|  ●─  04  6:00 PM   Dinner                       Nature's Village, Alfredo Hall
|  ●─  05  7:30 PM   First dance & toasts
|  ●─  06  10:00 PM  After-party                  Rombuhan Restobar
```
Buds (`#sprig-lavender` small) sit on the spine segment and open on view **[garden]**. Mobile: families first (Filipino convention), times in a 4.5rem column, venue as caption under each. Contact and parking move to Venue/FAQ.

### 4.5 Entourage
Concept: a printed programme's entourage page; hierarchy encoded by type size, side and indent, never by cards.
```
|  ~   THOSE WHO STAND WITH US
|      Our entourage
|      GROOM'S SIDE                     BRIDE'S SIDE
|      Mr. Jose Tagolimot               Mr. Hector Simene
|      & Mrs. Evalyn Ponce Tagolimot    & Mrs. Ma. Cynthia Alvarez Simene
|      PRINCIPAL SPONSORS  (ninong & ninang)                  ← sticky label
|      Mr. Jun Alvarez             &   Mrs. Snooky Alvarez
|      Mr. Mario Negre             &   Mrs. Lorena Negre       … 10 rows
|      MAID OF HONOR                    BEST MAN
|      Chelsea Anne Simene              Ben Rey Tagolimot
|      BRIDESMAIDS                      GROOMSMEN             4 rows paired
|      SECONDARY SPONSORS
|      [veil]   Veil           Christian Leuigi Bartolome & Monica Lorevella Negre
|      [cord]   Cord           Rico Pabilona Jr. & Janette Sardiñola
|      [candle] Candle         Clark Joel Barte & Evangelica Barte
|      [arrhae] Coins & Bible  Remar Pabilona
|      FLOWER LADIES · RING BEARER      one line each, smallest
```
Sizes: parents & principal sponsors Cormorant 600 1.25rem (sponsors heaviest, as in a Filipino wedding **[garden]**), MoH/BM 500 ital 1.2rem, bridesmaids/groomsmen 500 1.1rem, secondary 1.05rem with rite in Jost caps + glyph **[stationery]**, children 1rem. Groom left / bride right consistently **[stationery]**. Sticky group labels inside the section.

**[RESOLVED] Ampersand axis at 360px (Judges 1/2):** desktop ≥640px uses the `1fr auto 1fr` grid with `&` in `--wisteria-ink` italic. At <640px it switches to **garden's indented ledger**: one column, indent = rank (0/12/24/36/48px, the vine spine drawn at the indent), each pair on one line as "Mr. Jun & Mrs. Snooky Alvarez" (surname once, `data-short` attribute holds the short form). No floating ampersands, max 2 lines per name at 18px. Garden's desktop SVG tree rejected (unbuildable with reflow).

### 4.6 Venue
Concept: the three stops are a straight line north along the coast; the layout is that line, with time-headed stops and the guest's actions at thumb height.
```
|  ~   GETTING THERE
|      One day, three cities, all heading north
|      ┌─ #route-north: coast in --stem, sea wash --blue-light
|      │  ● Bacolod ─ about 25 min ─ ● Talisay ─ about 15 min ─ ● Silay   (labelled "approx.")
|      2:00 PM · CEREMONY                                    ← time heads the stop [stationery]
|      ❋ Queen of Peace Parish Redemptorist Church
|        B.S. Aquino Drive, Bacolod City                     ← address always visible (Judge 2)
|        Please silence phones · Free parking at the Redemptorist lot
|        [ Google Maps ] [ Waze ] [ Add to calendar ]
|      6:00 PM · RECEPTION  Nature's Village Resort, Alfredo Hall, Talisay City …
|      10:00 PM · AFTER-PARTY  Rombuhan Restobar, Silay City …
|      [ Show the map ]  ← loads Google iframe on tap only
```
Hydrangea pin per stop **[garden]**. Waze: `https://waze.com/ul?ll=10.6806389,122.9591336&navigate=yes` etc. Calendar: Google Calendar `render?action=TEMPLATE` link (primary; reliable in Messenger) with the `.ics` data URL as secondary. **[RESOLVED] "two taps to map":** the Google Maps button links straight to the place (one tap); "Show the map" is only for guests who want the overview embed. Mobile: stops stack; three buttons in a scroll-snap row of 44px pills.

### 4.7 Palette
Concept: herbarium sheets a guest can show the modista: one plant per colour family, hex visible always.
```
|  ~   OUR COLOURS
|      ┌────────────┐ ┌────────────┐ ┌────────────┐
|      │ wisteria   │ │ hydrangea  │ │ eucalyptus │   line art washed in its 3 tints
|      │ drawn, 3   │ │            │ │            │
|      │ washes     │ │            │ │            │
|      ├────────────┤ ├────────────┤ ├────────────┤
|      │ Pastel purple · primary │ Pastel blue · secondary │ Sage · accent │
|      │ ▇ #E8D5F5 ▇ #C5A8E0 ▇ #9B72C8 │ … │ … │   chips + hex printed, tap = copy
|      │ coll. Bacolod, xi.2026 │
|      └────────────┘ └────────────┘ └────────────┘
|      "Any shade in these families is welcome."
|      [ Save colour card ]   ← stretch, Task 18
```
**[RESOLVED]** garden's herbarium wins the visual; guest-journey's "Save swatch card" (canvas PNG → `navigator.share`, fallback open in new tab) kept as a post-launch stretch per Judges 0/1. Mobile: sheets stack full-width; no horizontal scroll.

### 4.8 Dress code
Concept: the real axis is sponsors vs guests.
```
|  ~   WHAT TO WEAR
|      Formal or semi-formal, in our colours
|                  ┆ Women                  ┆ Men
|      Sponsors    ┆ Long gown in the palette ┆ Barong with slacks
|      Guests      ┆ Formal or semi-formal    ┆ Formal or semi-formal
|      ─────────────────────────────────────────────
|      Please leave white, cream and ivory to the bride.   ▇ (struck-through chip)
|      [ 9 small chips linking up to Our colours ]
```
Real `<table>`; ≤480px collapses to two stacked lists via `display:block` + `data-label`. No figure illustrations (cut for schedule).

### 4.9 Gallery
Concept: prints in arched frames, fixed slots so photos drop in without breakage; empty slots are drawings.
```
|  ~   BEFORE THE DAY
|      ((  01 tall  ))  ((  02 wide        ))  ((  03 tall  ))
|      ((  04 wide        ))  ((  05 wide        ))  ((  06 tall  ))
```
**[RESOLVED] 12 slots → 6 documented slots [stationery]:** `grid-template-areas`; slots 1,3,6 portrait 3:4, 2,4,5 landscape 4:3; `GALLERY_COUNT` in config collapses unused slots. `<img loading="lazy" decoding="async" onerror="…dataset.empty='true'">` → shows `#arch-frame` + eucalyptus on a `--lavender`→`--blue-light` wash, caption "photograph to follow". **[RESOLVED] lightbox vs same-tab:** a minimal `<dialog>` lightbox with prev/next buttons and close (no swipe, Task 14); Judge 1's "no back affordance" objection to same-tab wins over garden. Mobile: 2 columns, all 3:4.

### 4.10 Video
```
|  ~   OUR FILM
|      (( images/video-poster.jpg or lavender wash + hydrangea   [ ▷ Play ] ))   16:9, squared arch variant
```
Facade: `youtube-nocookie.com/embed/JW0poKrqtCA?autoplay=1&rel=0` injected on tap only.

### 4.11 Music (new)
Concept: the moment in the ceremony is the label, like a printed programme's music page.
```
|  ~   WHAT YOU'LL HEAR
|      [▷] Processional       "Title"   Artist   3:42
|      [▷] Bride's entrance   "Title"   Artist   3:12
|      [▷] First dance        "Title"   Artist   4:05
|      [▷] Last song          "Title"   Artist   3:10
|      ──── progress ●─────── 1:12 / 3:42   (inline under the active row, NOT sticky)
```
**[RESOLVED] sticky mini-bar dropped** (all judges). One `<audio preload="none">`, `<input type="range">` progress in the active row, 44px play buttons left, never autoplays, pauses on `visibilitychange`, missing file → "coming soon" + disabled button. Tracks in `js/config.js`.

### 4.12 Hashtag
```
|  ~        ( small hydrangea )
|           #Dis TIN ed to be with JOE        TIN/JOE Cormorant 600 upright, --wisteria-ink; rest ital 300
|           Tag us so we can see the day through your eyes.
|           [ Copy hashtag ]  [ Share to Messenger ]
```
On `--vellum` band. Share: `navigator.share` → `fb-messenger://share?link=` → copy. "Copied" via `aria-live`.

### 4.13 FAQ
```
|  ~   GOOD TO KNOW
|      ~ When should we reply by?
|      ~ What time should we arrive at the church?
|      ~ Where do we park?            (moved here + Venue)
|      ~ What is the theme?           (moved here)
|      ~ Can we take photos during the ceremony?
|      ~ Can I bring a plus-one?      "Our seats are counted by name…"
|      ~ How do we reach you?         tel: + m.me links
```
Native `<details>/<summary>`, 52px summaries, lavender sprig marker rotates 90° on open. Zero JS.

### 4.14 Footer
```
|      ( spine terminates in #bloom-hydrangea, centred )
|      "So they are no longer two, but one flesh. Therefore what God has joined together,
|       let no one separate."   Matthew 19:6
|      Joevan & Christine · 21 November 2026 · Bacolod · Talisay · Silay
|      #DisTINedtobewithJOE · Joevan +63 951 751 7046 · Christine +63 943 087 7271
```
Paper ground, verse Cormorant ital 19px max 34ch. Garden's textPath wreath rejected (bespoke SVG, no gain on mobile). Padding-bottom = 64px + safe-area.

---

## 5. MOTION PLAN
Load (≤2.2s): paper + text instantly → 200ms hero arch draws 1.8s, wash fades last 600ms → 600ms names rise 12px/fade 700ms → 900ms date + countdown line. Nothing else.
Scroll: spine segments draw with scroll; sprig + h2 + first paragraph single 10px rise at 35% view, once; programme buds open on view. Entourage rows, FAQ, gallery, palette: no reveal.
Micro: button darkens 8%, `:active` scale 0.98; RSVP chip fills `--lavender`/`--blue-light` with check drawing in 300ms; success hydrangea 1.2s (the one celebratory moment); FAQ/stepper 150ms opacity; countdown crossfade once a minute.
Still: gallery, palette, route map, video, footer. No parallax, no petals, no texture.
Reduced motion + `data-lite`: dashoffset 0 everywhere, durations 1ms, scroll listener not attached.

---

## 6. COPY NOTES
Rewrite: hero eyebrow → "Together with their families"; CTAs "Send our RSVP" / "See the day". RSVP eyebrow "Kindly reply by 15 October", h2 "Will you be with us?", submit "Send our reply", guests "We're coming as", note "A note for Joevan & Christine (optional)". Details eyebrow "The wedding of", programme "The day". Entourage eyebrow "Those who stand with us", h2 "Our entourage", gloss "(ninong & ninang)". Venue eyebrow "Getting there", h2 "One day, three cities, all heading north". **[RESOLVED] sentence-headings (Judge 2):** Palette h2 "Our colours" (sub "Any shade in these families is welcome"); Dress code h2 "What to wear" (sub "Formal or semi-formal, in our colours; sponsors in long gown and barong"). Gallery "Before the day"; Video "Our film"; Music "What you'll hear"; Hashtag "Tag us"; FAQ "Good to know". Nav labels are nouns: Reply, Details, Entourage, Venue, Colours, Attire, Gallery, Film, Music, FAQ.
Remove: "Counting Down to Forever!", "Get ready to celebrate", "Your response helps us plan the perfect evening", "recorded in our guest management system", the Email Reminders box, "Replace placeholder boxes…", "Replace the YouTube video ID…", "captured at the golden hour", "light, laughter, and golden moments", "evoke romance, serenity", "Semi-formal / Cocktail", the Rikkerink names, every emoji and ✦ ❀, em dashes in guest-facing copy.

---

## 7. FILE STRUCTURE
```
/
├── index.html            (renamed; critical CSS ≤3 KB inlined; sprite inline at top of <body>; og: tags)
├── wedding-invitation.html  (meta-refresh → index.html, keep for old links)
├── css/  tokens.css · base.css · botanicals.css · components.css · sections.css
├── js/   config.js · main.js (countdown, nav, spine, reveals) · rsvp.js · media.js (gallery, video, audio, map, calendar)
├── svg/  sprite.svg (source; paste inline) · route-north.svg (editable source)
├── images/ prenup-01.jpg prenup-03.jpg prenup-06.jpg (portrait 1000×1400)
│           prenup-02.jpg prenup-04.jpg prenup-05.jpg (landscape 1400×1000)  ≤400 KB each
│           hero.jpg (optional 1600×2000) · video-poster.jpg (1280×720) · og.jpg (1200×630)
├── audio/  01-processional.mp3 · 02-bride-entrance.mp3 · 03-first-dance.mp3 · 04-last-song.mp3 (128 kbps ≤5 MB)
└── README.md
```
`js/config.js`: `WEDDING_DATE`, `RSVP_DEADLINE`, `RSVP_ENDPOINT` (existing Apps Script URL), `YOUTUBE_ID='JW0poKrqtCA'`, `HASHTAG`, `VENUES[{time,label,name,address,city,lat,lon,mapsUrl,note}]`, `TRACKS[{moment,title,artist,file}]`, `GALLERY_COUNT=6`, `CONTACTS`.
README (plain words): "Photos: put your prenup pictures in images/ named prenup-01.jpg to prenup-06.jpg. Slots 1, 3 and 6 are tall, 2, 4 and 5 are wide. Keep each under 400 KB (squoosh.app). og.jpg is the picture people see when the link is shared on Messenger, pick your favourite. Songs: MP3s in audio/ with the names listed there, then type the title and artist in js/config.js. Anything missing shows a drawing until you add it. Please double-check the parents of the groom and the sponsor list in index.html before sharing."
Budget: HTML ≤45 KB, CSS ≤18 KB, JS ≤14 KB, fonts ≈75 KB, zero external images on first paint; FCP <1.5 s on mid-range Android over 4G.

---

## 8. RISK
**One green ink, pastel-only washes, no script face, no boxes.** Every botanical on the page is drawn in a single sage line, and the couple's purple and blue appear only as misregistered washes slipping 3px behind that line, like a two-plate riso print. The risk is twofold: titas may expect a scripted name and a purple background, and a site with no card boxes can read as "unfinished" on Messenger. It is right for them because "expensive printed stationery" is defined by restraint (one paper, one ink, one plate), because three pastels used as flat fills go muddy while as pigment on petals they stay clean, and because their purple still dominates visually (every major wash is purple). Mitigation: the washes are at full opacity and consistent everywhere, and the wash fades in a beat after the line, so the two-plate idea is legible in the motion itself.

---

## 9. SELF-CRITIQUE
1. Eyebrow + italic h2 on every section is the AI-wedding default. Changed: eyebrows only where they add information (RSVP deadline, "Those who stand with us", "Getting there", "The wedding of"); the spine sprig is the section marker elsewhere.
2. The countdown line is still a commodity; the contextual second line ("{n} days left to reply") is the only reason to keep it, and it ties directly to the RSVP goal. Kept.
3. Venue stops with pill buttons could be any itinerary; the route-north sketch as first element plus time-headed stops and approx minutes is what makes it their geography. Kept, distances marked "approx."
4. FAQ and nav deliberately boring (garden's argument): 200 people use this once.
5. Gallery arched frames are a Pinterest trope; defensible only because the arch is the single non-rectangular shape on the page and recurs in hero wash and video. If a second curved shape ever appears, the arch must go.
6. The RSVP card is close to "elegant form". What is theirs: the stepper copy "We're coming as … including you", mobile-number-before-email with a reason, and the hydrangea success. Full frame kept only because it is the one object a guest fills out.
Unchanged because specifically theirs: no script face, spine-as-structure, ledger entourage with rite glyphs, herbarium sheets with "coll. Bacolod, xi.2026", typeset TIN/JOE pun, misregistered wash.

---

## 10. IMPLEMENTATION TASK BREAKDOWN (page viewable after every step)

1. **Bug fixes + rename.** Copy `wedding-invitation.html` → `index.html`, leave a meta-refresh stub behind. Fix font URL, `YOUTUBE_ID`, `#meal-group`, unclosed entourage divs, Rikkerink → Tagolimot, remove petal canvas, remove `alert()` calls (temporary inline message). Files: `index.html`, `wedding-invitation.html`. Accept: page loads, Cormorant visible in devtools, Decline click throws nothing, video embeds.
2. **Split files + config.** Extract CSS to `css/*.css`, JS to `js/config.js` + `js/main.js` + `js/rsvp.js` + `js/media.js`; create `images/`, `audio/`, `svg/` with README. Accept: identical render, all constants only in `config.js`.
3. **Tokens + base.** `tokens.css`, `base.css`: palette, fonts with `size-adjust` fallbacks, scale, focus ring, reduced-motion + `data-lite` blocks, remove Great Vibes/Lato. Accept: body 18px Cormorant, tab focus visible everywhere, Lighthouse contrast passes.
4. **Sprite.** Draw `svg/sprite.svg` with the 8 botanical/glyph symbols + UI icons, `pathLength="1"`, paste inline. Accept: `<use>` of each renders at 1.25px stroke at 3 sizes; total ≤11 KB.
5. **Hero.** Arch behind names, typeset countdown line (60s tick) with contextual line, two CTAs, load animation. Accept: 360px shows names + both buttons without scroll; no rAF loop after load.
6. **Nav + mobile thumb bar + menu dialog.** Accept: bar hides over RSVP, Menu sheet traps focus, Esc closes, 44px targets.
7. **RSVP card.** Native form, radios, stepper, validation, `buildPayload()`, `data-rsvp-status` states, success/decline views, honeypot, `#rsvp-followup`. Accept: submit reaches the Apps Script (check the Sheet), decline hides stepper, keyboard-only completion works, no zoom on iOS focus.
8. **Spine segments + sprig observer.** Per-section SVG, scroll `--p` writer, IO `.is-grown`. Accept: line draws with scroll on a throttled 4× CPU profile without dropped frames; fully drawn under reduced-motion.
9. **Details.** Colophon + `<ol>` programme on the spine with buds. Accept: families render above the stem on mobile; times tabular-aligned.
10. **Entourage.** Ampersand grid ≥640px, indented ledger <640px, sticky labels, rite glyphs, `data-short` names. Accept: at 360px no name exceeds 2 lines; sponsor label stays visible while scrolling 10 rows.
11. **Venue.** Route-north SVG, time-headed stops with address, Maps/Waze/Calendar links, map-on-tap. Accept: Waze opens to each pin on Android; no iframe in initial HTML.
12. **Palette + Dress code.** Herbarium sheets with tap-to-copy hex; 2×2 table with mobile collapse and struck white chip. Accept: hex visible without interaction; table readable at 360px.
13. **Gallery slots + placeholders.** 6-slot grid, `onerror` fallback, `GALLERY_COUNT`. Accept: with empty `images/` all six show drawn frames, no broken icons; drop one jpg and it appears.
14. **Lightbox + video facade.** `<dialog>` with prev/next/close; YouTube nocookie on tap. Accept: works with keyboard; no YouTube request before tap.
15. **Music section.** Tracklist, single `<audio>`, inline range progress, missing-file state. Accept: tab-operable; missing mp3 shows "coming soon"; pauses when tab hidden.
16. **Hashtag + FAQ + footer.** Typeset pun, copy/share fallbacks, `<details>` list with moved parking/theme, footer bloom + verse. Accept: FAQ works with JS disabled; share button never errors in Messenger.
17. **Copy pass + og tags.** Apply §6 rewrites, remove template text, add `og:title/description/image`, `<title>`. Accept: grep finds zero emoji, zero "Replace", zero em dash in body text; Messenger preview shows og.jpg.
18. **Performance + device pass.** Inline critical CSS, byte check, test on a 2–3 GB Android in Messenger's browser and 360px; add `data-lite` via `saveData`. Accept: FCP <1.5s on throttled 4G, budget met, no horizontal scroll at 360px.
19. **Stretch (post-launch): Save colour card** (canvas PNG → `navigator.share`, new-tab fallback). Accept: PNG shows 9 chips + names; failures fall back silently.
20. **Phase-2 seam check + README.** Confirm `buildPayload()` is the only JSON builder, `#rsvp-followup` empty, README written, Tagolimot confirmation flagged. Accept: a reviewer can add email confirmation by editing `rsvp.js` only.

Note: the claude.ai Gmail / Google Calendar / Google Drive / Microsoft 365 connectors are unauthorized in this session; none were needed. They can be authorized in claude.ai connector settings if the phase-2 email step needs them.