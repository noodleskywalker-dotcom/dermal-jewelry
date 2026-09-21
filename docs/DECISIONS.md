# Decisions

Dated records of choices that are not obvious from the code.

## 2026-09-21 — Story-driven collection page (DESERT EYE)

The owner drew the interaction wanted for special collection pages. It replaces the product-card
grid on a collection that has a story. Collections without a story keep the grid.

- **A story is data.** `lib/story/types.ts` describes a story: media slots, the cinematic's beats, the
  framing of each piercing form, where each jewelry object floats, and readiness. `lib/story/desert-eye.ts`
  is the only place DESERT EYE's character, opponent, pictures and timings are named. Replacing a
  character, a clip or a close-up means changing that file and the supplied media, nothing else.
- **Three states in one section of a normally scrolling page:** browsing, the cinematic (a native
  dialog opened by a press) and the product experience. The character is sticky only inside its own
  section on desktop. Nothing is driven by scroll position.
- **Hover is a hint, a press is the story.** Hovering or keyboard-focusing the character runs a
  1.2 second reaction. The cinematic starts only from pressing the character or WATCH STORY. This
  refines the older rule "hover never starts a reveal": hover still never starts one. Hovering a
  jewelry object only moves light, a glint and a few grains of sand, and shows its label.
- **Once per session.** One flag, `dermal-story-seen:<collection>`, is kept in `sessionStorage`. After
  the story has played or been skipped, the character opens the piece directly and the control reads
  REPLAY STORY. The flag holds nothing about a photo or a person.
- **Direct product access.** Every jewelry object is a real link carrying `?product=` and `?form=`, and
  opens the product experience in place without the cinematic. The address never carries anything else.
- **The cinematic resolves into the product.** The product experience is put in place underneath before
  the dialog opens, so Skip and Escape land on it at once. There is no navigation to another page.
- **The jewelry is always an overlay.** The close-up never supplies the jewelry. `StoryVisual` pins a
  `FormVisual` of the chosen form to an anchor on the picture, so the product asset slot feeds this
  surface too. The current internal close-up still already has painted jewelry in it; the overlay is
  drawn exactly over it. A clean close-up without jewelry is listed as a needed asset.
- **CHARACTER → YOUR FACE.** TRY ON keeps the character layer mounted and lets it go as the customer's
  photo arrives, drawn by `LookRenderer` with `previewItems`. No second overlay system exists. The photo
  stays in the Studio provider, in memory, as before.
- **Internal concept material never leaves a development server.** `lib/story/registry.ts` is read only
  by server code. Outside a development server, `storyForBuild` removes the working names and briefs,
  `internalStoryMedia` returns nothing, and `/api/dev-concept/*` answers 404. Every build, including a
  Vercel preview, therefore draws labelled placeholders. Checked on a local production build: the page
  contains neither name, no client chunk contains them, and the media route returned 404.
- **An unfinished story is not shown to customers as finished.** `canPlayCinematic` lets the labelled
  storyboard animatic play for internal review only. A build plays a cinematic only when footage
  exists, rights are cleared and the story is approved; until then the character opens the piece and the
  page says "Story in preparation". With reduced motion the story is always skipped.
- **The animatic is honest about itself.** It is built from the stills on disk and code-drawn
  placeholders, it is labelled "not the final cinematic", and the opponent is a labelled featureless
  figure because no opponent asset exists. No video was generated and no credits were spent.
- **DESERT EYE — LOVE now has a nose form.** The owner set the prototype status: anti-eyebrow is the
  approved prototype composition, micro dermal is the concept-approved hollow symbol on its own, nose
  is the concept-approved deep-red faceted gemstone on its own. Each note says "Not manufacturing-ready".
  The nose demo price (QAR 190) is the placeholder already used for the other nose concept.
  CRIMSON ORBIT's anti-eyebrow form is still concept pending and carries the tests for that state.
- **Paper inside an ink site.** The stage sets `.story-light`. Shared controls written for ink surfaces
  get darker secondary text and a darker focus ring there; an ink panel inside it opts back with `.story-dark`.
- **`useFormChoice` / `useChooseForm`** hold the form-selection logic that the family page had inline, so
  the family page and the story stage cannot drift apart.

## 2026-09-20 — Final direction (supersedes the pinned-chapter homepage below)

The owner's addendum ends the scroll-driven experiment. The pinned chapters, the `--p` scroll variable,
the horizontal collection sequence and the chapter index were deleted, along with the tests that
encoded them. What was kept from that attempt: the type system, the paper and ink palette, the
wordmark-behind-object opening, text links instead of buttons, the blended header on the homepage,
the full-screen mobile menu and the restyled Face Studio.

- **Normal scrolling.** The homepage is five ordinary sections. A browser test asserts that no full-height sticky stage exists and that the wheel moves the page one-to-one.
- **Design families.** A product owns `forms`. `formOf(product, id)` is the single gate: unknown or concept-pending form ids fall back to the default form, so they cannot reach previews, Face Studio, the bag or a URL.
- **Micro dermal form of DESERT EYE — LOVE** is a demo configuration with a single symbol top, labeled on the page as not approved. **Its nose form is concept pending** and cannot be selected. Nothing about those forms' physical design was invented beyond that label.
- **Demo prices per form** reuse the earlier placeholder tiers (390, 220, 190). They remain placeholders.
- **One shared selection.** The chosen form lives in the Studio provider (`forms[productId]`), so the family page, previews, Face Studio and the bag read the same value. The URL `?form=` is applied once on arrival and rewritten with `history.replaceState` on change.
- **Placement memory.** A look item remembers its adjustment per `form:side`. Switching form restores that form's own adjustment or starts from that form's placement default. A different placement profile never inherits coordinates.
- **Bag identity** is product plus form. The storage key moved to `dermal.demo-bag.v2`; older stored bags are ignored.
- **Reveal player.** See `docs/REVEALS.md`. The final jewelry frame is an overlay from the product asset, not part of the video. The development-only test pattern is refused by production builds.
- **Featureless head.** Drawn in code for placement previews. It is an approved device, labeled "Featureless form, not a person".
- **Second collection.** "ORIGINALS" sits beside "DESERT EYE". CRIMSON ORBIT is the complete original example, with micro dermal and nose forms and a product-led metal-sweep reveal.

## 2026-09-20 — Visual redirection (scroll mechanics superseded; visual language kept)

The owner rejected the first homepage as template-like and named a reference video
(`youtube.com/watch?v=6U3k4H346Es`). The video is a tutorial that shows three AI-built sites: a
sculpture-garden site, a personal portfolio and an astronaut scene. Its sites are scroll-scrubbed 3D
and video scenes made with generated assets.

Taken from the reference:
- One pinned full-screen frame per chapter. Scrolling moves the camera into the scene rather than down a stack of sections.
- A numbered chapter index on the right edge and a hairline progress rule.
- One object and one short statement on screen at a time. Copy crossfades while the scene moves.
- Light serif at modest sizes, tiny tracked monospace labels, underlined text links with an arrow instead of buttons.
- A giant wordmark placed behind the subject, on warm paper, before the cut to a dark scene.
- One rare accent colour.

Deliberately not imitated:
- Generated 3D scenes, scroll-scrubbed video and environment art. They need paid generation, which is not approved, and generated imagery must not stand in for the product.
- The reference's copy, logos, statues, columns, portrait and colour scheme.
- Ambient particles and shattering-glass effects. They do not serve jewelry.

How it is built:
- `useScrollProgress` writes one CSS variable, `--p`, per chapter. All motion is CSS `calc()` on that variable, so there is no animation library and no per-frame React work.
- Layers outside their progress window get `visibility: hidden`, so faded-out links cannot be clicked or focused.
- Pinned stages use `overflow: clip`, so keyboard focus can never scroll a stage sideways. Focusing an off-screen collection piece scrolls the page to bring it into frame.
- With reduced motion, every chapter renders as a plain unpinned section with all content visible.
- The homepage header has no background and uses white text with `mix-blend-mode: difference`, so it reads on paper and on ink. Inner pages use a solid bar.
- Typography is now Cormorant Garamond (display) with Geist and Geist Mono. Bodoni Moda was removed.
- Object tiles moved from dark tiles with a red glow to warm paper with a soft contact shadow.
- The Face Studio demonstration on the homepage is a line drawing labeled as an illustration. It uses the same `resolveComponents` layout as the real renderer.
- Face Studio kept all logic and test ids. Only presentation changed: text controls, a floating tool strip over the stage, a horizontal piece rail and a larger stage.
- The top "preview build" banner became a small fixed note on the homepage. Inner pages label demo products and prices inline.

## 2026-09-20 — Milestone 1

- **The master brief is the specification.** `DERMAL_MASTER_BRIEF.md` supersedes the older
  setup-only wording in `README.md` and `CLAUDE.md`. Infrastructure work is finished and is not repeated.
- **One renderer.** Face Studio, the hover panel, the mobile sheet and the product page all draw
  through `LookRenderer`, with layout from `resolveComponents`. Product artwork uses the same layout function.
- **Photo-relative coordinates.** A piece group stores its centre as 0..1 of the photo and its size
  as a fraction of the photo width. Everything inside the photo frame is positioned in percentages,
  so resizing cannot move the jewelry.
- **Wearer's side.** Layouts are authored for the wearer's left, which is the viewer's right in an
  unmirrored photo. Changing side reflects positions and rotation. Artwork is never flipped.
- **Photo handling.** The file is checked by size and by its first bytes, decoded with EXIF
  orientation applied, limited to 2,048 px on the longest edge and re-encoded to JPEG in the browser.
  Only an object URL is kept, in a React provider above all routes. Nothing is persisted.
  Clearing revokes the URL and resets the look and its undo history.
- **Undo.** A whole drag is one undo step. Slider and nudge changes made within 0.8 s of each other
  merge into one step.
- **Switching product** keeps the customer's position, size and rotation when the placement is the
  same, and drops per-piece tweaks because pieces differ between products.
- **Hover panel has no upload button.** A hover panel closes when the file dialog takes focus, which
  would discard the chosen file. The panel links to Face Studio instead. The mobile sheet and the
  product page, which stay open, do offer upload.
- **Demo bag** stores product ids and quantities in `localStorage`. It never stores anything about a photo.
  A pair is one product, so "Add look to demo bag" adds each distinct product once.
- **Commerce mode** comes from `DERMAL_COMMERCE_MODE` and defaults to `preview`. The checkout route
  refuses every request unless the mode is `live`, and live checkout is not built.
- **Symbol artwork.** The outline of U+611B comes from the Yuji Boku font (SIL Open Font License 1.1)
  and is drawn as original concept artwork. It is a placeholder, not a product drawing, and the
  design still needs a rights review before public use.
- **`@types/node` moved to 24** to match the Node 24 runtime and vitest's peer requirement.
- **Robots.** The whole site is `noindex` while it shows demo products.
