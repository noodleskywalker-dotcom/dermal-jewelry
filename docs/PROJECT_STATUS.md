# DERMAL — project status

Last updated: 20 September 2026. Branch: `feat/dermal-first-slice`.

Statuses used here: planned, implemented, tested, owner-approved, blocked, deferred.
"Tested" means an automated or recorded check actually ran. See `docs/TEST_REPORT.md`.

## Current milestone

Milestone 1, the first vertical slice, is implemented and tested locally. It is waiting for owner review.
Nothing is owner-approved yet. Nothing was merged to `main` or deployed to production.

## Visual redirection (20 September 2026)

The owner replaced the first visual direction. The homepage is now a four-chapter scroll sequence
(the piece, Face Studio, the collection, the close) with a new type system, light and dark chapters,
a rebuilt navigation and a restyled Face Studio. Status: implemented and tested, awaiting owner review.
Reasons and limits are in `docs/DECISIONS.md`. Before and after screenshots are in `docs/screenshots/`.

## What exists

| Area | Status | Notes |
| --- | --- | --- |
| Design tokens, fonts, layout, navigation, footer | tested | Dark editorial system in `app/globals.css`. Cormorant Garamond for display, Geist and Geist Mono for UI. |
| Homepage | tested | Hero, placement selector, Collection 001, try-on explanation, transparency section. |
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
