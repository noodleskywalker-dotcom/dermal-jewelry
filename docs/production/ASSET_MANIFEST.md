# Asset manifest — DESERT EYE — LOVE design family

Prepared 20 September 2026. Nothing here has been generated, purchased or approved.
No manufacturing specification appears in this document, because none has been verified.

## Status words

- **HAVE (concept)**: exists today only as code-drawn concept artwork, labeled "Concept artwork" on the site.
- **NEEDED**: a real asset must be produced or supplied.
- **DESIGN REQUIRED**: the physical design of this form is not approved, so no asset can be produced yet.
- **BLOCKED**: waiting on another item in this table.

## What is approved

Only the anti-eyebrow appearance: the openwork metallic symbol is the upper and outer piece, and the
small deep-red faceted gemstone is the lower and inner piece, on a diagonal. No grey ball.
Micro dermal and nose have **no approved physical design**. The site's micro dermal "single symbol
top" is a demo configuration, labeled as not approved, and must not be treated as the design.

## Source of truth for every product asset

Every product image below must be derived from one exact source per form, in this order of preference:
1. photography of a manufactured sample;
2. a render from the manufacturer's or jeweller's CAD file;
3. a commissioned illustration signed off by the owner as the exact design.

A generative model must not draw the jewelry. It may draw backgrounds, skin, sand and light only.

## Assets per form

Naming: `dermal/desert-eye-love/<form>/<asset>@<width>.<ext>`. Transparent assets are PNG or WebP with
alpha. Opaque stills are AVIF with a WebP fallback. All crops keep the pair's diagonal intact.

| # | Asset | Purpose on the site | Format and size | Anti-eyebrow | Micro dermal | Nose |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Clean product-only hero | Master still that every other product crop is cut from. Neutral warm-paper or sand ground, soft single key light, true colour. | 4000 px long edge master, 16-bit source kept offline | NEEDED | DESIGN REQUIRED | DESIGN REQUIRED |
| 2 | Transparent overlay for Face Studio | Replaces the code-drawn pieces in `LookRenderer`. One file **per piece** (symbol, gemstone), straight-on, no cast shadow baked in, soft contact shadow as a separate optional layer. | 1024 px per piece, alpha, under 150 KB each | NEEDED (2 files: symbol, gemstone) | DESIGN REQUIRED | DESIGN REQUIRED |
| 3 | Placement-preview asset | The same overlay placed on the featureless head. The head itself is an approved device; a rendered or photographed sculpted head may replace the code-drawn one. | Head: 1600 × 2000, opaque. Pieces reuse asset 2. | BLOCKED by 2. Head: NEEDED (optional upgrade) | BLOCKED by design | BLOCKED by design |
| 4 | Shop thumbnail | Product grid tile, 4:5. | 1200 × 1500 and 600 × 750 | BLOCKED by 1 | BLOCKED by design | BLOCKED by design |
| 5 | Product-page hero crop | Left media area of the family page, 4:5. | 1600 × 2000 and 1080 × 1350 | BLOCKED by 1 | BLOCKED by design | BLOCKED by design |
| 6 | Mobile crop | Family page and homepage on phones, 4:5, tighter on the pieces. | 1080 × 1350 and 720 × 900 | BLOCKED by 1 | BLOCKED by design | BLOCKED by design |
| 7 | Concept-reveal poster frame | Idle frame of the reveal player, and the still shown when media fails or reduced motion is on. Sand backdrop with the exact product overlay composited, no character. | 1080 × 1350, under 120 KB | BLOCKED by 1 and by backdrop S1 in the production plan | BLOCKED by design | BLOCKED by design |

## Assets shared by the family

| Asset | Purpose | Status |
| --- | --- | --- |
| Sand-textured campaign backdrop (S1) | Ground for thumbnails, hero crops, the poster and the last two seconds of the reveal | NEEDED, can be generated. See `PRODUCTION_PLAN.md`. |
| Reveal video, 6 to 7 seconds | Concept reveal on the family page | NEEDED, can be generated. Jewelry is not in the video. |
| Hero campaign face shot (S2) | Homepage opening | NEEDED, can be generated. Jewelry composited afterwards. |
| Final call-to-action campaign shot (S3) | Homepage close | NEEDED, can be generated. |
| Approved full-face sample photo | Face Studio sample mode | NEEDED from the owner, with a model release. Must not be generated and presented as a photograph of a real person. |

## Design decisions the owner must make before micro dermal and nose assets exist

1. Micro dermal: which single element carries the design? Options to choose between, none approved: the symbol alone; the gemstone alone; a new reduced mark.
2. Nose: is it a nostril stud, and does it use the gemstone, a reduced symbol, or something else?
3. For both: is the symbol still openwork at that size? This is a manufacturing question for the maker.

Until these are answered, both forms stay **DESIGN REQUIRED** in this manifest and "concept pending" or
"demo configuration, not approved" on the site.

## What is deliberately not being done

No further code-drawn imagery will be added to stand in for missing campaign art. Where an asset is
missing, the site keeps its current quiet fallback (the labeled concept artwork or the still) until
the real asset arrives.
