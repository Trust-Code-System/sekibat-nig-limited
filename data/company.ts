import type { Company } from "@/types";

/**
 * Company identity and contact details.
 *
 * `contact.isPlaceholder` is TRUE until the client supplies real details — the UI uses that
 * flag rather than hardcoding a warning anywhere. Replace the values, flip the flag to false,
 * and every surface updates.
 *
 * There is deliberately NO `stats` field. The brief rules out unverified figures — no client
 * counts, no years-of-experience, no project values. Do not add one.
 */
export const company: Company = {
  name: "Sekibat",
  legalName: "Sekibat Nig Limited",
  positioning: "Property, from the ground up.",

  ownedSide:
    "We develop and own residential and commercial property across Lagos and Abuja, acquiring the site, building it, and holding it afterwards.",
  clientSide:
    "We also work on property we do not own: developing, selling, maintaining and managing buildings and estates on behalf of the people who do.",

  intro:
    "Sekibat Nig Limited is a Nigerian property company. We build and hold our own portfolio, and we provide development, sales, maintenance, estate and project management to clients who hold theirs. The two sides share the same teams and the same standard of record-keeping, which is the point. A building we manage for a client is run the way we run our own.",

  values: [
    {
      title: "End to end, not piece by piece",
      body: "A site can come to us as bare land and leave as an occupied, managed building. The people who supervised the build are the people who maintain it, so nothing is lost in a handover between firms.",
    },
    {
      title: "On the record",
      body: "Every property, payment, purchase and instruction carries a reference and a written trail. That is how an owner knows what was spent, and how the position stands up when it is audited.",
    },
    {
      title: "Both sides of the table",
      body: "We carry the risk of our own developments. It makes us a different kind of adviser to a client building theirs, because we have had to live with the same decisions.",
    },
    {
      title: "Answerable after handover",
      body: "Practical completion is not the end of the relationship. Estate management, maintenance and service charge accounting are where a building is actually judged.",
    },
  ],

  contact: {
    // TODO: client — replace with real registered address.
    addressLines: ["Address to be confirmed", "Lagos", "Nigeria"],
    // TODO: client — replace with real switchboard number.
    phone: "+234 000 000 0000",
    // TODO: client — replace with real enquiries address.
    email: "enquiries@sekibat.com",
    hours: "Monday to Friday, 9:00 – 17:00 WAT",
    isPlaceholder: true,
  },

  // TODO: client — replace hrefs when the accounts are confirmed.
  social: [
    { label: "LinkedIn", href: "#" },
    { label: "Instagram", href: "#" },
  ],
};
