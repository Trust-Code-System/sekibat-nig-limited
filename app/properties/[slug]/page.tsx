import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PropertyCard } from "@/components/cards/PropertyCard";
import { EnquiryForm } from "@/components/forms/EnquiryForm";
import { PropertyGallery } from "@/components/media/PropertyGallery";
import { JsonLd } from "@/components/seo/JsonLd";
import { PageHeader } from "@/components/ui/PageHeader";
import { Container, Display, Eyebrow, Prose, Section } from "@/components/ui/primitives";
import { getPropertyBySlug, getPropertySlugs, getRelatedProperties } from "@/lib/api";
import {
  formatNaira,
  formatSize,
  OWNERSHIP_LABEL,
  PROPERTY_STATUS_LABEL,
  PROPERTY_TYPE_LABEL,
  statusTone,
} from "@/lib/format";
import { propertyImageAlt } from "@/lib/images";
import { breadcrumbJsonLd, buildMetadata, propertyJsonLd, propertyMetaTitle } from "@/lib/seo";
import { cn } from "@/lib/cn";

export const dynamicParams = true;

export async function generateStaticParams() {
  const slugs = await getPropertySlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const property = await getPropertyBySlug(slug);

  // The repository returns null rather than throwing; the page below triggers the 404.
  if (!property) return { title: "Property not found" };

  return buildMetadata({
    title: propertyMetaTitle(property),
    description: property.shortDescription,
    path: `/properties/${property.slug}`,
    image: property.images[0],
    imageAlt: propertyImageAlt(property.title, property.location.city, 0),
  });
}

export default async function PropertyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const property = await getPropertyBySlug(slug);
  if (!property) notFound();

  const related = await getRelatedProperties(slug, 3);
  const tone = statusTone(property.status);

  const facts: { label: string; value: string }[] = [
    { label: "Reference", value: property.reference },
    { label: "Type", value: PROPERTY_TYPE_LABEL[property.type] },
    { label: "Status", value: PROPERTY_STATUS_LABEL[property.status] },
    { label: "Ownership", value: OWNERSHIP_LABEL[property.ownership] },
  ];
  if (property.bedrooms) facts.push({ label: "Bedrooms", value: String(property.bedrooms) });
  if (property.bathrooms) facts.push({ label: "Bathrooms", value: String(property.bathrooms) });
  const size = formatSize(property.size, property.sizeUnit ?? "sqm");
  if (size) facts.push({ label: "Size", value: size });
  if (property.location.address)
    facts.push({ label: "Address", value: property.location.address });

  return (
    <>
      <PageHeader
        tone="dark"
        eyebrow={`${property.location.city}, ${property.location.state}`}
        title={property.title}
        breadcrumb={[
          { label: "Home", href: "/" },
          { label: "Properties", href: "/properties" },
          { label: property.title, href: `/properties/${property.slug}` },
        ]}
        aside={
          <div>
            <p className="font-mono text-sm text-lime">{property.reference}</p>
            <p
              className={cn(
                "mt-4 font-sans text-d3 font-medium tracking-[-0.03em]",
                property.price !== undefined ? "text-ivory" : "text-ivory/45"
              )}
            >
              {formatNaira(property.price)}
            </p>
            <p
              className={cn(
                "mt-3 text-[0.625rem] font-medium tracking-[0.16em] uppercase",
                tone === "accent" ? "text-lime" : "text-ivory/45"
              )}
            >
              {PROPERTY_STATUS_LABEL[property.status]}
            </p>
          </div>
        }
      />

      <Container className="py-14 md:py-20" data-nav-tone="light">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-12 md:gap-10">
          <div className="md:col-span-8">
            <PropertyGallery
              images={property.images}
              title={property.title}
              alt={property.images.map((_, i) =>
                propertyImageAlt(property.title, property.location.city, i)
              )}
            />
          </div>

          <div className="md:col-span-4">
            <Eyebrow>Details</Eyebrow>
            {/* A ruled spec list, not a row of icon chips — the hairline table is the
                system's way of presenting data. */}
            <dl className="mt-6 border-t border-rule">
              {facts.map((fact) => (
                <div
                  key={fact.label}
                  className="flex items-baseline justify-between gap-6 border-b border-rule py-3.5"
                >
                  <dt className="label">{fact.label}</dt>
                  <dd
                    className={cn(
                      "text-right text-base text-ink",
                      fact.label === "Reference" && "font-mono text-sm text-lime-deep"
                    )}
                  >
                    {fact.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </Container>

      <Section index="01" label="Overview" tone="deep">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-12 md:gap-10">
          <div className="md:col-span-7">
            <Display as="h2" level={3} className="max-w-[24ch]">
              {property.shortDescription}
            </Display>
            <Prose text={property.description} className="mt-8" />
          </div>

          <div className="md:col-span-4 md:col-start-9">
            <Eyebrow>Features</Eyebrow>
            <ul className="mt-6 border-t border-rule">
              {property.features.map((feature) => (
                <li key={feature} className="border-b border-rule py-3.5 text-base text-ink-muted">
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      <Section
        index="02"
        label="Enquire"
        note="Every enquiry is recorded against this property reference."
        id="enquire"
      >
        <div className="max-w-3xl">
          <Display as="h2" level={3} className="mb-8 max-w-[22ch]">
            Ask about {property.title}.
          </Display>
          <EnquiryForm
            property={{
              slug: property.slug,
              title: property.title,
              reference: property.reference,
            }}
            submitLabel="Send enquiry"
          />
        </div>
      </Section>

      {related.length > 0 && (
        <Section index="03" label="Related property" tone="deep">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((item) => (
              <PropertyCard key={item.id} property={item} />
            ))}
          </div>
        </Section>
      )}

      <JsonLd data={propertyJsonLd(property)} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Properties", path: "/properties" },
          { name: property.title, path: `/properties/${property.slug}` },
        ])}
      />
    </>
  );
}
