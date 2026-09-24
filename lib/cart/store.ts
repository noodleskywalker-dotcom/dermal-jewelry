"use client";

import { useSyncExternalStore } from "react";
import { catalog } from "@/lib/catalog";
import type { FormId } from "@/lib/catalog/types";
import { addToBag, EMPTY_BAG, removeFromBag, sanitizeBag, setQuantity, type Bag } from "./bag";

// The demo bag holds product ids and quantities only. No photo or face data is ever stored here.
const STORAGE_KEY = "dermal.demo-bag.v2";

let bag: Bag = EMPTY_BAG;
let loaded = false;
let drawerOpen = false;
const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) bag = sanitizeBag(JSON.parse(raw), catalog);
  } catch {
    bag = EMPTY_BAG;
  }
}

function commit(next: Bag) {
  bag = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(bag));
  } catch {
    // Storage can be unavailable (private mode); the bag still works for this visit.
  }
  emit();
}

function subscribe(listener: () => void) {
  load();
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export const bagActions = {
  add: (productId: string, formId: FormId, quantity = 1) => commit(addToBag(bag, productId, formId, quantity)),
  setQuantity: (productId: string, formId: FormId, quantity: number) => commit(setQuantity(bag, productId, formId, quantity)),
  remove: (productId: string, formId: FormId) => commit(removeFromBag(bag, productId, formId)),
  /**
   * Empties the demo bag. Called when Shopify becomes the real cart: a demo line must never sit
   * beside a real one, and a placeholder must never be carried into a purchase.
   */
  clear: () => {
    if (bag.lines.length) commit(EMPTY_BAG);
  },
  openDrawer: () => {
    drawerOpen = true;
    emit();
  },
  closeDrawer: () => {
    drawerOpen = false;
    emit();
  },
};

export function useBag(): Bag {
  return useSyncExternalStore(
    subscribe,
    () => {
      load();
      return bag;
    },
    () => EMPTY_BAG,
  );
}

export function useBagDrawerOpen(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => drawerOpen,
    () => false,
  );
}
