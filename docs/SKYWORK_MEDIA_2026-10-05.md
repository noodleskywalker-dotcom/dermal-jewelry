# Skywork media — 5 October 2026

Project: https://skywork.ai/session/01a10b23-5827-7dc2-9620-8f241b2a4c63?mode=1

Skywork was used for product and campaign images. No website code was generated there.

| Family | Source | Integrated delivery |
| --- | --- | --- |
| BLADE TRACE | One 2048 × 2048 reference edit of the canonical FormVisual screenshot | `public/products/blade-trace/{hero,catalogue,detail}.webp` |
| CROSSLINE | First 2048 × 2048 reference edit; separate line and crossing mark | `public/products/crossline/{hero,catalogue,detail}.webp` |
| ANKH TRACE | First 2048 × 2048 reference edit; original loop, bar and long stem | `public/products/ankh-trace/{hero,catalogue,detail}.webp` |

The reference PNGs are preserved in local `references/skywork-input/`. Original downloaded PNGs are preserved in local `references/skywork-output/2026-10-05/`; these directories remain gitignored. The Skywork project also retains the originals.

The brief locked each reference's silhouette and proportions, requested polished silver-tone appearance, warm ivory seamless studio lighting and soft contact shadows, and prohibited invented hardware, stones, text and logos. No metal specification, physical size, manufacturing approval or commercial product status was inferred from the images.

`scripts/build-skywork-renders.mjs` creates the delivery images. It reuses the repository's existing paper-removal function, crops only the presentation frame, writes transparent WebP and produces an 840px catalogue view. Detail views are crops of the same source, not additional angles or claimed photographs. Nine files total approximately 705 KiB. Face Studio component geometry and fit remain unchanged.

The first three renders were visually reviewed and retained. A queued duplicate instruction produced second CROSSLINE and ANKH images. These two redundant alternatives were not integrated; the second ANKH also shortened the stem relative to the reference. There were five generated images in total, three used.

Observed balance immediately before this session's work: **165,837** credits. After completion and refresh: **165,487** credits. Difference: **350 credits**, including the download-link request and duplicate generation. The earlier 3 October balance is not used to calculate this task's spending because the account was used between sessions.

Existing DESERT EYE, HORUS TRACE, JAPANESE ANGEL and ANKH + EYE render sets were retained. No new motion clip was necessary; existing approved product media and reduced-motion fallbacks remain in place.

## Gaara campaign and jewelry stories

The follow-up requested a hyperreal adult Gaara portrait wearing the paired piercing from the user's reference. The reference fixes the openwork love symbol above/outward and a separate round deep-red stone below/inward, with no connecting bar or extra stud. Two new images were generated and visually checked against that placement: a 2560 × 1440 hero and a 2048 × 2048 detail. Their appearance is an AI editorial interpretation, not a product photograph or manufacturing specification.

| Image | Skywork original | Delivery |
| --- | --- | --- |
| HERO | `dermal-gaara-hero.png` | `assets/editorial-preview/gaara-portrait.webp`, 194,128 bytes |
| DETAIL | `dermal-gaara-detail.png` | `assets/editorial-preview/gaara-detail.webp`, 481,614 bytes |

The original PNGs remain in the Skywork project and the local ignored source directory. Delivery WebPs preserve the entire frame and use quality 88. No jewelry geometry or composition was edited during conversion.

The portrait opens the preview homepage; the close-up accompanies the DESERT EYE story. Each of the seven jewelry families now has atmosphere, signature and expression chapters, with a keyboard-accessible chapter selector on the homepage. Configuration, placement geometry and commerce behavior are retained.

These character images are served only locally or on Vercel preview deployments by a fixed-name API route. Production returns 404 before filesystem access, omits their URLs, and retains the product-media hero. Private/no-store and noindex headers apply, and neither image enters the Next image-optimization cache. Preview build traces include both WebPs. Production build output was checked to exclude the portrait URL and Gaara alt text.

Observed balance before this pair: **165,487**. Balance after completion: **165,256**. Difference: **231 credits**. The complete session total across the product images and this pair is **581 credits**. Completion evidence: `docs/screenshots/skywork-gaara-complete.jpg`.
