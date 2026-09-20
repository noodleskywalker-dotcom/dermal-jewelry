import Link from "next/link";
import { site } from "@/lib/config/site";

// Only real destinations are linked. Contact details, policies and social links are added
// when they exist; nothing here is invented.
export function Footer() {
  return (
    <footer className="mt-24 border-t border-line">
      <div className="mx-auto grid max-w-[90rem] gap-12 px-5 py-16 sm:px-8 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <p className="font-display text-3xl tracking-[0.3em]">{site.brand}</p>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-ash">{site.tagline}</p>
        </div>

        <nav aria-label="Footer">
          <p className="eyebrow">Explore</p>
          <ul className="mt-4 space-y-3 text-sm">
            <li><Link href="/shop" className="hover:text-garnet-text">Shop all pieces</Link></li>
            <li><Link href={`/collections/${site.collection.slug}`} className="hover:text-garnet-text">Collection {site.collection.number} — {site.collection.title}</Link></li>
            <li><Link href="/face-studio" className="hover:text-garnet-text">Face Studio</Link></li>
            <li><Link href="/cart" className="hover:text-garnet-text">Demo bag</Link></li>
            <li><Link href="/about" className="hover:text-garnet-text">About</Link></li>
          </ul>
        </nav>

        <div>
          <p className="eyebrow">Good to know</p>
          <ul className="mt-4 space-y-3 text-sm leading-relaxed text-ash">
            <li>Your photo stays on this device. It is never uploaded.</li>
            <li>The try-on is an approximate visual preview, not a fitting or piercing advice.</li>
            <li>Materials, dimensions and compatibility will be published once verified.</li>
            <li>Contact, shipping and returns pages arrive before launch.</li>
          </ul>
        </div>
      </div>
      <p className="border-t border-line px-5 py-6 text-center text-[0.6875rem] uppercase tracking-[0.2em] text-ash">
        {site.brand} preview. Working names, demo catalog.
      </p>
    </footer>
  );
}
