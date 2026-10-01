import type { Metadata } from "next";
import { EnquiryForm } from "@/components/forms/EnquiryForm";
import { ImageFrame, SmartImage } from "@/components/media/SmartImage";
import { PageHeader } from "@/components/ui/PageHeader";
import { Container } from "@/components/ui/primitives";
import { getCompany } from "@/lib/api";
import { EDITORIAL, RATIO, SIZES } from "@/lib/images";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Contact",
  description:
    "Contact Sekibat about a property, a development, sales and marketing, maintenance, estate management or project management.",
  path: "/contact",
  image: EDITORIAL.contact,
  imageAlt: "Architectural interior in warm natural materials",
});

export default async function ContactPage() {
  const company = await getCompany();

  return (
    <div className="bg-ivory">
      <PageHeader
        tone="dark"
        eyebrow="Contact"
        title={
          <>
            Start with the <span className="accent-serif">property.</span>
          </>
        }
        intro="Enquire about a listed property, or tell us about a site, building or estate that needs developing, selling, maintaining or managing."
      />

      <Container className="py-16 md:py-24" data-nav-tone="light">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-12 md:gap-10">
          <div className="rounded-3xl bg-white p-6 md:col-span-7 md:p-10">
            <p className="cine-eyebrow text-ink-muted">Enquiry form</p>
            <h2 className="mt-5 max-w-[14ch] font-sans text-[clamp(1.75rem,1rem+2vw,2.75rem)] leading-[1] font-medium tracking-[-0.03em]">
              Tell us what you <span className="accent-serif">need.</span>
            </h2>
            <p className="mt-5 mb-8 max-w-[48ch] text-md text-ink-muted">
              A location, the current stage and your intended outcome are enough to begin. You
              can add the detail in the message.
            </p>
            <EnquiryForm />
          </div>

          <aside className="md:col-span-4 md:col-start-9">
            <ImageFrame ratio={RATIO.cardTall}>
              <SmartImage
                src={EDITORIAL.contact}
                alt="Architectural interior in warm natural materials"
                sizes={SIZES.half}
                priority
              />
            </ImageFrame>

            <div className="cine-value mt-6">
              <p className="text-[0.625rem] font-medium tracking-[0.16em] text-ink-faint uppercase">
                Contact details
              </p>
              {company.contact.isPlaceholder ? (
                <div className="mt-4">
                  <p className="text-base text-ink">
                    Direct contact details are awaiting confirmation from the client.
                  </p>
                  <p className="mt-2 text-sm text-ink-muted">
                    Use the enquiry form during this preview stage.
                  </p>
                </div>
              ) : (
                <address className="mt-4 space-y-3 text-base not-italic text-ink-muted">
                  <p>
                    {company.contact.addressLines.map((line) => (
                      <span key={line} className="block">
                        {line}
                      </span>
                    ))}
                  </p>
                  <p>
                    <a href={`tel:${company.contact.phone.replace(/\s/g, "")}`}>
                      {company.contact.phone}
                    </a>
                  </p>
                  <p>
                    <a href={`mailto:${company.contact.email}`}>{company.contact.email}</a>
                  </p>
                </address>
              )}
            </div>

            <div className="cine-value mt-5">
              <p className="text-[0.625rem] font-medium tracking-[0.16em] text-ink-faint uppercase">
                Hours
              </p>
              <p className="mt-4 text-base text-ink-muted">{company.contact.hours}</p>
            </div>
          </aside>
        </div>
      </Container>
    </div>
  );
}
