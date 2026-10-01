import { connection } from "next/server";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SmoothScroll } from "@/components/motion/SmoothScroll";
import { PageEnter } from "@/components/motion/PageEnter";
import { JsonLd } from "@/components/seo/JsonLd";
import { getCompany } from "@/lib/api";
import { organizationJsonLd, websiteJsonLd } from "@/lib/seo";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  await connection();
  const company = await getCompany();
  return <SmoothScroll>
    <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:z-100 focus:bg-clay focus:p-4 focus:text-paper">Skip to content</a>
    <SiteHeader />
    <main id="main" className="flex-1"><PageEnter>{children}</PageEnter></main>
    <SiteFooter />
    <JsonLd data={organizationJsonLd(company)} />
    <JsonLd data={websiteJsonLd()} />
  </SmoothScroll>;
}
