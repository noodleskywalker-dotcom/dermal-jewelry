import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-2xl px-5 py-32 text-center sm:px-8">
      <p className="eyebrow">404</p>
      <h1 className="mt-4 font-display text-5xl sm:text-6xl">That page isn&rsquo;t here.</h1>
      <p className="mt-4 text-sm text-ash">The piece or page you were looking for doesn&rsquo;t exist in this preview.</p>
      <Link href="/shop" className="mt-10 inline-flex min-h-12 items-center border border-ivory px-8 text-xs uppercase tracking-[0.24em] hover:bg-ivory hover:text-ink">
        Back to the shop
      </Link>
    </div>
  );
}
