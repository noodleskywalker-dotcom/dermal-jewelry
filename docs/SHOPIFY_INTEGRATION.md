# Shopify integration

How the approved DERMAL storefront is wired to Shopify, what Shopify owns, what the repository
owns, and what still has to be done on the Shopify side. Written 24 September 2026.

Nothing in Shopify was created, published, changed or deleted to build this. The store still holds
zero products, and every check below was run against that empty state on purpose.

## The division

| Concern | Owner | Why |
| --- | --- | --- |
| Title, handle, price, variants, availability, inventory, merchandise ids, cart totals | **Shopify** | It is the commerce system of record. The storefront never invents any of it. |
| Design family, forms, placement geometry, Face Studio coordinates | **Repository** | They are measurements and artwork, not commerce. |
| Artwork, motion, collection worlds, editorial copy, the catalogue's order | **Repository** | Presentation is the brand's, and it is approved work. |
| Honest status of anything unverified | **Repository** | A specification is a claim. Commerce must not be able to make one. |

## The layers

```
lib/shopify/        the Storefront API, and nothing else
  client.ts         one server-only call; private-token header; a 200 with errors is a failure
  queries.ts        every operation the storefront sends, in one file
  types.ts          the shapes Shopify answers with
  cart.ts           create, read, add, update, remove; Shopify's totals, never ours

lib/commerce/       the join between Shopify and the approved storefront
  model.ts          DermalProduct, CommerceRecord, CommerceVariant, purchase and price helpers
  mapping.ts        handle join, Shopify tags to the browsing taxonomy, the metafield schema
  normalize.ts      Shopify product to commerce facts; editorial joined to commerce
  catalog.ts        one cached server read of the catalogue, with fallback
  display.ts        what a surface shows about money and about buying

app/api/cart/       the cart's only door; the token never leaves the server
lib/cart/shopify-store.ts   the browser's cart id and the last cart Shopify reported
```

## The canonical model

`DermalProduct` is the editorial `Product` plus a `handle` and a `commerce` record. Every existing
field still means what it did, so no approved surface had to be rewritten to read it.

```ts
type DermalProduct = Product & { handle: string; commerce: CommerceRecord }

type CommerceStatus =
  | "live"        // matched, and something on it is genuinely for sale
  | "sold-out"    // matched, nothing available
  | "unmatched"   // no Shopify product carries this handle yet
  | "concept"     // a direction, never purchasable
  | "unavailable" // Shopify could not be reached on this render
```

There is deliberately no state meaning "probably purchasable". A surface asks
`purchaseState(product, form)` and gets a definite answer with the sentence to show beside it.

## The join

The join key is the **handle**, never a position in an array. A family's editorial slug is its
handle; `HANDLE_OVERRIDES` in `lib/commerce/mapping.ts` exists for a family whose Shopify handle has
to differ, and is empty today.

A Shopify product that no editorial family claims is ignored rather than rendered, and reported as
an orphan, so the storefront's shelves stay the approved catalogue.

## Variants

A variant is read from Shopify and mapped to an editorial form through its options, matching an
option named `Form`, `Placement`, `Style` or `Type`. When nothing names a form the answer is `null`,
and that is the normal case, not a failure.

**A visual form is not a purchasable variant.** The storefront draws three forms of DESERT EYE; until
Shopify carries variants that say so, none of them can be added to a bag. `purchaseState` answers
"This form is not for sale yet" rather than inventing a merchandise id.

## The cart

Shopify's Cart API, through `app/api/cart/route.ts` so the private token stays on the server.

| Action | Mutation |
| --- | --- |
| Add to bag | `cartCreate` when the customer has no cart, otherwise `cartLinesAdd` |
| Change quantity | `cartLinesUpdate` |
| Remove | `cartLinesRemove` |
| Restore after a reload | `cart(id:)` against the id in `localStorage` |

Only the cart id is stored in the browser, under `dermal.shopify-cart-id.v1`. No product data, no
prices, and nothing about a photo or a face. A remembered cart that Shopify no longer has — expired
or completed — starts a new one rather than showing the customer an error they cannot act on.

**No total is calculated in the storefront.** Every amount shown comes back from Shopify.

## Checkout

`checkoutUrl` is read and carried on the cart summary, and **no checkout button is enabled**. With a
real cart the button reads `Checkout — not yet live` and is disabled; the existing
`app/api/checkout/route.ts` still refuses every request unless `DERMAL_COMMERCE_MODE` is `live`,
which it is not.

## The empty store, and failure

| Situation | What the visitor sees |
| --- | --- |
| Shopify has the product | Shopify's price, its variants, a real bag |
| Shopify has no such product | The full editorial presentation, a demo price labelled a demo, and the demo bag |
| Shopify is unreachable or misconfigured | The same editorial presentation; purchasing is unavailable and says so |
| The piece is a concept | `Concept · not yet available`. No price, no button, no variant |

The catalogue read never throws into a page. A failure is logged on the server and the page renders
the editorial catalogue, so a storefront that cannot reach its backend looks like a catalogue that
cannot be bought from, not like a blank page or a spinner.

## Proposed metafield schema

**Not created.** No definition exists in Shopify and none will be made without approval. Every key is
optional and the normalizer reads them defensively, so creating them later changes nothing that is
already working.

Namespace `dermal`:

| Key | Type | Meaning |
| --- | --- | --- |
| `family` | single line text | The editorial slug, when it differs from the handle |
| `placement` | single line text | `anti-eyebrow`, `dermal`, `nose`, `eyebrow`, `septum`, `lip` |
| `gender` | single line text | `men`, `women`, `unisex` — browsing only, never a claim about the piece |
| `collection_type` | single line text | `inspired`, `original`, `signature`, `symbolic`, `ancient`, `weapon`, `limited` |
| `featured` | boolean | Carries the small `Featured` marker |
| `form` | single line text | `anti-eyebrow`, `micro-dermal`, `nose`, when a product sells exactly one form |
| `material_status` | single line text | `pending`, `proposed`, `confirmed`. Anything but `confirmed` keeps the pending wording |
| `tryon_asset` | single line text | Reserved. Try-on artwork stays in the repository for now |
| `catalogue_asset` | single line text | Reserved. Catalogue artwork stays in the repository for now |

Tags are supported alongside metafields, bare (`inspired`) or namespaced (`line:inspired`), matched
without case. A tag can only ever **add** to the taxonomy; it can never remove a family from a
filter, so the approved browsing structure cannot be broken from the Shopify side.

## Specifications are never invented by commerce

`materialsAreConfirmed()` is false unless a `dermal.material_status` metafield says `confirmed` in as
many words. `proposed` is an intention, not a confirmation. The unverified wording the catalogue
already carries — `Not yet verified`, `Deep-red faceted gemstone — material not yet confirmed`,
`Polished — proposed` — survives being joined to Shopify, and a test asserts that no banned claim
(`implant-grade`, `Grade 5`, `genuine ruby`, `hypoallergenic`, `nickel-free`, `ASTM`) appears.

## Performance and safety

- One server read of the catalogue per render, cached for 300 seconds under the tag
  `shopify-catalogue`. No client ever fetches the catalogue.
- The client refuses to run in a browser, and no Shopify variable is prefixed `NEXT_PUBLIC_`.
- A browser test loads every script the storefront serves and asserts the token, the private header
  name and the variable name appear in none of them.
- Cart calls are never cached.

## What still needs doing on the Shopify side

None of this was done, and none of it will be without approval.

1. **Create the five products**, with these exact handles, so the join works with no code change:
   `desert-eye-love`, `horus-trace`, `blade-trace`, `crossline`, `ankh-trace`.
   KIRI must **not** be created: it is a concept.
2. **Decide the variants.** A form only becomes purchasable when a variant names it through an
   option called `Form`. DESERT EYE's three drawn forms are a presentation today, not three variants.
3. **Set real prices.** Every price on the site is a demo placeholder until Shopify carries one.
4. **Publish to the Headless channel** "DERMAL Web Store", or the Storefront API will not return them.
5. **Optionally create the `dermal` metafield definitions** above, if the taxonomy is to be driven
   from Shopify rather than the repository.
6. **Confirm materials** with a supplier before `dermal.material_status` is ever set to `confirmed`.
7. **Checkout** stays off until the store, the products and the policies are ready.

## Verified on 24 September 2026

A read-only probe against `vxh01e-0d.myshopify.com`, API version `2026-07`, private-token header:

- `shop` answered `My Store`, currency `QAR` — the token, the header and the permissions are right.
- `products(first: 10)` answered with an empty list — the store holds no products.
