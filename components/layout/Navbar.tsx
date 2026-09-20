"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { bagCount } from "@/lib/cart/bag";
import { bagActions, useBag } from "@/lib/cart/store";
import { site } from "@/lib/config/site";

export function Navbar() {
  const pathname = usePathname();
  const bag = useBag();
  const count = bagCount(bag);
  // Remember which route the menu was opened on, so navigating closes it without an effect.
  const [menuOpenOn, setMenuOpenOn] = useState<string | null>(null);
  const menuOpen = menuOpenOn === pathname;

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-ink/90 backdrop-blur">
      <nav aria-label="Main" className="mx-auto flex h-16 max-w-[90rem] items-center justify-between px-5 sm:px-8">
        <Link href="/" className="font-display text-2xl tracking-[0.3em]" aria-label={`${site.brand} home`}>
          {site.brand}
        </Link>

        <ul className="hidden items-center gap-9 md:flex">
          {site.nav.map((item) => {
            const current = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={current ? "page" : undefined}
                  className={`text-xs uppercase tracking-[0.22em] transition-colors duration-200 hover:text-ivory ${
                    current ? "text-ivory" : "text-ash"
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={bagActions.openDrawer}
            data-testid="open-bag"
            className="min-h-11 px-3 text-xs uppercase tracking-[0.22em] text-ivory"
          >
            Bag <span aria-hidden="true">({count})</span>
            <span className="sr-only">, {count} {count === 1 ? "item" : "items"}</span>
          </button>
          <button
            type="button"
            className="min-h-11 px-3 text-xs uppercase tracking-[0.22em] text-ivory md:hidden"
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            onClick={() => setMenuOpenOn(menuOpen ? null : pathname)}
          >
            {menuOpen ? "Close" : "Menu"}
          </button>
        </div>
      </nav>

      {menuOpen && (
        <ul id="mobile-menu" className="fade-in border-t border-line px-5 py-4 md:hidden">
          {site.nav.map((item) => (
            <li key={item.href}>
              <Link href={item.href} onClick={() => setMenuOpenOn(null)} className="block py-3 font-display text-3xl">
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </header>
  );
}
