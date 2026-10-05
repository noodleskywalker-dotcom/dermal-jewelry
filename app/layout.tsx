import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Geist, Geist_Mono } from "next/font/google";
import { BagDrawer } from "@/components/cart/BagDrawer";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { GlobalMascot } from "@/components/layout/GlobalMascot";
import { CommerceProvider } from "@/components/commerce/CommerceProvider";
import { StudioProvider } from "@/components/studio/StudioProvider";
import { SandTransitionProvider } from "@/components/transition/SandTransition";
import { getCommerceState } from "@/lib/commerce/catalog";
import { internalMascotClips, internalMascotMedia, internalSandFallback, internalSandSource, isInternalReview } from "@/lib/story/registry";
import { site } from "@/lib/config/site";
import { canonicalOrigin } from "@/lib/config/metadata";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  metadataBase: canonicalOrigin(),
  title: { default: `${site.brand} — facial jewelry & custom commissions`, template: `%s — ${site.brand}` },
  description: site.tagline,
  openGraph: { siteName: site.brand, type: "website", title: "DERMAL — facial jewelry & custom commissions", description: site.tagline },
  // Preview build with demo products. Keep it out of search until launch is approved.
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#fbfaf7",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  // Whether anything on this storefront can actually be bought. It reuses the cached catalogue read,
  // and it falls back to "not live" whenever Shopify cannot be reached, so the bag is never offered
  // as real when it could not be.
  const { live } = await getCommerceState();
  const internal = isInternalReview();
  const mascot = internalMascotMedia(internal);
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} ${cormorant.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col" data-mascot={mascot ? "true" : undefined}>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:bg-ivory focus:px-4 focus:py-2 focus:text-ink"
        >
          Skip to content
        </a>
        {/* The Studio provider sits above every route so a chosen photo survives client-side navigation. */}
        <CommerceProvider live={live}>
        <StudioProvider>
          {/* A build has no clip, so there the transition is simply a link. */}
          <SandTransitionProvider src={internalSandSource(internal)} fallbackSrc={internalSandFallback(internal)}>
            <Navbar />
            <main id="main" className="flex-1">
              {children}
            </main>
            <Footer />
            <BagDrawer />
            <GlobalMascot media={mascot} clips={mascot ? internalMascotClips(internal) : null} />
          </SandTransitionProvider>
        </StudioProvider>
        </CommerceProvider>
      </body>
    </html>
  );
}
