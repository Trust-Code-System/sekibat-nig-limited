import type { Collection, Content, Entry } from "@/lib/cms/schema";
const names: Record<string, string> = {
  shortDescription: "Short description",
  legalName: "Registered company name",
  ownedSide: "Our own portfolio",
  clientSide: "Work for clients",
  intro: "Company introduction",
  isPlaceholder: "Contact details are placeholders",
  addressLines: "Address",
  shortTitle: "Short title",
  projectType: "Project type",
  listedAt: "Date listed",
  completionDate: "Completion date",
  heroImage: "Opening photograph",
  storyImage: "About section photograph",
  ctaImage: "Enquiry section photograph",
  headingAccent: "Heading emphasis",
  ctaHeading: "Enquiry heading",
  ctaAccent: "Enquiry heading emphasis",
  ctaBody: "Enquiry description",
  ctaLabel: "Enquiry button text",
  size: "Area (sqm)",
  price: "Price (NGN)",
  order: "Display order",
  social: "Social profiles",
  values: "Company values",
  images: "Gallery photographs",
  services: "Related services",
};
export const label = (key: string) =>
  names[key] ||
  key.replace(/([A-Z])/g, " $1").replace(/^./, (char) => char.toUpperCase());
const optional = new Set([
  "address",
  "price",
  "bedrooms",
  "bathrooms",
  "size",
  "completionDate",
  "client",
  "brief",
  "role",
  "outcome",
]);
export function status(entry: Entry) {
  return !entry.published
    ? "Draft"
    : JSON.stringify(entry.draft) !== JSON.stringify(entry.published)
      ? "Unpublished changes"
      : "Published";
}
export function title(entry: Entry) {
  return String(
    entry.draft.title ||
      entry.draft.legalName ||
      (entry.collection === "homepage"
        ? "Homepage"
        : entry.collection === "properties"
          ? "Untitled property"
          : entry.collection === "projects"
            ? "Untitled project"
            : "Untitled service"),
  );
}
export function photo(data: Content) {
  return String(
    data.heroImage ||
      data.image ||
      (Array.isArray(data.images) ? data.images[0] : "") ||
      "",
  );
}
export function publicPath(entry: Entry) {
  return entry.collection === "homepage"
    ? "/"
    : entry.collection === "company"
      ? "/about"
      : `/${entry.collection}/${entry.published?.slug || entry.draft.slug}`;
}
export function clean(value: unknown, key = ""): unknown {
  if (optional.has(key) && value === "") return undefined;
  if (Array.isArray(value)) return value.map((item) => clean(item));
  if (value && typeof value === "object")
    return Object.fromEntries(
      Object.entries(value)
        .map(([k, v]) => [k, clean(v, k)])
        .filter(([, v]) => v !== undefined),
    );
  return value;
}
export function template(collection: Collection): Content {
  const id = crypto.randomUUID();
  const shared = { id, title: "", slug: "" };
  if (collection === "properties")
    return {
      ...shared,
      reference: `PROP-${id.slice(0, 8).toUpperCase()}`,
      location: { city: "", state: "", address: "" },
      type: "residential",
      status: "available",
      ownership: "sekibat",
      shortDescription: "",
      description: "",
      price: "",
      currency: "NGN",
      bedrooms: "",
      bathrooms: "",
      size: "",
      sizeUnit: "sqm",
      features: [],
      images: [],
      featured: false,
      listedAt: new Date().toISOString().slice(0, 10),
    };
  if (collection === "projects")
    return {
      ...shared,
      reference: `PRJ-${id.slice(0, 8).toUpperCase()}`,
      location: "",
      projectType: "",
      client: "",
      status: "planned",
      completionDate: "",
      services: [],
      shortDescription: "",
      description: "",
      brief: "",
      role: "",
      work: [],
      outcome: "",
      images: [],
      featured: false,
    };
  return {
    ...shared,
    shortTitle: "",
    summary: "",
    description: "",
    capabilities: [{ title: "", body: "" }],
    audience: "",
    image: "",
    order: 5,
  };
}
export function editData(entry: Entry): Content {
  if (entry.collection === "properties")
    return {
      ...entry.draft,
      price: entry.draft.price ?? "",
      bedrooms: entry.draft.bedrooms ?? "",
      bathrooms: entry.draft.bathrooms ?? "",
      size: entry.draft.size ?? "",
      location: {
        ...(entry.draft.location as Content),
        address: (entry.draft.location as Content).address ?? "",
      },
    };
  if (entry.collection === "projects")
    return {
      ...entry.draft,
      client: entry.draft.client ?? "",
      completionDate: entry.draft.completionDate ?? "",
      brief: entry.draft.brief ?? "",
      role: entry.draft.role ?? "",
      work: entry.draft.work ?? [],
      outcome: entry.draft.outcome ?? "",
    };
  return structuredClone(entry.draft);
}
