import type { Metadata } from "next";
import { Archivo, Fraunces, IBM_Plex_Mono } from "next/font/google";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { PageEnter } from "@/components/motion/PageEnter";
import { SmoothScroll } from "@/components/motion/SmoothScroll";
import { JsonLd } from "@/components/seo/JsonLd";
import { getCompany } from "@/lib/api";
import { organizationJsonLd, websiteJsonLd } from "@/lib/seo";
import { SITE } from "@/lib/site";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["SOFT", "WONK", "opsz"],
  display: "swap",
});

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.name} · ${SITE.tagline}`,
    template: `%s · ${SITE.shortName}`,
  },
  description: SITE.description,
  openGraph: {
    type: "website",
    locale: SITE.locale,
    siteName: SITE.name,
  },
  twitter: { card: "summary_large_image" },
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const company = await getCompany();

  return (
    <html
      lang="en-NG"
      data-scroll-behavior="smooth"
      className={`${fraunces.variable} ${archivo.variable} ${plexMono.variable} h-full`}
    >
      <body className="flex min-h-full flex-col bg-ivory text-ink">
        <SmoothScroll>
          <a
            href="#main"
            className="sr-only rounded-xs focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-100 focus:bg-clay focus:px-5 focus:py-3 focus:text-2xs focus:tracking-[0.14em] focus:text-paper focus:uppercase"
          >
            Skip to content
          </a>
          <SiteHeader />
          <main id="main" className="flex-1">
            <PageEnter>{children}</PageEnter>
          </main>
          <SiteFooter />
          <JsonLd data={organizationJsonLd(company)} />
          <JsonLd data={websiteJsonLd()} />
        </SmoothScroll>
      </body>
    </html>
  );
}
