import { SUPABASE } from "../site-config";

/* The live platform counters: partner pharmacies, verified medical staff, and
   active patient accounts.

   Read on the SERVER while the page renders, never in the browser. Three
   consequences, all of them wanted:

   1. The numbers are in the served HTML. A crawler sees them, a reader with JS
      off sees them, and CountUp animates from a value that was already correct
      (the same rule that component was written to keep).
   2. The anon key never reaches the client.
   3. Every visitor is served one cached render rather than each browser making
      its own request. `revalidate` below decides how often that render is
      rebuilt, and the backend caches the counts on its side too
      (`platform_stats`, refreshed by cron every 15 min) so this can never
      become three COUNT(*) scans per visit.

   Failure returns null and the section is simply not rendered. A marketing page
   that invents numbers when the backend is unreachable is worse than one that
   is briefly missing a section, and zeros would be exactly that kind of lie. */

// Fifteen minutes, matching the cron that refreshes the counts. Asking more
// often than the data can change buys nothing.
const REVALIDATE_SECONDS = 900;

// A marketing page must not hang on a slow backend, so the request is capped
// well below any render budget and a timeout is just "no section this time".
const TIMEOUT_MS = 5000;

const int = (v) => (Number.isFinite(Number(v)) ? Math.max(0, Math.round(Number(v))) : 0);

export async function getPlatformStats() {
  try {
    const res = await fetch(`${SUPABASE.url}/rest/v1/rpc/rpc_public_stats`, {
      method: "POST",
      headers: {
        apikey: SUPABASE.anonKey,
        Authorization: `Bearer ${SUPABASE.anonKey}`,
        "Content-Type": "application/json",
      },
      body: "{}",
      signal: AbortSignal.timeout(TIMEOUT_MS),
      next: { revalidate: REVALIDATE_SECONDS },
    });
    if (!res.ok) return null;

    const data = await res.json();
    if (!data || typeof data !== "object") return null;

    const stats = {
      pharmacies: int(data.pharmacies),
      medicalStaff: int(data.medical_staff),
      patients: int(data.patients),
      updatedAt: data.updated_at ?? null,
    };

    // An empty platform has nothing to boast about, and three zeros under a
    // heading that says "our numbers" reads as a broken page rather than an
    // honest one. Everything else, including a single zero next to two real
    // figures, is shown as it is.
    if (!stats.pharmacies && !stats.medicalStaff && !stats.patients) return null;

    return stats;
  } catch {
    // Network error, timeout, malformed body: no numbers, no section.
    return null;
  }
}
