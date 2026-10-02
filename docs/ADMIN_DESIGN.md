# Sekibat Content Studio

The administration UI is a separate product surface: a publishing workspace for a property company, with its own typography and navigation. The public website and CMS data contracts remain unchanged.

## Direction

Slate navigation, a cool gray canvas, coral actions, Manrope text, and Geist Mono for small indices. Architectural photography anchors the overview and sign-in screen. The dashboard's publishing desk uses actual entry visibility, pending drafts, and media counts; no invented traffic or financial charts.

The editor separates identity/story, details/context, photography, and enquiry content into anchored chapters. Publishing actions stay available while editing. Its updating draft preview illustrates content, and is explicitly distinguished from the public page layout.

Collections support search, visibility filters, sorting, and list/grid layouts. The media library supports folders, search, clipboard paths, upload/drop, and photograph selection. Quick search supports Ctrl/Cmd-K, arrow keys, Enter, and Escape. Mobile navigation uses a modal drawer with focus containment.

## Research

Browsed the user's Chrome session on 2 October 2026:

- [Hamed's dashboard study on X](https://x.com/AfolabiDewale/status/2095077867381981411): compact hierarchy and restrained neutral surfaces.
- [HeiMaUX dashboard study via Pinterest](https://www.pinterest.com/pin/15621929952805276/): dark navigation beside an orderly working canvas.
- [Shadcn Admin by satnaing](https://github.com/satnaing/shadcn-admin): practical search and responsive navigation patterns.
- [Dribbble CMS references](https://dribbble.com/search/content-management-dashboard): browser access was gated by human verification; indexed results were available through web search.

These are references for hierarchy and interaction, not copied templates or assets. All in-app photographs come from Sekibat's existing library. Figma and generated imagery were unnecessary for this implementation.

## Motion and access

Motion for React handles short reveals and the shared active-navigation indicator. Modals and hover states use short CSS transitions. Reduced-motion preferences suppress movement. Native dialogs contain keyboard focus and close with Escape. Password visibility, labelled fields, feedback roles, a skip link, and keyboard-accessible media actions are included.

## Verification

`pnpm lint`, `pnpm build`, `pnpm smoke:cms`, and `pnpm smoke`. CMS smoke coverage includes authentication, drafts/publishing, validation, concurrent edit conflicts, media, collection search/layout controls, quick search, and mobile navigation. The smoke script restores local content after its checks.

## Boundary

This work changes the UI only. The existing local file-based persistence and production storage requirements remain as documented in the CMS setup guide.
