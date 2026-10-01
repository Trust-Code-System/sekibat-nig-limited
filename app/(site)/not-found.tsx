import { CineAction } from "@/components/ui/CineAction";

export default function NotFound() {
  return (
    <section
      className="flex min-h-[100svh] flex-col justify-center bg-onyx px-6 text-ivory md:px-12"
      data-nav-tone="dark"
    >
      <div className="mx-auto w-full max-w-(--container-site) py-32">
        <p className="cine-eyebrow text-lime">404 / Off record</p>
        <h1 className="mt-6 max-w-[14ch] font-sans text-[clamp(2.75rem,1.2rem+5vw,5.5rem)] leading-[0.94] font-medium tracking-[-0.045em]">
          This page is not in the <span className="accent-serif">ledger.</span>
        </h1>
        <p className="mt-7 max-w-[42ch] text-md text-ivory/65">
          The address may have changed, or the property or project may no longer be published.
        </p>
        <div className="mt-12 flex flex-wrap items-center gap-8">
          <CineAction href="/" invert caption="Back to the opening scene">
            Return home
          </CineAction>
          <CineAction href="/properties" invert caption="Browse the record">
            Explore properties
          </CineAction>
        </div>
      </div>
    </section>
  );
}
