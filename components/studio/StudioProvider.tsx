"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef } from "react";
import { catalog } from "@/lib/catalog";
import { applyChange, canRedo, canUndo, createHistory, redo, undo, type History } from "@/lib/studio/history";
import { addItem, createItem, EMPTY_LOOK } from "@/lib/studio/look";
import { loadLocalPhoto, PhotoError } from "@/lib/studio/photo";
import type { Look, Side, StudioPhoto } from "@/lib/studio/types";

// Session state for Face Studio. The photo lives only in this in-memory provider: it is never
// uploaded, persisted, logged or placed in a URL. A hard reload starts with no photo.

type State = {
  photo: StudioPhoto | null;
  loading: boolean;
  error: string | null;
  history: History<Look>;
  productId: string;
  side: Side;
  /** The piercing form chosen for each design family. Shared by the product page, previews, Studio and bag. */
  forms: Record<string, string>;
};

type Action =
  | { type: "select-form"; productId: string; formId: string }
  | { type: "photo-loading" }
  | { type: "photo-loaded"; photo: StudioPhoto; look: Look }
  | { type: "photo-error"; message: string }
  | { type: "photo-cleared" }
  | { type: "change"; update: (look: Look) => Look; key?: string; at: number }
  | { type: "undo" }
  | { type: "redo" }
  | { type: "select-product"; productId: string }
  | { type: "select-side"; side: Side };

const initialState: State = {
  photo: null,
  loading: false,
  error: null,
  history: createHistory(EMPTY_LOOK),
  productId: catalog.listProducts()[0].id,
  side: "left",
  forms: {},
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "select-form":
      return state.forms[action.productId] === action.formId
        ? state
        : { ...state, forms: { ...state.forms, [action.productId]: action.formId } };
    case "photo-loading":
      return { ...state, loading: true, error: null };
    case "photo-loaded":
      return { ...state, loading: false, error: null, photo: action.photo, history: createHistory(action.look) };
    case "photo-error":
      return { ...state, loading: false, error: action.message };
    case "photo-cleared":
      return { ...state, loading: false, error: null, photo: null, history: createHistory(EMPTY_LOOK) };
    case "change":
      return {
        ...state,
        history: applyChange(state.history, action.update(state.history.present), { key: action.key, at: action.at }),
      };
    case "undo":
      return { ...state, history: undo(state.history) };
    case "redo":
      return { ...state, history: redo(state.history) };
    case "select-product":
      return { ...state, productId: action.productId };
    case "select-side":
      return { ...state, side: action.side };
  }
}

type StudioContextValue = {
  photo: StudioPhoto | null;
  loading: boolean;
  error: string | null;
  look: Look;
  productId: string;
  side: Side;
  canUndo: boolean;
  canRedo: boolean;
  selectFile: (file: File) => Promise<void>;
  clearPhoto: () => void;
  /** Applies a pure look update. Changes sharing a key collapse into one undo step. */
  change: (update: (look: Look) => Look, key?: string) => void;
  undo: () => void;
  redo: () => void;
  selectProduct: (productId: string) => void;
  selectSide: (side: Side) => void;
  /** Chosen form id per product id. Missing means the product's default form. */
  forms: Record<string, string>;
  selectForm: (productId: string, formId: string) => void;
  newUid: () => string;
};

const StudioContext = createContext<StudioContextValue | null>(null);

export function StudioProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const stateRef = useRef(state);
  const uidCounter = useRef(0);
  const loadToken = useRef(0);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // Release the object URL if the whole app unmounts.
  useEffect(() => {
    return () => {
      const url = stateRef.current.photo?.url;
      if (url) URL.revokeObjectURL(url);
    };
  }, []);

  const newUid = useCallback(() => `piece-${++uidCounter.current}`, []);

  const selectFile = useCallback(
    async (file: File) => {
      const token = ++loadToken.current;
      dispatch({ type: "photo-loading" });
      try {
        const photo = await loadLocalPhoto(file);
        if (token !== loadToken.current) {
          URL.revokeObjectURL(photo.url);
          return;
        }
        const previous = stateRef.current.photo?.url;
        if (previous) URL.revokeObjectURL(previous);
        const product = catalog.getProductById(stateRef.current.productId) ?? catalog.listProducts()[0];
        const look = addItem(
          EMPTY_LOOK,
          createItem(newUid(), product, stateRef.current.side, stateRef.current.forms[product.id]),
        );
        dispatch({ type: "photo-loaded", photo, look });
      } catch (err) {
        if (token !== loadToken.current) return;
        const message = err instanceof PhotoError ? err.message : "That photo couldn't be opened. Try another image.";
        dispatch({ type: "photo-error", message });
      }
    },
    [newUid],
  );

  const clearPhoto = useCallback(() => {
    loadToken.current++;
    const url = stateRef.current.photo?.url;
    if (url) URL.revokeObjectURL(url);
    dispatch({ type: "photo-cleared" });
  }, []);

  const change = useCallback((update: (look: Look) => Look, key?: string) => {
    dispatch({ type: "change", update, key, at: performance.now() });
  }, []);

  const undoLast = useCallback(() => dispatch({ type: "undo" }), []);
  const redoLast = useCallback(() => dispatch({ type: "redo" }), []);
  const selectProduct = useCallback((productId: string) => dispatch({ type: "select-product", productId }), []);
  const selectSide = useCallback((side: Side) => dispatch({ type: "select-side", side }), []);
  const selectForm = useCallback((productId: string, formId: string) => dispatch({ type: "select-form", productId, formId }), []);

  const value = useMemo<StudioContextValue>(
    () => ({
      photo: state.photo,
      loading: state.loading,
      error: state.error,
      look: state.history.present,
      productId: state.productId,
      side: state.side,
      canUndo: canUndo(state.history),
      canRedo: canRedo(state.history),
      selectFile,
      clearPhoto,
      change,
      undo: undoLast,
      redo: redoLast,
      selectProduct,
      selectSide,
      forms: state.forms,
      selectForm,
      newUid,
    }),
    [state, selectFile, clearPhoto, change, undoLast, redoLast, selectProduct, selectSide, selectForm, newUid],
  );

  return <StudioContext.Provider value={value}>{children}</StudioContext.Provider>;
}

export function useStudio(): StudioContextValue {
  const ctx = useContext(StudioContext);
  if (!ctx) throw new Error("useStudio must be used inside StudioProvider");
  return ctx;
}
