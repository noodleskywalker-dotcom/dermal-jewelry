import Link from "next/link";

// The ways into the catalogue: text, under whatever is browsing above it. They are never given a
// stage of their own, so no way in competes with a design family for attention. Nothing is promised
// that has not been announced, so there is no limited-edition entry here.
const WAYS: { href: string; label: string }[] = [
  { href: "/shop", label: "Full collection" },
  { href: "/shop?browse=men", label: "Men" },
  { href: "/shop?browse=women", label: "Women" },
  { href: "/shop?browse=inspired", label: "Inspired" },
  { href: "/shop?browse=original", label: "Original" },
  { href: "/face-studio", label: "Try on your face" },
];

export function WaysIn({ className, exclude = [] }: { className?: string; /** Hrefs to leave out, where the page already says it louder. */ exclude?: string[] }) {
  return (
    <nav aria-label="Ways into the catalogue" data-testid="browse-ways" className={`browse-ways ${className ?? ""}`}>
      {WAYS.filter((way) => !exclude.includes(way.href)).map((way) => (
        <Link key={way.href} href={way.href} draggable={false} className="text-link">
          {way.label} <span aria-hidden="true">↗</span>
        </Link>
      ))}
    </nav>
  );
}
