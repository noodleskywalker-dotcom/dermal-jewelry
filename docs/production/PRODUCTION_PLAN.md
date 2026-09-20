# Production plan — reveal, campaign stills, original piece, media spec

Prepared 20 September 2026. **No credits have been spent and no generation has been run.**
Credit figures are the Higgsfield CLI's own read-only estimates (`higgsfield generate cost`) at default
settings on that date. Duration and resolution options can change them, so re-run the estimate with
the final parameters before approving. Account balance at the time: 10 credits, free plan.

| Model (job type) | Kind | Estimate |
| --- | --- | --- |
| `gpt_image_2_5` | image | 1 credit |
| `nano_banana_2_lite` | image | 1 credit |
| `nano_banana_pro` | image | 2 credits |
| `seedance_2_0_mini` | video | 5 credits |
| `kling3_0_turbo` | video | 7.5 credits |
| `veo3_1_lite` | video | 8 credits |
| `seedance_2_5` | video | 35 credits |

## 1. Public IP boundary (applies to everything below)

- The franchise character, its name, forehead mark, gourd, costume, music and footage are **internal concept material only**. None of it goes into a prompt intended for a public asset, into `public/`, or into a deployment.
- The reference images in `references/` are not uploaded to Higgsfield or any other service.
- Every prompt below is written for an **original DESERT EYE identity**: an unnamed desert figure, defined by sand, wind, ochre cloth and a calm, heavy-lidded gaze. It is "inspired by" only in mood.
- Nothing is labeled an official collaboration. The site already says "Anime-inspired design · not an official collaboration".
- The reveal is attached to the product through `reveal` config (title, identity, source), so a licensed scene can replace the original one later without touching the player or the page.

## 2. Reveal storyboard — DESERT EYE, 7.0 seconds, 4:5

The jewelry is **never generated**. It is composited from the exact product asset: tracked onto shot A
in an editor, and drawn by the site's own overlay at the end.

| Time | Shot | Picture | Camera | Notes |
| --- | --- | --- | --- | --- |
| 0.0 – 1.0 | A. Eye | Extreme close-up of one eye and the cheekbone beside it. Skin clean where the piercing sits. | Locked off, or a 3% linear push-in | Locked or linear so the exact jewelry can be tracked on in post with a simple 2D track. |
| 1.0 – 2.5 | B. Establish | Pull back to head and shoulders in a wind-blown dune field at low sun. A hand rises; sand lifts from the ground. | Smooth pull-back, no shake | One movement begins. No opponent is needed on screen. |
| 2.5 – 3.8 | C. Beat | One decisive gesture: the hand closes and a wall of sand snaps upward and forward. | Holds, slight low angle | A single readable action. No multi-shot battle, no weapons, no blood. |
| 3.8 – 5.0 | D. Sweep | The sand wall rushes the lens and fills the frame edge to edge. | Static; the sand does the moving | This is the transition. It must end fully covered. |
| 5.0 – 6.5 | E. Settle | Grains fall and settle into a calm, raked-sand surface with soft side light. | Static | Must match backdrop S1 so the cut to the poster and overlay is invisible. |
| 6.5 – 7.0 | F. Reveal | Hold on the empty sand field. | Static | The site fades in the exact overlay for the customer's selected form, centred and sharp. The product name appears in the page, not in the video. |

Because the ending is an empty backdrop, the same film serves the anti-eyebrow pair, and later the
micro dermal and nose forms once they are designed.

## 3. Higgsfield prompts and shot specifications

Shared negative instruction, appended to every prompt:

> No jewelry, no piercings, no earrings, no metal on the face. No text, letters, logos, watermarks or
> symbols. No tattoos or forehead marks. No recognisable existing character, no anime franchise
> costume, no gourd, no headband. No weapons, no blood. No extra fingers, no warped hands, no second
> face. No lens flares, no neon, no heavy film grain, no vignette.

### S1 — Sand atmospheric product backdrop (still)

- **Model:** `gpt_image_2_5`. **Aspect:** 4:5. **Duration:** still.
- **Framing:** top-down at about 70 degrees onto a field of fine pale sand, raked in long shallow curves; the central 40% of the frame is calm and nearly flat.
- **Lighting:** one soft, low, warm key from the upper left; long gentle shadows in the rake lines; no hard highlights.
- **Motion:** none. **Camera:** static.
- **Background:** the sand is the whole image. Warm bone to pale ochre, close to `#e7e2d8` in the light areas.
- **Subject position:** no subject.
- **Overlay zone:** the exact jewelry is composited in the central 40%, so that area must stay quiet and evenly lit.
- **Desktop use:** product hero ground, reveal poster, last frame of the reveal, homepage featured-family section.
- **Mobile crop:** 4:5 is used as is; a 1:1 centre crop must still be calm.
- **Prompt:** "Fine pale desert sand photographed from a high angle, raked in long shallow flowing curves, the centre of the frame smooth and almost flat, soft low warm sunlight from the upper left, long gentle shadows in the grooves, warm bone and pale ochre tones, editorial still life, extremely clean, high detail grains, shallow contrast, 4:5."

### S2 — Hero campaign face shot (still)

- **Model:** `nano_banana_pro`. **Aspect:** 3:2 master for desktop, composed so a 4:5 mobile crop works.
- **Framing:** tight beauty close-up of an adult model's face, three-quarter turned to camera left, cropped from mid-forehead to just below the lips. The model's left eye and cheekbone sit on the right third of the frame.
- **Lighting:** soft large source from camera left, gentle falloff into shadow on the right, matte natural skin with visible texture, no retouched plastic look.
- **Motion:** none. **Camera:** static, 85 mm portrait look, shallow depth of field, eye sharp.
- **Background:** plain warm bone seamless, slightly darker at the right edge.
- **Subject position:** face occupies the right 60%; the left 40% is empty for the wordmark and headline.
- **Overlay zone:** the clean skin just below and outside the outer corner of the model's left eye, on the right third. It must be evenly lit, in focus and free of hair.
- **Desktop use:** homepage opening, replacing the code-drawn pieces on the wordmark.
- **Mobile crop:** 4:5 crop taken from the right 60%, keeping the eye, cheekbone and overlay zone; the empty left side is dropped.
- **Prompt:** "Editorial beauty close-up of an adult model, face three-quarter turned toward camera left, cropped mid-forehead to just below the lips, the model's left eye and cheekbone on the right third of the frame, calm heavy-lidded gaze, natural matte skin with real texture, hair pulled back away from the cheek, soft large light source from the left with gentle shadow falloff, plain warm bone seamless background, empty negative space on the left 40 percent of the frame, 85mm portrait lens, shallow depth of field, eye tack sharp, high-end fashion campaign, 3:2."
- **Rule:** this is a synthetic model for campaign atmosphere. It must not be offered as a Face Studio "sample photo of a real person", and the exact jewelry is composited from the product asset afterwards.

### S3 — Final call-to-action campaign shot (still)

- **Model:** `gpt_image_2_5`. **Aspect:** 16:9 master, safe for a 4:5 centre-right crop.
- **Framing:** wide, low horizon dune landscape at dusk, one long clean dune ridge crossing the lower third from left to right, large calm sky.
- **Lighting:** last warm light raking the ridge from the right, cool shadow side, no sun disc in frame.
- **Motion:** none. **Camera:** static, 35 mm look.
- **Background:** sky graduates from warm bone at the horizon to deep charcoal at the top, so ivory text reads in the upper half.
- **Subject position:** no figure. The ridge line is the subject.
- **Overlay zone:** none required. If the pair is shown, it is composited small on the right third above the ridge.
- **Desktop use:** homepage close, behind "Your face. Your placement. Your piece."
- **Mobile crop:** 4:5 from the centre-right, keeping the ridge in the lower third.
- **Prompt:** "Minimal desert dune landscape at dusk, one long clean dune ridge crossing the lower third of the frame, vast calm sky graduating from warm bone at the horizon to deep charcoal at the top, last warm light raking the ridge from the right, cool blue-grey shadow side, no people, no tracks, no sun in frame, quiet cinematic fashion campaign, 35mm, 16:9."

### V1 — Reveal action sequence (video), shots B to E

Generated as image-to-video from an approved start frame, so the look is locked before any video credit is spent.

- **Start frame (still, `nano_banana_pro`, 4:5):** "Head-and-shoulders portrait of an unnamed adult desert figure standing in a wind-blown dune field at low sun, short wind-tossed dark auburn hair, calm heavy-lidded pale eyes with dark shadowed lids, plain layered ochre and charcoal cloth wrapped at the neck, one hand beginning to rise at the lower right of frame, fine sand lifting from the ground around them, warm low side light from the left, soft haze, cinematic, muted palette of bone, ochre and charcoal, 4:5."
- **Model:** test with `seedance_2_0_mini`; final with `seedance_2_5` or `veo3_1_lite` after the test is approved.
- **Aspect:** 4:5 (use 3:4 or 9:16 if 4:5 is not offered, and crop). **Duration:** 5 to 6 seconds for shots B to E.
- **Camera:** starts on the figure, no shake; holds while the sand rises; static once the sand covers the lens.
- **Framing:** figure centred, head in the upper third; the sand enters from the bottom and right.
- **Lighting:** warm low side light from the left, consistent throughout; brightens evenly as sand fills the frame.
- **Motion:** the raised hand closes; a wall of sand snaps upward and rushes toward the camera; it fills the frame completely; grains then fall and settle into a calm raked surface lit from the upper left.
- **Background:** dune field, then nothing but sand.
- **Subject position:** centred, fully hidden by the sand from about 60% of the clip onward.
- **Overlay zone:** the centre of the final settled sand. The site composites the exact jewelry there after the video ends.
- **Desktop use:** family page concept reveal, contained 4:5 player, and the expanded view.
- **Mobile crop:** 4:5 is native; no re-crop.
- **Prompt:** "The figure's raised hand closes into a fist. A huge wall of fine sand snaps upward from the ground and rushes toward the camera, sweeping across the whole frame until only sand is visible. The rushing sand then slows, the grains fall and settle into a calm, smooth, softly raked sand surface lit by low warm light from the upper left. Camera stays steady, no shake, no cuts. Cinematic, premium, restrained."

### V2 — Eye close-up (video), shot A

- **Start frame:** a tight 4:5 crop of still S2, or a dedicated still: "Extreme close-up of one calm heavy-lidded pale eye with dark shadowed lids and the cheekbone beside it, clean bare skin below and outside the outer corner of the eye, soft warm side light, shallow depth of field, 4:5."
- **Model:** `seedance_2_0_mini`. **Duration:** the shortest option; only 1 second is used.
- **Camera:** locked off with a barely perceptible linear push-in. **Motion:** one slow blink or none; a few grains drift past.
- **Overlay zone:** the bare skin below and outside the eye. The exact pair is tracked on in an editor.
- **Prompt:** "Almost still. A very slow, slight push-in on the eye. A few grains of sand drift across the frame. No blink until the end. Steady, no shake."

Assembly is a plain edit: V2 (1.0 s) + V1 (5.5 s) + 0.5 s hold on the last frame = 7.0 s.
The hold can also simply be the poster image, since the site shows the still after the video ends.

## 4. Minimum test plan — about 8 of the 10 available credits

Goal: prove the visual direction with the fewest generations, stills first, one video last.

| Step | Asset | Model | Runs | Estimate | Gate before the next step |
| --- | --- | --- | --- | --- | --- |
| 1 | S1 sand backdrop | `gpt_image_2_5` | 1 | 1 | Owner likes the sand and light. Every later asset must match it. |
| 2 | V1 start frame (desert figure) | `nano_banana_pro` | 1 | 2 | Owner approves the original figure and confirms it does not read as the franchise character. |
| 3 | V1 sand sweep, test quality | `seedance_2_0_mini` | 1 | 5 | Does the sand fill the frame and settle cleanly? Is the last frame usable under the overlay? |
| | **Total** | | **3** | **8** | 2 credits remain for one retry of a still. |

Not in the minimum plan: S2, S3, V2 and any final-quality video. The test reveal would open directly on
shot B. If step 3 fails, the fallback is a stills-only reveal: a slow cross-dissolve from the start
frame to S1, which needs no video credit.

## 5. Premium production plan — for a later, funded round

| Asset | Model | Planned runs | Estimate each | Subtotal |
| --- | --- | --- | --- | --- |
| S1 backdrop, 3 variations | `gpt_image_2_5` | 3 | 1 | 3 |
| S2 hero face, 4 variations | `nano_banana_pro` | 4 | 2 | 8 |
| S3 call-to-action landscape, 3 variations | `gpt_image_2_5` | 3 | 1 | 3 |
| V1 start frame, 3 variations | `nano_banana_pro` | 3 | 2 | 6 |
| V1 sweep, test passes | `seedance_2_0_mini` | 2 | 5 | 10 |
| V1 sweep, final quality | `seedance_2_5` | 2 | 35 | 70 |
| V2 eye close-up | `seedance_2_0_mini` | 2 | 5 | 10 |
| Upscale of the chosen stills and final video | `bytedance_image_upscale`, `video_upscale` | as needed | not yet estimated | — |
| **Approximate total before upscaling** | | | | **110 credits** |

This exceeds the current balance and needs a plan or credit purchase, which is the owner's decision.
Post-production outside Higgsfield is also needed: a 2D track of the exact jewelry onto shot A, the
edit, colour matching to S1, and encoding to the spec below.

## 6. Original piece — three katana-geometry directions

Working family name: **KIRI** (not cleared). Reduced Japanese blade geometry, polished silver or
titanium *appearance* only. No character, no named sword, no clan crest. No dimensions, alloys,
threads or compatibility are stated, because none are verified.

| | Direction A — "Sliver" | Direction B — "Guard" | Direction C — "Temper line" |
| --- | --- | --- | --- |
| Idea | One long tapered blade sliver with a single ridge line along its length and an angled tip | A small openwork disc derived from a sword guard: a circle with one narrow blade-shaped slot cut through it | A plain polished bar divided by one soft wave line: mirror finish on one side, satin on the other |
| Anti-eyebrow | The sliver as the upper, outer piece, set on the diagonal; a tiny plain polished point as the lower, inner piece | Guard disc upper and outer; small plain point lower and inner | Short bar upper and outer; small plain point lower and inner |
| Micro dermal | A shortened sliver | The guard disc alone | A short bar with the wave line |
| Nose | A very small angled tip | A very small disc with the slot | Probably too fine to read at this size; may be left out |
| Reads as | Sharp, directional, the most "blade" | Emblem-like, the most wearable, closest in spirit to the symbol piece | Quiet and material-led, the most fashion, the least literal |
| Risk | Length near the eye needs the maker's review | The slot must stay open at small sizes | The two finishes must be visible in photographs and on a phone |
| Concept reveal | A single thin line of light travels the length of the piece, once | The same light crosses the disc and passes through the slot | The light reveals the wave line as it passes |

Recommendation: develop **B — Guard** first. It works at all three sizes, pairs naturally with a small
point in the anti-eyebrow form, and gives the brand a second emblem that is clearly not from an anime.
Placement preview uses the approved featureless sculpted head. The concept view uses the existing
metal-sweep reveal, which is already built and needs no video.

Assets needed for the chosen direction: a design sketch, then the same seven assets per form as in
`ASSET_MANIFEST.md`. Until a direction is chosen, CRIMSON ORBIT remains the working original example.

## 7. Technical media specification

Muted-first. No asset on the site needs audio. Nothing below is preloaded on the homepage.

| Asset | Master | Desktop delivery | Mobile delivery | Aspect | Codec and container | Target size | Poster | Preload | Fallback still | Audio |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Reveal mini-scene (V1 + V2), 7 s | Highest native output of the chosen model, upscaled to 2160 × 2700 if clean | 1080 × 1350 | 720 × 900 | 4:5 | MP4 H.264 High, `yuv420p`, `+faststart`, as the universal file; WebM VP9 as an optional smaller source | 1.5 – 2.5 MB desktop, 0.7 – 1.2 MB mobile | Asset 7 in the manifest: S1 plus the exact overlay, 1080 × 1350, AVIF with WebP fallback, under 120 KB | `preload="none"`; the file is requested only after **Watch reveal** is pressed | The poster | No. If sound is ever added it stays off until the visitor turns it on. |
| Expanded reveal, optional | Same master | 1620 × 2025 | not served | 4:5 | same | up to 4 MB | same poster | none, only after the expanded view is opened and play is pressed | The poster | No |
| Hero campaign still S2 | 4800 × 3200 | 2400 × 1600 and 1600 × 1067 | 1080 × 1350 (4:5 crop) and 720 × 900 | 3:2, mobile 4:5 | AVIF with WebP fallback, responsive `srcset` | 180 – 260 KB desktop, under 120 KB mobile | not applicable | Eager, `fetchpriority="high"`, because it is the largest first-screen element | A flat `#e7e2d8` background colour | No |
| Sand backdrop S1 | 4000 × 5000 | 1600 × 2000 | 1080 × 1350 | 4:5 | AVIF with WebP fallback | under 150 KB | not applicable | Lazy | Flat `#e7e2d8` | No |
| Call-to-action still S3 | 4800 × 2700 | 2400 × 1350 | 1080 × 1350 (4:5 crop) | 16:9, mobile 4:5 | AVIF with WebP fallback | under 220 KB | not applicable | Lazy, below the fold | Flat `#0c0c0d` | No |
| Product overlays (per piece) | 2048 px | 1024 px | 512 px | 1:1 | PNG or WebP with alpha | under 150 KB, under 60 KB | not applicable | Loaded with the product they belong to | Current concept artwork | No |
| Original-piece light sweep | none, drawn in CSS | — | — | — | — | 0 KB | the product still | none | the product still | No |

Homepage rules: one eager image only (S2). No video on the homepage. Reveal media is requested only on
a product page and only after an explicit press. The reduced-motion and failure paths already fall
back to the poster still.

Small follow-up in code when real files exist (not done now, no redesign): add `poster` and separate
desktop and mobile `sources` to the product's `reveal` config, and swap the code-drawn pieces for
image overlays inside the existing renderer.

## 8. What the owner must approve before any generation

1. **The public identity**: reveal and campaign use an original DESERT EYE figure, not the franchise character. Yes or no.
2. **The 7.0 second storyboard** in section 2, including that the jewelry is composited and never generated.
3. **The anti-eyebrow product art**, as two transparent files (`symbol`, `gemstone`; see `ASSET_SLOT.md`). For the prototype a signed-off illustration is enough, classified as PROTOTYPE PRODUCT ART. CAD renders or photography replace it before commercial launch. Without it the site keeps the labeled concept artwork.
4. **The design of the micro dermal and nose forms**, or confirmation that they stay "design required" for now.
5. **The three still prompts and the start-frame prompt** in section 3, word for word.
6. **The minimum test plan** in section 4: 3 generations, about 8 of the 10 available credits.
7. **Whether a synthetic campaign model (S2) is acceptable**, given it is never presented as a real customer or as a Face Studio sample photo.
8. **The katana direction** to develop (A, B or C), and the working name KIRI.
9. **Budget for the premium plan** (about 110 credits before upscaling), to be decided only after the test.
10. **Uploading anything to Higgsfield**: only generated stills from step 2 onward are used as inputs. The files in `references/` are never uploaded.
