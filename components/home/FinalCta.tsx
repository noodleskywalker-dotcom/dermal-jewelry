import Link from "next/link";

export function FinalCta({ shopHref }: { shopHref: string; still?: string }) {
  return (
    <section aria-labelledby="final-heading" data-testid="final-section" className="brand-closing">
      <p className="label-xs">06 / Make it yours</p>
      <h2 id="final-heading">A small piece.<br /><em>An unmistakable you.</em></h2>
      <div className="brand-closing-links">
        <Link href={shopHref} className="text-link" data-testid="final-shop">Find your piece <span aria-hidden="true">↗</span></Link>
        <Link href="/face-studio" className="text-link" data-testid="final-studio">Enter Face Studio <span aria-hidden="true">↗</span></Link>
        <Link href="/commission" className="text-link">Create your own <span aria-hidden="true">↗</span></Link>
      </div>
    </section>
  );
}
