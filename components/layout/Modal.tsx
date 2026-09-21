"use client";

import { useEffect, useRef } from "react";

// Built on the native <dialog>: showModal() provides the focus trap, Escape handling,
// inert background and focus restoration without a dependency.
export function Modal({
  open,
  onClose,
  label,
  variant,
  children,
}: {
  open: boolean;
  onClose: () => void;
  label: string;
  variant: "drawer" | "sheet" | "full" | "clear";
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  const shape =
    variant === "drawer"
      ? "drawer-in ml-auto mr-0 h-dvh max-h-dvh w-full max-w-md border-l"
      : variant === "full"
        ? "fade-in h-dvh max-h-dvh w-full max-w-none"
        : variant === "clear"
          ? "h-dvh max-h-dvh w-full max-w-none"
        : "sheet-up mb-0 mt-auto max-h-[88dvh] w-full max-w-none border-t sm:mx-auto sm:max-w-lg";

  return (
    <dialog
      ref={ref}
      aria-label={label}
      onClose={onClose}
      onClick={(e) => {
        // A click on the dialog element itself is a click on the backdrop.
        if (e.target === e.currentTarget) onClose();
      }}
      // "clear" has no surface and no backdrop: the page stays visible under whatever it draws.
      className={`${shape} m-0 border-line p-0 open:flex open:flex-col ${variant === "clear" ? "overflow-hidden border-0 bg-transparent text-ink backdrop:bg-transparent" : "bg-coal text-ivory backdrop:bg-black/70"}`}
    >
      {open ? children : null}
    </dialog>
  );
}
