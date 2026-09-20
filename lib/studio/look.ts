import type { PlacementId, Product } from "@/lib/catalog/types";
import { clampGroup, clampTweak, defaultGroup, mirrorItem, ZERO_TWEAK } from "./geometry";
import type { ComponentTweak, GroupTransform, Look, LookItem, Side } from "./types";

export const EMPTY_LOOK: Look = { items: [], activeUid: null };

export function activeItem(look: Look): LookItem | undefined {
  return look.items.find((i) => i.uid === look.activeUid);
}

export function createItem(uid: string, product: Product, side: Side, placement?: PlacementId): LookItem {
  const chosen = placement && product.placements.includes(placement) ? placement : product.placements[0];
  return {
    uid,
    productId: product.id,
    placement: chosen,
    side,
    group: defaultGroup(product, chosen, side),
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

/**
 * Swaps the product on an item. The anchor, scale and rotation are kept when the placement
 * is unchanged; per-piece tweaks are dropped because pieces differ between products.
 */
export function switchProduct(look: Look, uid: string, product: Product): Look {
  return mapItem(look, uid, (item) => {
    const samePlacement = product.placements.includes(item.placement);
    const placement = samePlacement ? item.placement : product.placements[0];
    return {
      ...item,
      productId: product.id,
      placement,
      group: samePlacement ? item.group : defaultGroup(product, placement, item.side),
      tweaks: {},
    };
  });
}

export function setSide(look: Look, uid: string, side: Side): Look {
  return mapItem(look, uid, (item) => (item.side === side ? item : mirrorItem(item)));
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
    group: defaultGroup(product, item.placement, item.side),
    tweaks: {},
  }));
}

export function toggleVisible(look: Look, uid: string): Look {
  return mapItem(look, uid, (item) => ({ ...item, visible: !item.visible }));
}

/**
 * Items to draw for a product-card preview: the customer's current look with the previewed
 * product standing in for the active item, or a default placement when nothing matches.
 */
export function previewItems(look: Look, product: Product): LookItem[] {
  const active = activeItem(look);
  if (active && product.placements.includes(active.placement)) {
    const swapped = switchProduct(look, active.uid, product);
    return swapped.items.filter((i) => i.visible || i.uid === active.uid).map((i) => ({ ...i, visible: true }));
  }
  const others = look.items.filter((i) => i.visible);
  return [...others, createItem("preview", product, active?.side ?? "left")];
}
