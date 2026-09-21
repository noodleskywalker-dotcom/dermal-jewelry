import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/lib/config/site";

export const metadata: Metadata = { title: "About" };

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-14 sm:px-8">
      <p className="eyebrow">About</p>
      <h1 className="mt-3 font-display text-5xl leading-[0.95] sm:text-7xl">Small pieces, chosen placement.</h1>
      <div className="mt-10 space-y-6 text-base leading-relaxed text-ash">
        <p>
          {site.brand} started with a simple problem: distinctive anti-eyebrow jewelry was hard to find, and there was no
          way to see a piece on your own face before choosing it.
        </p>
        <p>
          So the store is built around a preview. Add a photo, pick a piece, move it where you wear it. You can also
          just browse. A photo and an account are never required.
        </p>
      </div>

      <section id="privacy" aria-labelledby="privacy-heading" className="mt-16 border-t border-line pt-10">
        <h2 id="privacy-heading" className="font-display text-4xl">How the preview handles your photo</h2>
        <ul className="mt-6 space-y-4 text-sm leading-relaxed text-ash">
          <li>Your photo is opened by your browser and kept in this tab&rsquo;s memory only.</li>
          <li>It is not uploaded, saved to your device by us, added to analytics or placed in a link.</li>
          <li>Clear photo removes it from the Studio and from every product preview. A page reload also removes it.</li>
          <li>The preview is a flat, approximate image. It does not measure your face or show real jewelry size.</li>
          <li>It cannot tell you where a piercing can safely go. Ask a professional piercer.</li>
        </ul>
      </section>

      <section aria-labelledby="status-heading" className="mt-16 border-t border-line pt-10">
        <h2 id="status-heading" className="font-display text-4xl">Where things stand</h2>
        <p className="mt-6 text-sm leading-relaxed text-ash">
          This is a preview build. The four pieces are concepts with demo prices. Materials, dimensions and
          compatibility are not verified, and checkout is disabled.
        </p>
        <Link href="/face-studio" className="btn-solid mt-8">
          Open Face Studio
        </Link>
      </section>
    </div>
  );
}
