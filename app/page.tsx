import { CinemaHero } from "@/components/home/CinemaHero";
import { FinalCta } from "@/components/home/FinalCta";
import { LaunchHero } from "@/components/home/LaunchHero";
import { SeeItOnYou } from "@/components/home/SeeItOnYou";
import { TheSelection } from "@/components/home/TheSelection";
import { AtelierIntroduction } from "@/components/home/AtelierIntroduction";
import { StoryChapters } from "@/components/home/StoryChapters";
import { getCatalogue } from "@/lib/commerce/catalog";
import { editorialPortraitUrl, editorialPreviewUrl } from "@/lib/story/editorial-preview";
import "./home-remodel.css";

const CINEMA = "/media/cinema";
const FAMILY_ORDER = ["desert-eye-love", "horus-trace", "blade-trace", "crossline", "ankh-trace", "japanese-angel", "ankh-eye"];

export default async function HomePage() {
  const { products: catalogue } = await getCatalogue();
  const products = FAMILY_ORDER.flatMap((slug) => catalogue.filter((product) => product.slug === slug));
  const featured = products[0];
  const cinematicPortrait = editorialPortraitUrl();
  const cinematicDetail = editorialPreviewUrl("gaara-detail");
  return (
    <div className="dermal-home">
      <CinemaHero cinematicPortrait={cinematicPortrait} poster={`${CINEMA}/hero-poster.jpg`} sources={[
        { src: `${CINEMA}/hero.webm`, type: "video/webm" },
        { src: `${CINEMA}/hero.mp4`, type: "video/mp4" },
      ]} />
      <LaunchHero frames={{ dir: `${CINEMA}/orbit`, count: 72, poster: `${CINEMA}/orbit/poster.jpg` }} />
      <TheSelection products={products} />
      <StoryChapters products={products} cinematicPortrait={cinematicDetail ?? cinematicPortrait} />
      <SeeItOnYou product={featured} />
      <AtelierIntroduction />
      <FinalCta shopHref="/shop" />
    </div>
  );
}
