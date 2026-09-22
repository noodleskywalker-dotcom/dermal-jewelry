# Test report

## Final master redesign — 22 September 2026

| Command | Result |
| --- | --- |
| `npm run lint` | pass, 0 errors |
| `npm run typecheck` | pass |
| `npm test` | 77 of 77 pass |
| `npm run test:e2e -- --workers=2` | 327 pass, 48 skipped, 0 fail |
| `npm run build` | pass |

New `tests/e2e/redesign.spec.ts`: hotspot annotations with the owner's wording and no invented grade,
purity or size; one open at a time; Escape closes; keyboard Enter and Space; the film poster is the
jewelry; the 360° rear note appears only at the rear; seven worlds in the browse rail with sand only on
DESERT EYE, arrows and keys, neighbours in frame, no cards; shop filters for men, women, inspired and
limited (empty with an honest note); the companion in the same corner and size on seven routes, a
hover glance that never navigates, a direct link off the homepage. Rail and sand tests now scope to the
pieces rail, since /collections opens on the ways in.

Review package (local only): `references/review/2026-09-22-master/` — the owner's 27 numbered
captures (desktop 01–21, mobile 22–27) and `walkthrough.webm`.


## Full visual redesign — 22 September 2026

| Command | Result |
| --- | --- |
| `npm run lint` | pass, 0 errors |
| `npm run typecheck` | pass |
| `npm test` | 77 of 77 pass |
| `npm run test:e2e -- --workers=2` | 304 pass, 46 skipped, 1 fail (a WebKit story-timing test under load, passes alone); after the last hero CSS change the layout specs (home, home-cinema, hybrid, viewports) rerun: 106 pass |
| `npm run build` | pass |

Updated for the new UX (not deleted): mode names Piece / 360° / Assembly / Placement / Try on, the film
reached through Assembly, the beauty frame as default, Face Studio tool gating (Move / Scale / Rotate),
the collections rail as gallery labels, the hero timing (beauty hold, one true turn, words at chosen
points), four macro views, the full-width assembly film, two pinned moments. Privacy, geometry, form
state, bag, media controls, reduced motion and mobile tests all still run.

Review package (local only): `references/review/2026-09-22-redesign/` — 1440×900, 1920×1080, Pixel 7,
360×800 and 844×390 for every homepage section, product (default, 360°, placement, try-on), Face Studio
(sculpture and photo), shop, bag, collections page and about; `walkthrough.webm`.


## The launch film — 22 September 2026

| Command | Result |
| --- | --- |
| `npm run lint` | pass |
| `npm run typecheck` | pass |
| `npm test` | 77 of 77 pass |
| `npm run test:e2e` (`--workers=2`) | 302 pass, 46 skipped, 3 fail in the first run: mobile mascot press blocked by the sand section's copy layer (a `z-index` over the companion). Fixed; `home.spec.ts` + `home-cinema.spec.ts` rerun: 51 pass. |
| `npm run build` | pass |

Specs rewritten for the new behaviour: `home.spec.ts` (opening, hidden-then-visible ways in, one sticky
`launch-stage`, collection browser on the page), `home-cinema.spec.ts` (frames follow scroll, name then
headline, frames fetched once, reduced motion, keyboard, sand, material, assembly, forms, on you, last
frame), `hybrid.spec.ts` (canvas over half the viewport, no teaser pieces, bar transparent until scrolled).

Review package (local only): `references/review/2026-09-22-launch-film/` — desktop and Pixel 7 for every
section, product page (film, 360°, exploded), Face Studio (crop, nose, photo), selection, shop, and
`walkthrough.webm`.


## MEDIA 01 hero orbit in the scrub — 22 September 2026

| Command | Result |
| --- | --- |
| `npm run lint` | pass |
| `npm run typecheck` | pass |
| `npm test` | 77 of 77 pass |
| `npm run test:e2e` (`--workers=2`) | 290 pass, 46 skipped, 0 fail |
| `npm run build` | pass |

`home-cinema.spec.ts` now expects 72 orbit frames fetched once from `/media/hero-orbit/desert-eye-love/`
and the late frame index at or above 66. Review package (local only):
`references/review/2026-09-22-hero-orbit/` — desktop and Pixel 7 stills, `walkthrough.webm`.


## Cinematic homepage — 22 September 2026

Browser results are **browser emulation on a Windows desktop** against a development server.

| Command | Result |
| --- | --- |
| `npm run lint` | pass, 0 problems |
| `npm run typecheck` | pass, 0 errors |
| `npm test` | 77 of 77 pass |
| `npm run test:e2e` (`--workers=2`) | 289 pass, 46 skipped, 0 fail after rerun (one WebKit reduced-motion mascot timeout passed alone) |
| `npm run build` | pass |

`tests/e2e/home-cinema.spec.ts`: frames follow the scroll up and back, the name arrives early and
the second line past the middle, the page goes on to the story; the 48 frames are fetched once and
scrubbing fetches nothing more, no `<video>` on the homepage; reduced motion gives a plain still and
no sticky element; PageDown scrubs it; the story has its three words, its sand and none of the
banned marketing words; the assembly section carries the film idle with the three material lines.
`home.spec.ts` now allows exactly one sticky stage, `.scrub-stage`.

Review package (local only): `references/review/2026-09-22-cinematic/` — desktop and Pixel 7 for
hero, scrub early / mid / end, story, assembly, selection, KIRI hover, product, Face Studio, and
`walkthrough.webm` (hero cursor, full scroll through the scrub, film play, sideways selection to KIRI,
Face Studio with the fixture photo).


## DESERT EYE product animation — 22 September 2026

Browser results are **browser emulation on a Windows desktop** against a development server.

| Command | Result |
| --- | --- |
| `npm run lint` | pass, 0 problems |
| `npm run typecheck` | pass, 0 errors |
| `npm test` | 77 of 77 pass |
| `npm run test:e2e` (`--workers=2`) | 272 pass, 45 skipped, 0 fail after rerun (321 across desktop Chromium, mobile Chromium, desktop WebKit) |
| `npm run build` | pass |

Four WebKit tests unrelated to the film (landing teaser, selection form switch, storefront navigation,
story hover) timed out under load in the full run and passed alone; see the note under the refinement
pass. The seven skips added by `film.spec.ts` are WebKit playback tests: Playwright's bundled WebKit
decodes neither VP9 nor H.264, and its Chromium has no H.264, so playback is verified in Chromium on
the WebM and everything else in every project.

`tests/e2e/film.spec.ts` covers: first load (poster only, no media request, no assembly, no reveal
tab, shopping enabled, safe wording); the film covers the anti-eyebrow form only and other designs
keep the drawn assembly; Face Studio has no film or video with or without a photo; press to play,
muted, not looping, one media request, captions at 6.2 s and all three at the end, last frame held,
Replay after a full play rewinds and restarts; Skip then Replay; keyboard Play, Skip and Replay; a
1.5 s delay shows "Loading…" then plays; an aborted load falls back to the completed piece with a
note and Replay; switching form while playing unmounts the film and coming back starts from the
poster; leaving for Try On and coming back finds the poster; reduced motion shows the completed
piece with all words and requests nothing; on a phone the 16:9 frame fits the screen uncropped with
a 44 px Play and the words under the frame. A replay bug found by the recording (Replay after a full
play stalled in "loading") was fixed and is covered.

Review package (local only): `references/review/2026-09-22-product-animation/` — desktop and Pixel 7
at poster, playing, captions and ended, full pages, and `product-page-with-film.webm` (poster → Play
→ full play → Replay → Skip → nose form → back to anti-eyebrow).

## Visual refinement pass — 22 September 2026

Browser results are **browser emulation on a Windows desktop** against a development server.

| Command | Result |
| --- | --- |
| `npm run lint` | pass, 0 problems |
| `npm run typecheck` | pass, 0 errors |
| `npm test` | 77 of 77 pass |
| `npm run test:e2e` (`--workers=2`) | 247 pass, 38 skipped, 0 fail (285 across desktop Chromium, mobile Chromium, desktop WebKit) |
| `npm run build` | pass |

At the default worker count this machine overloads and 12–13 unrelated tests time out at 30 s (a
different set each run: viewports, mascot, story stage, hover panel). Every one of them passes alone
and at two workers, so the two-worker run is the evidence. The hover-panel measurement now tolerates a
re-mount under load.

New browser checks: four families in the index and `Concept · KIRI` on the concept slide; KIRI is one
SVG blade and no image; at least 8 % of the next family's box shows at the edge at more than 30 %
opacity; the sand box ends above the title; the Face Studio tool bar sits under the stage inside the
page with no painted background and every action in view; no piece name is clipped; the hero is the
only piece with a reflection and every other piece is under 40 % of its width; no riser in the concept
hardware is taller than a fifth of the stage; one specification status and no per-row "Unverified" tag.

Review package (local only): `references/review/2026-09-22-refinement/` — desktop and Pixel 7 for the
eight owner-listed screens, the five extra sizes (320×568, 360×800, 390×844, 412×915, 844×390) for
home, selection, product and Face Studio with a photo, and `product-assembly.webm`.

## HYBRID visual system — 21 September 2026

Browser results are **browser emulation on a Windows desktop** against a development server.

| Command | Result |
| --- | --- |
| `npm run lint` | pass, 0 problems |
| `npm run typecheck` | pass, 0 errors |
| `npm test` | 77 of 77 pass |
| `npm run test:e2e` | 238 pass, 38 skipped, 0 fail (276 across desktop Chromium, mobile Chromium, desktop WebKit) |
| `npm run build` | pass; 0 client chunks contain the character's name, the dev media route, the mascot or the sand clip |

New browser tests (`hybrid.spec.ts`): every main route has a paper body and a light navigation bar with
near-black words; the shop has no filled tile behind a piece and no boxed filter; the sand layer exists
on the DESERT EYE slide only, is visible while that family is centred, fades when the next family is
centred, exists on the DESERT EYE product page and on no original's page, the shop, Face Studio or the
cart; KIRI has a heading and no image, price or sand; a mouse drag moves the rail to the next family
without opening a product; the piece assembles, opens out, closes and replays, with the owner's exact
material wording and none of ruby, implant-grade or certified on the page; no video is requested for the
themed opening; Face Studio without a photo shows the sculpted head wearing the chosen form, with side,
add-piece, size, undo and look controls absent, and the head following the form selector.

Defects found and fixed in this pass:

- The exploded view slid a full-size hardware layer over the "Assemble" button, which then could not be
  pressed. Assembly layers no longer take pointer events.
- The light sweep waited in full view at the side of the stage for 3.3 s before its turn.
- A `z-index` on the mascot block isolated its multiply blend and drew a white rectangle on the paper.
- The mascot went back to reading four seconds after a press even if the clip was still loading, so
  the sand could be aimed at a point that had moved by about 3 px. He now holds his look until the
  transition is over.
- On a phone: home labels were cramped, the product stage left a large empty band above the piece, the
  material notes ran into the caption, and the first tab was cut off.
- Studio tests measured the jewelry while the photo was still settling in; the helper now waits for it.

Tests updated for the new markup: the homepage paper check, the end of the rail now being KIRI, posts
counted by `data-post`, "Material not yet confirmed", "shown conceptually", and the look panel being put
away when a photo is cleared.

Visual review: `references/review/2026-09-21-hybrid/` (local only, 24 frames, desktop 1440 x 900 and
mobile 412 x 915). Every frame was opened and compared with the HYBRID contact sheet.

Not tested: real devices, Safari on iOS, Firefox, and the feel of the motion, which only the owner can judge.

## New direction: landing page, selection, whole piece — 21 September 2026

Browser results are **browser emulation on a Windows desktop** against a development server.

| Command | Result |
| --- | --- |
| `npm run lint` | pass, 0 problems |
| `npm run typecheck` | pass, 0 errors |
| `npm test` | 77 of 77 pass |
| `npm run test:e2e` | 197 pass, 37 skipped, 0 fail |
| `npm run build` | pass; 0 client chunks contain the character's name, the dev media route or the mascot |

New browser tests (`home.spec.ts`, `selection.spec.ts`): paper background and light navigation; both
actions inside the first screen, 44 px or taller, leading to Face Studio and the selection; nothing
pinned and the wheel moving the page one-to-one; the teaser opening the selection on the chosen family;
the mascot doing something small within seconds, returning to idle, never looking up or starting
anything by himself, with exactly one still showing; a press making him look up, the sand entering
within 3 px of the mini gourd, the route changing only after full cover, and the selection opening on
DESERT EYE — LOVE; Skip; reduced motion as a plain link; slides side by side in one row with no sideways
page overflow; arrows, arrow keys and `?family=`; the rail being an ordinary snap scroller that leaves
the wheel to the page; piercing type switched in place carrying into the bag and the product page; the
piece view showing base, posts and tops, 2 posts for the pair and 1 for the singles, its notes reading
Titanium / Proposed and Deep-red faceted gemstone / Not confirmed and never ruby, garnet, verified or
certified; reduced motion showing the piece assembled at once; the head having no stroked elements.

Defects found by these tests and fixed: visually hidden radio inputs of far slides widened the page by
up to 562 px; the assembly kept its start delays under reduced motion and stayed invisible; a swipe made
before hydration was not read; a press during his look-up animation measured the gourd 7 px off.
Earlier tests were updated for the new default tab and for a second "View DESERT EYE" link.


## Seated figure and sand reveal — 21 September 2026

Browser results are **browser emulation on a Windows desktop** against a development server.

| Command | Result |
| --- | --- |
| `npm run lint` | pass, 0 problems |
| `npm run typecheck` | pass, 0 errors |
| `npm test` | 77 of 77 pass |
| `npm run test:e2e` | 170 pass, 37 skipped, 0 fail |
| `npm run build` | pass; 0 client chunks contain the character's name or the dev media route |

Compositing method check, before any credit was spent: a synthetic sand-on-blue clip, recorded locally
to lossy WebM, keyed with the project's shader over a white page with black text. 99.7% of pixels clear
at the start, 100% opaque at full cover, 0 pixels with blue leading. WebKit on this machine could not
decode that WebM fixture; it does decode the real MP4, and the story tests pass in WebKit.

Measured from the generated clip every 0.1 s: 1280 × 720, 5.04 s; ground corners from (0,49,81) to
(119,182,217), so not a flat key; clear 99.7% at 0 s; opaque 99.2% at 4.5 s, 99.8% at 4.7 s, 100% from
4.8 s; 0 fringe pixels in every frame; the stream enters at x 0.01, y 0.74.

New unit tests: beats and their order with no fight words; the ground clears however bright or dark
and sand stays solid even at (43,19,5); a half-covered edge pixel keeps no blue; placement pins the
entry point to the target at the start and covers 1440 × 900, 412 × 915, 320 × 568 and 844 × 390 at the
end with the aspect ratio unchanged; a point on a contained, bottom-left picture.

New browser tests: at 320×568, 360×800, 390×844, 412×915, 844×390 and 1440×900 the sand's entry point
is within 2 px of the top of the cork, measured in the same frame as the clip's time, the gourd is on
screen, the canvas is never stretched, and at full cover the canvas spans the whole viewport; far from
the gourd the page's pixels are byte-identical before and during the early sand, and under full cover
no ink-black heading pixel shows through; with the footage blocked the story is skipped to the product
and not marked seen (Chromium only: this WebKit build does not let a test intercept a media request);
the dialog has a transparent background and the collection stage stays under it.

Failures on the way, all fixed rather than retried: React's development double-mount plus a deliberate
WebGL context loss left the second canvas unusable, so the story always fell back to the product; a
hover transform on the figure moved the measured origin by up to 7 px; a wall-clock timeline could reach
the cut before a stalled clip had covered the page; pressing Watch straight after a reload found the
figure's picture not yet loaded.

Inspected: both page recordings sampled at 10 frames per second across the whole interaction, plus
full-size frames at the burst, full cover and reveal, desktop and Pixel 7. A recording cannot be
watched at speed by this tool; the owner must judge the motion. Frame rate measured while the sand
played: 60 per second on this desktop. No real phone was used.


## Prototype product art installed — 21 September 2026

Browser results are **browser emulation on a Windows desktop**. No physical device was used.

| Command | Result |
| --- | --- |
| `npm run assets:render` | 2 pieces rendered locally, 4 web files written, 0 credits |
| `npm run assets:sync` | 4 product assets found |
| `npm run lint` | pass, 0 problems |
| `npm run typecheck` | pass, 0 errors |
| `npm test` | 72 of 72 pass |
| `npm run test:e2e` | 167 pass, 34 skipped, 0 fail (desktop Chromium, Pixel 7 emulation, WebKit) |
| `npm run build` | pass, "product assets: 4 found" |
| Local production build | all four `.webp` files answer 200 `image/webp`; the DESERT EYE page references both; character slots still `placeholder`; 0 client chunks with internal names |

The first full run after installing the art had **15 failures, all one cause**: five tests on three
projects selected "the image inside the photo frame", and the jewelry is made of images now too. The
customer's photo got its own test id (`studio-photo`) and the selectors name it. No behaviour changed.

New unit tests (`tests/unit/assets.test.ts`): the manifest holds exactly the four files; every listed
file is a real WebP; both source masters exist and the symbol's SVG contains the repository's glyph
outline unchanged; no right-hand variant exists and the right side reuses the one symbol; all three
forms are `prototype-product-art` and no note names a stone or a metal; offsets and the symbol's size
are untouched and the stone stays between 0.34 and 0.42 of the symbol's width; designs without supplied
art still fall back to drawn artwork.

New browser tests (`tests/e2e/product-art.spec.ts`, 2 tests on 3 projects):
- Stage, product page still, placement head, shop card and bag line all draw the real files, fully
  loaded, at 1600 × 1656 and 800 × 800 natural size, with no failed `/products/` request and no console
  error. The stone measures between 0.34 and 0.42 of the symbol's drawn width. Micro dermal uses the
  symbol file and nose uses the gemstone file. SAND VORTEX still has no image art. Cards say "Prototype
  artwork" for this design and "Concept artwork" for the others.
- No image has a negative horizontal scale anywhere above it, and none carries a recolouring filter.
- Face Studio: Pair, Symbol and Gemstone controls are present; switching to the wearer's right swaps the
  pieces' sides and keeps the symbol above the stone, with the same files, the same width and no flip;
  selecting the symbol alone and nudging it moves the symbol and leaves the stone where it was.

Screenshots opened and inspected (gitignored `references/review/2026-09-21-jewelry/`, desktop at 2× and
Pixel 7): stage, each floating piece on its own, pair hover, product page, product close-up, placement
head, final reveal frame, nose and micro-dermal concepts, try-on stand-in, Face Studio on the labelled
test fixture for both sides, shop grid, and two frames from a production build. The right-side frame
shows the character reading correctly, not mirrored.

Not tested: real devices, print or CAD accuracy (there is none to test against), a real face photo.


## Visual refinement of the DESERT EYE stage — 21 September 2026

All browser results are **browser emulation on a Windows desktop** against a development server, the
only place internal concept stills exist. No physical phone, tablet or Mac was used.

| Command | Result |
| --- | --- |
| `npm run lint` | pass, 0 problems |
| `npm run typecheck` | pass, 0 errors |
| `npm test` | 70 of 70 pass (4 new) |
| `npm run test:e2e` | 161 pass, 34 skipped, 0 fail (desktop Chromium, Pixel 7 emulation, WebKit) |
| `npm run build` | pass |
| Search of `.next/static` for the internal character names and the dev media route | 0 files |
| Local production build (`next start`), `/collections/desert-eye` | no character names, no development notes, `data-media="placeholder"`, `data-tone="light"`, "in preparation", KIRI and "Original designs" present, `/api/dev-concept/start` returned 404 |

Skipped tests: the earlier ones, hover tests on the phone project, the phone-layout test on desktop
projects, and the six fight-composition sizes outside desktop Chromium, where sizes are set explicitly.

Two runs on the way failed and were fixed, not retried until green:
- Phone: the first piece, floating beside the character, swallowed taps on the middle of the character.
  Only its jewelry and label take taps now. This was a real defect found by the tests.
- Two timing checks were flaky when the whole suite ran in parallel: a 0.8 second beat slipped between
  polls in WebKit, and a wall-clock wait sampled the fight during the throw instead of the block. Beats
  are now recorded inside the page, and the fight is measured with its animations held at 40%.

What the new and changed browser tests cover:
- The stage copy has no timings or engineering notes and no collaboration claim; "Story 01" is shown.
- The navigation on the stage is `data-tone="light"` with no bottom rule and keeps the home link.
- "Original designs" follows the stage, KIRI is shown as Original / Concept with no `svg` or `img` inside
  its entry, and CRIMSON ORBIT is linked.
- The character has a pointer cursor and a WATCH STORY label; a mouse 400 px away leaves `data-near`
  false, 60 px away sets it true without a reaction; hover reacts and returns to idle inside two seconds;
  nothing opens.
- The cinematic is labelled "Concept motion prototype" and "not final footage" and reports `animatic`.
- The ending is either the clean two-piece overlay or the painted reference with no overlay, never both.
- Nose and micro dermal use a different picture from the eye close-up, inside a window under 75% of the
  panel height, with the image drawn no wider than 1.05 times its natural width.
- Try on without a photo shows the featureless head wearing the chosen form, labelled "not a person",
  with the character hidden; with a photo the head is gone and the `blob:` photo is drawn. The privacy
  checks from the first round still pass.
- First screen: the heading, WATCH STORY, the character and the first piece all start inside it on
  every project; on desktop the next section starts at least 40 px above the fold and the SCROLL cue
  links to `#originals`.
- Fight composition at 320×568, 360×800, 390×844, 412×915, 844×390 and 1440×900: exactly one composition
  is active, 61 samples along the sand arc (with half its stroke width) never enter the face rectangle,
  the opponent's box never overlaps it, the opponent is opaque and entirely inside the stage.
- Phone: after the first piece no two pieces share a row, their centres vary by more than 60 px, and the
  page has no sideways overflow.

New unit tests: reaction length about a second; every beat titled and a customer-facing story label;
the painted close-up flagged and both required-asset notes present; the half-length still never drawn
wider than 1792 px on a 1440 × 900 panel; story collections and the light-navigation flag in step, and
KIRI present as words only and absent from the catalog.

Screenshots opened and inspected (kept in the gitignored `references/review/2026-09-21-refinement/`):
desktop stage, interaction, jewelry hover, eight animatic frames, product state, nose, micro dermal, try
on, originals; phone stage, story entry, two mid-story frames, sand, product state, browsing, try on; and
a 16-frame contact sheet of the 35.6 second walkthrough recording. Inspection during the pass found and
fixed: dashed arcs (a stroke effect that ignored the path length), a one-pixel hairline from a two-layer
mask, the first phone piece landing on the character's ear, a development note over the collection label,
a hard edge where the sand ended on a phone, a link that ignored its breakpoint, a nose stone too small
to read, the still's own edge swinging into view when skewed, and a caption cut off by the try-on strip.

Not tested: real devices, a screen reader, real footage, and whether the motion feels right at speed.


## Story-driven collection page — 21 September 2026

All browser results are **browser emulation on a Windows desktop** against a development server,
which is the only place internal concept stills exist. No physical phone, tablet or Mac was used.

| Command | Result |
| --- | --- |
| `npm run lint` | pass, 0 problems |
| `npm run typecheck` | pass, 0 errors |
| `npm test` | 66 of 66 pass (9 new in `tests/unit/story.test.ts`) |
| `npm run test:e2e` | 151 pass, 20 skipped, 0 fail (desktop Chromium, Pixel 7 emulation, WebKit) |
| `npm run build` | pass |
| Search of `.next/static` for the internal character names and the dev media route | 0 files |
| Local production build (`next start`), `/collections/desert-eye` | no character names in the page, `data-media="placeholder"`, "Story in preparation", `/api/dev-concept/closeup` returned 404 |

Skipped tests are the earlier ones plus three hover tests on the phone project. One earlier full run
showed five WebKit failures that were `ENOENT` errors on Playwright trace files: a second Playwright
command had been started at the same time and cleared `test-results`. Run alone, the suite passed.

What the new browser tests (`tests/e2e/story.spec.ts`, 11 tests on three projects) cover:
- The stage shows the character and four jewelry objects, no product cards, no console errors, and nothing plays during 1.2 seconds of waiting. Each object is a link named with the piece, the form and the demo price.
- Hovering the character sets the reaction, never opens the cinematic, and returns to idle inside two seconds.
- Hovering an object shows its name, form, price and TRY ON, and starts nothing.
- An object opens the product in place with `?product=&form=` in the address; the address alone opens the same form; Back clears it; a piece without a story (SAND VORTEX) is shoppable the same way and adds QAR 350 to the bag.
- WATCH STORY opens the cinematic from a press, Skip is visible and focused at once, it is labelled "not the final cinematic", and skipping lands on the product with focus on its title, all three piercing types enabled, all three views, QAR 390, the "Not manufacturing-ready" note and a working Add to demo bag.
- Left alone, it runs stance, exchange, fill and close-up, shows the two-piece product overlay on the close-up, ends between 5 and 9.5 seconds after its first frame (the design is 6.5; the ceiling allows for a busy test machine), then offers Replay story. In the same session, and after a reload, the character opens the piece without replaying. Replay is explicit and Escape skips it.
- The character is reachable by keyboard, named "Watch the DESERT EYE story", and Enter starts it.
- Changing piercing type changes the visual's form, the number of overlay pieces (2, 1, 1), the price (390, 190, 220), the note and the address; with stills present the nose uses a different picture from the eye close-up; the placement view and the ordinary product page follow the same form.
- TRY ON from an object opens the try-on view, says the photo is never uploaded, keeps the character until a photo arrives, then hides it and draws the customer's photo through `LookRenderer` with a `blob:` URL. Changing form changes the pieces on the face. No non-GET request was made, and neither the address nor session storage holds anything about the photo. The photo and form carry into Face Studio.
- Reduced motion: "View the piece", the story is skipped, no replay control.
- Normal scrolling, no sideways overflow, every object at least 44 px.

Existing tests changed because DESERT EYE — LOVE now has a nose form: the concept-pending checks moved
to CRIMSON ORBIT's anti-eyebrow form, the nostril filter now shows two pieces, and the collections test
follows the new stage. The unusual-size check now also covers the stage and its product state; it found
a 2 px sideways overflow at 320 px from the light sweep on a tilted object, which was fixed.

Screenshots opened and inspected (not committed, because they contain internal concept stills): stage
at 1440 × 900 and Pixel 7, object hover, six cinematic frames, product state for all three forms,
placement, try-on with and without the fixture, and the placeholder stage from a production build.
Inspection led to these fixes: a rectangular sand eruption became a growing circle, captions that were
unreadable over the close-up became ink chips, the still's hard edges were feathered on all sides, the
nose object no longer collides with the pair's label, and the micro-dermal anchor moved off a shadow.

Not tested: real devices, a screen reader, real footage (none exists), and how the animatic feels at
its true speed to a person, which needs the owner's eye.


## Final direction: design families and reveals — 20 September 2026

All browser results below are **browser emulation on a Windows desktop**. No physical phone, tablet or
Mac was used.

| Command | Result |
| --- | --- |
| `npm run lint` | pass, 0 problems |
| `npm run typecheck` | pass, 0 errors |
| `npm test` | 49 of 49 pass |
| `npm run test:e2e` | 118 pass, 17 skipped, 0 fail (desktop Chromium, Pixel 7 emulation, WebKit) |
| `npm run build` | pass |
| Search of `.next/static` for the Shopify token prefix | 0 files |

Skipped tests: desktop-only behaviour on the mobile project, the mobile menu on desktop projects, the
unusual-size checks outside desktop Chromium, and reveal **playback** in WebKit, whose Windows build
cannot decode the WebM test pattern. The WebKit failure path is covered by the failed-media test.

What the new tests cover:
- Changing form updates the form identifier, the placement preview, the number of pieces (2 to 1), the piece position, the demo price, the package text, the honest form note and the URL.
- A concept-pending form is disabled and labeled, and asking for it by URL falls back to the default form.
- A product-and-form URL opens on that form.
- The chosen form holds across Concept reveal, Placement preview and Try on your face, and two forms of one design become two bag lines with their own labels, quantities and prices (QAR 610, then QAR 830 after one increase).
- The original piece has working forms, and its nose form is drawn on the nose, smaller and nearer the centre line than the cheek form.
- In Face Studio, switching form keeps the same photo object URL, changes the pieces, starts the other form from its own placement, and restores the first form's adjusted position when switching back. No non-GET request was made.
- Without approved media the reveal is a still with "Reveal in preparation", has no Watch button, creates no video element and requests no media file, and Add to bag and Try it on stay usable.
- Hovering the reveal for 0.8 seconds starts nothing and loads nothing.
- Missing media shows "couldn't play" and the still, and shopping still works.
- Reduced motion offers the still only, and the homepage shows every section with no entrance animation.
- The original piece's metal-sweep loop plays without any video element, ends on its own and can be replayed.
- With the labeled test pattern (Chromium): Enter on the Watch button starts it, Skip is there at once, the video starts muted and the sound control unmutes it, Skip shows the final frame for the chosen form, Replay works, changing view stops playback, the expanded view opens on request and Escape closes it, the artwork is a labeled button, and a nine-second file is ended at eight seconds.
- The homepage has no full-height sticky stage and the wheel moves the page exactly 600 px and then 900 px.
- At 320 × 568, 720 × 450 (a 1440 × 900 window at 200% zoom), 1280 × 480, 844 × 390 and 2560 × 1200: no sideways overflow on `/`, the family page, `/shop` and `/face-studio`; Add to demo bag can be scrolled into view, is at least 44 px tall and sits inside the viewport; the first tab stop shows a focus outline.

Screenshots opened and inspected for this round: family placement preview (anti-eyebrow, micro dermal),
reveal still, original nose placement, and the family page at 320 px wide, 1280 × 480 and 844 × 390.
Inspection found and fixed three defects: the 4:5 media frame was taller than the window, the header
showed "Search" on phones, and the view tabs wrapped onto three lines at 320 px.
Other captured files in `docs/screenshots/` were not individually inspected and are not offered as evidence.

Remaining manual checks, not reported as passed:
- A physical iPhone and Android phone, including Safari and touch dragging with a finger.
- Real browser zoom at 200% (only the equivalent viewport size was emulated).
- A screen reader pass over the tabs, the form selector and the reveal controls.
- The reveal with real campaign media, including sound, once it exists.
- Playback in Safari with an MP4 or HEVC file. Only a WebM test pattern in Chromium has been played.
- Colour contrast measured with a tool on the paper sections.

## Visual redirection — 20 September 2026

Same machine and method as below, after the homepage, navigation and Face Studio restyle.

| Command | Result |
| --- | --- |
| `npm run lint` | pass |
| `npm run typecheck` | pass |
| `npm test` | 40 of 40 pass |
| `npm run test:e2e` | 90 pass, 6 skipped, 0 fail, across desktop Chromium, Pixel 7 emulation and WebKit |
| `npm run build` | pass |
| Search of `.next/static` for the Shopify token prefix | 0 files |

Skipped tests are desktop-only behaviour on the mobile project (hover pane, chapter index) and the
mobile menu test on the desktop projects.

New homepage tests (`tests/e2e/home.spec.ts`):
- The first screen shows one statement and one action, with no console errors, and the product detail copy is hidden.
- Scrolling the first chapter raises its progress, shows the product name and both callouts, and hides the opening statement.
- In the Face Studio chapter the named piece changes from DESERT EYE — LOVE to SAND VORTEX as the visitor scrolls.
- Vertical scrolling moves the collection sideways, the last piece and the collection link come into view, and the link works.
- Keyboard focus on an off-screen piece brings it into the frame.
- Try on opens the preview sheet from the sequence and Escape closes it.
- The closing chapter leads to Face Studio.
- Reduced motion produces no pinned stages, no track transform, and every heading and all four pieces visible.
- Desktop: hovering a piece opens exactly one preview pane, which closes on leave. The chapter index jumps to a chapter and marks it current.
- Mobile: the menu opens as a full-screen dialog, navigates and closes.

All Milestone 1 Face Studio, preview, look, bag, privacy and checkout-guard tests still pass unchanged,
apart from selectors for the new mobile menu.

Not tested: real phones, real Safari, scroll smoothness and frame rate on low-end devices, screen readers,
200% zoom, and the look of the sequence on very short or very wide viewports.

## Milestone 1 — 20 September 2026

All commands ran locally on Windows 11, Node 24.19, against the dev server at `http://localhost:3000`,
on branch `feat/dermal-first-slice`.

| Command | Result |
| --- | --- |
| `npm run lint` | pass |
| `npm run typecheck` | pass |
| `npm test` | 40 of 40 unit tests pass |
| `npm run test:e2e` | 67 pass, 2 skipped, 0 fail |
| `npm run build` | pass |
| Search of `.next/static` for the Shopify token prefix and variable names | 0 files |

The two skipped browser tests are the hover and keyboard-focus preview tests on the mobile project,
where that behaviour does not apply.

### Browser projects

| Project | Engine | Viewport |
| --- | --- | --- |
| desktop-chromium | Chromium | 1440 × 900 |
| mobile-chromium | Chromium, Pixel 7 emulation with touch | 412 × 915 |
| desktop-webkit | WebKit | 1280 × 800 |

WebKit here is Playwright's automated build. No real iPhone, Android phone or Safari was used.

### What the browser tests cover

- Home to collection to hero product, with no console errors. Real 404 for an unknown product.
- Placement filters, search and the empty state.
- Add to demo bag with no photo and no account.
- `POST /api/checkout` returns 403 `checkout_disabled`.
- Reduced motion removes animation.
- A valid photo loads as a `blob:` URL and places the pair with the symbol upper and outer and the gemstone lower and inner.
- Refused files: text renamed `.png`, SVG, HEIC, a corrupt PNG and a file over 10 MB, each with its message. A valid photo still loads afterwards.
- Mouse drag, size slider, rotation slider, undo back through each step, redo and reset.
- Adjusting the gemstone alone leaves the symbol where it was.
- Arrow keys, Shift plus arrow, and the nudge buttons.
- The jewelry stays on the same point of the photo at 820 × 1180, 390 × 844 and 1600 × 760.
- Wearer's right mirrors the position and keeps the symbol outer and unflipped.
- Pointer events of type touch move the jewelry. The handle has `touch-action: none`; the page body does not.
- Switching piece keeps the same photo and position. `/face-studio?product=…` opens on that piece.
- The photo follows client-side navigation into the Try on sheet, and Clear photo removes it from the Studio and from previews.
- After a reload there is no photo, and no app data exists in `sessionStorage`, IndexedDB or the Cache API. `localStorage` holds only the demo bag.
- Desktop hover panel shows the photo, stays inside the viewport, stays open under the pointer and closes on leave. Only one panel exists at a time.
- Keyboard focus opens the panel, Escape closes it and focus stays in the card.
- Look: add a second piece, the replace-or-add prompt, replace, add look to bag as one line per product, quantity change, subtotal, removal, empty bag, Escape closes the drawer, remove pieces.
- The bag survives a reload and `/cart` matches the drawer.
- Network: during photo selection, editing, product switching, bagging and clearing, the page made no request with a body, no non-GET request, and no request at all outside Next.js dev assets. Hot-reload socket frames carried no image data.

### Not tested

- A real phone or a real Safari browser.
- A real face photo. The fixture is an abstract grid and says nothing about how placement looks on a face.
- EXIF rotation with a rotated camera photo. The code requests orientation from the decoder, but no rotated fixture exists.
- Screen readers. Roles, labels and focus order were written deliberately but only checked through the accessibility tree and keyboard tests.
- 200% zoom and landscape phones.
- Colour contrast by tool. Token contrast ratios were calculated by hand.
- Two separate browser contexts sharing state. State is in memory and `localStorage` per browser, so none is expected.
- Performance and Core Web Vitals.
- Anything involving Shopify. This milestone makes no Shopify request.

### Known dev-only noise

Playwright hides the text caret before taking a screenshot. If it does so before React hydrates, the
Next.js dev overlay reports a hydration mismatch on `caret-color`. It appears in some review
screenshots as a "1 Issue" badge. It does not occur in normal browsing and is not an app defect.
