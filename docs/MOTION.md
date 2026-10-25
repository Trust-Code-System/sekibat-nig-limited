# Sekibat motion

The existing architectural scroll scene and reveal system are retained. The public site adds:

- A property-type control adapted from [React Bits Rubber Segment](https://reactbits.dev/micro/rubber-segment). Its two selection edges travel independently before settling; it supports mouse, touch, arrow keys, Home and End. The gallery filters the six featured records already supplied to the home page.
- Enquiry pending, success and error indicators adapted from [React Bits Status Mark](https://reactbits.dev/micro/status-mark). Status always has visible text and the existing live-region announcements.
- Layout transitions for filtered cards, gallery crossfades, a spring selection frame on thumbnails, an active navigation highlight, staggered hero/menu entrances, and button press feedback.

Adapted source is in `components/motion/`. The React Bits license is retained in `REACT_BITS_LICENSE.md`. The project uses its existing `motion/react` dependency.

CSS timings are `--duration-fast` (140ms, press feedback), `--duration-normal` (240ms, hover/state), and `--duration-deliberate` (450ms, entrances). `--ease-tactile` decelerates into rest; the selection and layout springs settle within 400ms. Related entrance items stagger 35–65ms.

CSS tokens collapse under `prefers-reduced-motion`; Motion components also use `useReducedMotion` so layout, scale, travel and ring rotation are removed. Images, links and form controls remain available. The filter does not change the site's property records or enquiry delivery.

`app/icon.svg`, the multi-size `app/favicon.ico`, and `app/apple-icon.png` share the orange plot-grid mark in `BrandLockup.tsx`. Next.js file metadata supplies the icon links.
