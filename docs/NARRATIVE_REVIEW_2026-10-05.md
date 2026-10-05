# Gaara campaign and jewelry stories — 5 October 2026

Preview: https://dermal-jewelry-7unfab0gv-openlimits.vercel.app

Branch: `feat/dermal-first-slice`. Implementation: `78aa5fc`; final contrast correction: `369233d`. The preview deployment of `369233d` is successful. Main remains `76b32a9ce772ef90bac2e08ec0bbe6ab0749b2a9`.

## What changed

Skywork generated two hyperreal adult Gaara campaign images from the user's piercing reference: a 2560 × 1440 opening portrait and a 2048 × 2048 detail. The reference's two-part placement is retained: openwork love symbol above/outward, round deep-red stone below/inward, with no external connecting bar. These are AI editorial interpretations, not photographs of manufactured jewelry.

The portrait opens the preview homepage. A seven-family chapter selector follows the existing selection, with distinct atmosphere, signature and expression narratives. Each product page expands its own story and continues to the relevant try-on or commission route. DESERT EYE includes the Gaara detail. Concept families retain their concept status and cannot acquire purchase or try-on actions through the new content.

The new character art uses a fixed-name, preview-only route outside `public/`. Production rejects it before filesystem access and omits the image URLs. Both WebPs are included in preview deployment traces. Product configuration, placement geometry, cart and commission delivery code are unchanged.

Skywork balance: 165,487 → 165,256, a cost of **231 credits** for the two campaign images. See `SKYWORK_MEDIA_2026-10-05.md` and `screenshots/skywork-gaara-complete.jpg`.

## Verification

Full implementation run: https://github.com/noodleskywalker-dotcom/dermal-jewelry/actions/runs/37301931879

At `78aa5fc`, lint, typecheck, all 180 unit tests, the optimized build and the full browser suite passed. Browser results: **520 passed, 122 skipped, 0 failed, 0 flaky**. There are no retries. Skips are explicit fixture, device, input or codec gates.

| Project | Passed | Skipped |
| --- | ---: | ---: |
| Desktop Chromium | 177 | 29 |
| Mobile Chromium | 161 | 45 |
| Desktop WebKit | 163 | 43 |
| Narrow 320px launch checks | 19 | 5 |

New checks cover all seven chapter changes, keyboard focus, reduced motion, product story links, concept next steps, selected-form fidelity and narrow-screen overflow. Local production and preview builds were also checked: preview traces contain both images; production homepage output contains neither their URLs nor Gaara alt text.

Screenshot review found one issue: translucent silver product renders became too dark on the chapter panels. Four CSS rules in `369233d` give product-only image planes ivory paper and dark captions. Gaara's image plane is unchanged. The final capture job passed and regenerated 37 narrative frames plus the existing remodel frames. All seven desktop chapters, mobile contrast and the narrow hero were inspected again; the product stories had already passed review at all captured sizes.

Final revision run: https://github.com/noodleskywalker-dotcom/dermal-jewelry/actions/runs/37304322700

At the time of this review record, the final revision's capture, lint, typecheck and 180 unit tests have passed. Its automatic repeat of the full browser suite is still running. The completed full-suite result above belongs to `78aa5fc`; it is not represented as a result for the later CSS revision.

## Review images and limits

Selected final captures and a seven-chapter contact sheet are preserved in `screenshots/narrative-review/` as WebP. `capture-manifest.json` records all 37 original PNG captures; the originals are in the `remodel-browser-review` artifact of the final revision run.

The frames were captured against the same revision's development server in GitHub Actions. They are browser evidence, not real-device testing. The deployed preview keeps its existing Vercel access protection; this review does not claim an authenticated deployed-site walkthrough or live commission delivery check. Vercel's connector currently lacks access to the team scope; deployment success and the preview URL were verified through GitHub deployment status.

No production deployment, main merge, checkout activation or live commission email was performed.
