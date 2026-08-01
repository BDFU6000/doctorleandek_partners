# Design system

Everything lives in `app/globals.css` as a custom property; no component file re-declares a value.

## Colours — one hue

The DoctorLeandak spec sheet listed nine colours. **This site uses one.** Primary Teal `#2B91A7`
is expanded into an eleven-step tint/shade ramp, which is the structure in the palette references
under `website Stlyes brainstorming/Theme/Colors` — a single hue, many lightnesses, and the canvas
itself tinted with it. Every step is H ≈ 191°.

| Token | Hex | Use |
|---|---|---|
| `--t-50` | `#F0F8FA` | light button fill, brightest text |
| `--t-100` | `#D7EDF2` | body copy tint |
| `--t-200` | `#A9D8E2` | stat numerals, captions |
| `--t-300` | `#7AC2D2` | accent text, headline accent line |
| `--t-400` | `#54ACBF` | *sheet's Light Teal* — icons, hover |
| `--t-500` | `#2B91A7` | **the one colour** — CTA, marks, rules |
| `--t-600` | `#227687` | |
| `--t-700` | `#1A5B68` | |
| `--t-800` | `#133F49` | oversized index numerals |
| `--t-900` | `#0C1B21` | **canvas** |
| `--t-950` | `#060F13` | alternating band |
| `--white` | `#FFFFFF` | |
| `--danger` | `#C7191C` | emergency **signal** only — the ambulance role, nowhere else |

`--t-400` and `--t-500` are the sheet's Light Teal and Primary Teal unchanged, so the brand survives
intact and everything else is derived from it.

**Why the canvas is `--t-900` and not black.** The three hero renders in `public/render/` were
generated on exactly this value. A page painted the same colour lets them sit in it with no visible
edge, which is the entire reason they read as objects *in* the page rather than pictures *on* it.
Change the canvas and the renders grow a rectangle.

Surfaces are alpha over the canvas, never new values: `--surface`, `--surface-hi`, `--line`,
`--line-hi`, and the copy tints `--ink`, `--ink-2`, `--ink-3`.

## Typography — Cairo

Loaded with `next/font/google`, which **self-hosts** it at build time. No external request, so a
strict CSP cannot break it and there is no layout shift.

| Role | Sheet | Here |
|---|---|---|
| Page Title | 28px Bold | `.pageTitle` — `clamp(34px, 6vw, 74px)` |
| Section Title | 18px Bold | `.sectionTitle` — `clamp(26px, 4vw, 52px)` |
| Body Large | 16px Regular | `.bodyLarge` — `clamp(16px, 1.35vw, 18px)` |
| Body | 14px Regular | `.bodySm` — `14px` |
| Section label | — | `.label` — 12.5px, `letter-spacing: 2.4px`, with an index numeral |

**The sheet's scale is a phone scale.** A 28px page title on a 1440px display looks like body text,
and the editorial references are built on display type, so the ceilings are raised and the sheet's
values stay as the mobile floor. Body is 16px rather than 14px because 14px is below the sensible
minimum for a web body; the sheet's 14px survives as `.bodySm`.

**Leading is looser than a Latin display scale would use** — `1.26` and `1.34`, not `1.1`. Cairo's
ascenders carry hamza and madda and its descenders carry ج ح خ ع; a line-height that reads as
tight-and-modern in Latin collides them in Arabic.

**Numerals are Latin (0-9), not Arabic-Indic (٠-٩).** Both are correct Arabic typography — Libya and
the Maghreb generally set Latin numerals ("الأرقام الغبارية"), the Mashriq sets ٠١٢. The page picks
one set and holds it: section indices, role indices, step numbers and the animated counters all
agree. `CountUp` formats with `en-US` for the same reason.

## Direction

`app/globals.css` sets `direction: rtl` on `html` **and** `body`, on top of `<html dir="rtl">`.
That is not redundant, and it must not be removed. The `dir` attribute is only a presentational
hint — browsers apply it through a UA rule, `[dir="rtl"]{direction:rtl}` — and an author rule beats
a UA rule. So the CSS keeps the layout RTL even when something rewrites the attribute after load: a
translation or reader extension, a proxy, a paste into another shell. Without it, one rewritten
attribute flips every column and every `text-align` on the page to the left, which is exactly the
bug that was reported. This site is Arabic-only; there is no case where it should read LTR.

## Layout language

Taken from the editorial kits in `website Stlyes brainstorming/UI kits`:

- **Bands, not cards.** Sections alternate `--t-900` / `--t-950` and are divided by a single
  hairline. Nothing floats on a gradient.
- **Hairlines do the dividing.** The roles grid is a real table — the container owns the border and
  1px gaps show `--line` through. The 6-column track with spans of 2 and 3 fills exactly, which is
  why five cards never leave a hole.
- **Index numerals on everything countable** (`01`…), Latin throughout.
- **The joining steps are a vertical road**, not four cards in a row: a dashed line running down
  through the numbers, with the teal filling in behind you as each step scrolls into view. Every
  offset derives from `--rail`, so the dot size and the line position cannot drift apart.
- **One accent.** `--t-500` carries every call to action and every active state.
- **Elevation is a top-edge highlight, not a shadow** (`--edge`), which is the neumorphism
  reference translated to a dark canvas: on dark, an inner light line reads as raised and a drop
  shadow reads as nothing.

## Components

| Property | Value |
|---|---|
| Radius | Buttons `999px` (pill) · Cards `14px` · Small `10px` |
| Elevation | `--shadow` / `--shadow-lg` / `--shadow-glow`, plus `--edge` top highlight |
| Buttons | height `56px`, flat `--t-500` fill |
| Surfaces | `.panel` — hairline, 5% fill, top-edge highlight. No backdrop blur. |
| Spacing | outer `24` · 8px grid |

**There are no gradient tokens.** The sheet defined four; this page uses none. Bands are flat ramp
steps divided by hairlines, and the only gradients left are the two soft radial pools behind the
artwork, written where they are used because each is tuned to one composition.

**Radii are sharper than the sheet's 24/20/18.** The editorial references are built on hairlines
and near-square corners; a 24px pill on every element is what made the first version read as a
template. Buttons stay fully round, because a pill CTA against square cards is the contrast that
makes it a CTA.

**Cards dropped the backdrop blur.** A `backdrop-filter` on twenty cards is real work for a phone,
and on a flat canvas there is nothing behind them to blur.

## Motion

The sheet is silent on motion, so this is the one part of the system that is
ours. It is written down here for the same reason the colours are: so the next
person adds to it rather than inventing a second one beside it.

### Curves

Three, not one per component. All in `globals.css`.

| Token | Value | For |
|---|---|---|
| `--e-fast` | `.18s` standard ease | hover, focus, colour changes — state that must feel instant |
| `--e-slow` | `.42s` ease-out | anything that travels a distance |
| `--e-enter` | `.72s` ease-out | scroll reveals |
| `--e-spring` | `.6s` slight overshoot | things that *arrive*: a panel, a card settling back |

### The layers

| Layer | Where | What it is |
|---|---|---|
| 3D orbit | `components/OrbitScene.js` | hand-written WebGL: five solids orbiting the hero emblem |
| Scroll reveal | `components/Reveal.js` + `[data-reveal]` | one shared observer for the page; `--i` staggers siblings |
| Card tilt | `components/TiltCard.js` + `.tilt` | pointer perspective, specular sweep, children lifted in Z |
| Magnetic CTA | `components/MagneticLink.js` | button leans toward the cursor, capped at 9px |
| Parallax | `components/Parallax.js` | artwork drifts against the page at ≤0.12× scroll |
| Ambient | `.aurora`, `.marquee`, `.eyebrow i` | slow loops that keep the page from looking frozen |

### Rules

1. **No 3D library.** The hero scene is ~500 lines against raw WebGL, including
   its own matrix maths and geometry. `three.js` would have been faster to write
   and about 110 KB gzipped heavier, which is the wrong trade for a page read in
   Libya on a phone.
2. **Handlers write custom properties, never styles that force layout.** Every
   pointer and scroll handler on the page sets a `--var` and stops. Nothing
   reads `getBoundingClientRect` inside a scroll or move handler except
   `Parallax`, which does it once per animation frame.
3. **Composed transforms.** `.btn` builds its transform out of `--pull-*`,
   `--lift` and `--press` so the magnet, the hover and the press can all apply
   at once. Writing `transform` directly in a `:hover` rule makes two effects
   fight and one silently lose.
4. **Everything stops for `prefers-reduced-motion`.** The block at the end of
   `globals.css` kills every transition and animation, forces `[data-reveal]`
   visible, and flattens the tilt and parallax. The hero scene draws one still
   frame instead of nothing, so the depth survives and the movement does not.
5. **Nothing is load-bearing.** No information on this page exists only inside
   an animation. With JavaScript off — see the `<noscript>` block in `layout.js`
   — the page is the same page, standing still.
6. **Logical properties have one exception.** A physical `translate(-50%)` must
   be paired with physical `left`/`top`. `inset-inline-start: 50%` resolves to
   `right` in RTL and lands the element a half-width off centre; both icon marks
   on this site had that bug.
7. **The 3D is placed, not scattered.** The first version put a dozen solids
   across the whole hero, including behind the headline, and it meant nothing.
   The orbit is the size of the emblem and centred on it, tilted to match the
   chrome ring already in the render, with exactly **five** satellites because
   there are exactly five partner account types. They converge on the mark. If a
   moving object cannot be given a reason like that, it should not move.

## Artwork

**This site no longer shares the app's illustration set.** The three `.webp` files copied from
`doctorleandek_02/web/img/` (a doctor, a phone surrounded by service icons, a shield) were the app's
onboarding art, not the site's, and they were removed. `public/img/` is gone.

In their place, `public/render/` holds three 3D product renders generated for this page and nothing
else. They are one family, deliberately: the same frosted-teal glass, the same glossy `--t-500`
ceramic core, the same brushed-chrome orbit ring, the same key light from the upper left, and the
same `#0C1B21` background.

| File | Where | What it argues |
|---|---|---|
| `hero-doctor.webp` | hero | the app's own logo figure in 3D — the page's one focal object |
| `request-flow.webp` | "الطلب يصل إليك جاهزًا" | a phone with request cards arriving in front of it |
| `trust-shield.webp` | "موثوقة من الطرفين" | a shield with a lock inside it |
| `red-crescent.webp` | final CTA | the Red Crescent, closing the page |
| `og.jpg` | social card | composited from the hero figure by a one-off sharp script |

`hero-doctor.webp` is generated **from** `doctorleandek_02/assets/Logo.png` — the doctor in the
logo, same pose, same outfit, same blank face, rebuilt as a glossy figurine in the render family.
The Arabic wordmark beside him in the logo is deliberately **not** baked in: it stays live Cairo
text in the header, where it is crisp, selectable and translatable.

**Each render is placed where it makes the section's point.** None is decoration, and there are no
spare ones. If a fifth section needs art, it needs a reason first.

### The medical symbol is the crescent, never the cross

The audience is Libyan and Muslim, and the Latin cross is the wrong emblem for them — the Red
Crescent is the Red Cross movement's own symbol for exactly this reason. Every cross on this site
was replaced:

| Was | Now |
|---|---|
| hero cross emblem render | `hero-doctor.webp` |
| OG card, two-bar plus mark | crescent, drawn as two circles with `fill-rule="evenodd"` |
| header brand mark, two `<i>` bars | `IconCrescentSolid` |
| `IconCross` on the hero badge | `IconCrescent` |
| plus inside `IconPharmacy`'s bag | scaled `CRESCENT_PATH` |
| plus on `IconAmbulance`'s van | scaled `CRESCENT_PATH` |
| `crossPrism()` WebGL satellite | `crescentPrism()` |

`CRESCENT_PATH` in `app/icons.js` is the single source for the 2D shape; icons scale it with a
transform rather than redrawing it. `crescentPrism()` in `app/lib/gl-geometry.js` is the 3D one.
**Do not reintroduce a cross anywhere**, including in a new icon.

Two more rules, easy to violate by accident:

1. **Icons are inline SVG, never emoji.** Emoji carry their own fixed colours — a red ambulance, a
   pink wallet — which break a single-hue palette, and every OS draws them differently. The icons in
   `app/icons.js` inherit `currentColor`.
2. **Emergency red is a signal.** `--danger` appears on the ambulance role and on the closing Red
   Crescent, and nowhere else.

### On the sheet's "No 3D"

The sheet's guidelines block says *"Follow the logo's illustration style. No cartoons. No 3D. No
childish drawings."* That line governed the **flat line-art illustration family the app ships** —
it was there to stop someone dropping a rendered cartoon doctor next to the onboarding art.

This site is a different surface with its own object language. The hero figure is the logo's own
doctor rendered as a smooth ceramic figurine, not a cartoon and not a photoreal person, and the
rest are abstract objects: no places, no narrative, no second illustration family.

## Where else this system lives

- `doctorleandek_02/web/landing.html` — the patient site.
- `doctorleandek_02/lib/core/theme/app_colors.dart` — the Flutter app.

**Those two still carry the sheet's nine-colour palette.** This site's single-hue ramp is a
divergence, taken on purpose. `--t-400` and `--t-500` are the sheet's Light Teal and Primary Teal
unchanged, so the brand still matches across all three; what differs is that the app and the patient
site also use navy, blue-accent and scaffold-grey, and this site does not. If the ramp is ever
adopted elsewhere, the two files above are what change.
