// Inline SVG, deliberately not emoji: emoji carry their own fixed colours (a red
// ambulance, a pink wallet) which fight a single-hue palette, and every OS draws
// them differently. These inherit currentColor.
//
// Line-art at a consistent 1.7 stroke, matching the sheet's "clean, professional,
// semi-realistic line-art" instruction. No fills, no cartoons.
//
// THE MEDICAL SYMBOL HERE IS THE CRESCENT, NOT THE CROSS. The audience is
// Libyan and Muslim, and the Latin cross is the wrong emblem for them — the
// Red Crescent is the Red Cross movement's own symbol for exactly this reason.
// Every plus that used to sit in this file (the bag, the ambulance, the badge)
// is now a crescent, and so is the mark in the header and on the social card.
// If you add an icon, do not reintroduce one.

const base = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.7,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": "true",
};

/**
 * The crescent, as one closed path on a 24×24 grid: a large arc out and a
 * smaller arc back. Reused at several sizes, so it is written once and scaled
 * by the caller with a transform rather than re-drawn per icon.
 */
export const CRESCENT_PATH = "M20.6 13.1A8.6 8.6 0 1 1 10.9 3.4 6.8 6.8 0 0 0 20.6 13.1Z";

/** Scales the shared crescent to `size` units, centred on (cx, cy). */
function crescentAt(cx, cy, size) {
  const k = size / 18;
  return `translate(${cx} ${cy}) scale(${k}) translate(-12 -12)`;
}

export function IconStethoscope() {
  return (
    <svg {...base}>
      <path d="M5.5 2.8v5.4a4.2 4.2 0 0 0 8.4 0V2.8" />
      <path d="M3.6 2.8h3.6M12.1 2.8h3.6" />
      <path d="M9.7 12.4v2.9a4.6 4.6 0 0 0 9.2 0v-2.1" />
      <circle cx="18.5" cy="10.4" r="2.1" />
    </svg>
  );
}

export function IconPharmacy() {
  return (
    <svg {...base}>
      <path d="M4.4 8.2h15.2l-1.3 12a1.6 1.6 0 0 1-1.6 1.4H7.3a1.6 1.6 0 0 1-1.6-1.4Z" />
      <path d="M8.2 8.2V6a3.8 3.8 0 0 1 7.6 0v2.2" />
      {/* Was a plus inside the bag. */}
      <path d={CRESCENT_PATH} transform={crescentAt(12, 15.2, 7.4)} />
    </svg>
  );
}

export function IconBox() {
  return (
    <svg {...base}>
      <path d="M3.4 7.6 12 3.2l8.6 4.4v8.8L12 20.8 3.4 16.4Z" />
      <path d="M3.4 7.6 12 12l8.6-4.4M12 12v8.8" />
    </svg>
  );
}

export function IconScooter() {
  return (
    <svg {...base}>
      <circle cx="5.4" cy="17.6" r="2.8" />
      <circle cx="18.6" cy="17.6" r="2.8" />
      <path d="M8.2 17.6h7.6" />
      <path d="M18.6 17.6 16.2 7.4h-2.6" />
      <path d="M5.4 14.8V12a2.4 2.4 0 0 1 2.4-2.4h4.4" />
    </svg>
  );
}

export function IconAmbulance() {
  return (
    <svg {...base}>
      <path d="M2.6 16.4V7.4h10.6v9" />
      <path d="M13.2 10.4h3.9l4.3 4v2h-8.2" />
      <circle cx="7" cy="18.2" r="1.7" />
      <circle cx="17.2" cy="18.2" r="1.7" />
      {/* Was a plus on the side of the van. */}
      <path d={CRESCENT_PATH} transform={crescentAt(7.9, 11.2, 5.6)} />
    </svg>
  );
}

export function IconCheck() {
  return (
    <svg {...base}>
      <path d="M20 6.5 9.4 17.1 4 11.7" />
    </svg>
  );
}

/** A house with a crescent over the door: the home visit. */
export function IconHome() {
  return (
    <svg {...base}>
      <path d="M3.4 10.6 12 3.6l8.6 7" />
      <path d="M5.6 9v10.6a1 1 0 0 0 1 1h10.8a1 1 0 0 0 1-1V9" />
      <path d="M10 20.6v-5.2h4v5.2" />
      <path d={CRESCENT_PATH} transform={crescentAt(12, 11.4, 4.6)} />
    </svg>
  );
}

export function IconWallet() {
  return (
    <svg {...base}>
      <path d="M3.6 7.2h15.2a1.6 1.6 0 0 1 1.6 1.6v9.6a1.6 1.6 0 0 1-1.6 1.6H5.2a1.6 1.6 0 0 1-1.6-1.6Z" />
      <path d="M3.6 7.2 15.4 3.8v3.4" />
      <path d="M16.2 13.6h4.2" />
    </svg>
  );
}

/** The medical record: a sheet with lines and a folded corner. */
export function IconRecord() {
  return (
    <svg {...base}>
      <path d="M6 2.8h8.2l4 4v13.6a.8.8 0 0 1-.8.8H6a.8.8 0 0 1-.8-.8V3.6a.8.8 0 0 1 .8-.8Z" />
      <path d="M14 2.8v4.2h4.2" />
      <path d="M8.4 11.6h7.2M8.4 15h7.2M8.4 18.4h4.4" />
    </svg>
  );
}

export function IconShield() {
  return (
    <svg {...base}>
      <path d="M12 2.8 4.6 5.6v5.8c0 4.6 3.1 8.4 7.4 9.8 4.3-1.4 7.4-5.2 7.4-9.8V5.6Z" />
      <path d="m8.8 12 2.2 2.2 4.2-4.4" />
    </svg>
  );
}

export function IconPhone() {
  return (
    <svg {...base}>
      <path d="M5.2 3.4h3.2l1.6 4-2 1.3a10.4 10.4 0 0 0 5.3 5.3l1.3-2 4 1.6v3.2a1.6 1.6 0 0 1-1.7 1.6A15.6 15.6 0 0 1 3.6 5.1a1.6 1.6 0 0 1 1.6-1.7Z" />
    </svg>
  );
}

/** A speech bubble, for WhatsApp. Not the WhatsApp logo: brand marks carry
    their own green, which the single-hue palette cannot hold. */
export function IconChat() {
  return (
    <svg {...base}>
      <path d="M4 18.8 5.2 15A7.8 7.8 0 1 1 8.6 18.2Z" />
      <path d="M9 10.4h6.2M9 13.4h4" />
    </svg>
  );
}

export function IconDownload() {
  return (
    <svg {...base}>
      <path d="M12 3.6v11.6" />
      <path d="m7.4 10.8 4.6 4.6 4.6-4.6" />
      <path d="M4.4 16.6v2.4a1.4 1.4 0 0 0 1.4 1.4h12.4a1.4 1.4 0 0 0 1.4-1.4v-2.4" />
    </svg>
  );
}

/** A small arrow pointing along the reading direction (left, in RTL). */
export function IconArrow() {
  return (
    <svg {...base}>
      <path d="M19 12H5.4" />
      <path d="m10.6 6.6-5.4 5.4 5.4 5.4" />
    </svg>
  );
}

/** The badge mark. Replaces the plus that used to sit here. */
export function IconCrescent() {
  return (
    <svg {...base}>
      <path d={CRESCENT_PATH} />
    </svg>
  );
}

/** Solid crescent, for the header mark and anywhere it reads as a logo. */
export function IconCrescentSolid() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d={CRESCENT_PATH} />
    </svg>
  );
}
