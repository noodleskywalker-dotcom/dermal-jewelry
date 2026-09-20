# CLAUDE.md — DERMAL project instructions

You are working on the DERMAL facial-piercing jewelry e-commerce project.

Read `README.md` before making major architecture or product decisions.

Repository:
`https://github.com/noodleskywalker-dotcom/dermal-jewelry`

Expected local Windows path:
`C:\Users\USER\Desktop\dermal-jewelry`

## Mission

Build a premium custom Next.js e-commerce experience for unusual facial piercing jewelry, with a proprietary Face Studio that lets customers upload a face photo and preview exact jewelry SKUs.

The site must not look like a generic Shopify theme.

The intended feel is luxury editorial fashion + experimental jewelry + technology.

## Core priorities

1. Keep the app working.
2. Keep changes incremental and reversible.
3. Inspect before editing.
4. Plan before broad refactors.
5. Protect secrets.
6. Keep the customer try-on accurate.
7. Do not let generative AI hallucinate product geometry.
8. Prioritize responsive/mobile quality.
9. Use Shopify as commerce backend, not as design system.
10. Commit meaningful checkpoints.

## Before every major task

1. confirm current directory
2. inspect `git status`
3. inspect relevant files
4. read `README.md` if architecture/product direction is involved
5. make a short plan
6. implement a small testable slice
7. run lint/build
8. fix errors
9. summarize changed files and test steps

Do not claim a file or integration exists without inspecting it.

## Git safety

Never:
- force push
- rewrite public history
- delete `.git`
- delete large folders without confirmation
- commit `.env*`
- commit tokens/API credentials

If the working tree contains unrelated user changes, preserve them.

## Environment secrets

Use `.env.local`.

Never move server-side secrets into `NEXT_PUBLIC_*`.

## Current stack

- Next.js
- TypeScript
- Tailwind CSS
- Git/GitHub
- Vercel
- Shopify headless / Storefront API
- Higgsfield
- Claude Code
- optional Superpowers
- optional Caveman plugin

Future:
- face landmarks
- Three.js / React Three Fiber if needed
- 3D jewelry assets
- optional Supabase

## UI direction

Use:
- black/charcoal
- off-white
- deep wine red / garnet
- polished chrome/titanium details
- large editorial typography
- negative space
- cinematic photography
- elegant subtle motion
- high-end microinteractions

Avoid:
- generic SaaS cards
- excessive rounded rectangles
- random gradients
- neon gamer aesthetic
- obvious template layouts
- clutter

## Accessibility

Use semantic controls, labels, keyboard support, sensible focus states, useful alt text, and reduced-motion support where reasonable.

## Performance

Do not add a heavy library when native code is enough.

Optimize large imagery.

Avoid huge client components and unnecessary global state.

Keep Face Studio processing local/browser-side where practical.

## Face Studio MVP

First version:
- upload image locally
- preview
- placement selector
- anti-eyebrow jewelry overlay
- two separate jewelry pieces
- drag
- scale
- rotate
- reset
- switch product
- stack panel

Do not attempt full AI head movement before this is polished.

## Face privacy

Prefer local browser processing.

Do not upload customer photos by default.

## Product accuracy

Never invent:
- material standards
- dimensions
- thread size
- compatibility
- gemstone identity
- manufacturing certification

Mark mock values as placeholders.

## Shopify

Use Storefront API for customer-facing commerce.

Keep private Admin credentials server-side.

Preserve QAR currency support.

## Higgsfield

Use Higgsfield for creative work, not exact product geometry.

Do not trigger expensive image/video batches without confirmation.

## Superpowers

If installed, use its planning/brainstorming/testing workflows for large features.

## Caveman

If installed, use conservatively.

Do not enable proxy/routing/compression behavior unless explicitly requested.

## Target components

- Navbar
- Hero
- CategorySelector
- ProductCard
- ProductGrid
- ProductDetails
- FaceStudio
- PhotoUploader
- JewelryOverlay
- PlacementSelector
- StackPanel
- CartDrawer
- Footer

## Routes

- `/`
- `/shop`
- `/collections`
- `/collections/[slug]`
- `/product/[slug]`
- `/face-studio`
- `/about`

Later:
- `/account`
- `/look/[shareId]`
- `/custom`

## Testing

After meaningful frontend work:

```powershell
npm run lint
npm run build
```

If a script does not exist, inspect `package.json`.

Test affected routes on desktop and mobile.

## Definition of done

A task is done when:
- code compiles
- relevant lint/build checks pass
- UI works
- mobile behavior is reasonable
- no obvious console errors
- secrets are safe
- Git state is clear
- test instructions are provided

## Working style

Be autonomous about ordinary implementation decisions.

Ask before:
- destructive actions
- expensive external generations
- schema/data deletion
- irreversible production changes
- purchasing services
- publishing sensitive information

## Immediate objective

Finish infrastructure setup, then build a polished visual shell and Face Studio MVP before advanced AI head movement.

Keep it premium, accurate, distinctive, and testable.
