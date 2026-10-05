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
- Browser validation and final website screenshots are recorded after the feature-branch CI run completes.

Work remains on `feat/dermal-first-slice`; main is unchanged.
