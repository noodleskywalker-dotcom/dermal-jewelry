"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { catalog, displayTitle, formOf, isConceptFamily, placementLabel } from "@/lib/catalog";
import type { Product } from "@/lib/catalog/types";
import { bagActions } from "@/lib/cart/store";
import { useShopifyCart } from "@/lib/cart/shopify-store";
import { purchaseState } from "@/lib/commerce/display";
import { useCommerceLive } from "@/components/commerce/CommerceProvider";
import { SCALE_MAX, SCALE_MIN, TWEAK_SCALE_MAX, TWEAK_SCALE_MIN, ZERO_TWEAK } from "@/lib/studio/geometry";
import {
  activeItem,
  addItem,
  createItem,
  findConflict,
  removeItem,
  replaceItem,
  resetItem,
  setActive,
  setForm,
  setSide,
  switchProduct,
  toggleVisible,
  updateGroup,
  updateTweak,
} from "@/lib/studio/look";
import type { LookItem, Side } from "@/lib/studio/types";
import { ANCHORS, PlacementPreview } from "@/components/catalog/PlacementPreview";
import { ProductArtwork } from "@/components/catalog/ProductArtwork";
import { LookRenderer, type LookInteraction } from "./LookRenderer";
import { PhotoPicker } from "./PhotoPicker";
import { useStudio } from "./StudioProvider";
import "./studio.css";

const NUDGE = 0.004;

// Quiet text controls. The Studio should read as a styling tool, not a dashboard of boxes.
const toolButton =
  "label-xs inline-flex min-h-11 shrink-0 items-center px-3 text-ash transition-colors duration-200 hover:text-ink disabled:cursor-not-allowed disabled:text-line aria-pressed:text-garnet aria-pressed:underline aria-pressed:underline-offset-8";

export function FaceStudio({ initialProductSlug, initialFormId }: { initialProductSlug?: string; initialFormId?: string }) {
  const studio = useStudio();
  const commerceLive = useCommerceLive();
  const { cart } = useShopifyCart();
  const { photo, look, change, selectProduct, selectSide, selectForm } = studio;
  // A concept family has no drawn form, so it has nothing to place: the Studio never offers one.
  const products = catalog.listProducts().filter((p) => !isConceptFamily(p));
  const placeable = (id: string | undefined) => products.find((p) => p.id === id);
  const active = activeItem(look);
  const activeProduct = placeable(active?.productId);
  const currentProduct = activeProduct ?? placeable(studio.productId) ?? products[0];

  const [selectedComponent, setSelectedComponent] = useState<string | null>(null);
  const [showJewelry, setShowJewelry] = useState(true);
  const [status, setStatus] = useState("");
  const [pendingAdd, setPendingAdd] = useState<{ product: Product; side: Side; conflictUid: string } | null>(null);
  const [addProductId, setAddProductId] = useState(products[0].id);
  const [addSide, setAddSide] = useState<Side>("right");
  // Which tool's controls are on the page. Move is the default; a slider appears only for its tool.
  const [tool, setTool] = useState<"move" | "scale" | "rotate">("move");

  // A selection only counts while it names a piece of the active product.
  const pieceId =
    activeProduct && active && formOf(activeProduct, active.formId).components.some((c) => c.id === selectedComponent)
      ? selectedComponent
      : null;

  const chooseProduct = (product: Product) => {
    selectProduct(product.id);
    setSelectedComponent(null);
    if (active) change((l) => switchProduct(l, active.uid, product, studio.forms[product.id]));
  };

  const chooseForm = (product: Product, formId: string) => {
    studio.selectForm(product.id, formId);
    setSelectedComponent(null);
    if (active && active.productId === product.id) change((l) => setForm(l, active.uid, product, formId));
  };

  // Product-aware links (/face-studio?product=slug) open the Studio on that piece.
  const appliedSlug = useRef<string | null>(null);
  useEffect(() => {
    const key = `${initialProductSlug ?? ""}|${initialFormId ?? ""}`;
    if (!initialProductSlug || appliedSlug.current === key) return;
    appliedSlug.current = key;
    const product = catalog.getProduct(initialProductSlug);
    if (!product || isConceptFamily(product)) return;
    selectProduct(product.id);
    // Only a real, available form is accepted from the URL. The URL never carries photo data.
    const form = initialFormId ? formOf(product, initialFormId) : null;
    if (form) selectForm(product.id, form.id);
    change((l) => {
      const current = activeItem(l);
      if (!current) return l;
      const wanted = form?.id ?? (current.productId === product.id ? current.formId : undefined);
      return current.productId !== product.id || current.formId !== wanted ? switchProduct(l, current.uid, product, wanted) : l;
    });
  }, [initialProductSlug, initialFormId, selectProduct, selectForm, change]);

  const interaction: LookInteraction = {
    activeUid: look.activeUid,
    selectedComponent: pieceId,
    onSelectItem: (uid) => {
      if (uid !== look.activeUid) {
        setSelectedComponent(null);
        change((l) => setActive(l, uid));
      }
    },
    onGroupChange: (uid, patch, key) => change((l) => updateGroup(l, uid, patch), key),
    onTweakChange: (uid, componentId, patch, key) => change((l) => updateTweak(l, uid, componentId, patch), key),
  };

  const tweak = active && pieceId ? (active.tweaks[pieceId] ?? ZERO_TWEAK) : null;

  const setScale = (value: number) => {
    if (!active) return;
    if (pieceId) change((l) => updateTweak(l, active.uid, pieceId, { scale: value }), `piece-scale:${active.uid}:${pieceId}`);
    else change((l) => updateGroup(l, active.uid, { scale: value }), `scale:${active.uid}`);
  };

  const setRotation = (value: number) => {
    if (!active) return;
    if (pieceId) change((l) => updateTweak(l, active.uid, pieceId, { rotation: value }), `piece-rotate:${active.uid}:${pieceId}`);
    else change((l) => updateGroup(l, active.uid, { rotation: value }), `rotate:${active.uid}`);
  };

  const nudge = (dx: number, dy: number) => {
    if (!active) return;
    if (pieceId) {
      const t = active.tweaks[pieceId] ?? ZERO_TWEAK;
      change(
        (l) => updateTweak(l, active.uid, pieceId, { dx: t.dx + dx / active.group.scale, dy: t.dy + dy / active.group.scale }),
        "nudge",
      );
    } else {
      change((l) => updateGroup(l, active.uid, { x: active.group.x + dx, y: active.group.y + dy }), "nudge");
    }
  };

  const changeSide = (side: Side) => {
    selectSide(side);
    if (active) change((l) => setSide(l, active.uid, side));
  };

  const requestAdd = () => {
    const product = catalog.getProductById(addProductId);
    if (!product) return;
    const form = formOf(product, studio.forms[product.id]);
    const conflict = findConflict(look, form.placement, addSide);
    if (conflict) {
      setPendingAdd({ product, side: addSide, conflictUid: conflict.uid });
      return;
    }
    // Build the item outside the updater so the reducer stays pure.
    const item = createItem(studio.newUid(), product, addSide, form.id);
    change((l) => addItem(l, item));
    setSelectedComponent(null);
    setStatus(`${product.title} added to your look.`);
  };

  const resolveAdd = (mode: "replace" | "add") => {
    if (!pendingAdd) return;
    const item = createItem(studio.newUid(), pendingAdd.product, pendingAdd.side, studio.forms[pendingAdd.product.id]);
    change((l) => (mode === "replace" ? replaceItem(l, pendingAdd.conflictUid, item) : addItem(l, item)));
    setSelectedComponent(null);
    setStatus(`${pendingAdd.product.title} ${mode === "replace" ? "replaced the existing piece" : "added to your look"}.`);
    setPendingAdd(null);
  };

  const canSaveLook = look.items.length > 0 && look.items.every((item) => {
    const product = catalog.getProductById(item.productId);
    return product && purchaseState(product, item.formId, commerceLive || cart !== null).canSaveSelection;
  });

  const addLookToBag = () => {
    if (!canSaveLook) return;
    // A pair is one sellable product, so each distinct product is added once, not once per piece.
    // Two forms of the same design are different bag lines.
    const lines = new Map(look.items.map((i) => [`${i.productId}:${i.formId}`, i]));
    lines.forEach((i) => bagActions.add(i.productId, i.formId));
    bagActions.openDrawer();
    setStatus(`${lines.size} ${lines.size === 1 ? "piece" : "pieces"} saved to your selection.`);
  };

  return (
    <div className="dermal-studio">
      <header className="dermal-studio-header">
        <div><p className="label-xs text-garnet">An exercise in expression</p><h1>Face <em>Studio</em></h1></div>
        <div className="dermal-studio-intro"><p>Find your point of view.</p><span>Choose a piece. Add your photo. Make the placement your own.</span></div>
      </header>

      <div className="dermal-studio-layout">
        {/* Piece rail */}
        <section aria-labelledby="pieces-heading" className="dermal-studio-pieces">
          <h2 id="pieces-heading" className="label-xs text-ash">
            The pieces <span className="dermal-studio-count">{String(products.length).padStart(2, "0")}</span>
          </h2>
          {/* Centred while the row fits, scrollable once it does not. `justify-center` alone would push
              the first pieces past the left edge, where no scrolling can reach them. */}
          <ul className="dermal-studio-piece-rail">
            {products.map((product) => {
              const selected = currentProduct.id === product.id;
              return (
                <li key={product.id} className="shrink-0">
                  <button
                    type="button"
                    data-testid="studio-product"
                    data-product={product.slug}
                    aria-pressed={selected}
                    onClick={() => chooseProduct(product)}
                    className={`dermal-studio-piece flex w-44 items-start gap-3 border-b pb-3 text-left transition-colors duration-500 ${
                      selected ? "border-garnet text-ink" : "border-transparent text-ash hover:text-ink"
                    }`}
                  >
                    <ProductArtwork product={product} className="h-14 w-12 shrink-0" showLabel={false} />
                    <span className="min-w-0">
                      {/* The whole name, on two lines if it needs them. Never cut short. */}
                      <span className="block font-display text-base font-light leading-tight">{displayTitle(product.title)}</span>
                      <span className="label-xs mt-1 block text-ash">
                        {placementLabel(product.placements[0])}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>

        {/* Stage */}
        {/* On small screens the stage sticks under the header so the jewelry stays visible while adjusting. */}
        <section
          aria-label="Photo stage"
          className={`dermal-studio-stage-section ${photo ? "dermal-studio-stage-with-photo" : ""}`}
        >
          <div
            className={`dermal-studio-stage ${photo ? "dermal-studio-stage-personal" : ""}`}
            data-testid="studio-stage"
          >
            {photo ? (
              // The customer's own photo settles in where the sculpted head stood.
              <div className="story-face h-full w-full">
                <LookRenderer
                  photo={photo}
                  items={look.items}
                  showJewelry={showJewelry}
                  interaction={interaction}
                  label="Your photo with the selected jewelry. Drag a piece or use the controls to adjust it."
                />
              </div>
            ) : (
              // No photo yet: the sculpted head, cropped close around the chosen placement, so the piece
              // and not the mannequin is the object of the stage. The head is the approved featureless
              // device, never a person.
              <div data-testid="studio-head" className="flex h-full flex-col items-center">
                {(() => {
                  const form = formOf(currentProduct, studio.forms[currentProduct.id]);
                  const anchor = ANCHORS[form.placement] ?? { x: 0.5, y: 0.5 };
                  return (
                    <div className="studio-crop">
                      <div className="crop-head" style={{ "--px": anchor.x, "--py": anchor.y, "--s": 1.9, "--tx": 0.55, "--ty": 0.46 } as React.CSSProperties}>
                        <PlacementPreview product={currentProduct} formId={form.id} bare />
                      </div>
                      <p className="dermal-studio-stage-caption label-xs">Sculpted form, not a person · approximate</p>
                    </div>
                  );
                })()}
                <div className="dermal-studio-photo-invite">
                  <PhotoPicker className="w-full max-w-[16rem]" label="Use my photo" compact />
                  <p className="label-xs -mt-2 text-ash">Your photo stays on this device</p>
                </div>
              </div>
            )}
          </div>

          {photo && (
            // Plain words on paper under the photo, a hairline above them: no pill, nothing over the picture.
            <div className="mt-3 flex flex-wrap items-center justify-center gap-x-1 border-t border-line pt-1" role="toolbar" aria-label="Studio actions">
              <button
                type="button"
                className={toolButton}
                aria-pressed={!showJewelry}
                onClick={() => setShowJewelry((v) => !v)}
                data-testid="before-after"
              >
                {showJewelry ? "Show before" : "Show after"}
              </button>
              <button
                type="button"
                className={toolButton}
                data-testid="clear-photo"
                onClick={() => {
                  studio.clearPhoto();
                  setSelectedComponent(null);
                  setShowJewelry(true);
                  setPendingAdd(null);
                  setStatus("Photo cleared from this session.");
                }}
              >
                Clear photo
              </button>
            </div>
          )}
          <p role="status" aria-live="polite" className="mt-2 min-h-5 text-sm text-ash" data-testid="studio-status">
            {status}
          </p>
        </section>

        {/* Controls and look */}
        {/* On small screens the stage is pinned above this panel, so focused controls keep clear of it. */}
        <div className="dermal-studio-controls">
          <div className="dermal-studio-selected"><p className="label-xs text-garnet">Currently selected</p><h2>{displayTitle(currentProduct.title)}</h2><Link className="text-link" href={`/product/${currentProduct.slug}`}>Explore the piece <span aria-hidden="true">↗</span></Link></div>
          <section aria-labelledby="adjust-heading">
            <h2 id="adjust-heading" className="label-xs text-ash">
              {photo ? "Adjust" : "Form"}
            </h2>

            {currentProduct.forms.length > 1 && (
              <fieldset className="mt-3">
                <legend className="sr-only">Piercing form</legend>
                <div className="flex flex-wrap gap-x-5 gap-y-1">
                  {currentProduct.forms.map((form) => {
                    const pending = form.status !== "available";
                    const selectedForm = (active?.productId === currentProduct.id ? active.formId : formOf(currentProduct, studio.forms[currentProduct.id]).id) === form.id;
                    return (
                      <TargetButton
                        key={form.id}
                        selected={!pending && selectedForm}
                        disabled={pending}
                        onClick={() => chooseForm(currentProduct, form.id)}
                        testId={`studio-form-${form.id}`}
                      >
                        {form.label}
                        {pending && " · concept pending"}
                      </TargetButton>
                    );
                  })}
                </div>
              </fieldset>
            )}

            {/* The tools, like a configurator's: one word each, the current value beside it, and only the
                selected tool's controls below. Nothing else is on the page until it is asked for. */}
            {photo && active && activeProduct ? (
              <>
                <div className="mt-8 flex flex-wrap gap-x-5 gap-y-1" role="tablist" aria-label="Tools">
                  {(["move", "scale", "rotate"] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      role="tab"
                      aria-selected={tool === t}
                      onClick={() => setTool(t)}
                      data-testid={`tool-${t}`}
                      className={`label-xs inline-flex min-h-11 items-center gap-2 border-b transition-colors duration-500 ${tool === t ? "border-garnet text-ink" : "border-transparent text-ash hover:text-ink"}`}
                    >
                      {t}
                      {t === "scale" && (
                        <output className="font-mono normal-case tracking-normal text-ash" data-testid="scale-value">
                          {`${((tweak ? tweak.scale : active.group.scale) * 100).toFixed(pieceId ? 0 : 1)}%`}
                        </output>
                      )}
                      {t === "rotate" && (
                        <output className="font-mono normal-case tracking-normal text-ash" data-testid="rotation-value">
                          {`${Math.round(tweak ? tweak.rotation : active.group.rotation)}°`}
                        </output>
                      )}
                    </button>
                  ))}
                  <button
                    type="button"
                    className={toolButton}
                    data-testid="reset"
                    onClick={() => {
                      setSelectedComponent(null);
                      change((l) => resetItem(l, active.uid, activeProduct));
                    }}
                  >
                    Reset
                  </button>
                  <button type="button" className={toolButton} onClick={studio.undo} disabled={!studio.canUndo} data-testid="undo">
                    Undo
                  </button>
                  <button type="button" className={toolButton} onClick={studio.redo} disabled={!studio.canRedo} data-testid="redo">
                    Redo
                  </button>
                </div>

                {formOf(activeProduct, active.formId).components.length > 1 && (
                  <fieldset className="mt-5">
                    <legend className="label-xs text-ash">Part</legend>
                    <div className="mt-1 flex flex-wrap gap-x-5 gap-y-1">
                      <TargetButton selected={pieceId === null} onClick={() => setSelectedComponent(null)} testId="target-group">
                        Pair
                      </TargetButton>
                      {formOf(activeProduct, active.formId).components.map((c) => (
                        <TargetButton key={c.id} selected={pieceId === c.id} onClick={() => setSelectedComponent(c.id)} testId={`target-${c.id}`}>
                          {/* "Symbol (upper, outer)" reads as "Symbol" here; the full label stays on the drag handle. */}
                          {c.label.split(" (")[0]}
                        </TargetButton>
                      ))}
                    </div>
                    {pieceId && <p className="mt-2 text-xs leading-relaxed text-ash">Moving one piece is a visual preview only. It does not describe a real spacing or fit.</p>}
                  </fieldset>
                )}

                {tool === "move" && (
                  <div className="mt-5" data-testid="tool-panel-move">
                    <fieldset>
                      <legend className="label-xs text-ash">Side of the face</legend>
                      <div className="mt-1 flex gap-x-5">
                        {(["left", "right"] as const).map((side) => {
                          const selected = (active?.side ?? studio.side) === side;
                          return (
                            <label
                              key={side}
                              className={`label-xs flex min-h-11 cursor-pointer items-center border-b has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-garnet-text ${
                                selected ? "border-garnet text-ink" : "border-transparent text-ash hover:text-ink"
                              }`}
                            >
                              <input type="radio" name="wearer-side" value={side} checked={selected} onChange={() => changeSide(side)} className="sr-only" data-testid={`side-${side}`} />
                              Wearer&rsquo;s {side}
                            </label>
                          );
                        })}
                      </div>
                    </fieldset>
                    <div className="mt-4 flex items-center justify-between gap-4">
                      <p className="label-xs text-ash">Nudge</p>
                      <div className="-mr-3 flex" role="group" aria-label="Nudge position">
                        <NudgeButton label="Nudge left" onClick={() => nudge(-NUDGE, 0)} testId="nudge-left">←</NudgeButton>
                        <NudgeButton label="Nudge up" onClick={() => nudge(0, -NUDGE)} testId="nudge-up">↑</NudgeButton>
                        <NudgeButton label="Nudge down" onClick={() => nudge(0, NUDGE)} testId="nudge-down">↓</NudgeButton>
                        <NudgeButton label="Nudge right" onClick={() => nudge(NUDGE, 0)} testId="nudge-right">→</NudgeButton>
                      </div>
                    </div>
                    <p className="mt-1 text-xs leading-relaxed text-ash">Drag the jewelry, or focus it and use the arrow keys. The wearer&rsquo;s left is on the right of an unmirrored photo.</p>
                  </div>
                )}
                {tool === "scale" && (
                  <div className="mt-5" data-testid="tool-panel-scale">
                    <Slider
                      label={pieceId ? "Piece size" : "Size"}
                      testId="scale"
                      min={pieceId ? TWEAK_SCALE_MIN * 100 : SCALE_MIN * 100}
                      max={pieceId ? TWEAK_SCALE_MAX * 100 : SCALE_MAX * 100}
                      step={pieceId ? 1 : 0.2}
                      value={(tweak ? tweak.scale : active.group.scale) * 100}
                      display={(v) => `${v.toFixed(pieceId ? 0 : 1)}%`}
                      onChange={(v) => setScale(v / 100)}
                    />
                  </div>
                )}
                {tool === "rotate" && (
                  <div className="mt-5" data-testid="tool-panel-rotate">
                    <Slider
                      label={pieceId ? "Piece rotation" : "Rotation"}
                      testId="rotation"
                      min={-180}
                      max={180}
                      step={1}
                      value={tweak ? tweak.rotation : active.group.rotation}
                      display={(v) => `${Math.round(v)}°`}
                      onChange={setRotation}
                    />
                  </div>
                )}
              </>
            ) : null}
          </section>

          {photo && (
          <section aria-labelledby="look-heading">
            <h2 id="look-heading" className="label-xs text-ash">
              Your look
            </h2>

            {look.items.length === 0 ? (
              <p className="mt-3 text-sm leading-relaxed text-ash" data-testid="look-empty">
                No pieces yet. Add a photo and the selected piece joins your look.
              </p>
            ) : (
              <ul className="mt-3 divide-y divide-line border-y border-line" data-testid="look-list">
                {look.items.map((item) => (
                  <LookRow
                    key={item.uid}
                    item={item}
                    isActive={item.uid === look.activeUid}
                    onEdit={() => {
                      setSelectedComponent(null);
                      change((l) => setActive(l, item.uid));
                    }}
                    onToggle={() => change((l) => toggleVisible(l, item.uid))}
                    onRemove={() => {
                      setSelectedComponent(null);
                      change((l) => removeItem(l, item.uid));
                      setStatus("Piece removed from your look.");
                    }}
                  />
                ))}
              </ul>
            )}

            {photo && (
              <div className="mt-4 space-y-2">
                <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2">
                  <label className="sr-only" htmlFor="add-product">
                    Piece to add
                  </label>
                  <select
                    id="add-product"
                    value={addProductId}
                    onChange={(e) => setAddProductId(e.target.value)}
                    className="min-h-11 border-b border-line bg-paper text-sm"
                    data-testid="add-product"
                  >
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.title}
                      </option>
                    ))}
                  </select>
                  <label className="sr-only" htmlFor="add-side">
                    Side for the new piece
                  </label>
                  <select
                    id="add-side"
                    value={addSide}
                    onChange={(e) => setAddSide(e.target.value as Side)}
                    className="min-h-11 border-b border-line bg-paper text-sm"
                    data-testid="add-side"
                  >
                    <option value="left">Wearer&rsquo;s left</option>
                    <option value="right">Wearer&rsquo;s right</option>
                  </select>
                </div>
                <button type="button" className={`${toolButton} !px-0 underline underline-offset-8`} onClick={requestAdd} data-testid="add-piece">
                  Add another piece
                </button>

                {pendingAdd && (
                  <div role="alertdialog" aria-labelledby="conflict-title" className="border border-garnet p-4" data-testid="conflict">
                    <p id="conflict-title" className="text-sm leading-relaxed">
                      There is already a {placementLabel(formOf(pendingAdd.product, studio.forms[pendingAdd.product.id]).placement).toLowerCase()} piece on the
                      wearer&rsquo;s {pendingAdd.side}.
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button type="button" className={toolButton} onClick={() => resolveAdd("replace")} data-testid="conflict-replace">
                        Replace it
                      </button>
                      <button type="button" className={toolButton} onClick={() => resolveAdd("add")} data-testid="conflict-add">
                        Add anyway
                      </button>
                      <button type="button" className={toolButton} onClick={() => setPendingAdd(null)}>
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  disabled={!canSaveLook}
                  onClick={addLookToBag}
                  data-testid="add-look-to-bag"
                  className="min-h-12 w-full bg-garnet text-xs uppercase tracking-[0.22em] text-ivory transition-colors duration-200 hover:bg-[#a52a41] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Add look to selection
                </button>
                {(commerceLive || cart !== null) && <p className="text-xs leading-relaxed text-ash">Choose available pieces and their current prices in the <Link href="/shop" className="underline">shop</Link>.</p>}
                <p className="text-xs leading-relaxed text-ash">
                  A virtual combination is a styling preview. It does not mean the pieces are physically compatible.
                </p>
              </div>
            )}
          </section>
          )}

          <div className="dermal-studio-privacy"><p className="label-xs">Your photo stays on this device</p><p>Your photo stays in this browser tab&rsquo;s memory. It is not uploaded, saved or tracked, and it is gone after a reload.</p><p>A still, approximate preview. Not real size, not a fitting, not piercing advice.</p><Link href="/about#privacy" className="text-link">How the preview works <span aria-hidden="true">↗</span></Link></div>
        </div>
      </div>
    </div>
  );
}

function TargetButton({
  selected,
  onClick,
  testId,
  disabled = false,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  testId: string;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      aria-pressed={selected}
      onClick={onClick}
      data-testid={testId}
      className={`min-h-11 border-b px-1 text-xs transition-colors duration-200 ${
        selected ? "border-garnet text-ink" : "border-transparent text-ash hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}

function NudgeButton({
  label,
  onClick,
  testId,
  children,
}: {
  label: string;
  onClick: () => void;
  testId: string;
  children: React.ReactNode;
}) {
  return (
    <button type="button" aria-label={label} onClick={onClick} data-testid={testId} className="h-11 w-11 text-ash hover:text-ink">
      <span aria-hidden="true">{children}</span>
    </button>
  );
}

function Slider({
  label,
  testId,
  min,
  max,
  step,
  value,
  display,
  onChange,
}: {
  label: string;
  testId: string;
  min: number;
  max: number;
  step: number;
  value: number;
  display: (v: number) => string;
  onChange: (v: number) => void;
}) {
  const id = `slider-${testId}`;
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <label htmlFor={id} className="text-sm">
          {label}
        </label>
        <output htmlFor={id} className="font-mono text-xs text-ash">
          {display(value)}
        </output>
      </div>
      <input
        id={id}
        type="range"
        className="studio-range"
        data-testid={testId}
        min={min}
        max={max}
        step={step}
        value={value}
        aria-valuetext={display(value)}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  );
}

function LookRow({
  item,
  isActive,
  onEdit,
  onToggle,
  onRemove,
}: {
  item: LookItem;
  isActive: boolean;
  onEdit: () => void;
  onToggle: () => void;
  onRemove: () => void;
}) {
  const product = catalog.getProductById(item.productId);
  if (!product) return null;
  return (
    <li className="py-3" data-testid="look-item" data-product={product.slug}>
      <div className="flex items-baseline justify-between gap-3">
        <p className="font-display text-lg font-light leading-tight">
          {product.title}
          {isActive && <span className="ml-2 align-middle text-[0.625rem] uppercase tracking-[0.16em] text-garnet-text">Editing</span>}
        </p>
        <p className="shrink-0 text-xs text-ash">
          Price pending
        </p>
      </div>
      <p className="mt-1 text-xs text-ash">
        {formOf(product, item.formId).label} form · wearer&rsquo;s {item.side}
        {!item.visible && " · hidden"}
      </p>
      <div className="-ml-3 mt-1 flex">
        <button type="button" onClick={onEdit} disabled={isActive} className={toolButton}>
          Edit<span className="sr-only"> {product.title}</span>
        </button>
        <button type="button" onClick={onToggle} aria-pressed={!item.visible} className={toolButton}>
          {item.visible ? "Hide" : "Show"}
          <span className="sr-only"> {product.title}</span>
        </button>
        <button type="button" onClick={onRemove} className={toolButton} data-testid="remove-piece">
          Remove<span className="sr-only"> {product.title}</span>
        </button>
      </div>
    </li>
  );
}
