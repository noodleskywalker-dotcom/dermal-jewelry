# Test report

## Story-driven collection page — 21 September 2026

All browser results are **browser emulation on a Windows desktop** against a development server,
which is the only place internal concept stills exist. No physical phone, tablet or Mac was used.

| Command | Result |
| --- | --- |
| `npm run lint` | pass, 0 problems |
| `npm run typecheck` | pass, 0 errors |
| `npm test` | 66 of 66 pass (9 new in `tests/unit/story.test.ts`) |
| `npm run test:e2e` | 151 pass, 20 skipped, 0 fail (desktop Chromium, Pixel 7 emulation, WebKit) |
| `npm run build` | pass |
| Search of `.next/static` for the internal character names and the dev media route | 0 files |
| Local production build (`next start`), `/collections/desert-eye` | no character names in the page, `data-media="placeholder"`, "Story in preparation", `/api/dev-concept/closeup` returned 404 |

Skipped tests are the earlier ones plus three hover tests on the phone project. One earlier full run
showed five WebKit failures that were `ENOENT` errors on Playwright trace files: a second Playwright
command had been started at the same time and cleared `test-results`. Run alone, the suite passed.

What the new browser tests (`tests/e2e/story.spec.ts`, 11 tests on three projects) cover:
- The stage shows the character and four jewelry objects, no product cards, no console errors, and nothing plays during 1.2 seconds of waiting. Each object is a link named with the piece, the form and the demo price.
- Hovering the character sets the reaction, never opens the cinematic, and returns to idle inside two seconds.
- Hovering an object shows its name, form, price and TRY ON, and starts nothing.
- An object opens the product in place with `?product=&form=` in the address; the address alone opens the same form; Back clears it; a piece without a story (SAND VORTEX) is shoppable the same way and adds QAR 350 to the bag.
- WATCH STORY opens the cinematic from a press, Skip is visible and focused at once, it is labelled "not the final cinematic", and skipping lands on the product with focus on its title, all three piercing types enabled, all three views, QAR 390, the "Not manufacturing-ready" note and a working Add to demo bag.
- Left alone, it runs stance, exchange, fill and close-up, shows the two-piece product overlay on the close-up, ends between 5 and 9.5 seconds after its first frame (the design is 6.5; the ceiling allows for a busy test machine), then offers Replay story. In the same session, and after a reload, the character opens the piece without replaying. Replay is explicit and Escape skips it.
- The character is reachable by keyboard, named "Watch the DESERT EYE story", and Enter starts it.
- Changing piercing type changes the visual's form, the number of overlay pieces (2, 1, 1), the price (390, 190, 220), the note and the address; with stills present the nose uses a different picture from the eye close-up; the placement view and the ordinary product page follow the same form.
- TRY ON from an object opens the try-on view, says the photo is never uploaded, keeps the character until a photo arrives, then hides it and draws the customer's photo through `LookRenderer` with a `blob:` URL. Changing form changes the pieces on the face. No non-GET request was made, and neither the address nor session storage holds anything about the photo. The photo and form carry into Face Studio.
- Reduced motion: "View the piece", the story is skipped, no replay control.
- Normal scrolling, no sideways overflow, every object at least 44 px.

Existing tests changed because DESERT EYE — LOVE now has a nose form: the concept-pending checks moved
to CRIMSON ORBIT's anti-eyebrow form, the nostril filter now shows two pieces, and the collections test
follows the new stage. The unusual-size check now also covers the stage and its product state; it found
a 2 px sideways overflow at 320 px from the light sweep on a tilted object, which was fixed.

Screenshots opened and inspected (not committed, because they contain internal concept stills): stage
at 1440 × 900 and Pixel 7, object hover, six cinematic frames, product state for all three forms,
placement, try-on with and without the fixture, and the placeholder stage from a production build.
Inspection led to these fixes: a rectangular sand eruption became a growing circle, captions that were
unreadable over the close-up became ink chips, the still's hard edges were feathered on all sides, the
nose object no longer collides with the pair's label, and the micro-dermal anchor moved off a shadow.

Not tested: real devices, a screen reader, real footage (none exists), and how the animatic feels at
its true speed to a person, which needs the owner's eye.


## Final direction: design families and reveals — 20 September 2026

All browser results below are **browser emulation on a Windows desktop**. No physical phone, tablet or
Mac was used.

| Command | Result |
| --- | --- |
| `npm run lint` | pass, 0 problems |
| `npm run typecheck` | pass, 0 errors |
| `npm test` | 49 of 49 pass |
| `npm run test:e2e` | 118 pass, 17 skipped, 0 fail (desktop Chromium, Pixel 7 emulation, WebKit) |
| `npm run build` | pass |
| Search of `.next/static` for the Shopify token prefix | 0 files |

Skipped tests: desktop-only behaviour on the mobile project, the mobile menu on desktop projects, the
unusual-size checks outside desktop Chromium, and reveal **playback** in WebKit, whose Windows build
cannot decode the WebM test pattern. The WebKit failure path is covered by the failed-media test.

What the new tests cover:
- Changing form updates the form identifier, the placement preview, the number of pieces (2 to 1), the piece position, the demo price, the package text, the honest form note and the URL.
- A concept-pending form is disabled and labeled, and asking for it by URL falls back to the default form.
- A product-and-form URL opens on that form.
- The chosen form holds across Concept reveal, Placement preview and Try on your face, and two forms of one design become two bag lines with their own labels, quantities and prices (QAR 610, then QAR 830 after one increase).
- The original piece has working forms, and its nose form is drawn on the nose, smaller and nearer the centre line than the cheek form.
- In Face Studio, switching form keeps the same photo object URL, changes the pieces, starts the other form from its own placement, and restores the first form's adjusted position when switching back. No non-GET request was made.
- Without approved media the reveal is a still with "Reveal in preparation", has no Watch button, creates no video element and requests no media file, and Add to bag and Try it on stay usable.
- Hovering the reveal for 0.8 seconds starts nothing and loads nothing.
- Missing media shows "couldn't play" and the still, and shopping still works.
- Reduced motion offers the still only, and the homepage shows every section with no entrance animation.
- The original piece's metal-sweep loop plays without any video element, ends on its own and can be replayed.
- With the labeled test pattern (Chromium): Enter on the Watch button starts it, Skip is there at once, the video starts muted and the sound control unmutes it, Skip shows the final frame for the chosen form, Replay works, changing view stops playback, the expanded view opens on request and Escape closes it, the artwork is a labeled button, and a nine-second file is ended at eight seconds.
- The homepage has no full-height sticky stage and the wheel moves the page exactly 600 px and then 900 px.
- At 320 × 568, 720 × 450 (a 1440 × 900 window at 200% zoom), 1280 × 480, 844 × 390 and 2560 × 1200: no sideways overflow on `/`, the family page, `/shop` and `/face-studio`; Add to demo bag can be scrolled into view, is at least 44 px tall and sits inside the viewport; the first tab stop shows a focus outline.

Screenshots opened and inspected for this round: family placement preview (anti-eyebrow, micro dermal),
reveal still, original nose placement, and the family page at 320 px wide, 1280 × 480 and 844 × 390.
Inspection found and fixed three defects: the 4:5 media frame was taller than the window, the header
showed "Search" on phones, and the view tabs wrapped onto three lines at 320 px.
Other captured files in `docs/screenshots/` were not individually inspected and are not offered as evidence.

Remaining manual checks, not reported as passed:
- A physical iPhone and Android phone, including Safari and touch dragging with a finger.
- Real browser zoom at 200% (only the equivalent viewport size was emulated).
- A screen reader pass over the tabs, the form selector and the reveal controls.
- The reveal with real campaign media, including sound, once it exists.
- Playback in Safari with an MP4 or HEVC file. Only a WebM test pattern in Chromium has been played.
- Colour contrast measured with a tool on the paper sections.

## Visual redirection — 20 September 2026

Same machine and method as below, after the homepage, navigation and Face Studio restyle.

| Command | Result |
| --- | --- |
| `npm run lint` | pass |
| `npm run typecheck` | pass |
| `npm test` | 40 of 40 pass |
| `npm run test:e2e` | 90 pass, 6 skipped, 0 fail, across desktop Chromium, Pixel 7 emulation and WebKit |
| `npm run build` | pass |
| Search of `.next/static` for the Shopify token prefix | 0 files |

Skipped tests are desktop-only behaviour on the mobile project (hover pane, chapter index) and the
mobile menu test on the desktop projects.

New homepage tests (`tests/e2e/home.spec.ts`):
- The first screen shows one statement and one action, with no console errors, and the product detail copy is hidden.
- Scrolling the first chapter raises its progress, shows the product name and both callouts, and hides the opening statement.
- In the Face Studio chapter the named piece changes from DESERT EYE — LOVE to SAND VORTEX as the visitor scrolls.
- Vertical scrolling moves the collection sideways, the last piece and the collection link come into view, and the link works.
- Keyboard focus on an off-screen piece brings it into the frame.
- Try on opens the preview sheet from the sequence and Escape closes it.
- The closing chapter leads to Face Studio.
- Reduced motion produces no pinned stages, no track transform, and every heading and all four pieces visible.
- Desktop: hovering a piece opens exactly one preview pane, which closes on leave. The chapter index jumps to a chapter and marks it current.
- Mobile: the menu opens as a full-screen dialog, navigates and closes.

All Milestone 1 Face Studio, preview, look, bag, privacy and checkout-guard tests still pass unchanged,
apart from selectors for the new mobile menu.

Not tested: real phones, real Safari, scroll smoothness and frame rate on low-end devices, screen readers,
200% zoom, and the look of the sequence on very short or very wide viewports.

## Milestone 1 — 20 September 2026

All commands ran locally on Windows 11, Node 24.19, against the dev server at `http://localhost:3000`,
on branch `feat/dermal-first-slice`.

| Command | Result |
| --- | --- |
| `npm run lint` | pass |
| `npm run typecheck` | pass |
| `npm test` | 40 of 40 unit tests pass |
| `npm run test:e2e` | 67 pass, 2 skipped, 0 fail |
| `npm run build` | pass |
| Search of `.next/static` for the Shopify token prefix and variable names | 0 files |

The two skipped browser tests are the hover and keyboard-focus preview tests on the mobile project,
where that behaviour does not apply.

### Browser projects

| Project | Engine | Viewport |
| --- | --- | --- |
| desktop-chromium | Chromium | 1440 × 900 |
| mobile-chromium | Chromium, Pixel 7 emulation with touch | 412 × 915 |
| desktop-webkit | WebKit | 1280 × 800 |

WebKit here is Playwright's automated build. No real iPhone, Android phone or Safari was used.

### What the browser tests cover

- Home to collection to hero product, with no console errors. Real 404 for an unknown product.
- Placement filters, search and the empty state.
- Add to demo bag with no photo and no account.
- `POST /api/checkout` returns 403 `checkout_disabled`.
- Reduced motion removes animation.
- A valid photo loads as a `blob:` URL and places the pair with the symbol upper and outer and the gemstone lower and inner.
- Refused files: text renamed `.png`, SVG, HEIC, a corrupt PNG and a file over 10 MB, each with its message. A valid photo still loads afterwards.
- Mouse drag, size slider, rotation slider, undo back through each step, redo and reset.
- Adjusting the gemstone alone leaves the symbol where it was.
- Arrow keys, Shift plus arrow, and the nudge buttons.
- The jewelry stays on the same point of the photo at 820 × 1180, 390 × 844 and 1600 × 760.
- Wearer's right mirrors the position and keeps the symbol outer and unflipped.
- Pointer events of type touch move the jewelry. The handle has `touch-action: none`; the page body does not.
- Switching piece keeps the same photo and position. `/face-studio?product=…` opens on that piece.
- The photo follows client-side navigation into the Try on sheet, and Clear photo removes it from the Studio and from previews.
- After a reload there is no photo, and no app data exists in `sessionStorage`, IndexedDB or the Cache API. `localStorage` holds only the demo bag.
- Desktop hover panel shows the photo, stays inside the viewport, stays open under the pointer and closes on leave. Only one panel exists at a time.
- Keyboard focus opens the panel, Escape closes it and focus stays in the card.
- Look: add a second piece, the replace-or-add prompt, replace, add look to bag as one line per product, quantity change, subtotal, removal, empty bag, Escape closes the drawer, remove pieces.
- The bag survives a reload and `/cart` matches the drawer.
- Network: during photo selection, editing, product switching, bagging and clearing, the page made no request with a body, no non-GET request, and no request at all outside Next.js dev assets. Hot-reload socket frames carried no image data.

### Not tested

- A real phone or a real Safari browser.
- A real face photo. The fixture is an abstract grid and says nothing about how placement looks on a face.
- EXIF rotation with a rotated camera photo. The code requests orientation from the decoder, but no rotated fixture exists.
- Screen readers. Roles, labels and focus order were written deliberately but only checked through the accessibility tree and keyboard tests.
- 200% zoom and landscape phones.
- Colour contrast by tool. Token contrast ratios were calculated by hand.
- Two separate browser contexts sharing state. State is in memory and `localStorage` per browser, so none is expected.
- Performance and Core Web Vitals.
- Anything involving Shopify. This milestone makes no Shopify request.

### Known dev-only noise

Playwright hides the text caret before taking a screenshot. If it does so before React hydrates, the
Next.js dev overlay reports a hydration mismatch on `caret-color`. It appears in some review
screenshots as a "1 Issue" badge. It does not occur in normal browsing and is not an app defect.
