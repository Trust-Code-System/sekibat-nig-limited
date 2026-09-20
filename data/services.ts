import type { Service } from "@/types";

/**
 * The five confirmed service lines. Copy is placeholder but the structure is final —
 * only `lib/api/services.ts` may import this file.
 */
export const services: Service[] = [
  {
    id: "s-01",
    slug: "property-development-management",
    title: "Property Development & Management",
    shortTitle: "Development & Management",
    summary:
      "Taking a site from acquisition through design, construction and handover, then running the finished building.",
    description:
      "We develop property on our own account and on behalf of clients who hold land or an existing asset. That covers the whole arc: appraising the site, assembling the design and consultant team, securing approvals, procuring and supervising the build, and handing over a building that is ready to occupy.\n\nWhere a client wants continuity, the same team stays on after handover to run the building, so the people who know how it was built are the ones maintaining it.",
    capabilities: [
      {
        title: "Site appraisal and feasibility",
        body: "Assessment of what a site can carry, what it will cost to build, and what the finished asset is likely to be worth.",
      },
      {
        title: "Design and consultant coordination",
        body: "Appointing and running architects, engineers and quantity surveyors against a single programme and budget.",
      },
      {
        title: "Approvals and documentation",
        body: "Assembling and tracking the permits, titles and statutory approvals a development needs before and during construction.",
      },
      {
        title: "Construction delivery",
        body: "Procurement, contractor supervision, valuations and quality control through to practical completion.",
      },
      {
        title: "Handover and ongoing management",
        body: "Snagging, commissioning, documentation handover, and a managed transition into occupation.",
      },
    ],
    audience: "Landowners, private developers, and Sekibat’s own portfolio.",
    image: "/media/services/property-development-management.jpg",
    order: 1,
  },
  {
    id: "s-02",
    slug: "property-sales-marketing",
    title: "Property Sales & Marketing",
    shortTitle: "Sales & Marketing",
    summary:
      "Positioning, pricing and selling residential and commercial property, with every enquiry and payment on record.",
    description:
      "We market and sell property: our own developments and those of clients who want a team to take the sale end to end. That means establishing a realistic price, preparing the material a buyer actually needs, handling viewings and enquiries, and carrying a sale through to documentation and payment.\n\nEvery enquiry, offer and payment is recorded against the property, so an owner can see exactly where a unit stands at any point.",
    capabilities: [
      {
        title: "Pricing and positioning",
        body: "Setting a price against comparable evidence and deciding how the property should be presented to the right buyer.",
      },
      {
        title: "Marketing material",
        body: "Photography, floor plans, specification sheets and listing copy prepared to a consistent standard.",
      },
      {
        title: "Viewings and enquiry handling",
        body: "Qualified viewings, follow-up, and a single record of who enquired about what and when.",
      },
      {
        title: "Offer and documentation",
        body: "Managing offers, deposits and the paperwork through to assignment, with each payment receipted.",
      },
    ],
    audience: "Owners selling a unit or a whole development, and buyers looking for one.",
    image: "/media/services/property-sales-marketing.jpg",
    order: 2,
  },
  {
    id: "s-03",
    slug: "property-maintenance",
    title: "Property Maintenance",
    shortTitle: "Maintenance",
    summary:
      "Planned and reactive maintenance for buildings in use, with a record of every job and what it cost.",
    description:
      "Buildings need attention whether or not anything has gone wrong. We hold planned maintenance schedules for the properties in our care, carry out the work, and respond when something fails unexpectedly.\n\nWork is logged against the property: what was done, who did it, when, and what it cost. That record is what lets an owner budget properly rather than reacting to invoices.",
    capabilities: [
      {
        title: "Planned maintenance",
        body: "Scheduled servicing of generators, water treatment, lifts, roofing and common areas against a written programme.",
      },
      {
        title: "Reactive repairs",
        body: "Response to faults reported by occupiers or estate staff, with the job tracked to completion.",
      },
      {
        title: "Refurbishment and fit-out",
        body: "Larger works on occupied or vacant buildings: finishes, services upgrades and unit turnaround.",
      },
      {
        title: "Contractor management",
        body: "Engaging and supervising trades, checking work before payment, and holding the cost record per property.",
      },
    ],
    audience: "Owners and occupiers of buildings that need to keep working.",
    image: "/media/services/property-maintenance.jpg",
    order: 3,
  },
  {
    id: "s-04",
    slug: "estate-management",
    title: "Estate Management",
    shortTitle: "Estate Management",
    summary:
      "Running estates and buildings day to day: access, service charge, tenancy and the accounts behind them.",
    description:
      "Estate management is the ongoing business of keeping a property running: security and access, common areas, utilities, service charge collection, and the relationship with the people who live or work there.\n\nWe hold the accounts for the estates we manage: what was collected, what was spent and what is outstanding, so the position is clear to the owner and defensible when it is audited.",
    capabilities: [
      {
        title: "Day-to-day estate operations",
        body: "Security, access control, cleaning, waste, landscaping and common-area upkeep.",
      },
      {
        title: "Service charge administration",
        body: "Setting the charge, collecting it, and accounting for how it was spent.",
      },
      {
        title: "Tenancy and occupier management",
        body: "Rent collection, renewals, occupier correspondence and arrears follow-up.",
      },
      {
        title: "Utilities and supply",
        body: "Managing power, water and generator supply, including metering and recharge where it applies.",
      },
      {
        title: "Reporting to owners",
        body: "Regular statements of income, expenditure and outstanding balances per property.",
      },
    ],
    audience: "Owners of estates, blocks and let buildings, and the residents in them.",
    image: "/media/services/estate-management.jpg",
    order: 4,
  },
  {
    id: "s-05",
    slug: "project-management",
    title: "Project Management",
    shortTitle: "Project Management",
    summary:
      "Holding a construction project to its programme, budget and standard on behalf of whoever is paying for it.",
    description:
      "Where a client has their own design team and contractor, we act as project manager, the party responsible for the programme, the budget and the quality of what is actually built.\n\nThat means running the meetings, checking valuations before they are paid, tracking materials and variations, and giving the client an honest account of where the project stands rather than an optimistic one.",
    capabilities: [
      {
        title: "Programme and cost control",
        body: "A single programme and cost plan, updated against what has actually happened on site.",
      },
      {
        title: "Procurement and tendering",
        body: "Preparing tenders, assessing returns and recommending appointments.",
      },
      {
        title: "Site supervision and quality",
        body: "Regular inspection against specification, with defects raised and closed out in writing.",
      },
      {
        title: "Valuations and variations",
        body: "Checking contractor applications and pricing changes before anything is certified for payment.",
      },
      {
        title: "Reporting",
        body: "Written progress reports covering programme, spend, risks and decisions needed from the client.",
      },
    ],
    audience: "Clients building something who need someone accountable for delivery.",
    image: "/media/services/project-management.jpg",
    order: 5,
  },
];
