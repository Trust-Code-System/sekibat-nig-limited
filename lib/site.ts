/**
 * Single source of truth for site-level identity and URLs.
 * Contact details are placeholders until the client supplies real ones — they are
 * marked so they are easy to find and swap. Nothing here is invented as a claim.
 */
const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL;
const productionUrl = "https://www.sekibat-nig-limited.com";

export const SITE = {
  name: "Sekibat Nig Limited",
  shortName: "Sekibat",
  url: process.env.VERCEL_ENV === "production" && (!configuredUrl || /localhost|127\.0\.0\.1/.test(configuredUrl))
    ? productionUrl : configuredUrl ?? productionUrl,
  locale: "en_NG",
  description:
    "Sekibat Nig Limited develops and owns residential and commercial property across Nigeria, and provides development, sales, maintenance, estate and project management to clients.",
  tagline: "Property, from the ground up.",
} as const;

export const NAV = [
  { href: "/properties", label: "Properties" },
  { href: "/projects", label: "Projects" },
  { href: "/services", label: "Services" },
  { href: "/about", label: "About" },
] as const;

export type NavItem = (typeof NAV)[number];
