import type { Metadata } from "next";
import { FaceStudio } from "@/components/studio/FaceStudio";

export const metadata: Metadata = {
  title: "Face Studio",
  description: "Preview facial jewelry on your own photo. The photo stays on your device.",
};

export default async function FaceStudioPage({ searchParams }: PageProps<"/face-studio">) {
  const params = await searchParams;
  const product = Array.isArray(params.product) ? params.product[0] : params.product;
  return <FaceStudio initialProductSlug={product} />;
}
