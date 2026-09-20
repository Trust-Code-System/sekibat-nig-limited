/**
 * Placeholder photography manifest.
 *
 * Maps a local path under `public/media/` to the Unsplash photo it was sourced from.
 * Run `node scripts/fetch-media.mjs` to (re)download. The site only ever references the
 * LOCAL paths — see `lib/images.ts` — so when the client supplies real photography you
 * drop the files into `public/media/` under the same names and delete this manifest.
 *
 * Selection bias is deliberate: urban West-African-plausible mid-rise, dusk/lit blocks with
 * balconies, peri-urban land, and warm material palettes. No Californian villas.
 */
export const MEDIA = {
  // ---- properties ----
  "properties/sekibat-heights-01.jpg": "1722421492323-eaf9c401befe", // dusk residential block, balconies, planting
  "properties/sekibat-heights-02.jpg": "1610286986642-057ece0c3656", // warm mid-rise, balcony stack
  "properties/sekibat-heights-03.jpg": "1646987916641-1f3c8992daa2", // warm designed living room
  "properties/sekibat-heights-04.jpg": "1724582586529-62622e50c0b3", // calm minimal living room

  "properties/oakview-residences-01.jpg": "1626273947634-823f04de159e", // tall block, balcony rhythm
  "properties/oakview-residences-02.jpg": "1619994121345-b61cd610c5a6", // pale apartment block, balcony rhythm
  "properties/oakview-residences-03.jpg": "1644221150167-fb4fafa7f411", // tower under construction

  "properties/victoria-commercial-centre-01.jpg": "1542309175-9b88d743f89f", // ochre commercial facade
  "properties/victoria-commercial-centre-02.jpg": "1758448656987-cfae6bf225e4", // marble + brass lobby
  "properties/victoria-commercial-centre-03.jpg": "1759462692354-404b2c995c99", // timber + brass reception

  "properties/emerald-court-01.jpg": "1643906652169-a750f3f70848", // warm brick corner block
  "properties/emerald-court-02.jpg": "1592276040264-e10344a6a10e", // white mid-rise, roof planting
  "properties/emerald-court-03.jpg": "1634822929277-0c51ca0e8846", // cream living room

  "properties/horizon-villas-01.jpg": "1571236673892-13d222da2019", // warm curved terrace blocks
  "properties/horizon-villas-02.jpg": "1638973140785-3b918e290682", // brick terraces with planting
  "properties/horizon-villas-03.jpg": "1589834390005-5d4fb9bf3d32", // warm interior, ochre sofa

  "properties/ikoyi-garden-plaza-01.jpg": "1624204386084-dd8c05e32226", // dusk tower, warm sky
  "properties/ikoyi-garden-plaza-02.jpg": "1545324418-cc1a3fa10c00", // dark commercial massing
  "properties/ikoyi-garden-plaza-03.jpg": "1718220268527-4477fd170775", // planted glass atrium

  "properties/epe-lakeview-land-01.jpg": "1773215023063-e662ea91a69c", // aerial, surveyed plots + roads
  "properties/epe-lakeview-land-02.jpg": "1561352335-f8a297b7d29e", // cleared land, track, tower beyond
  "properties/epe-lakeview-land-03.jpg": "1741526997954-a27031862fb7", // peri-urban development edge

  "properties/maitama-office-suites-01.jpg": "1515263487990-61b07816b324", // glazed commercial block
  "properties/maitama-office-suites-02.jpg": "1749310726959-d8fccfef7ee4", // timber-clad lobby corridor
  "properties/maitama-office-suites-03.jpg": "1686100510242-2521b6f89a68", // bright reception floor

  // ---- projects ----
  "projects/sekibat-heights-delivery-01.jpg": "1644221150167-fb4fafa7f411",
  "projects/sekibat-heights-delivery-02.jpg": "1722421492323-eaf9c401befe",
  "projects/victoria-centre-delivery-01.jpg": "1643308012242-704341800ef3", // cranes on skyline
  "projects/victoria-centre-delivery-02.jpg": "1758448656987-cfae6bf225e4",
  "projects/emerald-court-estate-01.jpg": "1592276040264-e10344a6a10e",
  "projects/emerald-court-estate-02.jpg": "1718220268527-4477fd170775",
  "projects/oakview-build-01.jpg": "1694521787162-5373b598945c", // rebar + workers on site
  "projects/oakview-build-02.jpg": "1626273947634-823f04de159e",
  "projects/harbour-point-sales-01.jpg": "1571236673892-13d222da2019",
  "projects/harbour-point-sales-02.jpg": "1589834390005-5d4fb9bf3d32",
  "projects/maitama-maintenance-01.jpg": "1673978484281-e9370ac3b81c", // interior strip-out / works
  "projects/maitama-maintenance-02.jpg": "1749310726959-d8fccfef7ee4",

  // ---- services ----
  "services/property-development-management.jpg": "1644221150167-fb4fafa7f411",
  "services/property-sales-marketing.jpg": "1610286986642-057ece0c3656",
  "services/property-maintenance.jpg": "1673978484281-e9370ac3b81c",
  "services/estate-management.jpg": "1718220268527-4477fd170775",
  "services/project-management.jpg": "1643308012242-704341800ef3",

  // ---- editorial plates ----
  "editorial/home-hero.jpg": "1775733924258-5363323b3ab8", // tropical residential tower -- CROPPED, see CROPS below
  "editorial/home-plate.jpg": "1789385745006-b55a3ef3bb07", // warm cream sculpted concrete, crops well at 21:9
  "editorial/about-hero.jpg": "1561352335-f8a297b7d29e",
  "editorial/about-detail.jpg": "1614595737476-42487331b8a1", // concrete + timber facade detail
  "editorial/contact.jpg": "1686100510109-d520e59bf0ea",
};

/**
 * Post-download crops, as fractions of the source height.
 *
 * `editorial/home-hero.jpg`: the source render carries a third-party development name
 * ("JBS ZENITH") on both the roof crown and the gatehouse. Publishing another company's
 * branding in Sekibat's hero is not acceptable, and it is only visible at the taller mobile
 * crop, so it is easy to miss. Cropping to the mid-building band removes both instances and
 * gives a better image for this direction anyway: a detail of balconies, planting and
 * terracotta rather than a whole marketing render.
 *
 * Re-running `fetch-media.mjs` re-applies these, so the signage cannot come back.
 */
export const CROPS = {
  "editorial/home-hero.jpg": { top: 0.24, bottom: 0.30 },
};
