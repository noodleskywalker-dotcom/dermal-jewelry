# DERMAL — Facial Piercing Jewelry + AI Face Studio

> **Project status:** Early development / MVP  
> **Repository:** https://github.com/noodleskywalker-dotcom/dermal-jewelry  
> **Local Windows project path:** `C:\\Users\\USER\\Desktop\\dermal-jewelry`  
> **Frontend:** Next.js + TypeScript + Tailwind  
> **Commerce backend:** Shopify (headless)  
> **Hosting:** Vercel  
> **Development agent:** Claude Code  
> **Creative generation:** Higgsfield  
> **Planned face try-on stack:** browser image upload + facial landmarks + accurate jewelry overlays, then 3D/head movement later

---

# Current state (20 September 2026)

Infrastructure is complete and development has started. `DERMAL_MASTER_BRIEF.md` is the product
specification and supersedes the setup-only wording further down this file.

Milestone 1 is built on the `feat/dermal-first-slice` branch: the visual system, homepage, shop,
collection and product pages, a working local-photo Face Studio, personalized product previews,
a look (stack) and a demo bag. Products and prices are demo placeholders and checkout is disabled.

- Progress and next task: `docs/PROJECT_STATUS.md`
- Test evidence: `docs/TEST_REPORT.md`
- Decisions: `docs/DECISIONS.md`
- Assets and rights: `docs/ASSET_REGISTER.md`
- Unknown product data: `docs/PRODUCT_SPEC_GAPS.md`

```powershell
npm run dev          # http://localhost:3000
npm run lint
npm run typecheck
npm test             # unit tests
npm run test:e2e     # browser tests
npm run build
```

---

# 1. What this business is

DERMAL is intended to become a premium facial-piercing jewelry e-commerce brand centered around unusual placements that are underserved by ordinary jewelry stores.

The initial opportunity came from trying to find distinctive anti-eyebrow jewelry and discovering that most existing stores have very limited design choice, weak presentation, and almost no visualization tools.

The business should not feel like a generic piercing supply store. The brand should feel closer to luxury fashion, experimental jewelry, technology, editorial photography, limited product drops, personalization, and collectible design.

The signature product experience is a **Face Studio** where a customer can upload a front-facing image and preview jewelry on their own face.

Long-term vision:

1. Customer uploads one front-facing photo.
2. Facial landmarks are detected.
3. Customer selects a piercing placement.
4. Jewelry is automatically positioned.
5. Customer can move, rotate, and scale it.
6. Customer can switch between products without re-uploading.
7. Product cards can preview the piece on the customer’s own face.
8. Customer can create an entire facial “stack.”
9. The face can eventually rotate subtly left/right while the exact jewelry remains attached to the correct location.
10. Customer can save, share, and buy the whole look.

The AI must not randomly redraw the jewelry. The product shown in the try-on should represent the actual SKU being sold.

---

# 2. Initial categories

The store should support:

- Anti-eyebrow / surface piercing
- Dermal
- Eyebrow
- Nostril
- Septum
- Lip / labret
- Ear categories later

The initial launch should focus strongly on **anti-eyebrow and dermal jewelry**.

---

# 3. First product concept

The first visual prototype is a Gaara-inspired anti-eyebrow pair.

Current concept:

- upper/outer piece: small hollow metallic symbol inspired by the red `愛` / “love” visual language
- lower/inner piece: small deep-red faceted gemstone
- asymmetrical pair
- placed in the anti-eyebrow area
- premium, very small, wearable scale
- polished metal
- dramatic red accent

The exact Naruto/Gaara symbol and character imagery are useful for **prototype/design exploration**, but commercial sale of recognizable franchise artwork, symbols, names, or character branding can create licensing/IP issues.

Before commercial manufacturing, either obtain the required license or create an original desert/sand/love/resilience symbol that is clearly our own design language.

Possible collection working title:

## COLLECTION 001 — DESERT EYE

Example products:

- DESERT EYE — LOVE
- SAND VORTEX
- CRIMSON ORBIT
- VOID STUD
- DESERT SEAL
- RED DUNE
- SAND CLAW

These are placeholders.

---

# 4. Core brand experience

The store should **not** look like a normal Shopify theme.

Suggested visual language:

- black / charcoal base
- off-white typography
- deep wine red
- dark garnet
- polished titanium / chrome accents
- large editorial type
- strong negative space
- macro jewelry photography
- subtle grain
- elegant motion
- minimal borders
- minimal generic cards
- premium interactions
- no cheap gamer/anime-store visual style
- no cluttered marketplace look

The site should feel like a premium fashion campaign first and an e-commerce store second.

---

# 5. Core customer journey

## First visit

Homepage opens with a cinematic face/jewelry hero.

Primary calls to action:

- `ENTER FACE STUDIO`
- `EXPLORE COLLECTION 001`

Customer can browse normally without uploading a face.

## Face Studio

Customer selects:

- Anti-eyebrow
- Dermal
- Eyebrow
- Nose
- Septum
- Lip

Customer uploads a photo.

For the MVP, the photo should remain in the browser whenever possible.

The user should be able to:

- position jewelry
- scale jewelry
- rotate jewelry
- reset
- change product
- change placement
- add item to stack
- add selected stack to cart

## Personalized browsing

Once a photo is loaded, product cards can eventually offer `TRY ON`.

Desktop:
- hover product
- product panel expands
- user’s uploaded face appears
- selected SKU appears on their face

Mobile:
- tap `TRY ON`
- open a compact Face Studio preview

---

# 6. Build Your Stack

The Face Studio should eventually allow a full facial jewelry composition.

Examples:
- anti-eyebrow
- eyebrow
- nostril
- septum
- labret
- dermal

Each selected item appears in **YOUR STACK**.

Actions:
- remove item
- change variant
- save look
- share look
- add entire stack to bag

---

# 7. Technical architecture

```text
Customer Browser
       |
       v
Next.js custom frontend
       |
       +-------------------+
       |                   |
       v                   v
Face Studio             Shopify
       |                   |
       |                   +--> Products
       |                   +--> Variants
       |                   +--> Inventory
       |                   +--> Cart
       |                   +--> Checkout
       |                   +--> Orders
       |
       +--> Browser photo state
       +--> Facial landmarks
       +--> 2D overlays (MVP)
       +--> 3D jewelry (later)
       +--> Head movement (later)
```

Deployment:

```text
Claude Code
    |
    v
Local Git repo
    |
    v
GitHub
    |
    v
Vercel
    |
    v
Live website
```

Creative pipeline:

```text
Product concept / CAD / product photos
            |
            v
        Higgsfield
            |
            +--> campaign images
            +--> cinematic videos
            +--> editorial creative
            +--> ads/social creative
```

Higgsfield is primarily a creative-generation tool. It should not be trusted to redraw exact product geometry for the virtual try-on.

---

# 8. Current project

Local project:

```powershell
C:\Users\USER\Desktop\dermal-jewelry
```

Open it:

```powershell
cd C:\Users\USER\Desktop\dermal-jewelry
```

Run:

```powershell
npm run dev
```

Then open:

```text
http://localhost:3000
```

Keep that terminal open during development.

---

# 9. Git + GitHub setup

Repository:

```text
https://github.com/noodleskywalker-dotcom/dermal-jewelry
```

If Git says `Author identity unknown`:

```powershell
git config --global user.name "noodleskywalker-dotcom"
git config --global user.email "noodleskywalker-dotcom@users.noreply.github.com"
```

Initialize if needed:

```powershell
git init
```

Verify `.gitignore` includes at least:

```gitignore
node_modules/
.next/
.env
.env.local
.env.*.local
.vercel
```

First commit:

```powershell
git add .
git commit -m "Initial Next.js setup"
git branch -M main
```

Set remote:

```powershell
git remote set-url origin https://github.com/noodleskywalker-dotcom/dermal-jewelry.git
```

If origin does not exist:

```powershell
git remote add origin https://github.com/noodleskywalker-dotcom/dermal-jewelry.git
```

Verify:

```powershell
git remote -v
```

Push:

```powershell
git push -u origin main
```

Normal workflow later:

```powershell
git add .
git commit -m "Describe what changed"
git push
```

Never force-push without a very specific reason.

---

# 10. Claude Code

Claude Code is the main local coding agent.

Open another terminal while `npm run dev` remains active:

```powershell
cd C:\Users\USER\Desktop\dermal-jewelry
claude
```

Claude should:

- inspect existing files before changing them
- plan before large changes
- keep changes incremental
- run lint/build after meaningful work
- fix TypeScript errors
- preserve a working Git state
- commit at good checkpoints
- never put API keys into source files
- never force push
- never delete the repository or large folders without confirmation
- avoid replacing the whole codebase unnecessarily

Permanent instructions belong in `CLAUDE.md`.

---

# 11. Superpowers for Claude Code

Superpowers is recommended for structured brainstorming, planning, testing, debugging, and implementation workflows.

Inside Claude Code:

```text
/plugin install superpowers@claude-plugins-official
```

Alternative:

```text
/plugin marketplace add obra/superpowers-marketplace
/plugin install superpowers@superpowers-marketplace
```

Project:
https://github.com/obra/superpowers

For major features:
1. brainstorm
2. agree architecture
3. write plan
4. implement incrementally
5. test
6. review
7. commit

---

# 12. Caveman for Claude Code

Caveman is optional.

For the first phase, use the Claude Code plugin/skills integration only.

```powershell
claude plugin marketplace add JuliusBrussee/caveman
claude plugin install caveman@caveman
```

Or inside Claude Code:

```text
/plugin marketplace add JuliusBrussee/caveman
/plugin install caveman@caveman
```

Project:
https://github.com/JuliusBrussee/caveman

Do not enable extra proxy/routing/compression functionality just because it exists. Keep the environment simple and predictable at first.

---

# 13. Higgsfield setup

Use Higgsfield for:

- cinematic product images
- campaign visuals
- short hero videos
- jewelry concept presentation
- model/face creative
- social media content
- launch ads
- product editorials

It is not the source of truth for product geometry.

Install CLI:

```powershell
npm i -g @higgsfield/cli
```

Authenticate:

```powershell
higgsfield auth login
```

Install skills:

```powershell
npx skills add higgsfield-ai/skills
```

Official references:

https://higgsfield.ai/creator-hub/help-center/integrations/how-do-i-access-higgsfield-via-cli

https://higgsfield.ai/creator-hub/help-center/integrations/how-do-i-connect-higgsfield-to-ai-agent

Important:
- generations use the connected Higgsfield account/credits
- do not let autonomous coding runs generate large batches without confirmation

---

# 14. Shopify setup

Shopify is the **commerce engine**, not the visual frontend.

Shopify should manage:

- products
- variants
- prices
- inventory
- collections
- carts
- checkout
- orders
- customer commerce data

Next.js controls the customer-facing experience.

Official headless docs:
https://shopify.dev/docs/storefronts/headless/building-with-the-storefront-api

Create the storefront/API configuration required by Shopify.

We will eventually need values equivalent to:

```text
SHOPIFY_STORE_DOMAIN
SHOPIFY_STOREFRONT_ACCESS_TOKEN
SHOPIFY_API_VERSION
```

Use `.env.local` locally:

```env
SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
SHOPIFY_STOREFRONT_ACCESS_TOKEN=replace_me
SHOPIFY_API_VERSION=replace_with_current_supported_version
```

Never put real tokens in README files.

Never commit `.env.local`.

Never put Admin API secrets into browser-side code.

Integration phases:
- A: mock product data
- B: Shopify products/collections
- C: Storefront cart
- D: checkout
- E: customer/order functionality where appropriate

---

# 15. Vercel setup

Vercel hosts the Next.js application.

Recommended:
1. push project to GitHub
2. log into Vercel
3. create/import a project
4. select `noodleskywalker-dotcom/dermal-jewelry`
5. confirm Next.js detection
6. deploy

Official docs:
https://vercel.com/docs/frameworks/full-stack/nextjs

Add production secrets through:

`Vercel Project -> Settings -> Environment Variables`

Never hardcode secrets.

---

# 16. Optional future Supabase setup

Do not add Supabase until persistent non-commerce data is actually needed.

Potential uses:
- saved Face Studio looks
- saved stacks
- shareable look IDs
- favorites
- user-created designs
- opt-in face profiles

Do not store face images indefinitely by default.

Prefer browser-local processing for simple try-on.

---

# 17. Face Studio MVP

Do **not** start with full AI head reconstruction.

MVP:
1. upload face image
2. keep it in browser memory
3. display it in the studio
4. select placement
5. overlay jewelry PNG/SVG
6. allow drag
7. allow scale
8. allow rotation
9. save selected product in stack
10. add product(s) to cart

Suggested technologies:
- browser `FileReader` / object URLs
- React state
- CSS transforms
- pointer events
- optional canvas

---

# 18. Face landmark phase

After the manual MVP works, add facial landmark detection.

Candidate:
- MediaPipe Face Landmarker or another maintained landmark system

Goals:
- detect eye corners
- eyebrow
- nose
- lips
- facial contour
- estimate face scale/orientation

Placement should use normalized landmark-relative coordinates, not fixed pixels.

Users should still be able to fine-tune placement.

---

# 19. 3D / head-turn phase

Only after the 2D system is reliable.

Target:

```text
front-facing image
      |
      v
face geometry / head pose
      |
      v
small left-right head rotation
      |
      v
exact jewelry model attached to anchor
```

Do not use a generative video model to repaint the jewelry differently in every frame.

Possible stack:
- face pose / geometry estimate
- Three.js
- React Three Fiber
- `.glb` jewelry models
- facial anchor coordinates

---

# 20. Jewelry product data model

Example:

```ts
type Product = {
  id: string
  slug: string
  title: string
  collection: string
  placement: string[]
  price: number
  currency: "QAR"
  material: string
  color: string
  finish: string
  stone?: string
  topDiameterMm?: number
  threadType?: string
  threadSize?: string
  compatibility?: string[]
  imageUrls: string[]
  tryOnAssetUrl?: string
  model3dUrl?: string
}
```

Never let AI invent medical/material specifications.

Every technical specification must come from verified manufacturing data.

---

# 21. Materials and product quality

Before manufacturing, define:

- material standard
- alloy
- finish
- plating, if any
- thread system
- thread dimensions
- top dimensions
- gemstone dimensions
- setting method
- tolerance
- compatible anchor/post
- intended placement
- QC method
- packaging
- batch traceability where practical

For anti-eyebrow pieces, distinguish between surface bars/surface piercing jewelry and paired dermal anchors.

The store must communicate compatibility clearly.

---

# 22. Site routes

Planned:

```text
/
 /shop
 /collections
 /collections/[slug]
 /product/[slug]
 /face-studio
 /about
 /cart
```

Later:

```text
/account
/account/looks
/look/[shareId]
/custom
/size-guide
/materials
/care
```

---

# 23. Homepage plan

Navigation:
- DERMAL logo
- SHOP
- FACE STUDIO
- COLLECTIONS
- ABOUT
- search
- account
- bag

Hero working headline:

`JEWELRY FOR THE FACE YOU CHOSE.`

Supporting copy:

`Rare facial jewelry. Designed differently. Try every piece on your own face before you wear it.`

CTAs:
- `ENTER FACE STUDIO`
- `EXPLORE COLLECTION 001`

Category selector:
- ANTI-EYEBROW
- DERMAL
- EYEBROW
- NOSE
- SEPTUM
- LIP

Product interactions:
- premium hover
- image zoom
- metadata reveal
- TRY ON
- optional personalized slide-out preview

---

# 24. Product page

Required:
- title
- price
- large visual
- material
- finish
- dimensions
- placement compatibility
- variants
- product story
- care/compatibility
- add to bag
- TRY IT ON
- shipping info
- related pieces
- stack suggestions

Feature:

## SEE IT ON YOU

If the user already uploaded a face, show their face. Otherwise invite upload.

---

# 25. Cart

Use a cart drawer.

Support:
- item
- image
- variant
- quantity
- remove
- subtotal
- checkout

During mock-data development, checkout can be disabled or marked as integration pending.

---

# 26. Privacy principles

The Face Studio uses personal photos.

MVP preference:
- local browser image
- no upload
- no permanent storage

Suggested UI text:

`Your image stays on this device during this prototype.`

Later, if cloud AI processing is required:
- explain why
- require clear user action
- define retention
- delete temporary assets
- give control over saved images
- separate marketing consent from service processing

---

# 27. Security rules

Never commit:
- `.env`
- `.env.local`
- Shopify private secrets
- database service keys
- payment gateway secrets
- private API keys
- login tokens

Before pushes involving integrations:

```powershell
git status
```

If a key is accidentally pushed, rotate it. Do not merely delete it in a later commit.

---

# 28. Development workflow

For every major feature:

```text
1. Understand requirement
2. Inspect current code
3. Plan
4. Implement a small slice
5. Run locally
6. Test desktop
7. Test mobile
8. Run lint
9. Run build
10. Fix errors
11. Review diff
12. Commit
13. Push
14. Verify Vercel preview
```

Commands:

```powershell
npm run dev
npm run lint
npm run build
```

Inspect `package.json` if a script is unavailable.

---

# 29. Git checkpoint philosophy

Prefer small meaningful commits:

```text
chore: initialize project tooling
feat: add brand shell and navigation
feat: add product mock data
feat: add Face Studio upload flow
feat: add draggable jewelry overlay
feat: add stack panel
feat: add cart drawer
feat: connect Shopify product queries
feat: connect Shopify cart
feat: add responsive mobile Face Studio
```

---

# 30. Recommended build order

## Phase 0 — Infrastructure
- GitHub
- Claude Code
- Superpowers
- Caveman optional
- Higgsfield
- Vercel
- Shopify

## Phase 1 — Design system
- typography
- colors
- spacing
- nav
- footer
- buttons
- motion language

## Phase 2 — Mock storefront
- homepage
- collections
- shop
- product page
- cart drawer

## Phase 3 — Face Studio MVP
- image upload
- placement selector
- draggable overlay
- scale
- rotation
- reset
- stack panel

## Phase 4 — Shopify
- product queries
- collections
- variants
- cart
- checkout

## Phase 5 — Automatic placement
- facial landmarks
- anti-eyebrow
- dermal
- eyebrow
- nose
- lip
- manual correction

## Phase 6 — Accurate product assets
- transparent assets
- CAD renders
- 3D models
- per-SKU placement metadata

## Phase 7 — 3D / subtle head movement
- head pose
- stable anchors
- 3D jewelry
- left/right preview

## Phase 8 — Accounts / saved looks
- save stack
- share look
- favorites
- optional saved Face Studio profile

## Phase 9 — Launch
- final product photography
- payment gateway
- shipping
- returns
- legal pages
- analytics
- SEO
- performance
- accessibility
- QA

---

# 31. First frontend mock products

```ts
export const mockProducts = [
  {
    slug: "desert-eye-love",
    title: "DESERT EYE — LOVE",
    placement: ["Anti-Eyebrow"],
    price: 390,
    currency: "QAR",
    material: "Titanium — placeholder until manufacturing is verified",
    description: "Deep red gemstone paired with a sculptural symbol top."
  },
  {
    slug: "sand-vortex",
    title: "SAND VORTEX",
    placement: ["Anti-Eyebrow"],
    price: 350,
    currency: "QAR"
  },
  {
    slug: "crimson-orbit",
    title: "CRIMSON ORBIT",
    placement: ["Dermal"],
    price: 220,
    currency: "QAR"
  },
  {
    slug: "void-stud",
    title: "VOID STUD",
    placement: ["Dermal"],
    price: 190,
    currency: "QAR"
  }
]
```

All prices/specs are placeholders.

---

# 32. Tool boundaries

Claude Code:
- architecture
- coding
- refactoring
- tests
- Git operations
- integrations
- local project tasks

Higgsfield:
- campaign imagery
- product visual experiments
- launch video
- editorial creative
- ads/social

Shopify:
- commerce system of record

Vercel:
- deploy/preview

GitHub:
- source control/rollback

Face Studio code:
- accurate customer try-on

---

# 33. Commands cheat sheet

Start project:

```powershell
cd C:\Users\USER\Desktop\dermal-jewelry
npm run dev
```

Start Claude:

```powershell
cd C:\Users\USER\Desktop\dermal-jewelry
claude
```

Git status:

```powershell
git status
```

Checkpoint:

```powershell
git add .
git commit -m "Describe change"
git push
```

Build:

```powershell
npm run build
```

Superpowers:

```text
/plugin install superpowers@claude-plugins-official
```

Caveman:

```powershell
claude plugin marketplace add JuliusBrussee/caveman
claude plugin install caveman@caveman
```

Higgsfield:

```powershell
npm i -g @higgsfield/cli
higgsfield auth login
npx skills add higgsfield-ai/skills
```

---

# 34. What Claude should do first

After infrastructure is connected, Claude should **not** build the entire store in one shot.

First:
1. inspect repository
2. inspect `README.md`
3. inspect `CLAUDE.md`
4. confirm Next.js/Tailwind setup
5. run current build
6. create a design-system plan
7. propose homepage + Face Studio component architecture
8. implement only the initial shell/design system

---

# 35. MVP definition

The MVP is complete when a user can:

1. open a polished website
2. browse jewelry
3. upload a selfie
4. select anti-eyebrow
5. see the first jewelry pair
6. reposition it
7. scale it
8. rotate it
9. switch product
10. add it to a stack
11. add to cart
12. checkout through Shopify once connected

Automatic head movement is **not required** for MVP.

---

# 36. Long-term differentiators

The strongest differentiation is not simply anime-inspired jewelry.

It is the platform:

- rare facial jewelry
- try-on using your own face
- personalized browsing
- build-your-stack
- shareable facial looks
- accurate placement
- unusual limited drops
- eventual custom designs
- AI-assisted creative generation

---

# 37. Source / setup references

Next.js:
https://nextjs.org/docs

Shopify headless:
https://shopify.dev/docs/storefronts/headless/building-with-the-storefront-api

Vercel:
https://vercel.com/docs/frameworks/full-stack/nextjs

Superpowers:
https://github.com/obra/superpowers

Caveman:
https://github.com/JuliusBrussee/caveman

Higgsfield CLI/Skills:
https://higgsfield.ai/creator-hub/help-center/integrations/how-do-i-access-higgsfield-via-cli

Higgsfield integration:
https://higgsfield.ai/creator-hub/help-center/integrations/how-do-i-connect-higgsfield-to-ai-agent

---

# 38. Final project principle

**The AI try-on is not an extra feature attached to the store. It is part of the store itself.**

Keep the product experience premium, accurate, unusual, personal, and visually memorable.
