import type { MetadataRoute } from "next";
import { catalog } from "@/lib/catalog";
import { canonicalOrigin } from "@/lib/config/metadata";

export default function sitemap(): MetadataRoute.Sitemap {
  const origin = canonicalOrigin();
  if (!origin) return [];
  return ["/", "/shop", "/collections", "/commission", "/face-studio", "/about", ...catalog.listProducts().map((p) => `/product/${p.slug}`)]
    .map((path) => ({ url: new URL(path, origin).href }));
}
