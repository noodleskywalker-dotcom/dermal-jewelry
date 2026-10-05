import type { MetadataRoute } from "next";

// Public indexing remains closed until the owner approves launch.
export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: "*", disallow: "/" } };
}
