"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { bagCount } from "@/lib/cart/bag";
import { bagActions, useBag } from "@/lib/cart/store";
import { site } from "@/lib/config/site";
import { Modal } from "./Modal";

// One light bar on every page: near-black words, no rule, no box. Transparent over the page's
// opening so a cinematic section can own the whole screen; it quietly takes a veil of paper once
// the page has scrolled. There is no dark bar.
export function Navbar() {
  const pathname = usePathname();
  const bag = useBag();
  const count = bagCount(bag);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const linkClass = "label-xs inline-flex min-h-11 items-center opacity-80 transition-opacity duration-200 hover:opacity-100";

  useEffect(() => {
    const read = () => setScrolled(window.scrollY > 24);
    read();
    window.addEventListener("scroll", read, { passive: true });
    return () => window.removeEventListener("scroll", read);
  }, []);

  return (
    <>
    <header data-tone="light" data-scrolled={scrolled} className={`sticky top-0 z-40 text-ink transition-colors duration-500 ${scrolled ? "bg-paper/85 backdrop-blur-[6px]" : "bg-transparent"}`}>
      <nav aria-label="Main" className="mx-auto flex h-16 max-w-[100rem] items-center justify-between px-5 sm:px-8">
        <Link href="/" className="font-sans text-sm font-medium tracking-[0.42em]" aria-label={`${site.brand} home`}>
          {site.brand}
        </Link>

        <ul className="hidden items-center gap-10 md:flex">
          {site.nav.map((item) => {
            const current = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <li key={item.href}>
                <Link href={item.href} aria-current={current ? "page" : undefined} className={`${linkClass} ${current ? "!opacity-100" : ""}`}>
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="flex items-center gap-6">
          <Link href="/shop#shop-search" className={`${linkClass} hidden md:inline-flex`}>
            Search
          </Link>
          <button type="button" onClick={bagActions.openDrawer} data-testid="open-bag" className={linkClass}>
            Bag <span aria-hidden="true">&nbsp;({count})</span>
            <span className="sr-only">, {count} {count === 1 ? "item" : "items"}</span>
          </button>
          <button type="button" className={`${linkClass} md:hidden`} aria-haspopup="dialog" onClick={() => setMenuOpen(true)}>
            Menu
          </button>
        </div>
      </nav>
    </header>
    {/* Outside the header so the blend mode never touches the menu. */}
    <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}

function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Modal open={open} onClose={onClose} label="Menu" variant="full">
      <div className="flex h-16 items-center justify-between px-5">
        <span className="font-sans text-sm font-medium tracking-[0.42em]">{site.brand}</span>
        <button type="button" onClick={onClose} className="label-xs inline-flex min-h-11 items-center">
          Close
        </button>
      </div>
      <ul id="mobile-menu" className="flex flex-1 flex-col justify-center gap-2 px-5 pb-16">
        {[...site.nav, { href: "/shop#shop-search", label: "Search" }].map((item, i) => (
          <li key={item.href}>
            <Link href={item.href} onClick={onClose} className="flex items-baseline gap-5 py-2 font-display text-5xl font-light">
              <span aria-hidden="true" className="label-xs w-6 text-ash">0{i + 1}</span>
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </Modal>
  );
}
