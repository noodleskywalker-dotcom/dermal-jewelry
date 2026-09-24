/**
 * Every Storefront operation DERMAL sends, in one place.
 *
 * Only fields the storefront actually uses are asked for. Metafields are read under the `dermal`
 * namespace and are all optional: none of them exists yet, and a missing metafield comes back null
 * rather than failing the query, so this is safe to ship before the definitions are created.
 */

const MONEY = `{ amount currencyCode }`;

const PRODUCT_FIELDS = `
  id
  handle
  title
  description
  availableForSale
  totalInventory
  tags
  productType
  vendor
  priceRange { minVariantPrice ${MONEY} maxVariantPrice ${MONEY} }
  featuredImage { url altText width height }
  images(first: 6) { nodes { url altText width height } }
  variants(first: 25) {
    nodes {
      id
      title
      availableForSale
      quantityAvailable
      sku
      price ${MONEY}
      compareAtPrice ${MONEY}
      selectedOptions { name value }
    }
  }
  metafields(identifiers: [
    { namespace: "dermal", key: "family" }
    { namespace: "dermal", key: "placement" }
    { namespace: "dermal", key: "gender" }
    { namespace: "dermal", key: "collection_type" }
    { namespace: "dermal", key: "featured" }
    { namespace: "dermal", key: "form" }
    { namespace: "dermal", key: "material_status" }
    { namespace: "dermal", key: "tryon_asset" }
    { namespace: "dermal", key: "catalogue_asset" }
  ]) { key namespace value type }
`;

/** Every published product, for the catalogue. 50 is far more than the collection will hold for a while. */
export const PRODUCTS_QUERY = `
  query DermalProducts($first: Int!) {
    products(first: $first) {
      nodes { ${PRODUCT_FIELDS} }
    }
  }
`;

/** One product by handle, for a product page that wants the freshest availability. */
export const PRODUCT_BY_HANDLE_QUERY = `
  query DermalProduct($handle: String!) {
    product(handle: $handle) { ${PRODUCT_FIELDS} }
  }
`;

/** A cheap call that proves the token, the header and the permissions are right. */
export const SHOP_QUERY = `
  query DermalShop {
    shop { name primaryDomain { url } paymentSettings { currencyCode } }
  }
`;

const CART_FIELDS = `
  id
  checkoutUrl
  totalQuantity
  cost {
    subtotalAmount ${MONEY}
    totalAmount ${MONEY}
    totalTaxAmount ${MONEY}
  }
  lines(first: 50) {
    nodes {
      id
      quantity
      cost { totalAmount ${MONEY} amountPerQuantity ${MONEY} }
      merchandise {
        ... on ProductVariant {
          id
          title
          availableForSale
          quantityAvailable
          price ${MONEY}
          selectedOptions { name value }
          product { id handle title }
        }
      }
    }
  }
`;

const USER_ERRORS = `userErrors { field message }`;

export const CART_QUERY = `
  query DermalCart($id: ID!) {
    cart(id: $id) { ${CART_FIELDS} }
  }
`;

export const CART_CREATE = `
  mutation DermalCartCreate($lines: [CartLineInput!]) {
    cartCreate(input: { lines: $lines }) {
      cart { ${CART_FIELDS} }
      ${USER_ERRORS}
    }
  }
`;

export const CART_LINES_ADD = `
  mutation DermalCartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart { ${CART_FIELDS} }
      ${USER_ERRORS}
    }
  }
`;

export const CART_LINES_UPDATE = `
  mutation DermalCartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
    cartLinesUpdate(cartId: $cartId, lines: $lines) {
      cart { ${CART_FIELDS} }
      ${USER_ERRORS}
    }
  }
`;

export const CART_LINES_REMOVE = `
  mutation DermalCartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
      cart { ${CART_FIELDS} }
      ${USER_ERRORS}
    }
  }
`;
