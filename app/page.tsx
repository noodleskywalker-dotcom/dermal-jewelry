import { CollectionChapter } from "@/components/home/CollectionChapter";
import { EndingChapter } from "@/components/home/EndingChapter";
import { HeroChapter } from "@/components/home/HeroChapter";
import { SceneHud } from "@/components/home/SceneHud";
import { StudioChapter } from "@/components/home/StudioChapter";
import { catalog } from "@/lib/catalog";

const CHAPTERS = [
  { id: "piece", label: "The piece" },
  { id: "studio", label: "Face Studio" },
  { id: "collection", label: "Collection" },
  { id: "enter", label: "Enter" },
];

// The homepage is one editorial sequence in four chapters rather than a stack of sections.
export default function HomePage() {
  const products = catalog.listProducts();
  return (
    <>
      <SceneHud chapters={CHAPTERS} />
      <HeroChapter product={products[0]} />
      <StudioChapter first={products[0]} second={products[1]} />
      <CollectionChapter products={products} />
      <EndingChapter />
    </>
  );
}
