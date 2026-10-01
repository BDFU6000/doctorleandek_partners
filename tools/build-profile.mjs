// Prints the company profile (/print-profile) to a PDF with headless Chrome.
//
//   1. start the site:   npm run build && npm start      (or npm run dev)
//   2. build the PDF:    npm run profile                  (default http://localhost:3000)
//                        npm run profile -- http://localhost:3210
//
// Output: public/profile/doctorleandek-profile-ar.pdf, which the site links to
// from the contact section and the footer. Rebuild it after any edit to
// app/content.js, because the PDF is a snapshot of that file (and of the live
// numbers on the day it was printed).

import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const base = (process.argv[2] || "http://localhost:3000").replace(/\/$/, "");
const out = join(root, "public", "profile", "doctorleandek-profile-ar.pdf");

const CANDIDATES = [
  process.env.CHROME_PATH,
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
].filter(Boolean);

const chrome = CANDIDATES.find((p) => existsSync(p));
if (!chrome) {
  console.error("Chrome or Edge not found. Set CHROME_PATH to the browser executable.");
  process.exit(1);
}

// Fail early with a clear message if the site is not running, rather than
// printing Chrome's own error page into the PDF.
try {
  const res = await fetch(`${base}/print-profile`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
} catch (e) {
  console.error(`Could not load ${base}/print-profile (${e.message}). Start the site first.`);
  process.exit(1);
}

mkdirSync(dirname(out), { recursive: true });

execFileSync(
  chrome,
  [
    "--headless=new",
    "--disable-gpu",
    "--no-pdf-header-footer",
    "--hide-scrollbars",
    // Time for the web font and the renders to load before the page is printed.
    "--virtual-time-budget=15000",
    `--print-to-pdf=${out}`,
    `${base}/print-profile`,
  ],
  { stdio: "inherit" },
);

const kb = Math.round(statSync(out).size / 1024);
console.log(`Profile written: ${out} (${kb} KB)`);
