# Exact product asset slot

The code-drawn jewelry is temporary. It stays only as a fallback until the exact asset is supplied.
No new design was invented to prepare this slot.

## Where the file goes

```text
public/products/desert-eye-love/anti-eyebrow.webp        wearer's left, the approved orientation (required)
public/products/desert-eye-love/anti-eyebrow.right.webp  wearer's right (optional, see below)
```

`.png` is accepted in place of `.webp`. If both exist, `.webp` is used.
The general pattern is `public/products/<product-slug>/<form-id>[.right].<webp|png>`, so other
products and forms use the same slot later (`micro-dermal`, `nose`, once those designs exist).

After adding or removing a file, run `npm run assets:sync`. It also runs automatically before
`npm run dev` and `npm run build`. It rewrites `lib/catalog/asset-manifest.json`, which is committed
together with the image.

## What the file must be

- Transparent background: WebP with alpha, or PNG-24 with alpha.
- One image of the **whole pair**, in the approved arrangement: the hollow metallic symbol upper and outer, the small deep-red faceted gemstone lower and inner, with the approved spacing and the approved diagonal.
- Oriented for the **wearer's left**, which is how the approved reference shows it: the symbol is toward the upper right of the image, the gemstone toward the lower left.
- **Cropped tightly** to the pair, with no more than about 2% transparent margin on any side. The site fits the image by its width, so spare margin would make the jewelry look smaller.
- Straight-on view, as it would sit on skin. No perspective tilt.
- No face, no skin, no background, no sand, no text, no watermark.
- No cast shadow baked in. A very soft contact shadow directly under the metal is acceptable; the site adds its own soft shadow on paper surfaces.
- No grey ball or stud anywhere.
- Derived from an exact source: a photograph of a sample, a render from the maker's CAD file, or an illustration the owner has signed off. It must not be drawn by a generative model.

## Size and aspect

- Recommended: **2400 px on the long edge**, which for this pair is the width. The authored layout of the pair is about 0.92 wide by 0.74 tall, so expect roughly **2400 × 1930 px** (about 5:4). The exact aspect is whatever the approved spacing gives; the site reads the height from the file.
- Minimum: 1200 px wide. Below that the reveal ending and the product page look soft on high-density screens.
- Target file size: under 400 KB as WebP. It is loaded once and reused on every surface.
- Colour: sRGB, 8 bits per channel.

## The wearer's right

The image is never flipped, because flipping would mirror the symbol. If only the left file exists,
the wearer's right side keeps the fallback artwork. To cover it, supply `anti-eyebrow.right.webp`:
the same two pieces with their positions mirrored (symbol toward the upper left, gemstone toward the
lower right) and the symbol itself **not** mirrored.

## Every place that uses it

All of these draw through one component, `components/catalog/FormVisual.tsx`, so they switch together
the moment the file is present:

| Surface | Component |
| --- | --- |
| Face Studio stage, and its drag handle | `components/studio/LookRenderer.tsx` |
| Personalized preview on shop cards (hover panel and Try on sheet) and on the product page | `components/catalog/TryOnPreview.tsx`, through `LookRenderer` |
| Placement preview on the featureless head | `components/catalog/PlacementPreview.tsx` |
| Product tiles in the shop, collections, "More pieces" and the homepage grid | `components/catalog/ProductArtwork.tsx` |
| Homepage opening, featured family section and Face Studio demonstration | `components/home/HomeSections.tsx` |
| Reveal still, and the final jewelry frame of the reveal | `components/reveal/RevealPlayer.tsx` |
| Demo bag thumbnail, and the piece rail in Face Studio | `components/cart/BagContents.tsx`, `components/studio/FaceStudio.tsx`, through `ProductArtwork` |

The asset is placed over the bounding box of the form's authored layout (`layoutBounds` in
`lib/catalog/assets.ts`), so it sits where the fallback sits, at the same size. Default size and
position in Face Studio do not change.

One behaviour changes when an exact asset is in use: "What to move" (adjusting one piece on its own)
is hidden for that form, because a single approved image keeps its approved spacing. Moving, scaling
and rotating the whole pair work as before.

## The reveal

The final jewelry frame was already a separate overlay, never part of any footage. It now draws
through `FormVisual` too. When the exact asset is added it replaces the fallback in the reveal ending
with no change to the timing: 5.5 seconds of scene, then 1.5 seconds of jewelry.

## Sand-frame grade

The generated sand frame is paler and cooler than the dunes in the start frame. A presentation-only
CSS filter (`.concept-sand` in `app/globals.css`) warms and deepens it wherever the prototype shows
it. The image files in `references/generated/` are untouched.
