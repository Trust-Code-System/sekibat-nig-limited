import { Container } from "@/components/ui/primitives";

export default function Loading() {
  return (
    <div className="bg-ivory pt-28">
      <Container className="py-16">
        <div className="h-3 w-24 rounded-full bg-ivory-deep" />
        <div className="mt-6 h-16 w-2/3 rounded-2xl bg-ivory-deep" />
        <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-2xl bg-white p-3">
              <div className="aspect-[4/3] w-full rounded-xl bg-ivory-deep" />
              <div className="mt-5 h-3 w-1/3 rounded-full bg-ivory-deep" />
              <div className="mt-4 h-7 w-3/4 rounded-full bg-ivory-deep" />
              <div className="mt-4 h-3 w-1/2 rounded-full bg-ivory-deep" />
            </div>
          ))}
        </div>
        <span className="sr-only">Loading properties…</span>
      </Container>
    </div>
  );
}
