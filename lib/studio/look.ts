import { formOf } from "@/lib/catalog";
import type { FormId, PlacementId, Product } from "@/lib/catalog/types";
import { clampGroup, clampTweak, defaultGroup, mirrorItem, ZERO_TWEAK } from "./geometry";
import type { ComponentTweak, GroupTransform, Look, LookItem, Side } from "./types";

export const EMPTY_LOOK: Look = { items: [], activeUid: null };

const memoryKey = (formId: FormId, side: Side) => `${formId}:${side}`;

export function activeItem(look: Look): LookItem | undefined {
  return look.items.find((i) => i.uid === look.activeUid);
}

export function createItem(uid: string, product: Product, side: Side, formId?: string | null): LookItem {
  const form = formOf(product, formId);
  return {
    uid,
    productId: product.id,
    formId: form.id,
    placement: form.placement,
    side,
    group: defaultGroup(form, side),
    memory: {},
    tweaks: {},
    visible: true,
  };
}

/** An existing item that already occupies the same placement and side, if any. */
export function findConflict(look: Look, placement: PlacementId, side: Side): LookItem | undefined {
  return look.items.find((i) => i.placement === placement && i.side === side);
}

export function addItem(look: Look, item: LookItem): Look {
  return { items: [...look.items, item], activeUid: item.uid };
}

export function replaceItem(look: Look, targetUid: string, item: LookItem): Look {
  return { items: look.items.map((i) => (i.uid === targetUid ? item : i)), activeUid: item.uid };
}

export function removeItem(look: Look, uid: string): Look {
  const items = look.items.filter((i) => i.uid !== uid);
  const activeUid = look.activeUid === uid ? (items[items.length - 1]?.uid ?? null) : look.activeUid;
  return { items, activeUid };
}

export function setActive(look: Look, uid: string): Look {
  return look.items.some((i) => i.uid === uid) ? { ...look, activeUid: uid } : look;
}

function mapItem(look: Look, uid: string, fn: (item: LookItem) => LookItem): Look {
  return { ...look, items: look.items.map((i) => (i.uid === uid ? fn(i) : i)) };
}

/** Saves the item's current adjustment under its own form and side. */
function remember(item: LookItem): LookItem["memory"] {
  return { ...item.memory, [memoryKey(item.formId, item.side)]: item.group };
}

/**
 * Shows another piece, or another form of the same design, on an item.
 * The customer's adjustment is kept only while the placement profile stays the same. A different
 * placement starts from that form's own default or from what the customer set for it earlier,
 * so cheek coordinates are never reused for a nose form.
 */
export function switchProduct(look: Look, uid: string, product: Product, formId?: string | null): Look {
  return mapItem(look, uid, (item) => {
    const form = formOf(product, formId);
    const sameProduct = item.productId === product.id;
    const memory = sameProduct ? remember(item) : {};
    const samePlacement = form.placement === item.placement;
    const recalled = memory[memoryKey(form.id, item.side)];
    const group = recalled ?? (samePlacement ? item.group : defaultGroup(form, item.side));
    return { ...item, productId: product.id, formId: form.id, placement: form.placement, group, memory, tweaks: {} };
  });
}

export function setForm(look: Look, uid: string, product: Product, formId: string): Look {
  return switchProduct(look, uid, product, formId);
}

export function setSide(look: Look, uid: string, side: Side): Look {
  return mapItem(look, uid, (item) => {
    if (item.side === side) return item;
    const memory = remember(item);
    const recalled = memory[memoryKey(item.formId, side)];
    const mirrored = mirrorItem(item);
    return { ...mirrored, memory, group: recalled ?? mirrored.group };
  });
}

export function updateGroup(look: Look, uid: string, patch: Partial<GroupTransform>): Look {
  return mapItem(look, uid, (item) => ({ ...item, group: clampGroup({ ...item.group, ...patch }) }));
}

export function updateTweak(look: Look, uid: string, componentId: string, patch: Partial<ComponentTweak>): Look {
  return mapItem(look, uid, (item) => ({
    ...item,
    tweaks: {
      ...item.tweaks,
      [componentId]: clampTweak({ ...(item.tweaks[componentId] ?? ZERO_TWEAK), ...patch }),
    },
  }));
}

export function resetItem(look: Look, uid: string, product: Product): Look {
  return mapItem(look, uid, (item) => ({
    ...item,
    group: defaultGroup(formOf(product, item.formId), item.side),
    tweaks: {},
  }));
}

export function toggleVisible(look: Look, uid: string): Look {
  return mapItem(look, uid, (item) => ({ ...item, visible: !item.visible }));
}

/**
 * Items to draw for a preview of one product form: the customer's current look with the previewed
 * form standing in for the active item when the placement matches, otherwise a default placement.
 */
export function previewItems(look: Look, product: Product, formId?: string | null): LookItem[] {
  const form = formOf(product, formId);
  const active = activeItem(look);
  if (active && active.placement === form.placement) {
    const swapped = switchProduct(look, active.uid, product, form.id);
    return swapped.items.filter((i) => i.visible || i.uid === active.uid).map((i) => ({ ...i, visible: true }));
  }
  const others = look.items.filter((i) => i.visible);
  return [...others, createItem("preview", product, active?.side ?? "left", form.id)];
}
