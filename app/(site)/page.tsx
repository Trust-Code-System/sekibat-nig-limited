import { CinematicHero } from "@/components/home/CinematicHero";
import { HomeCta } from "@/components/home/HomeCta";
import { HomeProperties } from "@/components/home/HomeProperties";
import { HomeStory } from "@/components/home/HomeStory";
import { getCompany, getProperties } from "@/lib/api";
import { getHomepage } from "@/lib/api/cms-store";

export default async function HomePage() {
  const [company, propertyPage, content] = await Promise.all([
    getCompany(),
    getProperties({ perPage: 6 }),
    getHomepage(),
  ]);

  return (
    <div className="overflow-x-clip bg-ivory">
      <CinematicHero featured={propertyPage.items[0]} content={content} />
      <HomeProperties properties={propertyPage.items} />
      <HomeStory company={company} image={content.storyImage} />
      <HomeCta content={content} />
    </div>
  );
}
