"use client";

import { useCallback, useEffect, useRef } from "react";
import { formOf } from "@/lib/catalog";
import type { Product, ProductForm } from "@/lib/catalog/types";
import { activeItem, setForm } from "@/lib/studio/look";
import { useStudio } from "./StudioProvider";

/** Chooses a piercing form for any design, keeping Face Studio in step when that design is being edited there. */
export function useChooseForm(): (product: Product, formId: string) => void {
  const { selectForm, change } = useStudio();
  return useCallback(
    (product: Product, formId: string) => {
      const next = formOf(product, formId).id;
      selectForm(product.id, next);
      change((look) => {
        const current = activeItem(look);
        return current && current.productId === product.id && current.formId !== next ? setForm(look, current.uid, product, next) : look;
      });
    },
    [selectForm, change],
  );
}

/**
 * The customer's piercing form for one design, read from and written to the shared Studio provider,
 * so every surface agrees. A form named in an address is applied once and is always validated by formOf.
 */
export function useFormChoice(product: Product, initialFormId?: string): { form: ProductForm; choose: (formId: string) => void } {
  const { forms, selectForm } = useStudio();
  const chooseForm = useChooseForm();
  const form = formOf(product, forms[product.id] ?? initialFormId);

  const applied = useRef<string | null>(null);
  useEffect(() => {
    const key = `${product.id}|${initialFormId ?? ""}`;
    if (!initialFormId || applied.current === key) return;
    applied.current = key;
    selectForm(product.id, formOf(product, initialFormId).id);
  }, [product, initialFormId, selectForm]);

  const choose = useCallback((formId: string) => chooseForm(product, formId), [chooseForm, product]);

  return { form, choose };
}
