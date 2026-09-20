"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { catalog, formatPrice, formOf, placementLabel } from "@/lib/catalog";
import type { Product } from "@/lib/catalog/types";
import { bagActions } from "@/lib/cart/store";
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
import { ProductArtwork } from "@/components/catalog/ProductArtwork";
import { LookRenderer, type LookInteraction } from "./LookRenderer";
import { PhotoPicker } from "./PhotoPicker";
import { useStudio } from "./StudioProvider";

const NUDGE = 0.004;

// Quiet text controls. The Studio should read as a styling tool, not a dashboard of boxes.
const toolButton =
  "label-xs inline-flex min-h-11 shrink-0 items-center px-3 text-ivory/75 transition-colors duration-200 hover:text-ivory disabled:cursor-not-allowed disabled:text-ivory/25 aria-pressed:text-ivory aria-pressed:underline aria-pressed:underline-offset-8";

export function FaceStudio({ initialProductSlug, initialFormId }: { initialProductSlug?: string; initialFormId?: string }) {
  const studio = useStudio();
  const { photo, look, change, selectProduct, selectSide, selectForm } = studio;
  const products = catalog.listProducts();
  const active = activeItem(look);
  const activeProduct = active ? catalog.getProductById(active.productId) : undefined;
  const currentProduct = activeProduct ?? catalog.getProductById(studio.productId) ?? products[0];

  const [selectedComponent, setSelectedComponent] = useState<string | null>(null);
  const [showJewelry, setShowJewelry] = useState(true);
  const [status, setStatus] = useState("");
  const [pendingAdd, setPendingAdd] = useState<{ product: Product; side: Side; conflictUid: string } | null>(null);
  const [addProductId, setAddProductId] = useState(products[0].id);
  const [addSide, setAddSide] = useState<Side>("right");

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
    if (!product) return;
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

  const addLookToBag = () => {
    // A pair is one sellable product, so each distinct product is added once, not once per piece.
    // Two forms of the same design are different bag lines.
    const lines = new Map(look.items.map((i) => [`${i.productId}:${i.formId}`, i]));
    lines.forEach((i) => bagActions.add(i.productId, i.formId));
    bagActions.openDrawer();
    setStatus(`${lines.size} ${lines.size === 1 ? "piece" : "pieces"} added to your demo bag.`);
  };

  return (
    <div className="mx-auto max-w-[90rem] px-5 pb-10 sm:px-8">
      <header className="flex flex-wrap items-end justify-between gap-4 pb-6 pt-8">
        <h1 className="font-display text-4xl font-light leading-none sm:text-5xl">Face Studio</h1>
        <p className="label-xs max-w-sm leading-relaxed text-ash">
          A still, approximate preview. Not real size, not a fitting, not piercing advice.
        </p>
      </header>

      <div className="grid gap-x-12 gap-y-5 lg:grid-cols-[minmax(0,1fr)_19rem]">
        {/* Piece rail */}
        <section aria-labelledby="pieces-heading" className="order-2 min-w-0 lg:col-start-1 lg:row-start-2">
          <h2 id="pieces-heading" className="label-xs text-ash">
            Pieces
          </h2>
          <ul className="mt-3 flex gap-6 overflow-x-auto pb-2">
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
                    className={`flex w-44 items-center gap-3 border-b pb-2 text-left transition-colors duration-200 ${
                      selected ? "border-ivory" : "border-transparent text-ivory/70 hover:text-ivory"
                    }`}
                  >
                    <ProductArtwork product={product} className="h-14 w-12 shrink-0" showLabel={false} />
                    <span className="min-w-0">
                      <span className="block truncate font-display text-base font-light leading-tight">{product.title}</span>
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
          className={`order-1 min-w-0 bg-ink lg:static lg:col-start-1 lg:row-start-1 ${photo ? "sticky top-16 z-20 -mx-5 px-5 pb-1 sm:-mx-8 sm:px-8 lg:mx-0 lg:px-0" : ""}`}
        >
          <div
            className={`relative bg-coal lg:h-[72dvh] ${photo ? "h-[44dvh] min-h-[16rem]" : "h-[58dvh] min-h-[22rem]"}`}
            data-testid="studio-stage"
          >
            {photo ? (
              <LookRenderer
                photo={photo}
                items={look.items}
                showJewelry={showJewelry}
                interaction={interaction}
                label="Your photo with the selected jewelry. Drag a piece or use the controls to adjust it."
              />
            ) : (
              <div className="flex h-full flex-col items-center justify-center px-6 text-center">
                <p className="font-display text-3xl sm:text-4xl">Start with a photo.</p>
                <p className="mt-3 max-w-sm text-sm leading-relaxed text-ash">
                  A front-facing photo works best. You can move, scale and rotate the jewelry afterwards.
                </p>
                <PhotoPicker className="mt-7 max-w-sm" label="Use my photo" />
                <p className="mt-2 text-xs text-ash">A sample model isn&rsquo;t available yet.</p>
              </div>
            )}
          </div>

          {photo && (
            <div className="relative z-10 mx-auto -mt-12 flex w-max max-w-full items-center overflow-x-auto bg-ink/80 px-1 backdrop-blur-sm" role="toolbar" aria-label="Studio actions">
              <button type="button" className={toolButton} onClick={studio.undo} disabled={!studio.canUndo} data-testid="undo">
                Undo
              </button>
              <button type="button" className={toolButton} onClick={studio.redo} disabled={!studio.canRedo} data-testid="redo">
                Redo
              </button>
              <button
                type="button"
                className={toolButton}
                disabled={!active || !activeProduct}
                data-testid="reset"
                onClick={() => {
                  if (!active || !activeProduct) return;
                  setSelectedComponent(null);
                  change((l) => resetItem(l, active.uid, activeProduct));
                }}
              >
                Reset
              </button>
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
                className={`${toolButton} border-l border-line`}
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
        <div className="order-3 min-w-0 space-y-10 lg:col-start-2 lg:row-span-2 lg:row-start-1">
          <section aria-labelledby="adjust-heading">
            <h2 id="adjust-heading" className="label-xs text-ash">
              Adjust
            </h2>

            <fieldset className="mt-3">
              <legend className="text-sm">Side of the face</legend>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {(["left", "right"] as const).map((side) => {
                  const selected = (active?.side ?? studio.side) === side;
                  return (
                    <label
                      key={side}
                      className={`label-xs flex min-h-11 cursor-pointer items-center border-b has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-garnet-text ${
                        selected ? "border-ivory" : "border-line text-ash"
                      }`}
                    >
                      <input
                        type="radio"
                        name="wearer-side"
                        value={side}
                        checked={selected}
                        onChange={() => changeSide(side)}
                        className="sr-only"
                        data-testid={`side-${side}`}
                      />
                      Wearer&rsquo;s {side}
                    </label>
                  );
                })}
              </div>
              <p className="mt-2 text-xs leading-relaxed text-ash">
                The wearer&rsquo;s left appears on the right of an unmirrored photo.
              </p>
            </fieldset>

            {currentProduct.forms.length > 1 && (
              <fieldset className="mt-5">
                <legend className="text-sm">Piercing form</legend>
                <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1">
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

            {active && activeProduct ? (
              <>
                {formOf(activeProduct, active.formId).components.length > 1 && (
                  <fieldset className="mt-5">
                    <legend className="text-sm">What to move</legend>
                    <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1">
                      <TargetButton selected={pieceId === null} onClick={() => setSelectedComponent(null)} testId="target-group">
                        Both pieces
                      </TargetButton>
                      {formOf(activeProduct, active.formId).components.map((c) => (
                        <TargetButton
                          key={c.id}
                          selected={pieceId === c.id}
                          onClick={() => setSelectedComponent(c.id)}
                          testId={`target-${c.id}`}
                        >
                          {c.label}
                        </TargetButton>
                      ))}
                    </div>
                    {pieceId && (
                      <p className="mt-2 text-xs leading-relaxed text-ash">
                        Moving one piece is a visual preview only. It does not describe a real spacing or fit.
                      </p>
                    )}
                  </fieldset>
                )}

                <div className="mt-5 space-y-4">
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

                <div className="mt-5">
                  <p className="text-sm">Nudge position</p>
                  <div className="mt-2 grid w-36 grid-cols-3 gap-1" role="group" aria-label="Nudge position">
                    <span />
                    <NudgeButton label="Nudge up" onClick={() => nudge(0, -NUDGE)} testId="nudge-up">↑</NudgeButton>
                    <span />
                    <NudgeButton label="Nudge left" onClick={() => nudge(-NUDGE, 0)} testId="nudge-left">←</NudgeButton>
                    <span />
                    <NudgeButton label="Nudge right" onClick={() => nudge(NUDGE, 0)} testId="nudge-right">→</NudgeButton>
                    <span />
                    <NudgeButton label="Nudge down" onClick={() => nudge(0, NUDGE)} testId="nudge-down">↓</NudgeButton>
                    <span />
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-ash">
                    You can also drag the jewelry, or focus it and use the arrow keys.
                  </p>
                </div>
              </>
            ) : (
              <p className="mt-4 text-sm leading-relaxed text-ash">Add a photo to place and adjust a piece.</p>
            )}
          </section>

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
                    className="min-h-11 border-b border-line bg-ink text-sm"
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
                    className="min-h-11 border-b border-line bg-ink text-sm"
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
                  disabled={look.items.length === 0}
                  onClick={addLookToBag}
                  data-testid="add-look-to-bag"
                  className="min-h-12 w-full bg-garnet text-xs uppercase tracking-[0.22em] text-ivory transition-colors duration-200 hover:bg-[#a52a41] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Add look to demo bag
                </button>
                <p className="text-xs leading-relaxed text-ash">
                  A virtual combination is a styling preview. It does not mean the pieces are physically compatible.
                </p>
              </div>
            )}
          </section>

          <p className="border-t border-line pt-5 text-xs leading-relaxed text-ash">
            Your photo stays in this browser tab&rsquo;s memory. It is not uploaded, saved or tracked, and it is gone
            after a reload. <Link href="/about#privacy" className="underline hover:text-ivory">How the preview works</Link>
          </p>
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
        selected ? "border-ivory" : "border-transparent text-ash hover:text-ivory"
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
    <button type="button" aria-label={label} onClick={onClick} data-testid={testId} className="h-11 w-11 text-ivory/70 hover:text-ivory">
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
        <output htmlFor={id} className="font-mono text-xs text-ash" data-testid={`${testId}-value`}>
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
        <p className="shrink-0 text-xs text-ash">Demo {formatPrice(formOf(product, item.formId).demoPrice, product.currency)}</p>
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
