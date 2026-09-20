import type { Project } from "@/types";

/**
 * PLACEHOLDER DATA — not real Sekibat projects.
 *
 * Projects are case studies, deliberately a different shape from Properties: they carry a
 * client, the services rendered, and a narrative (brief / role / work / outcome). Only
 * `lib/api/projects.ts` may import this file.
 *
 * Between them the six records cover all five service lines.
 */
export const projects: Project[] = [
  {
    id: "j-0001",
    reference: "PRJ-2025-000031",
    slug: "sekibat-heights-delivery",
    title: "Sekibat Heights",
    location: "Lekki, Lagos",
    projectType: "Residential development",
    status: "completed",
    completionDate: "2025-11-30",
    services: ["property-development-management", "project-management"],
    shortDescription:
      "A four-unit terrace developed on our own account, from site acquisition to handover.",
    description:
      "Sekibat Heights was developed on our own account on a plot off Admiralty Way. The project ran from acquisition through design and approvals to construction and handover, and the completed terrace is now managed by our estate team.",
    brief:
      "A constrained infill plot on Lekki Phase 1 with an awkward frontage and a requirement to deliver family-sized homes without the scheme reading as a block of flats.",
    role: "Developer and project manager. Sekibat acquired the site, appointed and ran the design team, procured the contractor and supervised construction through to handover.",
    work: [
      "Site appraisal, acquisition and title verification",
      "Appointment and coordination of architect, structural and services engineers",
      "Statutory approvals and building permit",
      "Contractor tender, appointment and monthly valuation control",
      "Full-time site supervision through structure and finishes",
      "Snagging, commissioning and handover documentation",
    ],
    outcome:
      "Four terraced homes completed and handed over, each with a private entrance and independent services. The estate is now run under our own management instruction.",
    images: [
      "/media/projects/sekibat-heights-delivery-01.jpg",
      "/media/projects/sekibat-heights-delivery-02.jpg",
    ],
    featured: true,
  },
  {
    id: "j-0002",
    reference: "PRJ-2024-000018",
    slug: "victoria-centre-delivery",
    title: "Victoria Commercial Centre",
    location: "Victoria Island, Lagos",
    projectType: "Commercial delivery",
    client: "Private owner",
    status: "completed",
    completionDate: "2024-09-12",
    services: ["project-management", "estate-management"],
    shortDescription:
      "Project management of a commercial building on Akin Adesola through to full occupation.",
    description:
      "A private owner appointed Sekibat to manage delivery of a commercial building on Akin Adesola Street after the design had been signed off. We took the project from an agreed scheme through construction to practical completion, and then stayed on to manage the building.",
    brief:
      "The owner had a design and a contractor but no party accountable for programme, cost or quality. The building needed to reach a lettable standard on a fixed budget.",
    role: "Project manager acting for the owner, then estate manager after handover.",
    work: [
      "Review and rebaselining of the construction programme",
      "Monthly valuation checking before any certificate was issued",
      "Variation pricing and change control",
      "Inspection against specification with a written defects register",
      "Commissioning of lifts, generator and water treatment",
      "Transition into estate management and service charge setup",
    ],
    outcome:
      "The building reached practical completion and is now fully let. Sekibat continues to hold the estate management and planned maintenance instruction.",
    images: [
      "/media/projects/victoria-centre-delivery-01.jpg",
      "/media/projects/victoria-centre-delivery-02.jpg",
    ],
    featured: true,
  },
  {
    id: "j-0003",
    reference: "PRJ-2026-000042",
    slug: "oakview-residences-build",
    title: "Oakview Residences",
    location: "Ikeja, Lagos",
    projectType: "Residential development",
    status: "ongoing",
    services: ["property-development-management", "project-management"],
    shortDescription:
      "Twenty-four apartments under construction in Ikeja GRA, developed on our own account.",
    description:
      "Oakview Residences is a twenty-four unit apartment block currently in the finishing phase in Ikeja GRA. Structure is complete to the upper floors; services installation and finishes are in progress.",
    brief:
      "Deliver apartments at a size and specification that suits families, on a site with limited frontage and a demanding parking requirement.",
    role: "Developer and project manager on our own account.",
    work: [
      "Design development and approvals",
      "Piling and substructure",
      "Frame and envelope to six floors",
      "Mechanical and electrical first fix",
      "Ongoing programme and cost control",
    ],
    outcome:
      "In progress. Structural works are complete and the building is in the finishing phase; release of units for sale follows first-floor handover.",
    images: [
      "/media/projects/oakview-build-01.jpg",
      "/media/projects/oakview-build-02.jpg",
    ],
    featured: true,
  },
  {
    id: "j-0004",
    reference: "PRJ-2025-000027",
    slug: "harbour-point-sales",
    title: "Harbour Point",
    location: "Ajah, Lagos",
    projectType: "Sales and marketing programme",
    client: "Private developer",
    status: "completed",
    completionDate: "2025-08-22",
    services: ["property-sales-marketing"],
    shortDescription:
      "Marketing and sale of a completed residential terrace on behalf of its developer.",
    description:
      "A developer with a completed terrace at Ajah appointed Sekibat to take the sale end to end: pricing, marketing material, viewings, offers and documentation through to assignment.",
    brief:
      "A finished scheme that had been on the market without a consistent price or presentation, and with no single record of who had enquired.",
    role: "Sales and marketing agent acting for the developer.",
    work: [
      "Repricing against comparable evidence",
      "Photography, floor plans and specification sheets",
      "Consolidation of existing enquiries into a single record",
      "Managed viewings and follow-up",
      "Offer handling, deposits and assignment documentation",
    ],
    outcome:
      "All units sold and documented, with a complete record of enquiries, offers and payments handed back to the developer.",
    images: [
      "/media/projects/harbour-point-sales-01.jpg",
      "/media/projects/harbour-point-sales-02.jpg",
    ],
    featured: false,
  },
  {
    id: "j-0005",
    reference: "PRJ-2026-000049",
    slug: "emerald-court-estate",
    title: "Emerald Court Estate Management",
    location: "Gwarinpa, Abuja",
    projectType: "Estate management instruction",
    status: "ongoing",
    services: ["estate-management", "property-maintenance"],
    shortDescription:
      "Day-to-day management of a residential block in Gwarinpa, including service charge accounts.",
    description:
      "Emerald Court is managed by our Abuja estate team. The instruction covers security and access, common areas, utilities, the planned maintenance schedule and the service charge accounts for the block.",
    brief:
      "A block where common-area upkeep and service charge collection had been handled informally, leaving no clear account of what had been collected or spent.",
    role: "Estate manager, on a standing instruction.",
    work: [
      "Setting a service charge against a costed schedule",
      "Collection, arrears follow-up and resident correspondence",
      "Planned maintenance programme for generator, water and common areas",
      "Security and access arrangements",
      "Periodic statements of income, expenditure and outstanding balances",
    ],
    outcome:
      "Ongoing. The block now runs to a written maintenance schedule with an accounted service charge.",
    images: [
      "/media/projects/emerald-court-estate-01.jpg",
      "/media/projects/emerald-court-estate-02.jpg",
    ],
    featured: false,
  },
  {
    id: "j-0006",
    reference: "PRJ-2026-000053",
    slug: "maitama-suites-maintenance",
    title: "Maitama Office Suites",
    location: "Maitama, Abuja",
    projectType: "Maintenance and refurbishment",
    client: "Private owner",
    status: "ongoing",
    services: ["property-maintenance", "estate-management"],
    shortDescription:
      "Planned maintenance and suite turnaround across a let office building in Maitama.",
    description:
      "A let office building on Gana Street held under a management instruction. Sekibat runs the planned maintenance programme and turns suites around between tenancies.",
    brief:
      "An occupied building with reactive-only maintenance, unpredictable costs and no record of what had been done to which suite.",
    role: "Maintenance and estate manager acting for the owner.",
    work: [
      "Condition survey and planned maintenance schedule",
      "Generator, water treatment and common-area servicing",
      "Suite turnaround between tenancies",
      "Contractor engagement and work verification before payment",
      "Cost record held per suite",
    ],
    outcome:
      "Ongoing. Maintenance now runs to a schedule with costs recorded against each suite rather than the building as a whole.",
    images: [
      "/media/projects/maitama-maintenance-01.jpg",
      "/media/projects/maitama-maintenance-02.jpg",
    ],
    featured: false,
  },
];
