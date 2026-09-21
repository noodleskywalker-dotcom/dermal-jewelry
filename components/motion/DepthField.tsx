"use client";

import { useCursorDepth } from "@/lib/motion/useCursorDepth";

/** A region whose floating objects shift a little with the cursor, each by its own depth. */
export function DepthField({ children, className, testId }: { children: React.ReactNode; className?: string; testId?: string }) {
  const ref = useCursorDepth<HTMLDivElement>();
  return (
    <div ref={ref} data-testid={testId} className={`depth-field ${className ?? ""}`}>
      {children}
    </div>
  );
}
