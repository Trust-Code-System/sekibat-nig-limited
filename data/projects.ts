import type { Project } from "@/types";

// Client-supplied Wemabod estate material. Location and construction status are unconfirmed.
// PRJ-WEM-001 is a website reference, not a supplied project identifier.
export const projects: Project[] = [
  {
    "id": "wemabod-estate",
    "reference": "PRJ-WEM-001",
    "slug": "wemabod-housing-estate",
    "title": "Wemabod Housing Estate",
    "projectType": "Housing estate",
    "services": [],
    "shortDescription": "Homes and land at Wemabod Housing Estate, developed by Sekibat Nig Limited.",
    "description": "Wemabod Housing Estate brings together duplexes, bungalows, flats and residential land. Explore the individual property listings to compare home types, bedrooms and prices.\n\nThe estate offering includes four-bedroom twin duplex houses, three-bedroom detached and semi-detached bungalows, three-bedroom duplex flats, two-bedroom flats and one-bedroom homes with a sitting room. Detached bungalows and half plots of land are offered in the estate extension.\n\nContact Sekibat to arrange a viewing and discuss the available properties and payment terms.",
    "role": "Developer: Sekibat Nig Limited.",
    "images": [
      "/media/properties/wemabod/estate-pending.png"
    ],
    "featured": true,
    "propertySlugs": [
      "wemabod-twin-duplex",
      "wemabod-detached-bungalow",
      "wemabod-semi-detached-bungalow",
      "wemabod-duplex-flat",
      "wemabod-two-bedroom-flat",
      "wemabod-one-bedroom-home",
      "wemabod-half-plot"
    ]
  }
];
