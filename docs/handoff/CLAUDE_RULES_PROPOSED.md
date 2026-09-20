# Proposed permanent CLAUDE.md rules — merge, do not blindly replace

These are concise project instructions to merge into the current CLAUDE.md after reading DERMAL_MASTER_BRIEF.md. Preserve useful project-specific discoveries and newer explicit owner decisions. Remove only obsolete or contradictory setup-only instructions.

## Mission and current phase

Build DERMAL: a premium facial-jewelry storefront with browser-local Face Studio, personalized product-card previews, Shopify commerce and an evidence-based launch plan.

Infrastructure is already connected according to the owner's latest report. Verify the immediate dependency once; do not recreate accounts, projects or stores. The project is now authorized for development, not another setup-only cycle.

Read DERMAL_MASTER_BRIEF.md for requirements and docs/PROJECT_STATUS.md for current progress. The master brief contains the full roadmap; implement only the active milestone and carry unfinished work forward honestly.

## Current identifiers

- Expected folder: C:\Users\USER\Desktop\dermal-jewelry
- Repository: noodleskywalker-dotcom/dermal-jewelry
- Reported Vercel project: openlimits/dermal-jewelry
- Reported Shopify domain: vxh01e-0d.myshopify.com
- Reported Headless storefront: DERMAL Web Store
- Existing environment names: SHOPIFY_STORE_DOMAIN, SHOPIFY_STOREFRONT_ACCESS_TOKEN, SHOPIFY_API_VERSION
- Reported private Storefront token and API version 2026-07: verify without exposing values or guessing token source from a prefix.

## Work style

Inspect before changing. Make a concise plan, then implement a testable vertical slice. Use sensible defaults; avoid trivial questions and endless design alternatives. Report complete sentences, genuine test evidence and remaining limitations even when a compression-oriented skill is active.

Use installed tools selectively. An optional plugin failure is not a reason to block unrelated work. No framework migration, broad dependency upgrade or extra paid service without a concrete reason and appropriate approval.

## Safety and authorization

Preserve unrelated files and uncommitted work. Use a feature branch, review staged changes and commit meaningful checkpoints. No force-push, destructive Git cleanup, production merge or deployment without explicit approval.

No purchases, plan changes, billed creative generations, ad campaigns, marketing sends, published products, real orders/refunds, integrations removal or credential rotation without specific approval. Browser authentication is not blanket authorization.

Do not print secrets or whole environment files. Keep .env.local ignored and preserve all its existing keys. Never overwrite it from an example file. Keep private Shopify credentials server-only and out of NEXT_PUBLIC_ variables, screenshots, logs, client bundles and arbitrary proxy endpoints. Review tracked files; .gitignore is not proof that a secret was never committed.

## Product and visual direction

Dark editorial: near-black, warm ivory, garnet and restrained silver. Large expressive typography, strong product detail, generous space and responsive accessible interactions. Avoid generic SaaS cards, scroll hijacking, fake trust signals and excessive animation.

Preserve the approved anti-eyebrow composition: upper/outer hollow symbol and lower/inner small deep-red faceted gemstone. The reference governs appearance, not physical specifications. Do not call the stone sapphire/ruby or assert a metal grade until verified.

Treat Gaara/franchise imagery as internal concept material pending rights review. Never assume a ChatGPT attachment is on disk. Use only files actually present and rights-cleared public assets. Never invent certifications, dimensions, compatibility, scarcity, reviews, lead times or inventory.

## Face Studio

First version: local photo or approved sample, two-piece placement, normalized coordinates, group/component adjustment, drag/scale/rotate/reset/undo, product switching, personalized hover/tap preview and stack.

Selfies and face data remain in memory; no server upload, storage, analytics, replay or logging by default. Clear-photo clears every dependent preview and releases resources where supported. Share configurations without a face by default. Keep manual placement and failure fallbacks.

A 2D preview is approximate, not a physical fit or piercing-safety assessment. A CSS-tilted photo is not a reconstructed side view. Head-motion and 3D are a later evaluated milestone with exact product assets and honest limitations.

## Commerce and marketing

Separate preview, waitlist and live modes. Never let mock products reach live checkout. Keep Shopify authoritative for real variant identity, prices, inventory and cart totals. GraphQL HTTP 200 is not sufficient success evidence. Buyer carts must not share caches or sessions.

Use the private Storefront request header server-side and follow current buyer-IP guidance from trusted deployment information. Test actual variant/cart behavior only with approved records; do not publish a fake product to pass a test.

Marketing work begins as drafts, landing-page architecture and disabled/consent-aware event hooks. No fake signup success or purchase events on checkout clicks. No customer faces/landmarks in ads, analytics or public metadata. No spending without a budget approval.

## Testing and handoff

Inspect package.json and use actual lint/build/type/test scripts. Test affected flows in Playwright using approved fixtures; include mobile, keyboard, photo privacy and error states. Do not claim tests ran when they did not. A build is not an end-to-end test.

At a checkpoint, report: what changed, test evidence, local/preview routes, remaining blockers and the next concrete task. Update docs/PROJECT_STATUS.md and record significant decisions. Leave production unchanged until the owner approves release.
