# Decisions

Dated records of choices that are not obvious from the code.

## 2026-09-23 — Three concept families: CROSSLINE, ANKH TRACE, HORUS TRACE

- **The owner's three reference screenshots never reached this machine.** No attachment arrived and no
  new image file was on disk, so nothing was traced from them. Each family is drawn from the written
  description as an original concept placeholder, and every surface says "Concept product".
- **A concept product carries no price.** `demoPrice: 0` now reads as "Price pending" everywhere
  (`formatPrice`), the product page replaces the bag button with a plain explanation, and a look in Face
  Studio that holds a concept piece cannot go into the demo bag. Nothing invents a number to look finished.
- **No claim from the supplied poster was copied.** HORUS TRACE records "Prototype specification",
  "Dark faceted gemstone — material not yet confirmed", "Not yet confirmed" for the metal, "Polished —
  proposed" and "Surface-bar concept — final specification pending". The words implant-grade, genuine
  gemstone, sterling and ruby appear nowhere, and a test fails if they ever do.
- **Lines, not new collection pages.** The three sit in the `originals` collection and carry the new
  lines `signature`, `symbolic` and `ancient`, which the product page prints as "Original · Symbolic ·
  Ancient". All three are unisex, so they show under men and under women, as every other piece does.
- **Each family has its own motion** (`motionOf`): CROSSLINE takes a slow light sweep and one step
  forward, ANKH TRACE swings slightly like something hanging, and HORUS TRACE lights its stone and
  traces its own line once. Sand stays with DESERT EYE alone, as ruled earlier.
- **Only real modes are offered.** With no film and no orbit media, the product page shows The piece,
  Placement and Try on. Nothing shows an empty 360° or a fake assembly clip.
- **New artwork ids** (`cross-line`, `cross-mark`, `ankh`, `horus-eye`, `horus-drop`, `dark-gem`) are
  drawn in `JewelryArt.tsx`. A thin element is drawn as a shape, never a stroked line: a gradient has no
  height to fill on a flat line, and CROSSLINE first came out flat grey because of it.

## 2026-09-22 — Cinematic remake: the opening shot, the world, the companion, the push into the stone

- **The owner rejected the previous result as not cinematic enough** and authorised Higgsfield without
  a credit limit. About 313 credits were spent (359 to 45.71). Every product clip starts from the exact
  approved frame; nothing redraws the jewelry. Details in `references/generated/cinema/RECORD.md`.
- **A new opening shot.** The homepage opens on a muted, looping low-key push-in of the piece, with a
  pause control (it moves for longer than five seconds) and the headline. It is ambient atmosphere, not
  a concept reveal, so the reveal rules (no autoplay) do not apply to it; the product film still waits
  for a press. With reduced motion it is the still.
- **Video sources attach after hydration** (`lib/motion/useAmbientVideo.ts`). A server-rendered source
  held WebKit's load event indefinitely, and the poster is the better first paint anyway.
- **The turn keeps its place** as "01 / The piece", now from the 4k orbit upscale.
- **The world and the companion.** A golden-hour dunes loop with three words, then the small reader of
  DESERT EYE on a dune (a new still from the approved chibi). He fills the screen there, so the corner
  companion hides while that section or the dark opening shot covers the middle of the screen.
  The copy says "Inspired design · not an official collaboration".
- **The macro stage** plays the macro clip backwards against the scroll so the page pushes into the
  stone. It is one of four pinned stages now (turn, dunes, companion on wide screens, macro), each in
  normal scroll. Nothing hijacks the wheel.
- **The piece story** gives the meaning of the symbol, the stone and the bar in a few sentences, with
  material notes in the owner's safe wording only ("material not yet confirmed", "proposed").
- **The companion still stays internal.** Like every character picture it is served only by the
  development server from `references/` (`/api/dev-concept/companion-dune`); a build leaves the
  companion section out. The product, dunes and macro media in `public/media/cinema/` contain no character.
- **`CraftedInSand.tsx` was removed**; `DesertWorld.tsx` replaces it.

## 2026-09-22 — Final master redesign: hotspots, worlds, taxonomy, a companion on every page

The owner's final master prompt. Rollback tag: `pre-redesign-2-c0aff80`. No credits spent.

- **Material hotspots on the piece** (`MaterialHotspots`). Three points on the beauty frame (gemstone,
  bar, symbol) open an annotation with a fine leader line. Wording is the owner's; every unknown says
  "pending" or "not yet confirmed": no purity, no grade number, no dimensions. Keyboard: each hotspot is
  a button (Enter, Space); Escape or a click outside closes it; one open at a time. On a phone the note
  is a sheet at the foot of the screen. The frame box reproduces the picture's cover crop without a
  transform (a transformed ancestor would trap the fixed phone sheet), so the points stay on the parts.
- **The film opens on the jewelry.** The Assembly poster is the finished piece; the creature appears
  only once the customer presses Play. The sound control reads Unmute / Mute.
- **360°** shows "Rear geometry conceptual" only while the rear faces the viewer.
- **The ways in** (`BrowseRail`): seven gallery entries, each its own world — DESERT EYE (sand),
  KIRI (ivory and chrome with a blade of light), LIMITED EDITION (dark, "None announced"), FULL
  COLLECTION, MEN, WOMEN (both "Unisex pieces included"), TRY ON YOUR FACE. On the homepage and at the
  top of /collections; the pieces rail follows it on /collections.
- **Taxonomy in the data model.** `Product.audience` (men, women, unisex) and `Product.lines` (full,
  inspired, original, signature, limited) with `matchesBrowse()`. Every demo piece is unisex and in the
  full collection plus inspired or original by its origin. Nothing is assigned to men or women, and
  nothing is a limited edition: those are the owner's calls. The shop filters (All, Men, Women, the
  placements, Inspired, Limited edition) use them; a limited filter says "No limited edition has been
  announced." No Shopify records were created.
- **The companion on every page** (`GlobalMascot`): fixed in the lower right, small, the same size on
  every page; idle beats as before; a hover is a one-second glance; on the homepage and /collections a
  press runs the sand into DESERT EYE, elsewhere it simply opens it. The multiply blend is set on the
  fixed box itself. Internal concept art: a build shows nothing there. He left the sand section and
  the collection rail so there is only ever one.
- **Macro views** are enlarged less (1.3–1.7×) so the 1080p source stays sharp.
- **Mode name** "The piece" and a View piece ↗ link on each shop piece.

## 2026-09-22 — Full visual redesign: keep the engine, rebuild the body

The owner rejected the visible site and ordered a full visual redesign to the class of a luxury-watch
launch site, keeping the engineering. Rollback tag: `pre-redesign-d6fef76`. No credits were spent;
MEDIA 02 is not made.

- **Kept:** Face Studio photo handling and privacy, placement geometry and `LookRenderer`, the
  Studio provider's product and form state, `formOf`/`filmFor`, the exact symbol and gemstone
  assets, the approved product film and orbit media, the bag, the catalog provider interface, the
  reveal infrastructure, and the tests for all of them.
- **Homepage:** 01–02 one pinned stage: the orbit fills the screen; on a wide screen the piece starts
  pushed in to the right of the hero words and glides to the centre as the turn begins; the first
  fifth of the scroll holds the beauty frame, then one true 360 (front, side, rear, other side,
  front, never ping-pong); "Engineered for the face." mid-turn and "DESERT EYE 01 / 04" at the end,
  in the corners. 03 Crafted in sand: the vortex still takes the viewport in a slow push (a second,
  short pinned moment), words on a veil that dissolves at every edge, the mascot here only. 04 Macro:
  four full-width and half-width close views with FACET, OPENWORK, POLISHED EDGE, SURFACE FORM.
  05 Assembly: the film across the whole width. 06 Forms. 07 See it on you: the customer's own
  photo through `LookRenderer` when one is in memory, otherwise the sculpted head in an extreme crop.
  08 Collections rail. 09 A dark final frame.
- **One crop for the sculpted head** (`.crop-head`): a centred 4:5 head box enlarged by `--s` and
  moved so the placement lands where asked. Used by Face Studio, the product page's Placement mode
  and "See it on you", so a crop is always around the real anchor.
- **Collections:** gallery labels, not cards: `01 / 04`, the name, Story-driven or Original,
  Explore ↗ and Try on ↗. No price, no form switch, no bag on the rail.
- **Product page as a configurator:** 68/32 split, a sticky stage with modes Piece (the orbit's beauty
  frame, never a schematic first), 360°, Assembly (the film), Placement (tight crop), Try on; a quiet
  right column with Form, price, Try on your face ↗, Add to demo bag, Details + / Materials + / Care +,
  and one line "Prototype specification · final production details pending · unverified". The old
  specification table and disclaimer wall under the page were removed.
- **Face Studio:** the tools are one word each (Move, Scale 12.0 %, Rotate 0°, Reset, Undo, Redo) and
  only the selected tool's controls are on the page; the picture tool row keeps Show before and Clear photo.
- **About** is an editorial page: the piece large, two lines, the photo facts.
- **The preview note** fades once the homepage scrolls, so it never sits over later controls.
- **Tests** were rewritten for the new behaviour (mode names, tool gating, the gallery rail, the
  Assembly mode, the hero timing, the macro and assembly sections, two pinned moments) and none of
  the privacy, geometry, form, bag, media-control, reduced-motion or mobile tests were dropped.

## 2026-09-22 — The launch film: homepage as a cinematic product site

The owner's "critical UI override" makes a luxury-watch cinematic site the primary reference: the
product as the main visual of nearly every section, a launch-film pacing, minimal navigation, text
links instead of button rectangles, and the rule that where the old DERMAL structure and that
structure conflict, the cinematic structure wins. No credits were spent; MEDIA 02 is not made.

- **Homepage flow** (`app/page.tsx`): `LaunchHero` (01–02: the approved orbit fills the screen and
  is turned by scroll, the name first, then the headline and the two ways in; one pinned stage,
  340 svh), `CraftedInSand` (03: the sand vortex still takes the viewport, three words, the mascot
  lives here and nowhere else), `MaterialDetail` (04: three enlarged crops of the orbit's front frame,
  labelled "Prototype render, enlarged · not a size"; stand-in for MEDIA 02), `AssemblySection`
  (05: the approved film), `FormsStage` (06: the three forms in one stage, the filmed form as the
  orbit still and the others as the drawn assembly, sharing the Studio provider's choice),
  `SeeItOnYou` (07: a close crop of the sculpted head around the placement), the `SelectionRail`
  (08), `FinalCta` (09: three lines, two links). The old `Landing`, `ScrubHero` and `StorySection`
  were deleted, with their floating teaser pieces and reflection.
- **The piece is large.** The opening frames are the orbit's 1.4× centre crop shown `object-contain`
  in the full viewport; on a portrait screen the frame is enlarged 1.45× so the piece fills the
  width. The forms and detail stages give the piece most of their area. No tiny jewelry, no giant
  mannequin: Face Studio's bare head is now a 1.9× crop around the chosen placement (`.studio-crop`),
  and the "on you" section crops the same way.
- **Navigation** is transparent over the opening and takes a veil of paper once the page has
  scrolled 24 px (`data-scrolled`); Search joined the right side. No boxes, no icons.
- **Buttons.** The two ways in are text links with ↗; only "Add to demo bag" is a solid rectangle.
- **Product page as configurator.** The left stage gained a 360° view (`OrbitViewer`: drag, arrow
  keys, a slider; the rear side labelled conceptual) and an Exploded view (`PieceAssembly` opening
  exploded) beside the film, placement and try-on; the right column stays put. The form group is
  labelled "Form".
- **Copy** is only the approved lines plus "Crafted in sand", "Sand. Solitude. Identity.",
  "Assembled with intent", "The forms", "See it on you", "View the collection" and "Your face. Your
  placement. Your piece." from the owner's flow. Small numbered labels ("01 / DESERT EYE") carry
  the sections.
- **Tests were rewritten for the new behaviour**, not preserved for the old layout, as instructed:
  the opening's canvas covers more than half the viewport, the ways in are hidden until the turn has
  begun, exactly one sticky stage (`launch-stage`), no teaser pieces, the bar's scrolled state, the
  sand section's words and single companion, three detail crops with no claims, the forms stage
  switching in place and carrying to the product page, the cropped head, the collection browser and
  the last frame.
- **Not done, deliberately.** No Lenis (native scroll). No new media. The "Crafted in sand" and
  "Material" sections wait for MEDIA 02 to become cinematic clips.

## 2026-09-22 — MEDIA 01 hero orbit, and the product reference for generation

- **The film's last frame is the product reference for generation.** A generated hero image
  (`nano_banana_pro`, 2 credits, owner-approved STEP 1) reinterpreted the glyph and the hardware and
  was rejected; the owner ruled that no image model redraws the jewelry. `final.jpg` of the approved
  film is the exact reference from now on.
- **One 5-credit identity test first** (`seedance_2_0_mini`, 5 s, 720p, start image `final.jpg`)
  kept the symbol, stone, prongs, bar and finish through a 70–80° turn, so the owner approved the
  full 360° orbit: `seedance_2_5`, 8 s, 1080p, no audio, 96 credits. Records with prompts, jobs and
  inspections are in `references/generated/orbit-test/RECORD.md` and `references/generated/orbit/RECORD.md`.
- **The rear of the piece in the orbit is conceptual.** The model imagined it (a red-faced, mirrored
  back; a half-second translucent ghost of the bar at about 4.5 s). It is presentation only and never
  a manufacturing reference, as the owner instructed.
- **Frames, not video, for the scrub.** 72 stills at 9 fps, centre-cropped 1.4× so the piece fills
  the stage, 1.8 MB, served from `public/media/hero-orbit/desert-eye-love/`. The placeholder frames
  from the assembly film were removed. The orbit master (HEVC) stays in `references/`.
- Credits this stage: 2 + 5 + 96 = 103. Balance 462 → 359. MEDIA 02 not generated.

## 2026-09-22 — Cinematic homepage: one scrubbed moment, story, assembly (no credits)

The owner's cinematic brief of 22 September asks for a scroll-scrubbed hero orbit, a minimal story
section and an assembly section on the homepage, with Higgsfield media for the orbit (MEDIA 01) and
a macro fly-through (MEDIA 02). Generation waits for the owner's approval of the exact prompts,
models and credits (proposed: `nano_banana_pro` hero image, 2 credits; two `seedance_2_5` clips,
8 s, 1080p, no audio, 96 credits each). Until then the sections are built with placeholders taken
from the approved product animation, and nothing was generated or spent.

- **One pinned section, by the owner's instruction.** `CLAUDE.md` forbids pinned stages and
  scroll-driven camera moves from the earlier chapter homepage; the owner's brief now allows
  "cinematic pinned / scrubbed media sections where they improve the experience" and asks for one.
  `ScrubHero` is that one: a 230 svh section whose stage stays in view while 48 still frames are
  scrubbed by the page's own scroll (`useScrollProgress` writes `--p`; a canvas draws the frame).
  Nothing else is pinned, nothing hijacks the wheel, and the section can be scrolled past at once.
  With reduced motion it is a plain still with the same words. The home test now allows exactly
  this one sticky stage.
- **Placeholder frames.** The frames are the assembly beats of the approved product animation
  (4.6–8.05 s at 14 fps, 1440 px JPEG, 1.3 MB total), so scrolling assembles the piece. The label
  under the stage says "Prototype product animation". They are replaced by the hero orbit's frames
  once MEDIA 01 is approved and made; the component is media-agnostic (`frames.dir`, `count`).
- **Story section** is three words, one still (the sand vortex frame of the film) with the
  collection's drifting grains, and a link. It stands in for MEDIA 02.
- **Assembly section** reuses `ProductFilm` unchanged, with the owner's three material lines.
- **Micro-interactions.** The cursor's light brightens chrome slightly (`--mx`/`--my` in
  `.fo-shadow`); KIRI's concept blade takes one thin blade of light on hover or focus.
- **Copy** is only the approved lines plus "Crafted for the face." (the owner's), "Sand. Solitude.
  Identity." (the owner's) and "Assembled from three parts." No taglines, no paragraphs.
- **Not done.** Lenis or any smooth-scroll library (native scrolling is enough and safer for
  accessibility); a new mascot animation (the IP filter blocks character video; the existing stills,
  idle code and sand clip stand); any credit spend.

## 2026-09-22 — The approved DESERT EYE product animation

The owner supplied a Higgsfield video (`hf_20260922_061502_5a468b8b-…mp4`, 8.05 s, 1920×1080) and
approved its sequence as the DESERT EYE — LOVE product animation: a sand creature appears, is
surrounded by sand, dissolves into it, the gemstone, bar and symbol appear separately and assemble,
and the completed piercing holds. It was to be used as supplied, not recreated in CSS and not
replaced. No credits were spent and nothing was generated.

- **The master stays out of the repository.** It is HEVC Main 10 with an AAC track, which most
  browsers cannot play. It lives in `references/generated/product-animation/` (gitignored) with the
  frames used to time the captions. Web versions were made with ffmpeg from the source, once:
  `film.mp4` (H.264 High 4.1, CRF 22, faststart, AAC 96 k, 2.6 MB) and `film.webm` (VP9 CRF 33,
  Opus 80 k, 1.2 MB), plus `poster.jpg` (first frame) and `final.jpg` (last frame), all in
  `public/media/product-animation/desert-eye-love/`. WebM is listed first, MP4 is the fallback.
- **A `film` on the product, resolved by form.** `ProductFilm` on the product type names the forms it
  shows (`anti-eyebrow` only: that is the piece in the footage), its sources, poster, final frame,
  duration, timed captions and an `approvedForPublication` flag; `filmFor(product, formId)` returns
  it only for a covered, approved form. Micro dermal and nose keep the drawn assembly, and every
  other design keeps it as its product view, so the architecture stays the fallback.
- **Same rules as a reveal.** `components/catalog/ProductFilm.tsx` never autoplays and never starts
  on hover; the page holds only the poster (94 KB, lazy) until a press, then mounts the video and
  loads it; sound is off unless the customer turns it on; Skip is available at once; after the
  film the last frame holds and Replay is offered; a load that fails or stalls for 8 s, and reduced
  motion, show the final frame instead. Changing form or leaving the page unmounts the film. The
  owner's brief said "play once when appropriate"; the project rule that reveals never autoplay
  was kept, so the first play is always a press.
- **Words are HTML, timed to the seating moments** read from the frames: the gemstone at 6.0 s,
  the bar at 6.4 s, the symbol at 7.1 s; all three once the piece is complete. Only "Deep-red faceted
  gemstone — Material not yet confirmed", "Titanium — Proposed" and "Polished finish — Proposed".
  They sit over the quiet lower-left of the picture on a wide screen and under the frame on a phone.
  The caption line under the stage says "Prototype product animation · concept hardware · not a size".
- **A contained 16:9 frame everywhere.** Nothing is cropped on a phone; the whole assembly stays in
  view and the controls sit under the frame.
- **Face Studio never uses it.** The film is presentation. Face Studio and every preview still draw
  the exact product assets on the customer's photo or the sculpted head.
- **The superseded concept-reveal tab** is hidden on a form that has a film; development fixtures
  (`?revealFixture=…`) can still open it, so the reveal player's own tests keep running.
- **Rights.** The creature is generated concept art the owner approved for this page. It is not a
  photograph of a franchise character, but it is close in spirit to one, and the standing rights review
  before public use applies to it as much as to the symbol. The branch is not deployed to production.
- **Test formats.** Playwright's bundled Chromium has no H.264 decoder and its WebKit decodes neither
  delivery format, so playback is verified in Chromium through the WebM; poster, fallback, reduced
  motion and layout are verified in every project.

## 2026-09-22 — Visual refinement pass (HYBRID structure approved, no redesign)

The owner approved the HYBRID structure as built and ordered a refinement pass from the 22 September
visual review (`references/review/2026-09-22-hybrid-review/REVIEW.md`), in a fixed priority order:
hardware, homepage hero, Face Studio, selection, mobile defects, KIRI, status copy, type and colour.
No credits were spent, no concept image or generated hardware was used, and the product artwork is unchanged.

- **Concept hardware is drawn to jewelry proportions, and says so.** The surface bar is one slim base
  with two short equal risers and a small collar under each top; the dermal anchor is a short post on a
  low 14-unit footplate; the nose form is a nostril screw, a short post with a curved tail that belongs
  to the post layer so the exploded view never splits a one-piece screw. The metal gradient is a
  polished-titanium ramp with a bright edge and a dark turning band, and the hardware casts its own
  soft shadow. Real jewelry was the reference for proportion and finish only. The caption reads
  "Concept hardware · type, size and thread not confirmed", and nothing carries a measurement.
- **One hero on the homepage.** `Landing` puts the featured family first at 30 vw with a faint mirrored
  reflection (`FloatingObject reflection`), mirrored across the lowest piece rather than the box edge so
  it reads as a surface under the jewelry. The three originals are 6–7 vw and secondary. The mascot is
  13 vw in the corner with its label under the picture, a detail rather than the identity. Only the
  approved headline and two actions remain.
- **Labels are solid ink or solid warm ash, never an alpha tint.** The "blue-grey" seen in the review
  was `rgba(12,12,13,0.64)` at 1× device scale: thin translucent 10 px mono type picks up subpixel
  colour fringing on Windows and reads like a link. `.story-light .text-ash` now resolves to the solid
  `--color-ash`, `.label-xs` is 11 px, and the in-scope `text-ink/NN` labels became `text-ash`.
  Garnet marks a selected or pressed state only (Face Studio side, form, target, product; the tool
  bar's pressed state).
- **Face Studio tools are words on paper.** The grey pill over the photo is gone; the tool bar is a
  hairline row under the stage that wraps and can never overflow a phone. The nudge keypad is one
  row of four arrows. The range thumb, which was ivory on ivory, has a hairline ring. On the bare
  sculpted head the piece is drawn at 1.55× the placement scale so it can be read at a glance; the
  preview is still labelled approximate and is never a size. Piece names wrap instead of truncating.
- **Selection neighbours are meant to be seen.** Slides are 50 vw on desktop and 70 vw on a phone
  inside 25 vw / 15 vw padding; neighbours sit at 50 % opacity, scale 0.9, and lean 8 % / 12 % toward
  the centre by `data-side`, so 8–15 % of the next piece shows at the edge. A neighbour's words are
  invisible and take no tap. The sand and the mascot moved inside the jewelry's box, so the sand can
  never lie behind a title and the mascot rests at the foot of the piece. The index counts browsable
  families (`01 / 04`); the KIRI slide reads `Concept · KIRI`.
- **KIRI has a concept form.** One vector chrome blade (`ConceptBlade`) with a single edge light stands
  where its piece will be. It is labelled Original / Concept, has no price, forms or bag action, and
  is a sculpture of the direction, not a product drawing.
- **One material status.** The specification section is headed "Material status" with one line,
  "Prototype specification · unverified", instead of a garnet tag on every row. DESERT EYE's rows say
  "Titanium — proposed", "Polished — proposed" and "Deep-red faceted gemstone — material not yet
  confirmed", the same words as the callouts on the piece. Nothing is confirmed by this wording.
- **The dash stays with its words.** `displayTitle()` ties " — " to the words around it with
  non-breaking spaces for display only, so "DESERT EYE — LOVE" breaks as "DESERT / EYE — LOVE".
- **Not a defect.** The review listed the Face Studio heading sliding under the sticky bar. The app
  does not scroll when a photo lands (`scrollY` stays 0 on desktop and Pixel 7); the recording script
  had scrolled. Nothing was changed for it.

## 2026-09-21 — HYBRID visual system (owner-approved direction)

The owner approved the HYBRID direction from the concept contact sheet: **Atelier Paper** everywhere,
and a restrained **Sand and Chrome** layer for DESERT EYE only. Concept images were a direction only.
No site code, geometry or jewelry artwork was taken from them, and no further credits were spent.

- **Tokens.** One light theme: paper `#FBFAF7`, ink `#0C0C0D`, garnet `#8F2337`. The old token names
  (`ash`, `line`, `coal`, `bone`) were kept and given light values, so no component needed a second
  theme. There is no dark navigation bar and no dark page left.
- **No tiles.** `ProductArtwork` no longer paints a tinted gradient behind the jewelry. The shop is a
  loose staggered pair of columns of borderless `FloatingObject` pieces, not a product grid of cards.
  Filters and search are tracked text with a hairline, not boxed chips. The bag and the cart page
  lost their outer box; quantity buttons lost their borders.
- **One motion language per family.** `motionOf()` derives it from the piece: DESERT EYE stirs a few
  grains and glints, a piece with a stone takes a small sparkle, plain metal takes one blade of light.
  Motion runs on hover or focus. Only a slow drift is constant, and reduced motion stops that too.
- **Sand is DESERT EYE's alone.** `SandLayer` appears beside the mascot on the homepage and on the
  DESERT EYE slide of the selection. It belongs to that slide, so it leaves when the next family is
  centred. KIRI and the originals stay plain paper with a chrome hairline.
- **Homepage copy** is the approved headline and the two actions only. No tagline and no body copy.
  The mascot block has no `z-index`: a stacking context would isolate its multiply blend and draw a
  white rectangle on the paper.
- **Selection and the wheel.** The owner asked for drag, wheel, arrows and keyboard. The project rule
  forbids horizontal movement driven by vertical scroll, so the vertical wheel is left to the page.
  A sideways wheel or trackpad, mouse drag, touch swipe, the Prev and Next buttons and the arrow keys
  all move the rail. This is a deliberate limit, not an omission.
- **Assembly timeline.** 0.0 to 0.6 s hardware appears separated, to 1.8 s bar and posts align, to
  2.7 s the tops approach, to 3.3 s they settle, to 4.0 s one light sweep and a gem glint. No bounce,
  spin or overshoot. The stage is keyed by form, replay count and motion preference, so it always
  starts from its own first state. With reduced motion the piece is simply assembled.
- **Hardware is conceptual and says so.** The tops are the approved prototype artwork. Bar, anchor,
  stud and posts are our own plain drawing with no measurement. The caption reads "Hardware shown
  conceptually · type, size and thread not confirmed".
- **Material callouts are page text** with leader lines, from `product.materials`: "Titanium /
  Proposed", "Deep-red faceted gemstone / Material not yet confirmed", "Polished finish / Proposed".
  The words ruby and implant-grade are never used.
- **Themed assembly is architecture only.** `product.assembly.themed` records the sand-spirit idea
  with status `not-produced`, and `PieceAssembly` has a `renderIntro` slot. Nothing is generated and
  the standard assembly never depends on it.
- **Face Studio before a photo** shows a featureless sculpted head wearing the chosen piece at the
  approved anchors, one "Use my photo" action and the form selector. Side, look list, add-piece and
  adjust controls appear only once a photo exists. Privacy handling is unchanged.

## 2026-09-21 — New direction: jewelry brand first (landing page, sideways selection, whole piece)

The owner judged the DESERT EYE presentation not good enough and changed the UX and visual direction:
cleaner, smoother, more premium, a jewelry brand first, cute in places. This supersedes the dark
five-section homepage. The DESERT EYE collection stage still exists at its address but is no longer
the way in, and no further work goes into it in its current form.

- **Landing page on paper.** One calm screen: a headline, two actions (**View on your face** → Face
  Studio, **View selection** → the selection), a small companion, then a quiet row of pieces. The
  old `HomeSections` were deleted. Nothing is pinned or driven by scroll.
- **Mini mascot.** A cute chibi figure lying on the floor reading, mini gourd on his back. He is five
  registered stills (idle, blink, yawn, page turned, looking up with a hand raised), generated as
  variations of one frame so they overlay exactly, and swapped by the page. A video of this character
  cannot be generated on this platform (`ip_detected`), so stills are the route. Idle life is small: a
  blink every few seconds, a page now and then, a rare yawn, a slow breathing scale. Pressing him makes
  him look up, and half a second later sand leaves the mini gourd, covers the page, and the selection
  opens under it. Skip and Escape open it at once. With reduced motion he holds still and is a link.
- **The mascot is internal concept art like every character picture.** Only a development server has
  it. A build shows the featured piece in its place and the transition is a plain link.
- **The sand transition lives above every route** (`components/transition/SandTransition.tsx`), so it
  survives the navigation it hides. It reuses the keyed sand clip; its numbers moved to
  `lib/story/sand-effect.ts` so the collection story and the transition share one source. The clip is
  the clock: the route changes only once the sand covers the page.
- **The selection is sideways.** `/collections` is a horizontal scroller with snap points, one floating
  family per slide with a lot of air. A finger swipes it; arrows, arrow keys and `?family=` step it.
  It is an ordinary scroller: vertical scrolling is never taken over, so this is not the scroll-driven
  horizontal movement that was ruled out earlier. The owner asked for sideways browsing explicitly.
  Piercing type is switched in place and feeds the shared form choice, the bag and the product page.
- **The product page opens on the whole piece.** A new first view, "The piece", shows the tops, the
  posts and the base, brought together on load in about three seconds, then what each part is. It is a
  page animation, not a video, so it can follow the chosen form. The hardware is a **schematic**: a
  surface bar for the pair, an anchor for the micro dermal, a stud for the nose. Its type, size and
  thread are not confirmed by a maker, the page says so, and no measurement is given.
- **Materials are the owner's proposal, labelled as such.** "Titanium · Proposed", "Polished ·
  Proposed". The owner's example named the stone "Ruby"; the page does **not**, because the standing
  rule is "deep-red faceted gemstone" until a supplier confirms it, and the owner's own brief says to
  state only what is confirmed or proposed. It reads "Deep-red faceted gemstone · Not confirmed".
- **The face was replaced.** The placement head is now a smooth sculpted form built only from soft
  light and shade, with no drawn lines. A test counts stroked elements and expects none.
- **Paper pages.** The landing page, the selection and product pages stand on paper with the light
  navigation. Shop, Face Studio, the bag and About keep the ink theme for now.

## 2026-09-21 — Seated figure and the sand reveal (supersedes the fight storyboard)

The owner replaced the story direction: the figure **sits calmly beside the products**; a press sends
sand from his original gourd across the page; the sand covers the screen; the piercing is revealed.
**No opponent and no fight.** The brush-fighter animatic and its beats were removed.

- **Approved stills** (internal, gitignored, development server only): the seated figure on plain white
  (`references/generated/stage1/03-seated-c.png`) and a clean eye and temple close-up with **no jewelry**
  (`05-closeup-b.png`). The product overlay is back on the close-up, so the jewelry is again only ever an
  overlay. Nose and micro dermal are still framed on the older half-length portrait.
- **The figure is a still and stays one.** A picture on plain white is multiplied into the paper, so it
  has no edge and needs no mask. Nothing animates his body or face, and nothing says it does.
- **A video of the character cannot be generated on this platform.** One motion test with the seated
  still as start image ended `ip_detected` and was refunded. It was not retried or worked around.
- **The sand is separate, generic effect footage** with no character, vessel or jewelry in it, composited
  over the still by the site. One clip, 5 credits (`references/generated/stage2/07-sand-only-a.mp4`).
- **Compositing method, validated before spending:** the clip is asked for on blue and keyed in the
  browser on the GPU, per frame (`lib/story/chroma-key.ts`, `components/story/KeyedEffect.tsx`). The
  canvas has real per-pixel opacity. It is not a blend mode, not a paid background remover, and a prompt
  saying "transparent" was never relied on. A synthetic fixture proved it first: 99.7% clear at the
  start, 100% opaque at full cover, 0 blue-fringe pixels.
- **The matte uses blue dominance relative to the pixel's own brightness.** The generated "blue screen"
  was a blue studio with a gradient, a floor and shadows, not a flat key. An absolute key left the
  shadowed floor as a grey blocky haze and made shadowed sand half transparent; the relative key clears
  the ground however bright or dark and keeps sand solid even in deep shadow. Unit tests pin both.
- **Placement is measured, not assumed.** The model ignored "a quarter in from the left": the stream
  enters at the clip's left edge, at floor height. That point, measured from the clip, is pinned to the
  top of the cork on the still, found from layout so a hover transform cannot move it. While the sand
  is a ribbon it stays pinned; when it bursts it drops to the ground the figure sits on, where the
  clip's own floor lines up with the page; at the end the clip simply covers the viewport. It is only
  ever scaled uniformly and never beyond cover size. A garbage matte softens the entry edge and hides
  the clip's floor until the sand lands on it.
- **Tried and rejected:** reflecting the clip past its entry edge to hide the cut. It reads as an obvious
  butterfly shape.
- **The footage is the clock.** While the clip plays, beats follow `video.currentTime`, so a slow device
  can never reach the cut before the sand has covered the page. A stall of 5 seconds, a load that takes
  over 12, or a browser that cannot key, all skip the story to the product. It is never imitated.
- **The dialog is transparent**, so the sand moves over the live page with no frame. The product
  experience is opened when the story stops, by end, Skip or Escape. Only the first outcome counts.

## 2026-09-21 — Prototype product art for DESERT EYE — LOVE

The owner answered the production-queue decisions and authorised assets 1 and 2. Layout is frozen.

- **"Hollow" means true openwork.** A metal body with a deep-red front face, polished metallic edges and
  sides, every negative space genuinely transparent, no backing plate, no grey stud, no baked shadow.
  It must read as a small sculptural top, not a printed disc, and not as a thin plain silver outline.
- **The glyph outline in the repository is approved for prototype product art only:** the website, Face
  Studio, placement, the reveal prototype and proportion testing. It is **not** manufacturing geometry.
  Before manufacture it must be rebuilt from maker or CAD geometry and reviewed for manufacturability,
  minimum stroke thickness, strength, attachment, finishing and exact proportions.
- **Made locally from vectors, zero credits.** `scripts/render-product-art.mjs` (`npm run assets:render`)
  builds both pieces as SVG, renders them in headless Chromium, crops to the alpha box with a 2% margin
  and writes a lossless PNG master and a WebP. The symbol's SVG embeds the outline from
  `lib/studio/love-glyph.ts` unchanged, and a unit test checks that. No generation service was used.
- **One image per piece, reused by form.** The symbol serves the anti-eyebrow pair and the micro dermal;
  the gemstone serves the pair and the nose. No right-hand variant exists: positions mirror, the
  picture never does. Browser tests check for a negative horizontal scale anywhere above each image.
- **Two size numbers changed, nothing else.** The images are cropped tight, where the drawn fallback
  filled about 76% of its box, so the stone would have grown by a quarter. Pair gemstone `size` 0.20 →
  0.18 keeps it at about 0.37 of the symbol's width, the proportion in the approved reference. Nose
  gemstone `size` 0.90 → 0.72 keeps its drawn size. All `x`, `y`, the symbol's size and every
  `defaultScale` are unchanged.
- **Art class is `prototype-product-art`** for all three forms. Stills say "Prototype artwork" where exact
  art is installed and "Concept artwork" elsewhere. The stone is only ever "deep-red faceted gemstone".
- **A manufacturing observation, recorded rather than fixed.** The outline has strokes that do not touch
  each other. Openwork with no backing plate cannot hold separate islands together, so the made piece
  will need bridges, a frame or a redrawn outline. The prototype art does not invent any of these.
- **Character media waits.** No matte service, no upload of internal files, no generation and no credits
  until the owner has approved the jewelry on the site. Future internal generation may use already
  generated working outputs as look references (`references/generated/02-start-frame-full.png`,
  `04-sand-frame-full.png`), never customer photos, the owner's own reference photographs or other
  files. The live Higgsfield balance must be rechecked before any spend.

## 2026-09-21 — Visual refinement of the DESERT EYE stage

A refinement pass after the owner's visual review. The interaction model and the data-driven story
architecture did not change. No media was generated, no credits were spent, Shopify was not touched.

- **No vignette.** The half-length internal still keeps the left and bottom edges of the stage and thins
  out to the right through one mask and at the top through a veil of paper. Two composited mask layers
  were tried first and left a one-pixel hairline at fractional widths, so there is only ever one.
  Sand lies across the foot of the whole stage, so the figure stands in something. It is still shown as
  half-length: **FULL-STANDING CHARACTER ASSET REQUIRED.**
- **The stage is one screen tall, less a strip.** The sticky character and the 125 svh canvas were
  dropped. The first row of the next section sits inside the first screen and a quiet SCROLL cue points
  at it, so the page visibly continues. There is no chapter navigation.
- **Discovery.** The character has a pointer cursor and a small WATCH STORY label on the sand beside him.
  A mouse within 140 px wakes him slightly (`data-near`). Hover or keyboard focus gives a reaction of
  1.0 second: a larger shift of weight, a puff of sand and twelve grains. The story is still press-only.
- **Concept motion prototype.** The fight is a deliberate storyboard: the still in monochrome, a generic
  brush-figure opponent in ink, sand arcs drawn on, speed lines, an impact burst, two inverted frames on
  the hit, and a held block before the throw. The grey mannequin and the tan shield are gone. Internal
  review labels it "Concept motion prototype · not final footage"; a build cannot play it at all.
- **Two compositions.** Positions are set once for a wide stage and once for a tall one. Motion lines are
  authored in percent of the stage and drawn in measured pixels, so a brush stroke keeps one width. The
  story data names where the face is, and tests check at 320×568, 360×800, 390×844, 412×915, 844×390 and
  1440×900 that neither the sand arc nor the opponent crosses it and that the opponent is on stage.
- **Copy.** Timing and behaviour notes left the page. The header says WATCH STORY and "Story 01". Beat
  captions became short storyboard titles, with the full sentence kept for assistive technology.
  Internal status is one small development-only line per surface and never renders in a build.
- **Navigation.** A collection marked `stage: "light"` in `lib/config/site.ts` gets a paper bar with ink
  text and no rule. The flag lives in site config, not the story registry, so working names still never
  reach a client bundle. A unit test keeps the flag and the registry in step.
- **Hover artifact.** The grey smear was the contact shadow of the light-sweep band. The band is gone. The
  shadow now belongs to a wrapper around the jewelry alone, the metal catches light through a brightness
  pulse on the piece itself, and a small four-point glint lands on the stone or first metal part.
- **Phone.** Title, WATCH STORY, the character and the first piece share the first screen. The first piece
  floats beside his shoulder and only its jewelry and label take taps. The rest come one at a time,
  changing sides, with sand spilling from the figure's feet into the page. No horizontal scrolling.
- **Close-ups.** Nose and micro dermal use a 4:5 window at 64% of the panel with paper around it, so the
  1792 px still is never drawn wider than its real pixels at 1440×900. Their overlays are drawn a little
  larger than life so the piece can be read; it is a concept view, not a fitting.
  **CLEAN HIGH-RES CLOSE-UP WITHOUT JEWELRY REQUIRED.**
- **No double image.** The only eye close-up on disk already has the pair painted in. A slot flagged
  `paintedJewelry` is shown as the prototype reference it is, with no overlay on top, and the file is
  never altered. Clearing the flag on a clean still brings the overlay back with no other change. This
  is a deliberate, recorded exception to "the jewelry is always an overlay".
- **Try on.** With no customer photo the stand-in is the approved featureless head wearing the chosen
  form, with a slim "See it on you" strip. The grid test fixture is for tests only and is not in the
  review package. With a photo the head leaves and the photo settles in, in memory as before.
- **Brand balance.** Every story-driven stage is followed by "Original designs": CRIMSON ORBIT, VOID STUD
  and **KIRI** as `Original / Concept`, words only. KIRI has no artwork, no price and is not a product.

## 2026-09-21 — Story-driven collection page (DESERT EYE)

The owner drew the interaction wanted for special collection pages. It replaces the product-card
grid on a collection that has a story. Collections without a story keep the grid.

- **A story is data.** `lib/story/types.ts` describes a story: media slots, the cinematic's beats, the
  framing of each piercing form, where each jewelry object floats, and readiness. `lib/story/desert-eye.ts`
  is the only place DESERT EYE's character, opponent, pictures and timings are named. Replacing a
  character, a clip or a close-up means changing that file and the supplied media, nothing else.
- **Three states in one section of a normally scrolling page:** browsing, the cinematic (a native
  dialog opened by a press) and the product experience. The character is sticky only inside its own
  section on desktop. Nothing is driven by scroll position.
- **Hover is a hint, a press is the story.** Hovering or keyboard-focusing the character runs a
  1.2 second reaction. The cinematic starts only from pressing the character or WATCH STORY. This
  refines the older rule "hover never starts a reveal": hover still never starts one. Hovering a
  jewelry object only moves light, a glint and a few grains of sand, and shows its label.
- **Once per session.** One flag, `dermal-story-seen:<collection>`, is kept in `sessionStorage`. After
  the story has played or been skipped, the character opens the piece directly and the control reads
  REPLAY STORY. The flag holds nothing about a photo or a person.
- **Direct product access.** Every jewelry object is a real link carrying `?product=` and `?form=`, and
  opens the product experience in place without the cinematic. The address never carries anything else.
- **The cinematic resolves into the product.** The product experience is put in place underneath before
  the dialog opens, so Skip and Escape land on it at once. There is no navigation to another page.
- **The jewelry is always an overlay.** The close-up never supplies the jewelry. `StoryVisual` pins a
  `FormVisual` of the chosen form to an anchor on the picture, so the product asset slot feeds this
  surface too. The current internal close-up still already has painted jewelry in it; the overlay is
  drawn exactly over it. A clean close-up without jewelry is listed as a needed asset.
- **CHARACTER → YOUR FACE.** TRY ON keeps the character layer mounted and lets it go as the customer's
  photo arrives, drawn by `LookRenderer` with `previewItems`. No second overlay system exists. The photo
  stays in the Studio provider, in memory, as before.
- **Internal concept material never leaves a development server.** `lib/story/registry.ts` is read only
  by server code. Outside a development server, `storyForBuild` removes the working names and briefs,
  `internalStoryMedia` returns nothing, and `/api/dev-concept/*` answers 404. Every build, including a
  Vercel preview, therefore draws labelled placeholders. Checked on a local production build: the page
  contains neither name, no client chunk contains them, and the media route returned 404.
- **An unfinished story is not shown to customers as finished.** `canPlayCinematic` lets the labelled
  storyboard animatic play for internal review only. A build plays a cinematic only when footage
  exists, rights are cleared and the story is approved; until then the character opens the piece and the
  page says "Story in preparation". With reduced motion the story is always skipped.
- **The animatic is honest about itself.** It is built from the stills on disk and code-drawn
  placeholders, it is labelled "not the final cinematic", and the opponent is a labelled featureless
  figure because no opponent asset exists. No video was generated and no credits were spent.
- **DESERT EYE — LOVE now has a nose form.** The owner set the prototype status: anti-eyebrow is the
  approved prototype composition, micro dermal is the concept-approved hollow symbol on its own, nose
  is the concept-approved deep-red faceted gemstone on its own. Each note says "Not manufacturing-ready".
  The nose demo price (QAR 190) is the placeholder already used for the other nose concept.
  CRIMSON ORBIT's anti-eyebrow form is still concept pending and carries the tests for that state.
- **Paper inside an ink site.** The stage sets `.story-light`. Shared controls written for ink surfaces
  get darker secondary text and a darker focus ring there; an ink panel inside it opts back with `.story-dark`.
- **`useFormChoice` / `useChooseForm`** hold the form-selection logic that the family page had inline, so
  the family page and the story stage cannot drift apart.

## 2026-09-20 — Final direction (supersedes the pinned-chapter homepage below)

The owner's addendum ends the scroll-driven experiment. The pinned chapters, the `--p` scroll variable,
the horizontal collection sequence and the chapter index were deleted, along with the tests that
encoded them. What was kept from that attempt: the type system, the paper and ink palette, the
wordmark-behind-object opening, text links instead of buttons, the blended header on the homepage,
the full-screen mobile menu and the restyled Face Studio.

- **Normal scrolling.** The homepage is five ordinary sections. A browser test asserts that no full-height sticky stage exists and that the wheel moves the page one-to-one.
- **Design families.** A product owns `forms`. `formOf(product, id)` is the single gate: unknown or concept-pending form ids fall back to the default form, so they cannot reach previews, Face Studio, the bag or a URL.
- **Micro dermal form of DESERT EYE — LOVE** is a demo configuration with a single symbol top, labeled on the page as not approved. **Its nose form is concept pending** and cannot be selected. Nothing about those forms' physical design was invented beyond that label.
- **Demo prices per form** reuse the earlier placeholder tiers (390, 220, 190). They remain placeholders.
- **One shared selection.** The chosen form lives in the Studio provider (`forms[productId]`), so the family page, previews, Face Studio and the bag read the same value. The URL `?form=` is applied once on arrival and rewritten with `history.replaceState` on change.
- **Placement memory.** A look item remembers its adjustment per `form:side`. Switching form restores that form's own adjustment or starts from that form's placement default. A different placement profile never inherits coordinates.
- **Bag identity** is product plus form. The storage key moved to `dermal.demo-bag.v2`; older stored bags are ignored.
- **Reveal player.** See `docs/REVEALS.md`. The final jewelry frame is an overlay from the product asset, not part of the video. The development-only test pattern is refused by production builds.
- **Featureless head.** Drawn in code for placement previews. It is an approved device, labeled "Featureless form, not a person".
- **Second collection.** "ORIGINALS" sits beside "DESERT EYE". CRIMSON ORBIT is the complete original example, with micro dermal and nose forms and a product-led metal-sweep reveal.

## 2026-09-20 — Visual redirection (scroll mechanics superseded; visual language kept)

The owner rejected the first homepage as template-like and named a reference video
(`youtube.com/watch?v=6U3k4H346Es`). The video is a tutorial that shows three AI-built sites: a
sculpture-garden site, a personal portfolio and an astronaut scene. Its sites are scroll-scrubbed 3D
and video scenes made with generated assets.

Taken from the reference:
- One pinned full-screen frame per chapter. Scrolling moves the camera into the scene rather than down a stack of sections.
- A numbered chapter index on the right edge and a hairline progress rule.
- One object and one short statement on screen at a time. Copy crossfades while the scene moves.
- Light serif at modest sizes, tiny tracked monospace labels, underlined text links with an arrow instead of buttons.
- A giant wordmark placed behind the subject, on warm paper, before the cut to a dark scene.
- One rare accent colour.

Deliberately not imitated:
- Generated 3D scenes, scroll-scrubbed video and environment art. They need paid generation, which is not approved, and generated imagery must not stand in for the product.
- The reference's copy, logos, statues, columns, portrait and colour scheme.
- Ambient particles and shattering-glass effects. They do not serve jewelry.

How it is built:
- `useScrollProgress` writes one CSS variable, `--p`, per chapter. All motion is CSS `calc()` on that variable, so there is no animation library and no per-frame React work.
- Layers outside their progress window get `visibility: hidden`, so faded-out links cannot be clicked or focused.
- Pinned stages use `overflow: clip`, so keyboard focus can never scroll a stage sideways. Focusing an off-screen collection piece scrolls the page to bring it into frame.
- With reduced motion, every chapter renders as a plain unpinned section with all content visible.
- The homepage header has no background and uses white text with `mix-blend-mode: difference`, so it reads on paper and on ink. Inner pages use a solid bar.
- Typography is now Cormorant Garamond (display) with Geist and Geist Mono. Bodoni Moda was removed.
- Object tiles moved from dark tiles with a red glow to warm paper with a soft contact shadow.
- The Face Studio demonstration on the homepage is a line drawing labeled as an illustration. It uses the same `resolveComponents` layout as the real renderer.
- Face Studio kept all logic and test ids. Only presentation changed: text controls, a floating tool strip over the stage, a horizontal piece rail and a larger stage.
- The top "preview build" banner became a small fixed note on the homepage. Inner pages label demo products and prices inline.

## 2026-09-20 — Milestone 1

- **The master brief is the specification.** `DERMAL_MASTER_BRIEF.md` supersedes the older
  setup-only wording in `README.md` and `CLAUDE.md`. Infrastructure work is finished and is not repeated.
- **One renderer.** Face Studio, the hover panel, the mobile sheet and the product page all draw
  through `LookRenderer`, with layout from `resolveComponents`. Product artwork uses the same layout function.
- **Photo-relative coordinates.** A piece group stores its centre as 0..1 of the photo and its size
  as a fraction of the photo width. Everything inside the photo frame is positioned in percentages,
  so resizing cannot move the jewelry.
- **Wearer's side.** Layouts are authored for the wearer's left, which is the viewer's right in an
  unmirrored photo. Changing side reflects positions and rotation. Artwork is never flipped.
- **Photo handling.** The file is checked by size and by its first bytes, decoded with EXIF
  orientation applied, limited to 2,048 px on the longest edge and re-encoded to JPEG in the browser.
  Only an object URL is kept, in a React provider above all routes. Nothing is persisted.
  Clearing revokes the URL and resets the look and its undo history.
- **Undo.** A whole drag is one undo step. Slider and nudge changes made within 0.8 s of each other
  merge into one step.
- **Switching product** keeps the customer's position, size and rotation when the placement is the
  same, and drops per-piece tweaks because pieces differ between products.
- **Hover panel has no upload button.** A hover panel closes when the file dialog takes focus, which
  would discard the chosen file. The panel links to Face Studio instead. The mobile sheet and the
  product page, which stay open, do offer upload.
- **Demo bag** stores product ids and quantities in `localStorage`. It never stores anything about a photo.
  A pair is one product, so "Add look to demo bag" adds each distinct product once.
- **Commerce mode** comes from `DERMAL_COMMERCE_MODE` and defaults to `preview`. The checkout route
  refuses every request unless the mode is `live`, and live checkout is not built.
- **Symbol artwork.** The outline of U+611B comes from the Yuji Boku font (SIL Open Font License 1.1)
  and is drawn as original concept artwork. It is a placeholder, not a product drawing, and the
  design still needs a rights review before public use.
- **`@types/node` moved to 24** to match the Node 24 runtime and vitest's peer requirement.
- **Robots.** The whole site is `noindex` while it shows demo products.
