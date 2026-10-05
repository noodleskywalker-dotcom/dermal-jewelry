# Hyperreal catalog review — 5 October 2026

The catalog now uses 12 opaque photographic render sets: all ten design families, plus Desert Eye's symbol-only and gemstone-only forms. Each set includes an 1800px hero, 1600px detail view and 840px thumbnail. The detail view preserves the same composition rather than implying a separately photographed angle.

## Reference fidelity

- BLADE TRACE: sharpened metal blade, ring handle and realistic reflections.
- CROSSLINE: a thin dark line and a separate silver cross, matching the supplied wearer photograph.
- ANKH TRACE: a narrow, teardrop-shaped loop based on the supplied white-haired wearer image.
- HORUS TRACE: surface bar with spherical ends, dark stone, curl and pointed drop.
- DESERT EYE: two separate tops, with individual symbol and gemstone views for the single-top forms.
- Japanese Angel and Ankh + Eye retain their supplied design geometry.
- Crimson Orbit, Sand Vortex and Void Stud retain their existing catalog concepts.

The supplied Crossline and Ankh wearer images are included in their homepage stories and product pages, through the existing private-preview image gate. Gaara's existing supplied portraits remain in the Desert Eye story. The two latest screenshots show existing Blade Trace and Crossline pages, so no duplicate catalog families were created.

## Image generation and integration

Skywork generated the images in the signed-in project. Balance before generation: **165,256**. Verified balance after all twelve renders: **164,458**. Total used: **798 credits**, within the authorized **5,000-credit** limit. No credit purchase or subscription change was made.

Source session: https://skywork.ai/session/01a10b23-5827-7dc2-9620-8f241b2a4c63?mode=1

The original PNGs are retained in Skywork. Delivery WebPs preserve the opaque backgrounds and reflections; no alpha extraction or artificial glint overlay is used. Catalog, product stories, selection, bag/reveal imagery, about and commission pages resolve their imagery from the same photographic catalog records. The technical Horus hardware study remains available as an explicit study mode. The earlier Desert Eye orbit and assembly are retired because they showed a connecting bar absent from the reference; the homepage now uses the corrected full-image stills.

## Validation

- Local lint and TypeScript checks passed.
- All 185 unit tests passed.
- The capture job completed successfully with 109 current screenshots: 58 catalog, product and commission captures; 51 narrative and supplied-reference captures.
- The deployed preview was opened directly. The Gaara homepage, Blade Trace product, corrected Crossline product and original Crossline wearer reference all rendered correctly.
- Visual review covered all ten catalog images; every mobile product opening; 320px Blade, Crossline and Ankh openings; both supplied-reference figures at desktop/mobile/320px; and the full mobile/narrow product stories. No clipping, unreadable captions or retired Desert Eye bar imagery was found.
- The full browser suite finished with **512 passed, 115 skipped and 3 failures**. All three failures were the same outdated assertion in `story.spec.ts`, repeated across Chromium desktop/mobile and WebKit: it counted the retired component cutouts in a fallback that now correctly shows a complete photograph.
- Updated that assertion to check the exact form-specific photographic image and successful image load, while preserving component counts for an internal wearer-image overlay. ESLint and TypeScript passed after this test-only correction.
- Replayed the affected flow directly on the deployed preview: pair, nose gemstone and micro-dermal symbol each selected the correct loaded image; URL, price and form note followed the choice; Placement and the linked product page retained the micro-dermal form. The full cross-browser suite was not repeated after this test-only correction.
- Vercel built and deployed the implementation successfully. The CI build step was skipped after the obsolete assertion failures; it is not recorded as a passed CI build.

Tested implementation: `18742ca8229ed7e4ec021debb6768805c28d640d`.

Preview: https://dermal-jewelry-16zyvhims-openlimits.vercel.app/

CI run: https://github.com/noodleskywalker-dotcom/dermal-jewelry/actions/runs/37313326166

Selected review images:

- [Live homepage](screenshots/hyperreal-live-home.jpg)
- [Live Blade Trace](screenshots/hyperreal-live-blade.jpg)
- [Live Crossline](screenshots/hyperreal-live-crossline.jpg)
- [All ten photographic designs](screenshots/hyperreal-catalogue.webp)
- [Mobile Blade Trace](screenshots/hyperreal-mobile-blade.webp)
- [Mobile original Ankh reference](screenshots/hyperreal-mobile-ankh-reference.webp)

The capture artifact also contains a tracked `astra-remodel/browser-results.json` from an earlier run; it is not evidence for this implementation. Use the run linked above for current test results.

Work remains on `feat/dermal-first-slice`; main is unchanged.
