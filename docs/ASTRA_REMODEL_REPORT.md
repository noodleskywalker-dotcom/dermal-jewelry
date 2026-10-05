# DERMAL remodel review — 5 October 2026

Later visual follow-up: see `NARRATIVE_REVIEW_2026-10-05.md` for the hyperreal Gaara campaign, seven individual jewelry stories, updated preview and final screenshot review. The results below describe the preceding storefront remodel.

Status: tested preview deployed and screenshots reviewed. Live commission delivery remains blocked on protected-preview access. Public launch and checkout are not approved.

| # | Requested item | Result |
| --- | --- | --- |
| 1 | Branch | `feat/dermal-first-slice` |
| 2 | Implementation commits | `dd21d07a882d47cfed197f088a5a7ee353256386` — editorial storefront; `e092e2ab26faed6c33c36964a64e431a5c271e3a` — Skywork media, SEO and review capture; `0dc5239a8c91cf6a4505eca5d5110cbea1a5f1af` — seven-family image coverage; `cf3e518a7641e9e702bc6fd351edc01e808dc52f` — confirmation scroll fix |
| 3 | Working tree | Implementation and review package committed on the feature branch; clean after the review-package commit. |
| 4 | Preview | https://dermal-jewelry-lz778ye1k-openlimits.vercel.app — Vercel READY, implementation commit `cf3e518`, preview target |
| 5 | Localhost | No local server left running. |
| 6 | Pages changed | Home, shop, collections index, shared product presentation for all families, commission, Face Studio, cart, about; shared navigation, footer and collection presentation. |
| 7 | New media | Nine WebP files: `hero.webp`, `catalogue.webp`, `detail.webp` under each of `public/products/blade-trace/`, `crossline/`, `ankh-trace/`. |
| 8 | Media sources | Three Skywork reference edits of canonical FormVisual images, each 2048px square. Delivery images use the existing paper-removal method, proportional resizing and detail crops. Existing DESERT EYE, HORUS TRACE, JAPANESE ANGEL and ANKH + EYE images retained. See `SKYWORK_MEDIA_2026-10-05.md`. |
| 9 | Skywork spending | 350 credits: observed balance 165,837 → 165,487. |
| 10 | Rejected media | Duplicate CROSSLINE and ANKH alternatives not integrated; redundant, and the second ANKH shortened the reference stem. Three of five generated images used. |
| 11 | Catalogue | Seven primary families: DESERT EYE — LOVE, HORUS TRACE, BLADE TRACE, CROSSLINE, ANKH TRACE, JAPANESE ANGEL, ANKH + EYE. CRIMSON ORBIT, SAND VORTEX and VOID STUD retained as secondary studies. KIRI retained in the concept archive. |
| 12 | Concepts | JAPANESE ANGEL and ANKH + EYE have renders but no configured wearable forms, prices or purchase/try-on actions. KIRI remains concept-only. All other renders still carry unverified manufacturing specifications. |
| 13 | Shopify | Server-side catalogue and one-cart architecture retained. Preview environment variable names verified present without reading values. Current remote inventory remains unverified in this review; no products or prices created. |
| 14 | Commission | Secure validation, upload, signed reference access and server-side delivery retained. Optional finish preference added. Mock success/failure tests are separate from live delivery verification. |
| 15 | Blob | Preview token configured. Private upload/access implementation preserved. Live upload remains pending protected-preview access. |
| 16 | Resend | Preview API key and recipient variable configured. No live email sent in this review. Default recipient in code is `noodleskywalker@gmail.com`; encrypted environment value was not exposed. Live receipt remains unverified. |
| 17 | Preorder | Honest coming-soon/concept/sold-out/unavailable presentation; no invented prices or lead times. Checkout remains closed. |
| 18 | Lint | Pass locally and in latest CI. |
| 19 | Typecheck | Pass locally and in latest CI. |
| 20 | Unit tests | 175 passed, 16 files. |
| 21 | Browser tests | Run `37287262062`, commit `cf3e518`: **484 passed, 122 skipped, 0 failed, 0 flaky**. Project totals below. |
| 22 | Build | Local and final CI optimized builds passed, 25 generated pages. One Turbopack warning: dynamic filesystem tracing in the internal-media helper can enlarge server output. Vercel preview also built successfully. |
| 23 | Screenshots | `docs/screenshots/astra-remodel/`; 47 reviewed frames, including refreshed selection overview and fixed confirmation states; interactive image index included. Commission success screenshots use development mocks. |
| 24 | Launch blockers | Live preview commission check; approved prices, specifications, hardware, production timing and commerce configuration; canonical public domain; applicable IP/media approval; explicit checkout and production approval. Robots currently disallows indexing. |
| 25 | Owner approval | Automatic approval review rejected protected-preview fetch because the Vercel tool creates/reuses a temporary authentication-bypass link. Specific permission for that temporary link is needed to complete the live check. Production and checkout require separate explicit approval. |

## Preserved behavior

Face Studio photos remain local to the browser, with existing placement geometry preserved. Commission references are a separate, explicitly submitted upload flow. Material appearance never becomes a manufacturing claim. Real Shopify merchandise cannot fall back into the demo bag, and a restored real cart prevents demo selections from mixing with it.

The homepage hands off from the launch campaign to the seven-family selection in its third meaningful section, then Face Studio and commissions. Product pages use truthful view labels, including “Orbit study”; no simulated view is represented as a full 360-degree capture.

## Verification limits

The local sandbox prevents Chromium from creating its required socket, and WebKit dependencies cannot be installed there. Browser verification therefore runs on GitHub Actions with the official Playwright browser installation. No assertion was weakened to accommodate that environment restriction.

The earlier mobile `/about` timeout occurred while an optimized image response remained pending: the page HTML and its content had loaded. It did not recur in the next full run; no timing assertions were weakened. All skips must be read with their fixture/device gates; missing gated character media is not a passing media-playback test.

Main remains at `76b32a9ce772ef90bac2e08ec0bbe6ab0749b2a9`. No main merge, production deployment or checkout enablement was performed.

## Visual review

All 47 October 5 frames were opened in review sheets, with the underlying full-resolution files retained. Reviewed: home opening/reveal and four selection families, home commission introduction, shop, collections, Face Studio, about, empty cart, all seven product heroes, an ANKH + EYE detail view, commission opening/form/upload/send/failure/success states, Pixel 7 pages and 320px product/upload views.

The review found a real mobile confirmation defect: native focus scrolling could place “Request received” behind the fixed navigation. The fix preserves keyboard focus, scrolls the success section with a header offset, and asserts the heading is below the header in every browser project. Product renders remain proportional, with no cropped silhouettes in the reviewed phone and 320px product stages. The DESERT EYE selection overview shows the complete section, including labels and controls. Other families retain the correct viewport captures: Playwright’s oversized-element capture repositioned the horizontal rail, so those misleading frames were rejected. The capture helper uses viewport screenshots for subsequent rail positions.

Open `screenshots/astra-remodel/index.html` for the image index. Commission screenshots are explicitly mock delivery evidence. The review does not substitute for real-device testing or the protected deployed-site check.

## Final automated results

GitHub Actions run: https://github.com/noodleskywalker-dotcom/dermal-jewelry/actions/runs/37287262062

| Project | Passed | Skipped | Failed |
| --- | ---: | ---: | ---: |
| Desktop Chromium, 1440 × 900 | 165 | 29 | 0 |
| Mobile Chromium, Pixel 7 emulation | 150 | 44 | 0 |
| Desktop WebKit, 1280 × 800 | 150 | 44 | 0 |
| Narrow Chromium, 320px launch checks | 19 | 5 | 0 |
| Total | **484** | **122** | **0** |

No retries or flaky passes. Skips are explicit device/input gates, absent gated internal character footage, codec limitations and viewport checks executed once in desktop Chromium. They are not untested failures counted as passes. Lint, typecheck, all 175 unit tests, the optimized build and the screenshot capture also passed in this run.

Run history: the first remodel run had one optimized-image load timeout on mobile `/about`; it did not recur. Adding the three Skywork families exposed seven assertions still assuming four renders and enlarged SVG artwork. Those expectations were updated to seven rendered families, all seven hero/detail/asset paths are checked, and image loading, contain sizing, square catalogue frames and overflow checks remain enforced. The visual review then added the confirmation-heading regression check.

The final review-package commit adds documentation, captured images and a capture-only correction; application code remains the exact implementation tested at `cf3e518`. The preview URL above identifies that tested implementation.
