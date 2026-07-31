# Design system

Transcribed from the DoctorLeandak spec sheet. The sheet's own rules are **"use only these
colours"** and **"use gradients as defined"**, so nothing may be introduced that is not below.
Everything lives in `app/globals.css` as a custom property; no component file re-declares a value.

## Colours

| Token | Hex | Use |
|---|---|---|
| `--primary-teal` | `#2B91A7` | primary brand |
| `--light-teal` | `#54ACBF` | accents, icons, focus ring |
| `--dark-teal` | `#275059` | gradient end |
| `--mid-teal` | `#4494A6` | gradient stop |
| `--blue-accent` | `#376B97` | buttons |
| `--navy` | `#122331` | page background, text on light |
| `--scaffold-grey` | `#F5F7F8` | light surfaces |
| `--emergency-red` | `#C7191C` | emergency only, never decoration |
| `--white` | `#FFFFFF` | text on dark |

## Gradients

| Token | Definition |
|---|---|
| `--grad-appbar` | `#54ACBF → #2B91A7 → #275059` |
| `--grad-button` | `#376B97 → #122331` |
| `--grad-bottomnav` | `#449AA6 → #1A3940` |
| `--grad-card` | `rgba(84,172,191,.8) → rgba(59,130,145,.9)` |

## Typography — Cairo

Loaded with `next/font/google`, which **self-hosts** it at build time. No external request, so a
strict CSP cannot break it and there is no layout shift.

| Role | Sheet | Here |
|---|---|---|
| Page Title | 28px Bold | `.pageTitle` — `clamp(28px, 4.6vw, 54px)` |
| Section Title | 18px Bold | `.sectionTitle` — `clamp(18px, 2.7vw, 34px)` |
| Body Large | 16px Regular | `.bodyLarge` — `clamp(16px, 1.4vw, 18px)` |
| Body | 14px Regular | `.bodySm` — `14px` |

**The one deliberate departure.** The sheet's scale is a phone scale. A 28px page title on a 1440px
display looks like body text, so headings use `clamp()` with the sheet's value as the mobile floor.
The tokens and ratios are the sheet's; only the upper bound is ours. Body is 16px rather than 14px
because 14px is below the sensible minimum for a web body; the sheet's 14px survives as `.bodySm`.

## Components

| Property | Value |
|---|---|
| Radius | Buttons `24px` · Cards `20px` · Inputs `18px` |
| Shadow | `Y:8 · Blur:30 · Opacity 12%` → `--shadow` |
| Buttons | height `56px`, gradient fill |
| Cards | glass · 10% white · blur · soft border → `.glass` |
| Spacing | outer `24` · section `32` · items `16` · 8px grid |

## Visual rules

From the sheet's guidelines block, which governs any new artwork:

- Follow the logo's illustration style. **No cartoons. No 3D. No childish drawings.**
- Clean, professional, semi-realistic line-art.
- Large hero scene, Arabic RTL layout, consistent colours and gradients.

Two consequences worth stating, because they are easy to violate by accident:

1. **Icons are inline SVG, never emoji.** Emoji carry their own fixed colours — a red ambulance, a
   pink wallet — which break a palette the sheet says to use exactly, and every OS draws them
   differently. The icons in `app/icons.js` inherit `currentColor`.
2. **Artwork is shared with the app**, copied from `doctorleandek_02/web/img/`. The app's
   `assets/onboarding/README.md` says to judge the set, not the picture: a one-off illustration
   generated for this site alone would break the family.

## Where else this system lives

- `doctorleandek_02/web/landing.html` — the patient site, same tokens inline.
- `doctorleandek_02/lib/core/theme/app_colors.dart` — the Flutter app.

Change a colour in one and it must change in all three.
