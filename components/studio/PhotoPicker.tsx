"use client";

import { useId, useRef } from "react";
import { ACCEPT_ATTR } from "@/lib/studio/photo";
import { useStudio } from "./StudioProvider";

// The one way a photo enters the app. The file is read locally and never sent anywhere.
export function PhotoPicker({
  label = "Choose a photo",
  compact = false,
  className,
}: {
  label?: string;
  compact?: boolean;
  className?: string;
}) {
  const { selectFile, loading, error } = useStudio();
  const inputRef = useRef<HTMLInputElement>(null);
  const errorId = useId();

  return (
    <div className={className}>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT_ATTR}
        data-testid="photo-input"
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
        onChange={(e) => {
          const file = e.target.files?.[0];
          // Reset so choosing the same file again still fires a change.
          e.target.value = "";
          if (file) void selectFile(file);
        }}
      />
      <button
        type="button"
        disabled={loading}
        aria-describedby={error ? errorId : undefined}
        onClick={() => inputRef.current?.click()}
        className={`inline-flex min-h-12 items-center justify-center bg-ivory px-7 text-xs uppercase tracking-[0.22em] text-ink transition-colors duration-200 hover:bg-white disabled:opacity-60 ${
          compact ? "w-full" : ""
        }`}
      >
        {loading ? "Opening photo…" : label}
      </button>
      {!compact && (
        <p className="mt-3 text-xs leading-relaxed text-ash">
          JPEG, PNG or WebP, up to 10 MB. Your photo stays on this device and is never uploaded.
        </p>
      )}
      <p id={errorId} role="alert" data-testid="photo-error" className="mt-3 min-h-5 text-sm text-garnet-text">
        {error}
      </p>
    </div>
  );
}
