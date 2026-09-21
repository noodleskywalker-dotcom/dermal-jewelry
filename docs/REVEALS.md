# Concept reveals

Optional, short reveal moments for selected products. They are storytelling. They are not a
demonstration of physical fit, and they never stand between a customer and shopping.

## Rules the player enforces

- Three product-level modes: `none`, `loop` (short motion loop) and `mini-scene`.
- A mini-scene is 5 to 8 seconds in total, including the final jewelry frame. The player stops it at `maxSeconds` (8) even if the file is longer.
- Nothing autoplays. Playback starts only from the explicit **Watch reveal** button or from pressing the artwork, which is itself a labeled button. Hover never starts a reveal; hover stays reserved for the personalized try-on preview.
- Media loads only after that press. No reveal file is requested when a page opens.
- Muted at first, with a sound control. **Skip** is available immediately. **Replay** appears at the end. The expanded view is opened on purpose and closed with Close or Escape, and focus returns to the page.
- Only one reveal plays at a time. Changing view, changing product or leaving the page stops it.
- The final jewelry frame is a separate overlay drawn from the product asset for the customer's selected piercing form. A video never draws the product, so it cannot redesign it, and the ending always matches the chosen form.
- Slow loading (8 seconds), a playback error or unsupported media all fall back to the still with a plain message.
- With reduced motion, only the still is offered.
- The selected piercing form is never changed by playing, skipping, replaying or closing a reveal.
- Anime-inspired pieces may use a character-led motion language. Original pieces use product-led motion only, never a fight scene.
- No generation service is ever called while a customer shops. Reveals are prepared files.

## Collection stories (added 21 September 2026)

A story-driven collection page has a character on the page and one special cinematic. The rules above
still hold, with these additions. The story is described in `lib/story/` and drawn by `components/story/`.

- A mouse coming within reach wakes the character slightly. Hovering or focusing him gives a reaction of
  0.5 to 1.5 seconds (1.0 today). Both are hints. Neither starts the cinematic or loads anything.
- The cinematic starts only from pressing the character or **Watch story**. **Skip →** is on screen and
  focused from the first frame, and Escape skips too. It always ends in the product experience, in place.
- Target length is 6 to 7 seconds. DESERT EYE runs 6.5: stance 0.0–0.8, one exchange 0.8–3.5,
  sand erupts 3.5–4.7, sand fills the frame as the hidden cut 4.7–5.5, close-up 5.5–6.5.
- After it has played or been skipped once in a session it does not play again by itself. The control
  reads **Replay story**.
- Every jewelry object opens its product directly. The cinematic is never required for shopping.
- The close-up's jewelry is a product overlay for the chosen form, pinned to the picture. The one
  exception is a picture that already has jewelry painted in: it is shown as that reference, without
  an overlay, until a clean picture replaces it.
- Until footage exists the action is a **concept motion prototype**: a monochrome storyboard animatic,
  labelled as such in internal review and never presented as final footage.
- A footage slot (`video`) exists. When a file is supplied it plays under the same timeline and stops
  before the close-up, which always belongs to the page.
- Outside a development server the story is not playable until footage exists, rights are cleared and it
  is approved. Until then customers see a labelled placeholder figure and "Story in preparation".

| Story | Interaction | Storyboard | Character media | Source video | Rights cleared | Approved | What a build shows today |
| --- | --- | --- | --- | --- | --- | --- | --- |
| DESERT EYE | implemented, tested | prepared | internal concept stills only, half-length, with background | **missing** | no | no | Placeholder figure, floating jewelry, direct product access, no cinematic. |

## Readiness, tracked separately

| Product | Mode | Identity | Player implemented | Storyboard prepared | Source video | Approved for publication | What the customer sees today |
| --- | --- | --- | --- | --- | --- | --- | --- |
| DESERT EYE — LOVE | mini-scene | sand / impact / reveal | yes | yes (below) | **missing** | no | A deliberate still of the chosen form with "Reveal in preparation". No player controls. |
| CRIMSON ORBIT | loop | metal sweep | yes | yes (below) | not needed (drawn in CSS) | no, owner has not reviewed it | A still with **Watch reveal**; a single blade of light crosses the piece for about 2.5 seconds. |
| SAND VORTEX, VOID STUD | none | — | — | — | — | — | Placement preview and try-on only. |

A labeled **test pattern** (`public/fixtures/reveal-test-pattern.webm`, made by
`tests/fixtures/make-reveal-fixture.mjs`) exists only to exercise the player. It shows the words
"TEST PATTERN, not campaign media" and a timer. It is offered only by a development server through
`?revealFixture=1`; a production build ignores that parameter. It is not the campaign scene.

> The production-ready storyboard, prompts, generation plans and media specification now live in
> `docs/production/PRODUCTION_PLAN.md`. The storyboard below is the earlier outline it was built from.

## Storyboard for approval: DESERT EYE — LOVE, 7.0 seconds

This is a proposal. It is not permission to generate paid media, and nothing has been generated.

| Time | Beat | Picture | Notes |
| --- | --- | --- | --- |
| 0.0 – 1.0 s | Open | Extreme close-up of an eye with the placement beside it, or one still character pose. | One held image, slow push-in. Establishes the face and the placement. |
| 1.0 – 3.5 s | Action | One clear exchange and one decisive winning beat. | A single readable action, not a multi-shot battle. No more than two cuts. |
| 3.5 – 5.0 s | Sand | Sand sweeps across and fills the whole frame. | The sweep is the transition. It must end on a flat, even sand field so the overlay can sit on it. |
| 5.0 – 7.0 s | Reveal | The sand settles into a backdrop. The selected form of the jewelry appears, centred and sharp. | The jewelry is **not** in the video. The player fades in the product overlay for the customer's selected form over the last frame. |

Motion language: sand, impact, reveal. Sound, if any, is off by default.

Requirements for the delivered file:
- The last 2 seconds hold a calm backdrop with no jewelry, no text and no character, so the overlay reads clearly for any form.
- No franchise character, logo, name, music or footage unless rights are confirmed in writing. Until then, the character beats must use original characters or abstract figures.
- 4:5 portrait, because the contained media area is 4:5. A 16:9 master may also be kept for the expanded view.

## Storyboard: original pieces (CRIMSON ORBIT), about 2.5 seconds

A still of the piece on warm paper. One narrow band of light crosses from left to right at a slight
angle, like a blade catching light, and the piece settles. No character, no action scene. This is
drawn in CSS today and needs no media file.

## Media still needed

1. **DESERT EYE — LOVE mini-scene source video**, 5 to 8 seconds, 4:5, ending on a clean sand backdrop (see above). Needs an approved budget and an approved generation or production route.
2. **Rights decision for any character imagery** in that scene, or an original character design to use instead.
3. **Approved product assets for each form** used as the final overlay: anti-eyebrow pair, micro dermal top, and the nose form once it is designed. Today the overlay uses labeled concept artwork.
4. **A poster still** for the mini-scene, so the idle state can show a frame from the scene instead of the plain product still.
5. **Optional sound**, cleared for commercial use.
6. **Owner review of the metal-sweep loop** before it is treated as approved.
7. **A short motion identity for each future special piece** (for example a darker, sharper blade or energy language for a second anime-inspired design). None is designed yet.
