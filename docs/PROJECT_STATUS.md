# DERMAL — project status

Last updated: 22 September 2026. Branch: `feat/dermal-first-slice`.

Statuses used here: planned, implemented, tested, owner-approved, blocked, deferred.
"Tested" means an automated or recorded check actually ran. See `docs/TEST_REPORT.md`.

## Current milestone

Milestone 1, the first vertical slice, is implemented and tested locally. The HYBRID **structure** is
owner-approved (22 September 2026); the visual refinement built on it below is waiting for owner review.
Nothing was merged to `main` or deployed to production.

## Animated mascot from local generation (24 September 2026, no credits)

Built and tested; **awaiting the owner's review**. Review package:
`references/review/2026-09-24-local-media/` (desktop and mobile, plus the local transition composite).

| Area | Status | Notes |
| --- | --- | --- |
| Mascot idle and reaction clips | tested | Generated locally on the RTX 4060 Ti; served by the internal dev route, never in `public/`. |
| Multiply blending instead of keying | tested | No video rectangle on the ivory page. |
| Yields to other video | tested | Pauses while any other clip plays, resumes when the page is quiet. |
| Reduced motion | tested | Five stills, direct navigation, no sand. |
| Full-frame sand wipe and composite | tested locally | Proven in `gaara-transition-full.mp4`; the site's own sand transition is unchanged for now. |
| HORUS TRACE | unchanged | The existing site clip is better lit than the local 1440p version. |
| DESERT EYE subtle motion | held | Kept as a library asset; nothing on the site is weaker than it. |

## BLADE TRACE (23 September 2026, no credits)

Built and tested; **awaiting the owner's review**. Review package:
`references/review/2026-09-23-blade-trace/` (desktop and mobile).

| Area | Status | Notes |
| --- | --- | --- |
| BLADE TRACE in the catalogue | tested | Inspired · Weapon form, unisex, micro dermal; third in the rail, in the full collection, the shop, men and women. |
| Concept artwork and diagonal placement | tested | Drawn from the worn reference; blade, ribbed grip and ring, rotated 18°. |
| Product page | tested | The piece · Placement · Try on. No 360° and no assembly film are shown, because no media exists. |
| Own motion, local code only | tested | One thin light along the edge, a small step forward, then rest. |
| Face Studio | tested | Selectable with move, scale and rotate; the rail no longer hides its first pieces. |
| HORUS TRACE | frozen | In motion · Front · Angle · Detail · Placement · Try on, unchanged. |

Higgsfield is unavailable (0.68 credits) and nothing was generated.

## HORUS TRACE as the second hero (23 September 2026, 41 credits)

Built and tested; **awaiting the owner's review**. Review package:
`references/review/2026-09-23-horus-hero/`.

| Area | Status | Notes |
| --- | --- | --- |
| Four references located and stored internally | done | `references/products/`, gitignored; the fourth is unassigned and flagged for the owner. |
| Artwork redrawn from the references | tested | HORUS TRACE is one whole piece with its own hardware; CROSSLINE and ANKH TRACE follow their worn references. |
| HORUS TRACE prepared media | tested | Hero clip, angle and macro stills, generated from the reference and labelled as a prototype render. |
| Product page: The piece · Hardware · Placement · Try on | tested | No 360° is shown, because none exists. |
| Order and taxonomy | tested | DESERT EYE, HORUS TRACE, CROSSLINE, ANKH TRACE; featured, signature, symbolic and ancient lines. |
| Face Studio and placement previews | tested | All three selectable, manual tools only. |

The product stage is the owner's multi-view system: In motion, Front, Angle, Detail, with Placement
and Try on beside it. The clip ships at 1920 x 1080.

Gaps: no exact per-piece art, CAD, photography, 360° or assembly media for any of the three. The orbit
needs about 96 credits; the balance is 0.68, so no further generation is possible. A 4k upscale of the
hero clip was attempted on the remaining balance, cost 4 credits and returned nothing (no job was
created); see `references/generated/horus/RECORD.md`.

## Three concept families (23 September 2026, no credits)

Built and tested; **awaiting the owner's review**. Review package:
`references/review/2026-09-23-three-families/` (desktop and mobile captures of the full collection, the
selection, the three product pages, the HORUS TRACE placement and try-on, and all three in Face Studio).

| Area | Status | Notes |
| --- | --- | --- |
| CROSSLINE, ANKH TRACE, HORUS TRACE in the catalogue | tested | Unisex; lines Signature, Symbolic and Ancient; in the full collection, the selection, the shop and Face Studio. |
| Concept presentation | tested | No price, no bag, an explicit "Concept product" notice, and no claim from the supplied poster. |
| Concept placeholder artwork | tested | Drawn from the written description in `JewelryArt.tsx`. |
| Placement previews | tested | CROSSLINE and ANKH TRACE on the upper cheek (dermal), HORUS TRACE at the anti-eyebrow. |
| Face Studio | tested | All three selectable, with move, scale and rotate unchanged. |
| Own motion per family | tested | Sweep, pendulum, eye. No sand. |

Gaps: **the three reference images never arrived**, so no exact product art, CAD, photography, 360°
media or assembly media exists for any of them (see `docs/ASSET_REGISTER.md`). The artwork is a stand-in
and should be redrawn once the references are supplied.

## Cinematic remake (22 September 2026, about 313 credits)

Built and tested; **awaiting the owner's visual review**. Rollback: commit `4305f8b` (the final master
redesign). Review package: `references/review/2026-09-22-cinematic-remake/` (desktop and mobile
captures of every new section, `video/walkthrough-desktop.webm`, `video/walkthrough-mobile.webm`).

| Area | Status | Notes |
| --- | --- | --- |
| Opening shot (muted ambient loop, pause control, poster first) | tested | Generated from the exact approved frame; still with reduced motion. |
| The turn (72 frames from the 4k orbit) | tested | Now "01 / The piece"; the headline moved to the opening shot. |
| The world (golden-hour dunes loop, three words) | tested | No character in the video. |
| The companion (the small reader on a dune) | tested | Full-bleed on wide screens, picture then words on a phone; corner companion steps aside while he is on screen. |
| Macro scrub (pinned push into the stone, four callouts) | tested | 1080p frames; the 4k macro upscale hung and was stopped. |
| Close views (four crops of the 4k frame) | tested | Sharp at full size. |
| The piece (meaning and safe material wording) | tested | Symbol, stone and metal notes use the owner's wording. |

Limits: the hero clip frames the piece small, so CSS enlarges it; the orbit's rear stays conceptual;
character video remains blocked by the platform and was not attempted; the Gaara art is internal
concept material pending a rights review. The test WebKit build has no video decoder, so WebKit tests
see the poster.

## Final master redesign (22 September 2026, no credits)

Built, tested, pushed; **awaiting the owner's visual review**. Rollback tag `pre-redesign-2-c0aff80`.
Review package: `references/review/2026-09-22-master/` (27 numbered captures and `walkthrough.webm`).

| Area | Status | Notes |
| --- | --- | --- |
| Material hotspots (gemstone, bar, symbol) | tested | Owner's wording, "pending" for every unknown; keyboard and phone sheet. |
| Film poster is the jewelry | tested | Creature only after Play. |
| 360° rear note only at the rear | tested | |
| Ways-in rail (7 worlds) | tested | Homepage and /collections. |
| Audience and line taxonomy | tested | Data model and shop filters. All pieces unisex; no limited edition. |
| Companion on every page | tested on the dev server | Lower right, same size everywhere; glance on hover; direct link off the homepage. |

Placeholders: sections 03 and 04 still use stills until MEDIA 02; the orbit's rear is conceptual;
men / women / limited are empty categories until the owner assigns pieces.

## Full visual redesign (22 September 2026, no credits)

The visible site was rebuilt to a luxury-watch-launch standard; the engine was kept (see
`docs/DECISIONS.md`). Rollback tag `pre-redesign-d6fef76`. Built, tested, pushed; **awaiting the
owner's visual approval**. Review package: `references/review/2026-09-22-redesign/` (1440×900,
1920×1080, Pixel 7, 360×800, 844×390, and `walkthrough.webm`).

Known placeholders: sections 03 and 04 use stills from the approved film and orbit until MEDIA 02;
the macro views are enlarged crops of a 1080p render and are soft at full width; the orbit's rear is
conceptual; the film's first frame is the creature.

## The launch film (22 September 2026, no credits)

The homepage is now a cinematic product site in the owner's nine-section flow (see `docs/DECISIONS.md`).
Built, tested locally and pushed; **not owner-reviewed as built**. Sections 03 and 04 run on stills
from the approved film and orbit until MEDIA 02 is approved.

| Area | Status | Notes |
| --- | --- | --- |
| 01–02 opening: orbit turned by scroll, name then headline and two text-link ways in | tested | One pinned stage. Piece fills the screen; portrait screens enlarge the frame. |
| 03 Crafted in sand | tested | Vortex still over the viewport, three words, the mascot here only. Placeholder for MEDIA 02. |
| 04 Material | tested | Three enlarged crops of the orbit frame, "Prototype render, enlarged · not a size". Placeholder for MEDIA 02. |
| 05 Assembled with intent | tested | The approved film. |
| 06 The forms | tested | Form switches in place; carries to the product page. |
| 07 See it on you | tested | Close crop of the sculpted head around the placement. |
| 08 Collection | tested | The sideways rail on the homepage. |
| 09 Last frame | tested | Three lines, two links. |
| Navigation | tested | Transparent over the opening, paper veil after scroll, Search added. |
| Product page 360° and Exploded views | implemented | `OrbitViewer` from the orbit stills; rear side labelled conceptual. |
| Face Studio close crop | tested | 1.9× around the chosen placement before a photo. |

## Cinematic homepage (22 September 2026, no credits)

From the owner's cinematic brief. Built and tested locally; the two new media clips wait for the
owner's credit approval, so their sections run on placeholders from the approved product animation.

| Area | Status | Notes |
| --- | --- | --- |
| Scroll-scrub hero (`ScrubHero`) | tested | One pinned stage, 72 stills of the **approved hero orbit (MEDIA 01)** scrubbed by scroll, words in order, keyboard scroll, reduced-motion still, frames fetched once. Rear of the piece in the orbit is conceptual only. |
| Story section | tested | "DESERT EYE / Sand. Solitude. Identity." with the vortex still and drifting grains. **Placeholder** for MEDIA 02 macro fly-through. |
| Assembly section | tested | The approved film with the three material lines. Real media. |
| Cursor light on chrome, KIRI blade sweep | implemented | CSS only. |
| MEDIA 01 hero orbit | done | `seedance_2_5`, 96 credits. Record in `references/generated/orbit/RECORD.md`. |
| Hero product image (STEP 1) | rejected | `nano_banana_pro`, 2 credits: symbol and hardware reinterpreted. Film `final.jpg` is the product reference instead. |
| Identity motion test | passed | `seedance_2_0_mini`, 5 credits. |
| MEDIA 02 macro fly-through | **awaiting approval** | 96 credits proposed. Story section still on the vortex still. |
| Credits this stage | 103 spent | Balance 462 → 359. |
| MEDIA 03 assembly | done | Existing approved film, not regenerated. |
| MEDIA 04 mascot | done as far as the platform allows | Stills, idle code, sand clip. Character video is blocked by the IP filter; not retried. |
| Lenis / smooth scroll | not used | Native scroll. |

## DESERT EYE product animation (22 September 2026)

The owner's approved Higgsfield sequence is the product animation for DESERT EYE — LOVE, anti-eyebrow
form, on the product page's stage. Built and tested locally, pushed to `feat/dermal-first-slice`,
**not owner-reviewed as built**, not merged, not deployed to production. No credits, nothing generated.
Details in `docs/DECISIONS.md`.

| Area | Status | Notes |
| --- | --- | --- |
| Web delivery from the supplied master | done | `film.webm` 1.2 MB, `film.mp4` 2.6 MB, poster and final frame, in `public/media/product-animation/desert-eye-love/`. The HEVC master stays in `references/`. |
| Product stage: poster, Play, Skip, Replay, sound off by default, hold on the last frame | tested | Nothing loads before a press; never autoplays; one media request per play. |
| Material words as timed HTML overlays | tested | Gemstone 6.0 s, bar 6.4 s, symbol 7.1 s; all after the end. Safe wording only. |
| Failure and slow-network fallback | tested | Aborted media → completed-piece still with a note; a 1.5 s delay → "Loading…" then playback; 8 s stall → fallback. |
| Reduced motion | tested | Completed piece and all words, no playback offered, no media requested. |
| Keyboard | tested | Play, Skip and Replay by Enter and Space. |
| Form switching and returning from Try On | tested | Other forms use the drawn assembly; coming back finds the poster. |
| Phone | tested (Pixel 7) | Contained 16:9 frame, nothing cropped, controls under the frame, words under the frame. |
| Face Studio | tested | No film, no video element, with or without a photo. |
| Concept-reveal tab | hidden on the filmed form | Still reachable with the development fixture for its own tests. |

Limits: the poster is the film's first frame (the creature), as the owner asked, so the first thing
on the product page is the creature rather than the jewelry; there is no 3D view, so "view the
completed piece" is the held last frame plus the placement preview and try-on tabs; the creature is
generated concept art and the rights review before public use applies to it.

## Visual refinement pass (22 September 2026)

Built from the owner's brief after the 22 September visual review, in the owner's priority order.
Tested locally, **not owner-approved**. No credits spent, no generated media, Shopify untouched.
Decisions are in `docs/DECISIONS.md`; the review packages are local only under `references/review/`.

| Area | Status | Notes |
| --- | --- | --- |
| Product-page concept hardware | tested | Slim surface bar with two short risers and collars; low footplate anchor; nostril screw with curved tail. Polished-titanium gradient, own contact shadow. Caption "Concept hardware · type, size and thread not confirmed". No measurements. |
| Assembly (4.0 s) | tested for states, visually reviewed by the builder | Tighter shadows, narrower light blade with a halo, shorter exploded offsets. |
| Homepage hero | tested | One 30 vw DESERT EYE piece with a faint reflection, three small originals, mascot 13 vw in the corner. Headline and the two actions unchanged. |
| Face Studio | tested | Hairline tool row under the photo (no pill, no overflow), garnet only for selected states, piece 1.55× on the bare head, names wrap, visible slider thumb, nudge as one row. |
| Selection | tested | 8–15 % of the next family visible at either edge at 50 % opacity, leaning in by side. Sand inside the jewelry's box, mascot at the foot of the piece. Index `01 / 04`; KIRI reads `Concept · KIRI`. |
| KIRI | tested | One vector chrome blade with an edge light. Original / Concept, no price, no product. |
| Material status | tested | One "Prototype specification · unverified" line; rows in words, no garnet tags. |
| Type and colour | tested | Labels solid ink or solid warm ash; no alpha tints (they fringed blue at 1×). 11 px labels. |
| Mobile defects | tested at 320×568, 360×800, 390×844, 412×915, 844×390 | Tool bar clipping, sand behind text, orphaned dash and truncated names fixed. The "heading under the sticky bar" was the recording script scrolling, not the app. |
| Shop, bag, cart | tested | Only the label colour cleanup. Not redesigned. |

## HYBRID visual system (21 September 2026)

The owner approved the HYBRID direction: Atelier Paper everywhere, Sand and Chrome for DESERT EYE only.
It is implemented across the site on `feat/dermal-first-slice`. It is **not yet owner-reviewed as built**.
No credits were spent, no concept image was used as site artwork, and Shopify was not touched.

| Area | Status | Notes |
| --- | --- | --- |
| One light token set, light navigation on every page | tested | Paper `#FBFAF7`, ink `#0C0C0D`, garnet `#8F2337`. No dark page remains. |
| Homepage | tested | Approved headline and two actions only. Floating pieces with cursor depth. Mascot rests on a small sand patch. |
| Mascot idle and click-to-sand transition | tested | Internal stills and clip, development server only. Never in a production build. |
| Selection rail | tested | One family centred, neighbours peek, drag, swipe, arrows, keys, sideways wheel. The vertical wheel stays with the page by project rule. |
| Sand only on DESERT EYE | tested | The layer belongs to that slide and fades when the next family is centred. KIRI is words and a chrome hairline. |
| Product page, about two thirds stage | tested | Complete piercing by default: tops, posts, base. Exploded view and replay. |
| Assembly timeline (4.0 s, no bounce or spin) | tested for states, visually reviewed by the builder | Owner review pending. |
| Material callouts as page text | tested | "Titanium / Proposed", "Deep-red faceted gemstone / Material not yet confirmed", "Polished finish / Proposed". |
| Themed sand-spirit assembly | architecture only | `assembly.themed.status` is `not-produced`. No clip exists and none was generated. |
| Face Studio sculpted head before a photo | tested | Secondary controls appear only with a photo. Privacy handling unchanged. |
| Shop, cart, bag drawer, mobile menu, About, not-found | tested | Borderless pieces, no tinted tiles, no boxed filters. |

Placeholders that remain: conceptual hardware drawing, prototype product art for DESERT EYE — LOVE,
drawn concept art for the three originals, KIRI without artwork, internal-only mascot and sand clip
(the clip still has a straight entry edge for about 0.6 s and a dark final cover), and the reveal video.

## Final direction (20 September 2026)

The owner's addendum is the current direction: normal vertical scrolling, original and anime-inspired
designs side by side, one design-family page with several piercing forms, optional short concept
reveals, and Face Studio at the centre. The earlier pinned-chapter homepage was removed.
Details are in `docs/DECISIONS.md` and `docs/REVEALS.md`.

| Area | Status | Notes |
| --- | --- | --- |
| Normal-scroll homepage | tested | Opening, featured family, Face Studio demonstration, the pieces, close. |
| Design-family page, DESERT EYE — LOVE | tested | Anti-eyebrow, micro dermal and nose are available (nose since 21 September 2026). |
| Original example, CRIMSON ORBIT | tested | Micro dermal and nose are available. Anti-eyebrow is concept pending. |
| Form switching (visual, piece count, placement preview, price, package, URL) | tested | |
| Form consistency across reveal, placement preview, try-on, Face Studio and bag | tested | Shared selection in the Studio provider. |
| Per-form and per-side placement memory | tested | A nose form never starts from cheek coordinates. |
| Bag lines per form | tested | Two forms of one design are two lines. |
| Reveal player framework | tested | Play, skip, replay, sound, expand, close, failure fallback, reduced motion, eight-second ceiling, no hover start, on-demand loading. Playback itself was tested with a labeled test pattern in Chromium only. |
| Gaara-inspired mini-scene | **media missing** | Player implemented, storyboard prepared, source video missing, not approved. Customers see a still with "Reveal in preparation". |
| Metal-sweep loop for originals | implemented, not owner-approved | Drawn in CSS, no media file. |
| Featureless-head placement preview | tested | Approved device, labeled as not a person. |

## Story-driven collection page (21 September 2026)

The owner's drawn interaction for special collection pages is implemented for DESERT EYE and tested
locally. It is **not owner-approved yet**, was not merged, and was not deployed. No video was generated,
no Higgsfield credits were spent, and Shopify was not touched.

| Area | Status | Notes |
| --- | --- | --- |
| White full-viewport stage, character on the left, no card or frame | tested | `/collections/desert-eye`. Collections without a story keep the product grid. |
| Borderless floating jewelry objects with small labels | tested | Four objects: three forms of DESERT EYE — LOVE and SAND VORTEX. Each is a link with the name, form, demo price and TRY ON. |
| Object hover micro-interactions | implemented, inspected by screenshot | Lift, slight rotation, light sweep, gemstone glint, sand grains, label. Hover never plays a story. |
| Character micro-reaction on hover or keyboard focus | tested | 1.2 seconds, then idle. Tested that it never opens the cinematic. |
| Cinematic from a press or WATCH STORY | tested | 6.5 seconds in five beats from story data. Skip → focused at once, Escape skips. **It is a labelled storyboard animatic from stills and placeholders, not a film.** |
| Resolves into the product experience, in place | tested | Piercing type, views (Concept, Placement, Try on), demo price, Add to demo bag, link to full details. |
| Piercing-type transition | tested | Anti-eyebrow: eye and temple close-up. Nose: attention moves to the nose, single gemstone. Micro dermal: single symbol on the cheekbone. Framing is data per form. |
| CHARACTER → YOUR FACE try-on | tested | Same `LookRenderer`, same in-memory photo. Tested: blob URL only, no non-GET request, nothing in the address or session storage. |
| Skip, once per session, REPLAY STORY | tested | One `sessionStorage` flag per collection. |
| Direct product access | tested | Object press and `?product=&form=` address both skip the cinematic. |
| Mobile | tested (Pixel 7 emulation) | Character, then WATCH STORY "or tap the character", then tappable objects. No hover dependence. |
| Reduced motion | tested | Story skipped, piece opens directly. |
| Internal media kept off every build | tested on a local production build | Page and client chunks contain no character names; `/api/dev-concept/*` returned 404; placeholders drawn. |
| DESERT EYE — LOVE nose form | tested | Now available as the concept-approved single gemstone. All three forms say "Not manufacturing-ready". |

Limits that remain: the character is a half-length still with a background, not a full standing
cutout; there is no opponent picture, no reaction loop and no footage; the close-up still already
contains painted jewelry under the overlay. These are listed in `docs/production/ASSET_MANIFEST.md`.
Decisions are in `docs/DECISIONS.md`, rules in `docs/REVEALS.md`.

### Visual refinement pass (21 September 2026, later the same day)

Made after the owner's visual review. It is tested locally and **not owner-approved**. Details are in
`docs/DECISIONS.md`.

| Area | Status | Notes |
| --- | --- | --- |
| Character presence without a vignette | implemented, inspected | Anchored bottom-left, sand across the stage foot. Still half-length: a full-standing cutout is required. |
| Interaction discovery | tested | Pointer cursor, WATCH STORY label, proximity wake, 1.0 second reaction. Story stays press-only. |
| Concept motion prototype | tested | Monochrome storyboard animatic replaces the mannequin and shield. Labelled in internal review, unplayable in a build. |
| Fight composition on phones | tested at six sizes | Face never crossed by the arc or the opponent; opponent on stage at the hit. |
| First-screen clarity | tested | Desktop: next section peeks in and a SCROLL cue points at it. Phone: title, WATCH STORY, character and first piece on the first screen. |
| Customer-facing copy | tested | No timing or engineering notes. Internal status is development-only. |
| Light navigation on the paper stage | tested | Paper bar, ink text, no rule, same destinations. |
| Jewelry hover artifact | fixed, inspected | No band, no smear. Lift, tilt, light catch, glint, sand grains. |
| Phone product presentation | tested | One piece at a time, changing sides, no two in a row, no horizontal scroll. |
| Close-up states | tested | Smaller crisp window for nose and micro dermal. Painted reference shown without an overlay: no ghosting. |
| Try on without a photo | tested | Featureless head stand-in. The grid fixture is for tests only. |
| Original designs on the story page, KIRI as Original / Concept | tested | Words only for KIRI: no artwork, price or product. |

### Layout frozen, asset creation next (21 September 2026)

The owner's brief after the refinement review states that the current interaction and layout
architecture is approved as the working base, and that visual layout changes stop. The next phase is
asset creation. `docs/production/PRODUCTION_QUEUE.md` lists the eight assets in the owner's order, with
dimensions, background, crop, angle, where each is used, whether current tools can make it, whether it
needs Higgsfield credits, whether product geometry is untouched, and whether it is internal only.
Nothing has been generated and no credits have been spent. Five owner decisions are listed there.

### Prototype product art installed (21 September 2026)

Assets 1 and 2 of the production queue are made and installed: the openwork symbol and the deep-red
faceted gemstone, rendered locally from vectors with **zero credits**, classified
`prototype-product-art`. They replace the code-drawn jewelry on every surface that shows DESERT EYE —
LOVE in all three forms, in every build. Other designs keep their drawn artwork. Two size numbers
changed to hold the approved proportions; see `docs/DECISIONS.md`. Assets 3 to 8 have **not** started
and no budget is approved. The owner reviews the jewelry on the site first.

### Seated figure and sand reveal (21 September 2026, local only)

The story direction changed: seated figure, sand from the gourd, full cover, reveal. No opponent, no
fight. Built and tested locally, **not pushed**, not owner-approved. Higgsfield spend this phase:
10 credits for five stills (two approved), 5 for one sand clip; one blocked character video was refunded.

| Area | Status | Notes |
| --- | --- | --- |
| Approved seated still on the stage | implemented, inspected | Multiplied into the page: no edge. A still; nothing animates the figure. |
| Approved clean close-up with product overlay | tested | Overlay is back; no painted jewelry, no ghosting. |
| Keyed sand effect over the live page | tested | Real alpha from a GPU blue key. 0 fringe pixels, 100% opaque at cover. |
| Sand starts at the opening of the gourd | tested at six sizes | Within 2 px of the cork, never stretched. |
| Full cover hides the cut | tested | The footage is the clock. No heading pixels show through. |
| Skip, Escape, Replay, once per session, reduced motion | tested | Unchanged behaviour. |
| Media not ready or not keyable | tested | Story is skipped to the product, never imitated, not marked seen. |
| Known defects | open | For about 0.6 s as the sand bursts, the clip's left edge and its floor show as straight edges. The final sand is darker and more orange than the page's sand. Both need a cleaner clip. |

### New direction: jewelry brand first (21 September 2026)

| Area | Status | Notes |
| --- | --- | --- |
| Landing page on paper with two main actions | tested | View on your face, View selection. Old homepage sections deleted. |
| Mini mascot with idle life and press interaction | tested | Five stills, internal only. 10 credits. A build shows the featured piece instead. |
| Sand transition from the mini gourd into the selection | tested | Keyed clip, route changes under full cover, Skip and Escape, plain link with reduced motion or no clip. |
| Sideways selection with in-place piercing type | tested | Swipe, arrows, keys, `?family=`. Vertical scroll untouched. |
| Product page: the whole piece, assembled, with material notes | tested | Schematic hardware per form. Materials labelled Proposed / Not confirmed. Stone not named. |
| Sculpted placement head | tested | Shading only, no drawn lines. |
| Still placeholder | open | Mascot and sand are internal-only. Hardware is a schematic, not the real part. Symbol and stone are prototype art. Shop, Face Studio, bag and About are still on the ink theme. The sand clip keeps its known edge and colour defects. |

## Asset production phase (started 20 September 2026)

The interaction architecture is approved as the working foundation. No redesign and no new major
features are planned. Work is now art direction and asset production, and **nothing has been
generated or spent yet**.

- `docs/production/ASSET_MANIFEST.md`: the seven assets needed per form. Anti-eyebrow assets are needed; micro dermal and nose are **design required**.
- `docs/production/PRODUCTION_PLAN.md`: the public IP boundary, the 7.0 second storyboard, exact Higgsfield prompts and shot specifications, the minimum test plan (3 generations, about 8 credits), the premium plan (about 110 credits), three katana-geometry directions for an original piece, the media specification, and the list of approvals needed before any generation.

- `docs/production/ASSET_SLOT.md`: the exact product asset slot. Each piece of a form has its own transparent source image (`symbol`, `gemstone`), and the form's composition metadata lays them out on every surface through `components/catalog/FormVisual.tsx`, so Face Studio can still move the pair, the symbol or the gemstone. Prototype product art and commercial product assets are classified separately. The slot was empty until 21 September 2026; it now holds prototype product art for DESERT EYE — LOVE. The development-only reveal prototype and its sand-frame grade are described there too.

Missing art is documented rather than imitated in code. The site keeps its labeled concept artwork
and stills until real assets arrive.

Next concrete step: owner approvals in section 8 of the production plan.

## Earlier visual redirection

The type system, palette, text links, blended homepage header, mobile menu and restyled Face Studio
from the earlier redirection remain. Its scroll mechanics were superseded and deleted.

## What exists

| Area | Status | Notes |
| --- | --- | --- |
| Design tokens, fonts, layout, navigation, footer | tested | Dark editorial system in `app/globals.css`. Cormorant Garamond for display, Geist and Geist Mono for UI. |
| Homepage | tested | Five normally scrolling sections. See "Final direction" above. |
| Shop with placement filter and search | tested | Filter and search live in the URL. Empty placements show an honest empty state. |
| Collections index and DESERT EYE page | tested | DESERT EYE is now the story-driven stage described above. |
| Product page (all four demo products) | tested | Demo price, unverified specs, package note, inline try-on, add to demo bag. |
| Demo catalog behind a provider interface | tested | `lib/catalog`. Demo ids start with `demo-`. |
| Face Studio, local photo | tested | Validation, local decode and re-encode, drag, scale, rotate, per-piece adjust, nudge, reset, undo, redo, side, before/after, product switch, clear photo. |
| Shared renderer | tested | `components/studio/LookRenderer.tsx` is used by the Studio, hover panel, mobile sheet and product page. |
| Personalized previews | tested | Desktop hover and keyboard focus. Mobile Try on sheet. Zooms to the placement. |
| Look (stack) | tested | Add, replace-or-add prompt, show/hide, edit, remove, add look to demo bag. |
| Demo bag | tested | Drawer and `/cart`. Quantities, removal, subtotal, empty state, survives reload. |
| Checkout guard | tested | `POST /api/checkout` returns 403 in preview mode. No Shopify call exists for demo items. |
| About page with photo-handling explanation | implemented | |
| Sample-photo mode | blocked | No approved full-face sample photo exists. The UI says it is unavailable. |
| Shopify catalog and cart | deferred | Milestone 2. The existing connection and environment variables are untouched. |
| Compare two pieces, export image, favorites, redo shortcut keys | deferred | Later milestones. |
| Contact, FAQ, policies, materials, compatibility pages | planned | Need real business details and reviewed content. |
| Marketing drafts (`MARKETING_PLAN.md`, `ADS_STORYBOARDS.md`, `ANALYTICS_SPEC.md`, `LAUNCH_CHECKLIST.md`) | planned | Not started. No tracking, signup or outreach exists in the code. |

## How to run

```powershell
npm run dev          # http://localhost:3000
npm run lint
npm run typecheck
npm test             # unit tests (vitest)
npm run test:e2e     # browser tests (Playwright); reuses a running dev server
npm run build
```

## Preview deployment

The Git integration built a Vercel **preview** (not production) for this branch:
https://dermal-jewelry-git-feat-dermal-first-slice-openlimits.vercel.app

It is protected by Vercel login, so sign in with the project's Vercel account to open it.
Its homepage content was checked through authenticated access on 20 September 2026.
Production at https://dermal-jewelry.vercel.app still serves the starter page and was not touched.
Vercel's Hobby plan is for non-commercial use; confirm the plan before any commercial launch.

## Routes to review

`/`, `/collections` (the selection), `/collections?family=crimson-orbit`, `/shop`, `/shop?placement=dermal`, `/collections`, `/collections/desert-eye`,
`/collections/desert-eye?product=desert-eye-love&form=nose`,
`/product/desert-eye-love`, `/face-studio`, `/face-studio?product=sand-vortex`, `/cart`, `/about`.

## Next concrete task

Owner review of the slice. Then Milestone 2: Shopify catalog and cart behind the same provider
interface, using the private token header server-side only.

## Open items for the owner

1. An approved full-face sample photo, if sample mode is wanted.
2. Rights review of the symbol design before any public use.
3. Verified product data: metal, finish, dimensions, thread system, stone identity, package contents.
