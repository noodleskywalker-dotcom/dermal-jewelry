"use client";

import { useSyncExternalStore } from "react";
import type { CartSummary } from "@/lib/shopify/cart";

/**
 * The real bag, as far as the browser is concerned: an id it remembers and whatever Shopify last
 * said the cart contains. Every amount here came back from Shopify; nothing is calculated locally.
 *
 * Only the cart id is stored. No product data, no prices and nothing about a photo or a face.
 */

const CART_ID_KEY = "dermal.shopify-cart-id.v1";

export type CartState = {
  cart: CartSummary | null;
  status: "idle" | "busy" | "error";
  /** A sentence a customer can read. Shopify's own wording never reaches here. */
  error: string | null;
  /** False until the first restore has finished, so the interface can avoid flashing an empty bag. */
  ready: boolean;
};

let state: CartState = { cart: null, status: "idle", error: null, ready: false };
const listeners = new Set<() => void>();
let restoring: Promise<void> | null = null;

function emit() {
  for (const listener of listeners) listener();
}

function set(next: Partial<CartState>) {
  state = { ...state, ...next };
  emit();
}

function readId(): string | null {
  try {
    return window.localStorage.getItem(CART_ID_KEY);
  } catch {
    return null;
  }
}

function writeId(id: string | null) {
  try {
    if (id) window.localStorage.setItem(CART_ID_KEY, id);
    else window.localStorage.removeItem(CART_ID_KEY);
  } catch {
    // Private browsing can refuse storage. The bag still works for this visit; it is simply not
    // remembered after it, which is better than failing the action the customer asked for.
  }
}

type CartAnswer = { ok: boolean; cart?: CartSummary | null; forget?: boolean; error?: string; message?: string };

async function call(body: Record<string, unknown>): Promise<CartAnswer> {
  const response = await fetch("/api/cart", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return (await response.json()) as CartAnswer;
}

async function run(body: Record<string, unknown>): Promise<void> {
  set({ status: "busy", error: null });
  try {
    const answer = await call(body);
    if (!answer.ok) {
      set({
        status: "error",
        error:
          answer.error === "not_configured"
            ? "The bag is not available in this preview."
            : "The bag could not be reached. Nothing was changed.",
      });
      return;
    }
    if (answer.forget) writeId(null);
    else if (answer.cart) writeId(answer.cart.id);
    set({ cart: answer.cart ?? null, status: "idle", error: null, ready: true });
  } catch {
    set({ status: "error", error: "The bag could not be reached. Nothing was changed." });
  }
}

/** Reads the cart back after a reload. Runs once; a second caller waits on the first. */
export function restoreCart(): Promise<void> {
  if (restoring) return restoring;
  const id = readId();
  if (!id) {
    set({ ready: true });
    restoring = Promise.resolve();
    return restoring;
  }
  restoring = run({ action: "get", cartId: id });
  return restoring;
}

export const cartActions = {
  add: (merchandiseId: string, quantity = 1) => run({ action: "add", cartId: readId(), merchandiseId, quantity }),
  setQuantity: (lineId: string, quantity: number) => {
    const cartId = readId();
    if (!cartId) return Promise.resolve();
    return run({ action: "update", cartId, lineId, quantity });
  },
  remove: (lineId: string) => {
    const cartId = readId();
    if (!cartId) return Promise.resolve();
    return run({ action: "remove", cartId, lineId });
  },
  /** Used by tests and by a customer who wants to start again. Shopify keeps the abandoned cart. */
  forget: () => {
    writeId(null);
    set({ cart: null, status: "idle", error: null, ready: true });
  },
};

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (typeof window !== "undefined") void restoreCart();
  return () => listeners.delete(listener);
}

const SERVER_STATE: CartState = { cart: null, status: "idle", error: null, ready: false };

export function useShopifyCart(): CartState {
  return useSyncExternalStore(
    subscribe,
    () => state,
    () => SERVER_STATE,
  );
}

/** Test seam: resets the module between checks without touching a real browser. */
export function resetCartStoreForTests() {
  state = { cart: null, status: "idle", error: null, ready: false };
  restoring = null;
  listeners.clear();
}
