# CLAUDE.md — DERMAL project instructions

DERMAL is a premium facial-jewelry storefront with a browser-local Face Studio, personalized
product previews and Shopify as the commerce backend.

Read `DERMAL_MASTER_BRIEF.md` for requirements and `docs/PROJECT_STATUS.md` for current progress.
The brief holds the full roadmap. Build only the active milestone and carry unfinished work forward honestly.
`README.md` holds the original concept and setup notes.

Infrastructure is connected and verified. Do not recreate accounts, projects, stores or credentials,
and do not run another setup-only cycle. Development is authorized.

## Identifiers

- Folder: `C:\Users\USER\Desktop\dermal-jewelry`
- Repository: `noodleskywalker-dotcom/dermal-jewelry`
- Vercel project: `openlimits/dermal-jewelry`
- Shopify: `vxh01e-0d.myshopify.com`, Headless storefront "DERMAL Web Store"
- Environment names: `SHOPIFY_STORE_DOMAIN`, `SHOPIFY_STOREFRONT_ACCESS_TOKEN` (a private token), `SHOPIFY_API_VERSION` (`2026-07`)

## Work style

1. Confirm the directory and `git status`. Preserve unrelated and uncommitted work.
2. Inspect before editing. Do not claim a file or integration exists without looking.
3. Make a short plan, then build a small testable slice. Use sensible defaults and avoid routine questions.
4. Run `npm run lint`, `npm run typecheck`, `npm test`, `npm run test:e2e` and `npm run build`. Fix failures.
5. Update `docs/PROJECT_STATUS.md` and record notable choices in `docs/DECISIONS.md`.
6. Report in complete sentences with real test evidence and remaining limits, even when a compression skill is active.

This Next.js version has breaking changes. Read `node_modules/next/dist/docs/` before using an API (see `AGENTS.md`).
Do not add a heavy library when native code is enough. No framework migration or broad upgrade without a concrete reason.

## Safety and authorization

Work on a feature branch and commit meaningful checkpoints. Never force-push, rewrite public history,
delete `.git`, or run destructive cleanup. Do not merge to `main` or deploy to production without explicit approval.

Ask before: purchases, plan or billing changes, billed creative generation, ads, marketing sends,
publishing products, real orders or refunds, removing integrations, rotating credentials, or deleting data.
A browser login is not blanket authorization.

Never print secrets or whole environment files. Keep `.env.local` ignored and preserve every key in it.
Keep Shopify credentials server-only and out of `NEXT_PUBLIC_*`, screenshots, logs and client bundles.

## Product and visual direction

Dark editorial: near-black, warm ivory, garnet, restrained silver. Large expressive type, strong product
detail, generous space, purposeful motion. Avoid generic SaaS cards, heavy rounding, random gradients,
neon gamer styling, scroll hijacking, fake trust signals and clutter. Mobile is a first-class layout.

Preserve the approved anti-eyebrow pair: upper and outer openwork symbol, lower and inner small deep-red
faceted gemstone, on a diagonal. Never bring back a grey ball. Say only "deep-red faceted gemstone"
until a supplier confirms the stone.

Never invent material standards, dimensions, thread size, compatibility, gemstone identity,
certifications, scarcity, reviews, lead times or inventory. Mark unknown values as unverified.

Franchise imagery is internal concept material pending a rights review. `references/` is local only:
gitignored, never in `public/`, never uploaded to an external service. Use only files actually on disk.

## Face Studio

Photos and any face data stay in browser memory. No upload, storage, analytics, replay, logging or URLs.
Clear photo must clear every dependent preview and release the object URL.
All surfaces draw through `components/studio/LookRenderer.tsx`; do not build a second overlay system.
Positions are photo-relative, and changing side mirrors positions but never the artwork.

The 2D preview is approximate. It is not a fitting or a piercing-safety assessment.
A tilted photo is not a side view. Head motion and 3D are a later milestone.

## Commerce and marketing

Modes are preview, waitlist and live. Demo products must never reach Shopify or a real checkout, and the
server must refuse purchasing outside live mode. Shopify is the authority for real prices, inventory and
cart totals. Send the private token with `Shopify-Storefront-Private-Token` from server code only.
An HTTP 200 with GraphQL errors is a failure. Preserve QAR support.

Marketing starts as drafts and disabled, consent-aware hooks. No fake signup success, reviews or scarcity.
No tracking services, ads, outreach or emails without approval. Use Higgsfield for creative work only,
never for exact product geometry, and never spend credits without approval.

## Accessibility and performance

Semantic controls, labels, keyboard alternatives to dragging, visible focus, useful alt text,
reduced-motion support and roughly 44 px touch targets. Keep face models, 3D engines and other heavy
code off ordinary shopping pages.

## Testing and handoff

Test real interactions in Playwright with the non-personal fixture in `tests/fixtures/`.
Cover mobile, keyboard, photo privacy and error states. Never claim a test ran when it did not.
A passing build is not proof that the UI works.

Optional plugins (Superpowers, Context7, Shopify AI Toolkit, Caveman) are aids. A plugin failure must not
block unrelated work. Do not enable Caveman proxy, routing or compression features.
