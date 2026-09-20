import type { Metadata, Viewport } from "next";
import { Bodoni_Moda, Geist, Geist_Mono } from "next/font/google";
import { BagDrawer } from "@/components/cart/BagDrawer";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { PreviewBanner } from "@/components/layout/PreviewBanner";
import { StudioProvider } from "@/components/studio/StudioProvider";
import { site } from "@/lib/config/site";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const bodoni = Bodoni_Moda({
  variable: "--font-bodoni",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: { default: `${site.brand} — facial jewelry, previewed on you`, template: `%s — ${site.brand}` },
  description: site.tagline,
  // Preview build with demo products. Keep it out of search until launch is approved.
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#0c0c0d",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} ${bodoni.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:bg-ivory focus:px-4 focus:py-2 focus:text-ink"
        >
          Skip to content
        </a>
        {/* The Studio provider sits above every route so a chosen photo survives client-side navigation. */}
        <StudioProvider>
          <PreviewBanner />
          <Navbar />
          <main id="main" className="flex-1">
            {children}
          </main>
          <Footer />
          <BagDrawer />
        </StudioProvider>
      </body>
    </html>
  );
}
