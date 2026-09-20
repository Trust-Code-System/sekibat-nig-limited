/**
 * Image conventions — the single place sizing, ratios and the placeholder tone are decided.
 *
 * Property and project photography lives in the data records (they are content, and will come
 * from the admin API). Editorial plates that belong to the page rather than to a record live
 * here. All paths are LOCAL under `public/media/` — see `scripts/media-manifest.mjs` for where
 * the placeholders came from and how to refetch them.
 */

export const EDITORIAL = {
  homeHero: "/media/editorial/home-hero.jpg",
  homePlate: "/media/editorial/home-plate.jpg",
  aboutHero: "/media/editorial/about-hero.jpg",
  aboutDetail: "/media/editorial/about-detail.jpg",
  contact: "/media/editorial/contact.jpg",
  /** Dusk house — the cinematic homepage opening plate. */
  cineHero: "/media/properties/sekibat-heights-01.jpg",
  /** Residential tower used in the dark story panel. */
  cineStory: "/media/editorial/home-hero.jpg",
  /** Dusk balcony stack for the closing full-bleed band. */
  cineCta: "/media/properties/ikoyi-garden-plaza-01.jpg",
} as const;

/**
 * `sizes` presets. Content column maxes out at 1360 with 24–48px gutters.
 * Getting these wrong is the difference between a 200KB page and a 2MB one.
 */
export const SIZES = {
  /** Full-bleed hero and plate breaks. */
  full: "100vw",
  /** Half-bleed editorial figure. */
  half: "(min-width: 1024px) 50vw, 100vw",
  /** Card in a 3-up grid. */
  card: "(min-width: 1024px) 420px, (min-width: 640px) 50vw, 100vw",
  /** Card in a 2-up grid (projects). */
  cardWide: "(min-width: 1024px) 640px, 100vw",
  /** Main image in the property gallery. */
  gallery: "(min-width: 1024px) 880px, 100vw",
  /** Gallery thumbnail strip. */
  thumb: "120px",
} as const;

export const RATIO = {
  hero: "aspect-[4/5] md:aspect-[3/2]",
  plate: "aspect-[3/2] md:aspect-[21/9]",
  card: "aspect-[4/3]",
  cardTall: "aspect-[4/5]",
  gallery: "aspect-[3/2]",
  square: "aspect-square",
} as const;

/**
 * One shared low-quality placeholder, tinted to the paper/clay palette so it reads as an
 * intentional tonal block rather than a grey box. Per-image LQIPs are a build-time tax that
 * buys nothing while the photography is placeholder.
 */
const BLUR_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 8 10"><rect width="8" height="10" fill="#e6ded3"/><rect y="6" width="8" height="4" fill="#cdbcab"/></svg>`;

export const BLUR_DATA_URL = `data:image/svg+xml;base64,${Buffer.from(BLUR_SVG).toString("base64")}`;

/**
 * Alt text for a property photograph. Generated rather than authored because the placeholder
 * records have no per-image captions; when real photography arrives with real captions, pass
 * those through instead.
 */
export function propertyImageAlt(title: string, city: string, index: number): string {
  return index === 0
    ? `${title}, ${city}`
    : `${title}, ${city}, view ${index + 1}`;
}
