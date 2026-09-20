# Test report

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
