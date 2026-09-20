# Decisions

Dated records of choices that are not obvious from the code.

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
