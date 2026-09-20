import type { Metadata } from "next";
import type { Company, Project, Property, Service } from "@/types";
import { PROPERTY_STATUS_LABEL, PROPERTY_TYPE_LABEL } from "./format";
import { SITE } from "./site";

/**
 * Metadata and structured-data builders.
 *
 * No route hand-rolls an OpenGraph block — call `buildMetadata`. JSON-LD shapes live here so
 * the schema.org decisions are made in one place and stay consistent.
 *
 * Builders receive records from the repository layer, so switching to the backend also updates
 * structured data without creating a second content source.
 */

const ORG_ID = `${SITE.url}/#organization`;

export function absoluteUrl(path: string): string {
  return new URL(path, SITE.url).toString();
}

export function buildMetadata({
  title,
  description,
  path,
  image,
  imageAlt,
}: {
  title: string;
  description: string;
  path: string;
  image?: string;
  imageAlt?: string;
}): Metadata {
  const url = absoluteUrl(path);
  const images = image ? [{ url: absoluteUrl(image), alt: imageAlt ?? title }] : undefined;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: "website",
      ...(images ? { images } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(images ? { images: images.map((i) => i.url) } : {}),
    },
  };
}

/* ------------------------------------------------------------------ JSON-LD */

export function organizationJsonLd(company: Company): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    "@id": ORG_ID,
    name: company.legalName,
    alternateName: company.name,
    url: SITE.url,
    description: SITE.description,
    areaServed: { "@type": "Country", name: "Nigeria" },
    // Contact fields are omitted entirely while they are placeholders — publishing an
    // invented phone number as structured data would be worse than publishing nothing.
    ...(company.contact.isPlaceholder
      ? {}
      : {
          telephone: company.contact.phone,
          email: company.contact.email,
          address: {
            "@type": "PostalAddress",
            streetAddress: company.contact.addressLines[0],
            addressLocality: company.contact.addressLines[1],
            addressCountry: "NG",
          },
          sameAs: company.social.filter((s) => s.href !== "#").map((s) => s.href),
        }),
  };
}

export function websiteJsonLd(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    url: SITE.url,
    name: SITE.name,
    publisher: { "@id": ORG_ID },
  };
}

const AVAILABILITY: Record<Property["status"], string> = {
  available: "https://schema.org/InStock",
  "under-development": "https://schema.org/PreOrder",
  completed: "https://schema.org/InStock",
  leased: "https://schema.org/OutOfStock",
  sold: "https://schema.org/SoldOut",
};

export function propertyJsonLd(property: Property): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: property.title,
    description: property.shortDescription,
    url: absoluteUrl(`/properties/${property.slug}`),
    image: property.images.map((src) => absoluteUrl(src)),
    datePosted: property.listedAt,
    identifier: property.reference,
    provider: { "@id": ORG_ID },
    address: {
      "@type": "PostalAddress",
      streetAddress: property.location.address,
      addressLocality: property.location.city,
      addressRegion: property.location.state,
      addressCountry: "NG",
    },
    ...(property.size
      ? {
          floorSize: {
            "@type": "QuantitativeValue",
            value: property.size,
            unitCode: "MTK",
          },
        }
      : {}),
    ...(property.bedrooms ? { numberOfBedrooms: property.bedrooms } : {}),
    ...(property.bathrooms ? { numberOfBathroomsTotal: property.bathrooms } : {}),
    // `offers` is omitted entirely when there is no public price — never emit a zero.
    ...(property.price !== undefined
      ? {
          offers: {
            "@type": "Offer",
            price: property.price,
            priceCurrency: property.currency ?? "NGN",
            availability: AVAILABILITY[property.status],
          },
        }
      : {}),
  };
}

export function projectJsonLd(project: Project): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: project.title,
    description: project.shortDescription,
    url: absoluteUrl(`/projects/${project.slug}`),
    image: project.images.map((src) => absoluteUrl(src)),
    identifier: project.reference,
    creator: { "@id": ORG_ID },
    locationCreated: { "@type": "Place", name: project.location },
    ...(project.completionDate ? { dateCreated: project.completionDate } : {}),
  };
}

export function serviceJsonLd(service: Service): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.title,
    description: service.summary,
    url: absoluteUrl(`/services/${service.slug}`),
    serviceType: service.title,
    provider: { "@id": ORG_ID },
    areaServed: { "@type": "Country", name: "Nigeria" },
  };
}

export function breadcrumbJsonLd(
  trail: { name: string; path: string }[]
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

/** Title pattern shared by property metadata and the browser tab. */
export function propertyMetaTitle(property: Property): string {
  return `${property.title}, ${property.location.city} · ${PROPERTY_TYPE_LABEL[property.type]}, ${PROPERTY_STATUS_LABEL[property.status]}`;
}
