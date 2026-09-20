# DERMAL — project status

Last updated: 20 September 2026. Branch: `feat/dermal-first-slice`.

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
| Design-family page, DESERT EYE — LOVE | tested | Anti-eyebrow and micro dermal are available. Nose is concept pending and cannot be chosen. |
| Original example, CRIMSON ORBIT | tested | Micro dermal and nose are available. Anti-eyebrow is concept pending. |
| Form switching (visual, piece count, placement preview, price, package, URL) | tested | |
| Form consistency across reveal, placement preview, try-on, Face Studio and bag | tested | Shared selection in the Studio provider. |
| Per-form and per-side placement memory | tested | A nose form never starts from cheek coordinates. |
| Bag lines per form | tested | Two forms of one design are two lines. |
| Reveal player framework | tested | Play, skip, replay, sound, expand, close, failure fallback, reduced motion, eight-second ceiling, no hover start, on-demand loading. Playback itself was tested with a labeled test pattern in Chromium only. |
| Gaara-inspired mini-scene | **media missing** | Player implemented, storyboard prepared, source video missing, not approved. Customers see a still with "Reveal in preparation". |
| Metal-sweep loop for originals | implemented, not owner-approved | Drawn in CSS, no media file. |
| Featureless-head placement preview | tested | Approved device, labeled as not a person. |

## Asset production phase (started 20 September 2026)

The interaction architecture is approved as the working foundation. No redesign and no new major
features are planned. Work is now art direction and asset production, and **nothing has been
generated or spent yet**.

- `docs/production/ASSET_MANIFEST.md`: the seven assets needed per form. Anti-eyebrow assets are needed; micro dermal and nose are **design required**.
- `docs/production/PRODUCTION_PLAN.md`: the public IP boundary, the 7.0 second storyboard, exact Higgsfield prompts and shot specifications, the minimum test plan (3 generations, about 8 credits), the premium plan (about 110 credits), three katana-geometry directions for an original piece, the media specification, and the list of approvals needed before any generation.

- `docs/production/ASSET_SLOT.md`: the exact product asset slot. One transparent image per form is the single visual source on every surface, through `components/catalog/FormVisual.tsx`. **The slot is empty**, so every surface still shows the labeled code-drawn fallback. The development-only reveal prototype and its sand-frame grade are described there too.

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
| Collections index and DESERT EYE page | tested | |
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

`/`, `/shop`, `/shop?placement=dermal`, `/collections`, `/collections/desert-eye`,
`/product/desert-eye-love`, `/face-studio`, `/face-studio?product=sand-vortex`, `/cart`, `/about`.

## Next concrete task

Owner review of the slice. Then Milestone 2: Shopify catalog and cart behind the same provider
interface, using the private token header server-side only.

## Open items for the owner

1. An approved full-face sample photo, if sample mode is wanted.
2. Rights review of the symbol design before any public use.
3. Verified product data: metal, finish, dimensions, thread system, stone identity, package contents.
