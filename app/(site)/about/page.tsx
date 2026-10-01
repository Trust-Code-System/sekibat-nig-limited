import type { Metadata } from "next";
import { ImageFrame, SmartImage } from "@/components/media/SmartImage";
import { CtaBand } from "@/components/sections/CtaBand";
import { PageHeader } from "@/components/ui/PageHeader";
import { Container } from "@/components/ui/primitives";
import { Reveal } from "@/components/ui/Reveal";
import { getCompany } from "@/lib/api";
import { EDITORIAL, RATIO, SIZES } from "@/lib/images";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "About",
  description:
    "Sekibat is a Nigerian property company that develops and owns property, and provides development, sales, maintenance, estate and project management for clients.",
  path: "/about",
  image: EDITORIAL.aboutHero,
  imageAlt: "Contemporary residential architecture in Nigeria",
});

export default async function AboutPage() {
  const company = await getCompany();

  return (
    <div className="bg-ivory">
      <PageHeader
        tone="dark"
        eyebrow="About Sekibat"
        title={
          <>
            We stay with the <span className="accent-serif">property.</span>
          </>
        }
        intro="Sekibat develops and holds property on its own account, and brings the same teams to buildings and estates owned by clients."
      />

      <Container className="py-14 md:py-20" data-nav-tone="light">
        <Reveal>
          <figure>
            <ImageFrame ratio={RATIO.plate}>
              <SmartImage
                src={EDITORIAL.cineStory}
                alt="A Sekibat residential tower, planted balconies against a clear sky"
                sizes={SIZES.full}
                priority
              />
            </ImageFrame>
            <figcaption className="mt-4 flex justify-between gap-6 text-[0.625rem] font-medium tracking-[0.16em] text-ink-faint uppercase">
              <span>Property development</span>
              <span>Nigeria</span>
            </figcaption>
          </figure>
        </Reveal>
      </Container>

      <section className="bg-ivory-deep" data-nav-tone="light">
        <Container className="py-20 md:py-28">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-12 md:gap-10">
            <Reveal className="md:col-span-7">
              <p className="cine-eyebrow text-ink-muted">The company</p>
              <h2 className="mt-5 max-w-[16ch] font-sans text-[clamp(2rem,1rem+3vw,3.5rem)] leading-[0.98] font-medium tracking-[-0.04em]">
                One company, both sides of <span className="accent-serif">ownership.</span>
              </h2>
              <p className="mt-8 max-w-[54ch] text-md text-ink-muted">{company.intro}</p>
            </Reveal>
            <dl className="md:col-span-4 md:col-start-9">
              <Reveal delay={80}>
                <div className="cine-value">
                  <dt className="text-[0.625rem] font-medium tracking-[0.16em] text-ink-faint uppercase">
                    Our own portfolio
                  </dt>
                  <dd className="mt-4 text-base text-ink-muted">{company.ownedSide}</dd>
                </div>
              </Reveal>
              <Reveal delay={120}>
                <div className="cine-value mt-5">
                  <dt className="text-[0.625rem] font-medium tracking-[0.16em] text-ink-faint uppercase">
                    Work for clients
                  </dt>
                  <dd className="mt-4 text-base text-ink-muted">{company.clientSide}</dd>
                </div>
              </Reveal>
            </dl>
          </div>
        </Container>
      </section>

      <section className="bg-ivory" data-nav-tone="light">
        <Container className="py-20 md:py-28">
          <p className="cine-eyebrow text-ink-muted">How we work</p>
          <h2 className="mt-5 max-w-[18ch] font-sans text-[clamp(2rem,1rem+3vw,3.25rem)] leading-[0.98] font-medium tracking-[-0.04em]">
            A clear record matters as much as a well-finished <span className="accent-serif">building.</span>
          </h2>
          <dl className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-2">
            {company.values.map((value, index) => (
              <Reveal key={value.title} delay={(index % 2) * 60}>
                <div className="cine-value h-full">
                  <dt className="font-sans text-xl font-medium tracking-[-0.02em]">{value.title}</dt>
                  <dd className="mt-4 max-w-[46ch] text-base text-ink-muted">{value.body}</dd>
                </div>
              </Reveal>
            ))}
          </dl>
        </Container>
      </section>

      <section className="bg-ivory-deep" data-nav-tone="light">
        <Container className="py-16 md:py-24">
          <div className="grid grid-cols-1 items-end gap-10 md:grid-cols-12 md:gap-8">
            <Reveal className="md:col-span-7">
              <figure>
                <ImageFrame ratio={RATIO.gallery}>
                  <SmartImage
                    src={EDITORIAL.aboutDetail}
                    alt="Architectural detail in warm stone and concrete"
                    sizes={SIZES.half}
                  />
                </ImageFrame>
              </figure>
            </Reveal>
            <Reveal delay={80} className="md:col-span-4 md:col-start-9 md:pb-4">
              <p className="cine-eyebrow text-ink-muted">Continuity</p>
              <h2 className="mt-5 max-w-[14ch] font-sans text-[clamp(1.75rem,1rem+2vw,2.75rem)] leading-[1] font-medium tracking-[-0.03em]">
                The handover is a beginning, not an <span className="accent-serif">exit.</span>
              </h2>
              <p className="mt-6 max-w-[38ch] text-base text-ink-muted">
                Development, maintenance and estate management sit together so knowledge of the
                building is not lost when construction finishes.
              </p>
            </Reveal>
          </div>
        </Container>
      </section>

      <CtaBand
        eyebrow="Work with Sekibat"
        title={
          <>
            Bring us the property, the site or the <span className="accent-serif">problem.</span>
          </>
        }
        body="Tell us what you own, what stage it has reached, and what needs to happen next. We will start from there."
        primary={{ href: "/contact", label: "Start an enquiry" }}
        secondary={{ href: "/services", label: "See our services" }}
      />
    </div>
  );
}
