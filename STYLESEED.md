# STYLESEED — Sekibat Nig Limited (public website)

**Binding.** These decisions are locked. Do not re-litigate them per-component or per-page.
Chosen from four rendered directions on 2026-09-20; see `docs/` history if revisited.

Brand profile: **none inherited.** Sekibat has no registered brand profile. Nothing from any
other client's system (colour, type, voice) may appear here.

## Direction

**Architectural editorial + technical ledger.**
Properties are presented as *works*, not listings — the reference feeling is an architecture
monograph: a plate, a caption, an index number, generous paper around it. The ledger layer
(referenced tables, `PROP-000123`-style codes, monospace micro-data) is the distinctive move and
foreshadows the internal management system.

Photography leads. Chrome is hairlines, not boxes and shadows.

## Colour — ONE accent

| Token | Value | Use |
|---|---|---|
| `paper` | `#F7F5F1` | page base |
| `paper-deep` | `#EFEAE2` | alternating sections, wells |
| `ink` | `#14120F` | primary text, display |
| `ink-muted` | `#57534C` | secondary body |
| `ink-faint` | `#767068` | micro-labels, captions |
| `rule` | `rgba(20,18,15,.14)` | hairlines, dividers, edges |
| `clay` | `#9C4A2A` | **the accent** — links, active state, CTA, refs |
| `clay-deep` | `#7E3A20` | accent hover/pressed |
| `night` | `#1A1714` | footer + contact band only |

A second accent requires a stated reason. Status is carried by **label and position**, never by
a palette of badge colours — sold/leased get reduced ink, not red.

Contrast floors are hard limits: **4.5:1 body, 3:1 large text and UI edges.**

## Type

- **Display — Fraunces** (variable, `opsz` high, `SOFT 0`, `WONK 0`). Page titles and property
  names only.
- **Text / UI — Archivo.**
- **Data / refs — IBM Plex Mono.** Reference codes, table micro-headers, spec figures only.
- Inter is banned; it is the default-choice tell.

Ladder, nothing off-scale: `11 · 12 · 13 · 15 · 17 · 21 · 28 · 40 · 56 · 80 · 112`.
Weights 400 / 500 / 600 only. Hierarchy from **weight, colour and space before size.**

## Shape, depth, space

- **Radius `0`** almost everywhere. `2px` on buttons and inputs. Pills only for a status dot.
- **No shadows.** Separation is hairline rules and paper tone shifts. One soft elevation exists
  only for the sticky header. `0 4px 6px rgba(0,0,0,.1)` is banned.
- Spacing on Tailwind's 4px base. Section rhythm: `96` mobile / `128` desktop.
- **Grid**: 12 columns, 1360 container, gutters 24 → 48. Layouts are **asymmetric** — section
  labels and indices in columns 1–2, content in 3–12. Centred hero + three equal cards is banned.

## Motion

Reveal: `opacity 0→1`, `translateY 12px→0`, 500ms, `cubic-bezier(.2,.6,.2,1)`, 60ms stagger.
Plate hover: image `scale(1.03)` over 700ms, nothing else moves.
No parallax, no counters, no scroll-jacking. All behind `prefers-reduced-motion: reduce`.

## Content rules (from the client brief — non-negotiable)

- **No invented figures.** No stat counters, no "500+ clients", no years-of-experience claims,
  no awards, no testimonials until the client supplies real ones.
- No stock skyscrapers. No "Building Dreams"-class slogans.
- Photography leans **Lagos-plausible urban mid-rise** — dusk/lit residential blocks with
  balconies and tropical planting — not Californian villas.
- Missing price renders **"Price on request"**, never `₦0`.
