import type { Metadata } from "next";
import { FaceStudio } from "@/components/studio/FaceStudio";

export const metadata: Metadata = {
  title: "Face Studio",
  description: "Preview facial jewelry on your own photo. The photo stays on your device.",
};

const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);

// The URL carries only a product slug and a piercing form. It never carries anything about a photo.
export default async function FaceStudioPage({ searchParams }: PageProps<"/face-studio">) {
  const params = await searchParams;
  return <FaceStudio initialProductSlug={first(params.product)} initialFormId={first(params.form)} />;
}
