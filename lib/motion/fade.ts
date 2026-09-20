/**
 * CSS opacity expression driven by the chapter's --p variable:
 * fades in between a and b, holds, and fades out between c and d.
 */
export function fadeWindow(a: number, b: number, c: number, d: number): string {
  const rise = `clamp(0, calc((var(--p) - ${a}) / ${(b - a).toFixed(4)}), 1)`;
  const fall = `clamp(0, calc((${d} - var(--p)) / ${(d - c).toFixed(4)}), 1)`;
  return `min(${rise}, ${fall})`;
}

/** Props for a layer that is visible only inside a progress window. */
export function windowProps(a: number, b: number, c: number, d: number) {
  return {
    "data-from": Math.max(0, a - 0.001),
    "data-to": Math.min(1, d + 0.001),
    style: { opacity: fadeWindow(a, b, c, d) } as React.CSSProperties,
  };
}
