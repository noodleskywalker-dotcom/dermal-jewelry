import Link from "next/link";

// The one quiet way from the catalogue to a commission: a line of type under the pieces, never a banner.
export function CommissionCta({ className }: { className?: string }) {
  return (
    <aside aria-label="Commission" data-testid="commission-cta" className={`commission-cta ${className ?? ""}`}>
      <p className="label-xs text-ash">Can’t find what you want?</p>
      <Link href="/commission" className="commission-cta-link">
        Commission your own <span aria-hidden="true">→</span>
      </Link>
    </aside>
  );
}
