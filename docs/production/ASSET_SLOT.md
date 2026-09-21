# Exact product asset slot

> **Status, 21 September 2026: the slot is filled with PROTOTYPE PRODUCT ART** for DESERT EYE — LOVE.
>
> | File | Size | Bytes | Used by |
> | --- | --- | --- | --- |
> | `public/products/desert-eye-love/anti-eyebrow/symbol.webp` | 1600 × 1656 | 214 KB | pair |
> | `public/products/desert-eye-love/anti-eyebrow/gemstone.webp` | 800 × 800 | 39 KB | pair |
> | `public/products/desert-eye-love/micro-dermal/symbol.webp` | 1600 × 1656 | 214 KB | micro dermal (same image) |
> | `public/products/desert-eye-love/nose/gemstone.webp` | 800 × 800 | 39 KB | nose (same image) |
> | `art/product-masters/desert-eye-love/symbol.svg`, `symbol.png` | vector, 1600 × 1656 lossless | | source masters |
> | `art/product-masters/desert-eye-love/gemstone.svg`, `gemstone.png` | vector, 800 × 800 lossless | | source masters |
>
> Rebuild with `npm run assets:render`. It renders locally from vectors and spends no credits. This is
> prototype art for the website only. It is not manufacturing geometry, and a commercial asset still
> needs the maker's CAD render or a photograph of the made piece.

The code-drawn jewelry is temporary. It stays only as a fallback until the exact assets are supplied.
No new design was invented to prepare this slot.

## Source files: one transparent image per piece

```text
public/products/desert-eye-love/anti-eyebrow/symbol.webp      required
public/products/desert-eye-love/anti-eyebrow/gemstone.webp    required

public/products/desert-eye-love/anti-eyebrow/symbol.right.webp     optional
public/products/desert-eye-love/anti-eyebrow/gemstone.right.webp   optional
```

`.png` is accepted in place of `.webp`. If both exist, `.webp` is used.
General pattern: `public/products/<product-slug>/<form-id>/<component-id>[.right].<webp|png>`.
The file name must equal the component id in the form's metadata (`symbol`, `gemstone`).

After adding or removing a file, run `npm run assets:sync`. It also runs before `npm run dev` and
`npm run build`. It rewrites `lib/catalog/asset-manifest.json`, which is committed with the images.

**Both pieces are needed.** If either file is missing, the whole form keeps the drawn fallback, so
exact art and drawn art are never mixed inside one piece of jewelry.

## What each file must be

- Transparent background: WebP with alpha, or PNG-24 with alpha.
- **One piece only**, cropped tightly to it (about 2% transparent margin). The site fits each image by its width to that piece's `size`, so spare margin makes the piece look smaller.
- `symbol`: the hollow metallic symbol, upright in its approved orientation. The openings must be truly transparent so skin shows through.
- `gemstone`: the small deep-red faceted gemstone in its setting.
- Straight-on view. No face, skin, background, sand, text or watermark. No grey ball or stud.
- No cast shadow baked in. A very soft contact shadow directly under the metal is acceptable; paper surfaces add their own soft shadow.
- Recommended size: **symbol 1600 px wide, gemstone 800 px wide** (the gemstone is drawn at about 0.42 of the symbol's width). Minimum 800 px and 400 px. sRGB, 8 bits per channel. Target under 250 KB and 100 KB as WebP.
- Aspect: whatever the tight crop gives. The site reads the height from the file.

## Default composition metadata

The relationship between the two pieces is **data, not pixels**. It lives with the form in
`lib/catalog/demo-products.ts`:

```ts
{
  id: "anti-eyebrow",
  placement: "anti-eyebrow",
  defaultScale: 0.12,            // width of the pair's unit box as a fraction of the photo width
  components: [
    // x, y: offset of the piece's centre from the pair's centre, in pair units,
    //       authored for the wearer's LEFT. +x is outward, +y is down.
    // size: the piece's width in pair units.   rotation: degrees, default 0.
    { id: "symbol",   art: "love-symbol", x:  0.30, y: -0.20, size: 0.48, rotation: 0 },
    { id: "gemstone", art: "garnet-gem",  x: -0.28, y:  0.20, size: 0.20, rotation: 0, symmetric: true },
  ],
  composition: {
    approved: true,                          // symbol upper + outer, gemstone lower + inner, approved diagonal
    artClass: "concept-fallback",            // becomes "prototype-product-art", later "commercial-product-asset"
    note: "…",
  },
}
```

These numbers reproduce the currently approved anti-eyebrow composition exactly; they were not
changed. `art` names the drawn fallback used while a file is missing. If the signed-off artwork needs
slightly different spacing or scale, only these numbers change. No component or layout code changes.

## How it is used

Every surface composes the same two images through the same metadata, so there is one
representation of the piece:

| Surface | How |
| --- | --- |
| Product page, shop, collections, homepage, bag thumbnail, Face Studio piece rail | `ProductArtwork` → `FormVisual` |
| Placement preview on the featureless head | `PlacementPreview` → `FormVisual` |
| Personalized previews (hover panel, Try on sheet, product page) | `TryOnPreview` → `LookRenderer` → `PieceArt` |
| Face Studio stage | `LookRenderer` → `PieceArt` |
| Reveal still and final reveal frame | `RevealPlayer` → `FormVisual` |

`FormVisual` and `PieceArt` are in `components/catalog/FormVisual.tsx`. No precomposed derivative is
generated; two small images are composed in the browser. If one is ever wanted for performance, it
must be rendered from these same two files and this metadata, never redrawn by hand.

## Face Studio

Because the pieces are separate images, the **Move** control keeps all three targets: **Pair**,
**Symbol**, **Gemstone**. The pair can be moved, scaled and rotated; each piece can be moved on its
own. **Reset** clears every adjustment and returns to the default composition above, exactly.
Moving one piece is a visual preview and does not describe a real spacing or fit.

## The wearer's right

Only positions mirror. The symbol image is **never flipped**. Without `symbol.right.webp`, the one
approved `symbol.webp` is reused on the right in its approved, non-mirrored orientation, at the
mirrored position. Supply a `.right` file only if the artwork genuinely differs on that side, for
example a lit edge that should face the other way. The gemstone is marked `symmetric` and normally
needs no right-side file.

## Prototype art versus commercial asset

For the **website prototype**, a signed-off illustration based on the approved design may be used as
the exact visual asset, even if it began in an AI-assisted concept-design process. It must be
classified internally as **PROTOTYPE PRODUCT ART**: set `composition.artClass` to
`"prototype-product-art"` and record it in `docs/ASSET_REGISTER.md`.

Prototype product art is **not** proof of manufactured dimensions, metal grade, gemstone identity,
threading, compatibility or actual finish. The site's specification table stays "Unverified".

Before commercial launch, replace it with manufacturer or CAD-derived renders, or real photography of
the manufactured product, and set `artClass` to `"commercial-product-asset"`. The replacement is a
file swap at the same paths. Placement geometry and UI do not change; at most the `x`, `y` and `size`
numbers are re-measured against the real piece.

## Reveal and sand-frame grade

The final jewelry frame of the reveal is a separate overlay drawn through `FormVisual`, never part of
any footage, so adding the assets changes the ending's artwork and nothing about its timing.
The development-only prototype warms the generated sand frame with a presentation-only CSS filter
(`.concept-sand`); the image files are untouched.
