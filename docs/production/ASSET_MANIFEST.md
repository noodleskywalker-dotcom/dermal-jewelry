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

Two classes of product art are recognised, and they must not be confused.

**PROTOTYPE PRODUCT ART**, for the website prototype only. A signed-off illustration based on the
approved design may be used as the exact visual asset, even if it began in an AI-assisted
concept-design process. It is not proof of manufactured dimensions, metal grade, gemstone identity,
threading, compatibility or actual finish, and the site keeps those fields "Unverified".

**COMMERCIAL PRODUCT ASSET**, required before commercial launch: a render from the manufacturer's or
jeweller's CAD file, or photography of the manufactured product. It replaces the prototype art by a
file swap at the same paths, with no change to placement geometry or UI.

In both classes, campaign and reveal generators must not draw the jewelry into a scene. They draw
backgrounds, skin, sand and light only, and the product art is composited separately.
File paths, per-piece requirements and the composition metadata are in `ASSET_SLOT.md`.

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

## Story media for the DESERT EYE collection page (added 21 September 2026)

The collection page describes its media as slots in `lib/story/desert-eye.ts`. The interaction is built
and tested; these are the pictures it is waiting for. Character material is **internal concept only**
until a rights review. Nothing here has been generated, and generating any of it needs approval first.

| Slot | What belongs in it | Status |
| --- | --- | --- |
| `character` | Full standing character on a **transparent** background, facing the jewelry, about 3:4, 2400 px tall. | NEEDED. Today a half-length internal still with a desert background stands in, feathered at the edges. It is not a cutout and not full length. |
| `closeup` | Extreme close-up of the eye and temple with room for the anti-eyebrow pair, **drawn without jewelry**. | NEEDED. The internal still in use already contains painted jewelry; the product overlay is drawn exactly over it. |
| nose and cheek framing | Pictures that show the nose and the cheekbone clearly enough for the single forms. | NEEDED. Today both forms zoom into the half-length still. |
| `sand` | Flat, even sand field that can fill any viewport. | Internal still exists. A cleared version is NEEDED for publication. |
| `video` | The 0.0 to 5.5 second action ending on full sand, no jewelry in the footage. 16:9 master, plus a 9:16 or 4:5 crop for phones. | **MISSING.** The site plays a labelled storyboard animatic in internal review and nothing in a build. |
| opponent | Any opponent picture for the one short exchange. | MISSING. A labelled featureless figure stands in. |
| micro-reaction | 0.5 to 1.5 second character reaction loop (eyes, body, a little sand). | MISSING. A CSS shift of the still and rising sand grains stand in. |

## Design status of the single forms (set by the owner, 21 September 2026)

1. Micro dermal is **concept-approved as the hollow symbol on its own**.
2. Nose is **concept-approved as the deep-red faceted gemstone on its own**.
3. Anti-eyebrow remains the **approved prototype composition**.

None of the three is manufacturing-ready, and the site says so on every form. Still open, and a
question for the maker: whether the symbol can stay openwork at micro-dermal size. In the tables
above, read "DESIGN REQUIRED" for micro dermal and nose as "concept approved, product art NEEDED".

## What is deliberately not being done

No further code-drawn imagery will be added to stand in for missing campaign art. Where an asset is
missing, the site keeps its current quiet fallback (the labeled concept artwork or the still) until
the real asset arrives.
