# Production queue — DESERT EYE assets

Prepared 21 September 2026, in the order the owner set. **Nothing here has been generated and no
credits have been spent.** The interaction and layout are frozen as the working base; every asset
below drops into an existing slot without a layout change.

Tools on this machine today: the repository's own vector artwork, headless Chromium through Playwright
(renders SVG to PNG with a transparent background), and the Higgsfield CLI. Not installed: ffmpeg, an
image editor, a background remover, a video keyer. Higgsfield balance was 10 credits on the free plan on
20 September and has not been rechecked. Credit figures are the CLI's own estimates from
`PRODUCTION_PLAN.md`: `nano_banana_pro` 2 per image, `seedance_2_0_mini` 5 per clip, `seedance_2_5` 35.

Two standing rules decide most answers below:
- **Higgsfield is never used for exact product geometry.** Assets 1 and 2 are therefore not generated.
- **Character material is internal only** until licensing is cleared. It lives in `references/`, is
  served only by the development server, and never goes in `public/`, Git or a build. Uploading an
  existing internal image to an outside service needs separate approval (`references/ASSET_GUIDE.md`).

## The queue

| # | Asset | Dimensions and format | Transparency / background | Crop | Angle | Used in | Current tools? | Higgsfield credits? | Product geometry unchanged? | Internal or public |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Exact transparent hollow-symbol asset | 1600 px wide (800 minimum), height from the tight crop. WebP with alpha, PNG-24 master. sRGB, 8-bit. Under 250 KB. | Fully transparent. Openings between strokes truly transparent so skin shows through. No cast shadow baked in. | One piece only, about 2% margin. | Straight-on, upright, approved orientation. Never mirrored. | `public/products/desert-eye-love/anti-eyebrow/symbol.webp` and `…/micro-dermal/symbol.webp`. Every surface: floating pieces, close-up overlay, placement head, Face Studio, bag. | **Yes.** Rendered from the vector outline already in `lib/studio/love-glyph.ts` through headless Chromium. That gives *prototype product art*. A *commercial* asset needs the maker's CAD render or a photograph. | **No, and must not.** | Yes: it is drawn from the geometry itself. | Contains no character. Public-safe **after** the open rights review of the symbol design. |
| 2 | Exact transparent deep-red gemstone asset | 800 px wide (400 minimum). WebP with alpha, PNG-24 master. Under 100 KB. | Fully transparent. Setting included. No cast shadow. | One piece only, about 2% margin. | Straight-on, table facing the camera. | `…/anti-eyebrow/gemstone.webp` and `…/nose/gemstone.webp`. Same surfaces as asset 1. | **Yes**, the same vector-to-PNG route, as prototype product art. Commercial version needs the maker. | **No, and must not.** | Yes. | Public-safe. Described only as "deep-red faceted gemstone" until a supplier confirms the stone. |
| 3 | Full-standing Gaara internal concept cutout | 2400 × 3200 px (3:4), PNG with alpha. Delivery copy WebP with alpha, under 600 KB. | Transparent. Clean matte around hair. No ground, no cast shadow; the page supplies the sand. | Head to feet, about 4% margin, feet on the bottom edge. | Eye-level, three-quarter, body and gaze turned toward the viewer's right, where the jewelry floats. Idle stance. Soft key light from the left, matching the current still. | `character` slot: the stage figure and the first frame of the story. | **Partly.** The figure can be generated; **the transparent matte cannot be cut with what is installed**. Needs a background remover or an illustrator. | **Yes.** About 2 per attempt with `nano_banana_pro`; allow 3 to 5 attempts, 6 to 10 credits. | Yes. No jewelry is in this picture. | **Internal only.** |
| 4 | Clean high-resolution eye and temple close-up, no jewelry | 3600 × 3000 px (6:5, the current slot's ratio). Opaque. Delivery AVIF or WebP under 500 KB. | Opaque. **No jewelry, no holes, no marks** in the overlay zone. | Eye on the left third, forehead mark visible at the top, hair on the right. Overlay zone kept clean and evenly lit: 55–78% across, 48–70% down. | Extreme close-up, three-quarter, matching the approved reference composition. | `closeup` slot: end of the story and the anti-eyebrow product state. Clearing `paintedJewelry` on the slot brings the product overlay back. | **Generation only.** Removing the jewelry from the approved reference by inpainting would mean uploading that internal file, which needs separate approval. | **Yes.** About 2 per attempt; allow 3 to 4, 6 to 8 credits. | Yes. The jewelry is always the overlay from assets 1 and 2. | **Internal only.** |
| 5 | Nose placement close-up | 2400 × 3000 px (4:5). Opaque. | Opaque. No jewelry. Nostril wing clean and evenly lit. | Brow line to upper lip. | Three-quarter toward camera left, so the wearer's left nostril faces the camera, as the overlay is authored. | `focus.nose` in `lib/story/desert-eye.ts`: a new slot replaces the cropped half-length still, and the smaller window can be dropped. | Generation only. | **Yes.** About 2 per attempt; allow 2 to 3, 4 to 6 credits. | Yes. | **Internal only.** |
| 6 | Micro-dermal placement close-up | 2400 × 3000 px (4:5). Opaque. | Opaque. No jewelry. High cheekbone under the outer eye clean and evenly lit. | Eye to jaw, wearer's left cheek. | Same three-quarter as asset 5. | `focus["micro-dermal"]`, as above. | Generation only. | **Yes.** About 2 per attempt; allow 2 to 3, 4 to 6 credits. | Yes. | **Internal only.** |
| 7 | Gaara micro-reaction loop | 1080 × 1440 px (3:4), 24 or 30 fps, 1.0 to 1.5 seconds, seamless, no audio. WebM VP9 plus MP4 H.264, under 1.2 MB each. First and last frame identical to asset 3. | Ideally alpha (VP9 alpha WebM plus HEVC alpha for Safari). Generators do not output alpha, so it would be shot on a flat ground and keyed. | Same as asset 3. | Same as asset 3. Eyes narrow, small shift of weight, a little sand lifts, back to idle. No attack. | Replaces the CSS reaction on hover and focus. Needs a small, contained addition to `StoryCharacter`. | **No, not end to end.** Image-to-video from asset 3 is possible; keying and encoding need tools that are not installed. | **Yes.** About 5 per test with `seedance_2_0_mini`; allow 2 to 3, 10 to 15 credits. **Blocked by asset 3.** | Yes. No jewelry in frame. | **Internal only.** |
| 8 | Full 5 to 8 second action and reveal footage | 1920 × 1080 (16:9) master and 1080 × 1920 (9:16) tall version. 5.5 seconds of action, 24 fps, MP4 H.264 `yuv420p` `+faststart`, optional WebM. Under 2.5 MB desktop, 1.2 MB phone. No audio. | Opaque. **No jewelry anywhere.** Must end on a flat, even field of sand filling the frame. | Wide: character left, action across, face never covered. Tall: recomposed, not a centre crop. | Beats as built: stance 0–0.8, one exchange 0.8–3.5, sand erupts 3.5–4.7, sand fills 4.7–5.5. The close-up at 5.5–6.5 stays on the page. | `video` slot in the cinematic. Replaces the concept motion prototype with no code change beyond supplying the file. | **No, not to final.** Test clips are possible; editing two shots together, grading and encoding need tools that are not installed. | **Yes, and beyond the balance.** Tests about 5 each; finals about 35 each with `seedance_2_5`. Two tests and two finals per orientation is about 80 to 160 credits. **Needs a credit purchase, which is the owner's decision.** | Yes. | **Internal only.** Never published without licensing clearance. |

## Order of work and what each step unblocks

1. **Assets 1 and 2 first, at no cost.** They replace the code-drawn jewelry on every surface at once,
   public build included. They need one owner decision before rendering (below).
2. **Asset 3**, then **4**. These two change how the stage and the product state look more than
   anything else. Both need credits and approval. Asset 3 also needs a way to cut the matte.
3. **Assets 5 and 6** once the look of 3 and 4 is approved, so all four pictures match.
4. **Asset 7** only after asset 3 is final, because it must start and end on that exact frame.
5. **Asset 8** last. It is the largest spend and depends on the approved look of 3 and 4.

Estimated credits for assets 3 to 7: about 30 to 45. Asset 8 adds about 80 to 160. Current balance: 10.

## Owner decisions, 21 September 2026

1. Hollow means true openwork: red-faced metal, polished edges and sides, transparent negative space.
2. The repository's glyph outline is approved for prototype product art only, never as manufacturing geometry.
3. No background-removal service and no upload of internal files. The future character is to be generated
   on a clean white or simple neutral ground that suits the white stage; a transparent cutout can come later.
4. No credits approved yet. Assets 1 and 2 first, then a review of the site with them installed, then a
   budget decision. The live balance is rechecked before any spend.
5. Already generated working outputs may serve as look references for internal generation. Customer
   photos, the owner's reference photographs and other files may not.

**Assets 1 and 2 are done** as prototype product art (see `ASSET_SLOT.md`). Assets 3 to 8 have not started.

## Decisions that were needed from the owner (kept for the record)

1. **What "hollow" means for the symbol.** The approved reference shows metal-edged strokes with deep
   red inside them and open space between the strokes. Confirm: red-filled strokes with open gaps, or
   an open metal outline with nothing inside the strokes.
2. **Whether the glyph outline now in the code is the geometry to make exact.** It comes from the Yuji
   Boku font (SIL Open Font License) and is an interpretation of the reference, not a trace of it.
3. **How the cutout matte for asset 3 is made:** install a local background remover, use an outside
   service (the internal picture would leave this machine, which needs approval), or an illustrator.
4. **Budget.** Approve the 30 to 45 credit block for assets 3 to 7, and separately decide on asset 8.
5. **Whether any existing internal picture may be uploaded** as a reference for look consistency. Without
   that, assets 3 to 6 are made from text prompts alone and will match each other less closely.

## Not changing

The site layout, the interaction model, Shopify, and the rule that a build shows placeholders for every
character slot until licensing is cleared.
