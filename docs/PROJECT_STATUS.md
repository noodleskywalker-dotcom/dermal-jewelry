# DERMAL — project status

Last updated: 21 September 2026. Branch: `feat/dermal-first-slice`.

Statuses used here: planned, implemented, tested, owner-approved, blocked, deferred.
"Tested" means an automated or recorded check actually ran. See `docs/TEST_REPORT.md`.

## Current milestone

Milestone 1, the first vertical slice, is implemented and tested locally. It is waiting for owner review.
Nothing is owner-approved yet. Nothing was merged to `main` or deployed to production.

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
