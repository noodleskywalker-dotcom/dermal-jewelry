import { ShopifyError, storefront } from "./client";
import { CART_CREATE, CART_LINES_ADD, CART_LINES_REMOVE, CART_LINES_UPDATE, CART_QUERY } from "./queries";
import type { CartMutationAnswer, ShopifyCart } from "./types";

/**
 * The cart, as Shopify keeps it. Server only.
 *
 * Shopify owns the totals. Nothing here adds prices up: a subtotal the storefront calculated would
 * be a second opinion about money, and it would be the wrong one as soon as tax, a discount or a
 * currency rule applies. Every amount shown to a customer comes back from these calls.
 */

export type CartSummary = {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  subtotal: { amount: string; currencyCode: string };
  total: { amount: string; currencyCode: string };
  lines: {
    id: string;
    quantity: number;
    merchandiseId: string;
    handle: string;
    title: string;
    variantTitle: string;
    availableForSale: boolean;
    options: { name: string; value: string }[];
    linePrice: { amount: string; currencyCode: string };
    unitPrice: { amount: string; currencyCode: string };
  }[];
};

export function toSummary(cart: ShopifyCart): CartSummary {
  return {
    id: cart.id,
    checkoutUrl: cart.checkoutUrl,
    totalQuantity: cart.totalQuantity,
    subtotal: cart.cost.subtotalAmount,
    total: cart.cost.totalAmount,
    lines: (cart.lines?.nodes ?? []).map((line) => ({
      id: line.id,
      quantity: line.quantity,
      merchandiseId: line.merchandise.id,
      handle: line.merchandise.product.handle,
      title: line.merchandise.product.title,
      variantTitle: line.merchandise.title,
      availableForSale: line.merchandise.availableForSale,
      options: line.merchandise.selectedOptions,
      linePrice: line.cost.totalAmount,
      unitPrice: line.cost.amountPerQuantity,
    })),
  };
}

/** A mutation's `userErrors` are refusals, not crashes: Shopify declined, and it said why. */
function unwrap<K extends string>(answer: CartMutationAnswer<K>, key: K): ShopifyCart {
  const result = answer[key];
  if (result?.userErrors?.length) {
    throw new ShopifyError(
      "graphql",
      "Shopify refused the cart change.",
      result.userErrors.map((e) => e.message),
    );
  }
  if (!result?.cart) throw new ShopifyError("graphql", "Shopify returned no cart.");
  return result.cart;
}

export type CartLineInput = { merchandiseId: string; quantity: number };

export async function createCart(lines: CartLineInput[] = []): Promise<CartSummary> {
  const answer = await storefront<CartMutationAnswer<"cartCreate">>(CART_CREATE, { variables: { lines } });
  return toSummary(unwrap(answer, "cartCreate"));
}

/** The cart Shopify still has, or null when the id is unknown to it — an expired or completed cart. */
export async function fetchCart(id: string): Promise<CartSummary | null> {
  const answer = await storefront<{ cart: ShopifyCart | null }>(CART_QUERY, { variables: { id } });
  return answer.cart ? toSummary(answer.cart) : null;
}

export async function addLines(cartId: string, lines: CartLineInput[]): Promise<CartSummary> {
  const answer = await storefront<CartMutationAnswer<"cartLinesAdd">>(CART_LINES_ADD, { variables: { cartId, lines } });
  return toSummary(unwrap(answer, "cartLinesAdd"));
}

export async function updateLine(cartId: string, lineId: string, quantity: number): Promise<CartSummary> {
  const answer = await storefront<CartMutationAnswer<"cartLinesUpdate">>(CART_LINES_UPDATE, {
    variables: { cartId, lines: [{ id: lineId, quantity }] },
  });
  return toSummary(unwrap(answer, "cartLinesUpdate"));
}

export async function removeLine(cartId: string, lineId: string): Promise<CartSummary> {
  const answer = await storefront<CartMutationAnswer<"cartLinesRemove">>(CART_LINES_REMOVE, {
    variables: { cartId, lineIds: [lineId] },
  });
  return toSummary(unwrap(answer, "cartLinesRemove"));
}

/**
 * Adds to the cart there is, or starts one. A cart id the customer's browser remembers may have
 * been completed or expired, in which case Shopify no longer has it and a new one is started rather
 * than the customer being shown an error they cannot act on.
 */
export async function addToCart(cartId: string | null, lines: CartLineInput[]): Promise<CartSummary> {
  if (!cartId) return createCart(lines);
  try {
    return await addLines(cartId, lines);
  } catch (error) {
    if (error instanceof ShopifyError && error.kind === "graphql") return createCart(lines);
    throw error;
  }
}
