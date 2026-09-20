import { CinematicHero } from "@/components/home/CinematicHero";
import { HomeCta } from "@/components/home/HomeCta";
import { HomeProperties } from "@/components/home/HomeProperties";
import { HomeStory } from "@/components/home/HomeStory";
import { getCompany, getProperties } from "@/lib/api";

export default async function HomePage() {
  const [company, propertyPage] = await Promise.all([
    getCompany(),
    getProperties({ perPage: 6 }),
  ]);

  return (
    <div className="overflow-x-clip bg-ivory">
      <CinematicHero featured={propertyPage.items[0]} />
      <HomeProperties properties={propertyPage.items} />
      <HomeStory company={company} />
      <HomeCta />
    </div>
  );
}
