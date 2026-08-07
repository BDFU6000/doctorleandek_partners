// Every outward URL in one place. The partners site is not deployed yet, so
// `partnersUrl` is the name Vercel will mint from the project name. If the real
// deployment differs, or a custom domain lands, change it HERE and nowhere else.
export const SITE = {
  // This site.
  partnersUrl: "https://doctorleandek-partners.vercel.app",

  // The patient-facing site and the app that lives under it.
  mainUrl: "https://doctorleandek.vercel.app",
  appUrl: "https://doctorleandek.vercel.app/app/",
};

// The platform's own backend, for the live counters in the "أرقام المنصة"
// section. Same values the app ships (lib/core/supabase/supabase_config.dart),
// and the anon key is public by design: it authenticates as the `anon` role and
// RLS is the wall, not the key. The only thing this site is allowed to call
// with it is `rpc_public_stats`, which returns three totals and a timestamp.
//
// Env vars win when set, so a Vercel project can be pointed at a staging
// project without a code change. They are NOT `NEXT_PUBLIC_`: the counters are
// fetched while rendering on the server, so nothing here reaches the browser.
export const SUPABASE = {
  url: process.env.SUPABASE_URL || "https://fxtrhoipotoxpzezkjmj.supabase.co",
  anonKey:
    process.env.SUPABASE_ANON_KEY ||
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ4dHJob2lwb3RveHB6ZXpram1qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ0NzEzOTIsImV4cCI6MjA5MDA0NzM5Mn0.HVyKV9bVUTOwNay0pfCvhoGTJoCvW6dP8cgrjwYmoaA",
};
