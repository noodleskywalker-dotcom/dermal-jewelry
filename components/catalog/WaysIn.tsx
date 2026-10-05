import Link from "next/link";
import styles from "./ways-in.module.css";

// Navigation into the catalogue stays secondary to the pieces. The limited-edition route reports
// its actual empty state until a release is announced; the link itself promises no availability.
const WAYS: { href: string; label: string }[] = [
  { href: "/shop", label: "Full collection" },
  { href: "/shop?browse=men", label: "Men" },
  { href: "/shop?browse=women", label: "Women" },
  { href: "/shop?browse=inspired", label: "Inspired" },
  { href: "/shop?browse=original", label: "Original" },
  { href: "/shop?browse=limited", label: "Limited edition" },
  { href: "/face-studio", label: "Try on your face" },
];

export function WaysIn({ className, exclude = [] }: { className?: string; /** Hrefs to leave out, where the page already says it louder. */ exclude?: string[] }) {
  return (
    <nav aria-label="Ways into the catalogue" data-testid="browse-ways" className={`browse-ways ${styles.ways} ${className ?? ""}`}>
      {WAYS.filter((way) => !exclude.includes(way.href)).map((way) => (
        <Link key={way.href} href={way.href} draggable={false} className="text-link">
          {way.label} <span aria-hidden="true">↗</span>
        </Link>
      ))}
    </nav>
  );
}
