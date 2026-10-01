# Design Direction: UI Upgrade, 2026-10-01

Built from `01-awwwards-research.md`. This is a **restyle in place**: every section stays, in the same order, with the same copy and
the same components. Nothing in the flow moves.

## Fixed constraints (not up for change)

- One hue. The `--t-*` ramp in `app/globals.css` stays, and `--danger` stays limited to the ambulance role and the Red Crescent.
- The canvas stays `#0C1B21` (`--t-900`), because the renders in `public/render/` were generated on that exact value.
- Crescent, never a cross. Latin numerals. Cairo. RTL declared in CSS on `html` and `body`.
- The steps road and the FAQ network were iterated on separately and keep their structure.

## What changes, section by section

| Section | Pattern from research | Change |
|---|---|---|
| Navigation | Floating inset capsule (HEVA, Photon, Bevel, Function) | Once you scroll, the bar becomes a rounded glass capsule inset from the edges, instead of a full-width strip. Over the hero it stays transparent. |
| Hero | Accent phrase + proof strip (Function) | Keep the copy. Add a hairline orbit-ring overlay behind the emblem (our version of Tamayoz's hexagon lattice, drawn from the orbit motif). The proof strip becomes a contained rounded strip. |
| Ticker | Marquee (Function) | Chips get the card surface and a softer edge mask. |
| Section heads | One accent phrase per headline (Function) | The second clause of each section title takes the accent tint. Same words. |
| Numbers | Separate cards (HEVA) | The three counters become separate rounded cards with gaps. |
| Roles | Separate cards + tag chips (HEVA, Photon) | The five roles become separate rounded cards. The index numeral becomes a small tag chip. Ambulance keeps its red signal. |
| Benefits | "What makes us different" (Institute of Health) | Same four columns, with an accent bar that grows on hover. |
| Request / Trust splits | Tag chips (Photon) | Check rows become a contained panel. |
| Final CTA | Contained panel (HEVA, Photon) | The closing block sits in one large rounded panel with an orbit-ring overlay and the crescent glow. |
| Footer | | Unchanged apart from tokens. |

## New tokens

- `--r-card: 20px` (was 14). The sheet asked for 24/20/18; separate cards read better at 20 than at the old near-square 14.
- `--r-panel: 28px` for the large contained panels (final CTA, nav capsule on mobile).
- `--rings`: a reusable hairline concentric-ring background, used in the hero and the final panel.
