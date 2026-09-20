import Link from "next/link";
import { BrandLockup } from "@/components/brand/BrandLockup";
import { getCompany, getServices } from "@/lib/api";
import { NAV, SITE } from "@/lib/site";
import { CineAction } from "@/components/ui/CineAction";
import { Container, Rule } from "@/components/ui/primitives";

export async function SiteFooter() {
  const [company, services] = await Promise.all([getCompany(), getServices()]);
  const confirmedSocial = company.social.filter((item) => item.href !== "#");
  const year = new Date().getFullYear();

  return (
    <footer className="on-night mt-auto bg-onyx text-ivory" data-nav-tone="dark">
      <Container className="py-20 md:py-28">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-12 md:gap-8">
          <div className="md:col-span-4">
            <BrandLockup className="text-ivory" />
            <p className="mt-6 max-w-[16ch] font-sans text-d3 font-medium tracking-[-0.03em] text-ivory">
              {company.positioning}
            </p>
            <div className="mt-8">
              <CineAction href="/contact" invert caption="Start an enquiry">
                Get Started
              </CineAction>
            </div>
          </div>

          <nav aria-label="Footer" className="md:col-span-2">
            <h2 className="text-[0.625rem] font-medium tracking-[0.18em] text-ivory/45 uppercase">
              Site
            </h2>
            <ul className="mt-5 space-y-3">
              {NAV.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-ivory/60 transition-colors hover:text-ivory"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/contact"
                  className="text-sm text-ivory/60 transition-colors hover:text-ivory"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </nav>

          <nav aria-label="Services" className="md:col-span-3">
            <h2 className="text-[0.625rem] font-medium tracking-[0.18em] text-ivory/45 uppercase">
              Services
            </h2>
            <ul className="mt-5 space-y-3">
              {services.map((service) => (
                <li key={service.slug}>
                  <Link
                    href={`/services/${service.slug}`}
                    className="text-sm text-ivory/60 transition-colors hover:text-ivory"
                  >
                    {service.shortTitle}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="md:col-span-3">
            <h2 className="text-[0.625rem] font-medium tracking-[0.18em] text-ivory/45 uppercase">
              Contact
            </h2>
            {company.contact.isPlaceholder ? (
              <div className="mt-5 text-sm text-ivory/60">
                <p className="max-w-[24ch]">Direct contact details are awaiting confirmation.</p>
                <Link
                  href="/contact"
                  className="mt-4 inline-block border-b border-white/20 pb-1 text-2xs font-medium tracking-[0.14em] text-ivory uppercase transition-colors hover:border-ivory"
                >
                  Use the enquiry form
                </Link>
              </div>
            ) : (
              <address className="mt-5 space-y-3 text-sm not-italic text-ivory/60">
                <p>
                  {company.contact.addressLines.map((line) => (
                    <span key={line} className="block">
                      {line}
                    </span>
                  ))}
                </p>
                <p>
                  <a
                    href={`tel:${company.contact.phone.replace(/\s/g, "")}`}
                    className="transition-colors hover:text-ivory"
                  >
                    {company.contact.phone}
                  </a>
                </p>
                <p>
                  <a
                    href={`mailto:${company.contact.email}`}
                    className="transition-colors hover:text-ivory"
                  >
                    {company.contact.email}
                  </a>
                </p>
              </address>
            )}

            {confirmedSocial.length > 0 && (
              <ul className="mt-6 flex gap-5">
                {confirmedSocial.map((item) => (
                  <li key={item.label}>
                    <a
                      href={item.href}
                      rel="noreferrer"
                      className="text-2xs tracking-[0.14em] text-ivory/50 uppercase transition-colors hover:text-ivory"
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <Rule tone="night" className="mt-16" />

        <div className="mt-8 flex flex-col gap-3 text-2xs tracking-[0.12em] text-ivory/40 uppercase sm:flex-row sm:items-center sm:justify-between">
          <p>
            &copy; {year} {company.legalName}
          </p>
          <p className="font-mono">{SITE.url.replace(/^https?:\/\//, "")}</p>
        </div>
      </Container>
    </footer>
  );
}
