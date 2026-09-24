# The first Shopify product: DESERT EYE — LOVE

Prepared 24 September 2026. **The product was not created.** Three separate things block it, two of
them the owner's own stop conditions and one a permissions fact. They are set out below with what is
needed to clear each.

Nothing in Shopify was created, changed, published or deleted for this.

## What the connection can actually do

Checked read-only on 24 September 2026 against `vxh01e-0d.myshopify.com`, API version `2026-07`.

| Fact | Finding |
| --- | --- |
| Store | "My Store", primary domain `vxh01e-0d.myshopify.com` |
| Currency | **QAR**, the only enabled presentment currency — it matches the storefront |
| Products visible to the Headless storefront | **0** |
| Storefront API | Working. 41 mutations exposed, all 24 `cart*` mutations present |
| Product-writing mutations on the Storefront API | **None.** The Storefront API cannot create products by design |
| Admin API with the token we hold | Reachable, and answers `shop` |
| Admin access scopes on that token | **Zero.** `products` and `publications` both answer `ACCESS_DENIED` |

**What I am able to do:** read the shop, read products through the Storefront API, and create and
change carts. Everything the storefront needs at runtime works.

**What I am not able to do:** create, edit, publish or delete a product; read the Admin product list;
read or change sales-channel publication; set inventory; create metafield definitions. The token
carries no Admin scopes, so product creation is not something I can perform at all with the
credentials in this project — independently of whether the data were ready.

## Blocker 1 — no form is approved for manufacture (the owner's stop condition, §6)

The brief says: *"If no form has yet been explicitly approved for manufacturing: STOP and report that
variant data is missing. Do not guess."*

The project record says no form is:

- `docs/production/ASSET_MANIFEST.md`: micro dermal is *concept-approved as the hollow symbol on its
  own*; nose is *concept-approved as the deep-red faceted gemstone on its own*; anti-eyebrow is the
  *approved prototype composition*. "None of the three is manufacturing-ready, and the site says so
  on every form."
- `docs/DECISIONS.md` and `docs/PROJECT_STATUS.md` carry the same ruling, and every form on the live
  site displays "Not manufacturing-ready".

**Needed:** which single form is approved as sellable — or a statement that one now is. A variant
cannot be created from a drawing.

## Blocker 2 — there is no selling price (the owner's stop condition, §7)

The brief says: *"Do not invent a price. If Shopify requires a price and no real selling price has
been supplied: STOP before product creation and ask for the price."*

`docs/PRODUCT_SPEC_GAPS.md` records: *"Selling price — unknown. 390, 350, 220 and 190 QAR are demo
placeholders."* Owner-owned, still open.

**Needed:** the real selling price in QAR for the approved form. The 390 on the site is a
placeholder and must not become Shopify pricing.

## Blocker 3 — inventory is unspecified (§8)

The brief forbids arbitrary stock. Option A — keep it unavailable until a real quantity is known —
is the safe default and is what I would use, but it is a decision, not an assumption.

**Needed:** either "track no inventory / continue selling when out of stock = off, quantity 0 for
now", or a real opening quantity.

## The record, ready to create

Everything below is known and carries no invented claim. It is written down rather than created.

```
Title          DESERT EYE — LOVE
Handle         desert-eye-love
Status         DRAFT
Vendor         DERMAL
Product type   Facial Jewelry
Tags           featured, inspired, unisex, desert-eye, anti-eyebrow
Published to   nothing yet. The Headless channel "DERMAL Web Store" only when the owner says so.
```

### Description

> DESERT EYE — LOVE
>
> A paired facial-jewelry concept built around an openwork symbol and a deep-red faceted stone.
>
> Designed as part of the DESERT EYE family.
>
> Final material specification and production dimensions are confirmed at manufacture.

No anime character, series or franchise is named. The project has no clearance for commercial use of
that reference, and `references/` remains internal concept material pending a rights review, so it
cannot appear in commercial product copy.

The description makes no claim about titanium, grade, implant grade, gemstone identity, ruby, gauge,
threading, post dimensions, hypoallergenic or nickel-free status, or any certification. It says the
stone is "deep-red faceted", which is the approved wording, and nothing about what it is.

### Variant

**Blocked.** One variant, on an option named `Form`, whose value is the single approved form. The
storefront maps `Form` to an editorial form, so this exact naming makes the site light up with no
code change. Nothing is written here until blocker 1 is cleared.

The site draws three forms. Two of them must **not** become variants on the strength of being drawn.

### Price and inventory

**Blocked.** See blockers 2 and 3.

### Metafields, namespace `dermal`

Safe values, all of them facts the project already holds. Definitions do not exist and would have to
be created first, which also needs an Admin scope this token lacks.

| Key | Value |
| --- | --- |
| `family` | `desert-eye` |
| `placement` | `anti-eyebrow` |
| `gender` | `unisex` |
| `collection_type` | `inspired` |
| `featured` | `true` |
| `material_status` | `pending` |

`tryon_asset` and `catalogue_asset` are deliberately left empty. Artwork stays in the repository and
a local filesystem path in a Shopify field would be a broken reference the moment anything moved.

### Media

The approved product artwork already in the repository, showing the jewelry alone:

- `public/products/desert-eye-love/anti-eyebrow/symbol.webp`
- `public/products/desert-eye-love/anti-eyebrow/gemstone.webp`

No new media would be generated. No character or campaign imagery would be uploaded as product
photography.

## What happens the moment the product exists

No code change is needed. With the handle `desert-eye-love` published to the Headless channel, the
storefront joins it automatically and DESERT EYE moves from `unmatched` to `live` or `sold-out`. The
interface does not change: the same card, the same product page, the same bag, now carrying Shopify's
title, Shopify's price, a real merchandise id and Shopify-calculated totals.

The §11 checks are ready to run against it and are written as tests against a simulated live
catalogue in the meantime.

## The cart rule, implemented in this pass

The owner's decision of 24 September 2026 is in force in code, not only in prose:

- The demo bag is a development fallback and nothing more.
- `getCommerceState()` reports whether **any** piece on the storefront has a Shopify variant that is
  genuinely for sale, and a provider carries that to every surface.
- From the moment one real variant exists, Shopify is the **only** cart on the site. A piece with no
  Shopify product of its own then reads "Not yet available" instead of offering a demo line.
- A Shopify cart existing at all has the same effect, so the two can never be shown side by side.
- The demo bag is emptied as Shopify takes over, so a placeholder line can never sit beside a real
  one or be carried into a purchase.
- Checkout stays disabled either way.
