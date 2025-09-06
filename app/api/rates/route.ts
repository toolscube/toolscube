import { NextResponse } from "next/server";

const PRIMARY = "https://api.exchangerate.host/latest";
const FALLBACK = "https://api.frankfurter.app/latest";

// GET /api/rates?base=USD
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const base = searchParams.get("base") || "USD";

  // Primary: exchangerate.host
  try {
    const res = await fetch(`${PRIMARY}?base=${encodeURIComponent(base)}`, {
      next: { revalidate: 0 },
    });
    if (!res.ok) throw new Error("exchangerate.host failed");
    const data = await res.json();
    if (!data?.rates) throw new Error("exchangerate.host invalid");

    // exchangerate.host returns a date string (YYYY-MM-DD); include it.
    const date: string | undefined = data?.date;
    return NextResponse.json({ base, rates: data.rates, provider: "exchangerate.host", date });
  } catch {
    // Fallback: frankfurter.app (always EUR base; convert if needed)
    try {
      const fbRes = await fetch(`${FALLBACK}?from=EUR`, { next: { revalidate: 0 } });
      if (!fbRes.ok) throw new Error("frankfurter failed");
      const fbData = await fbRes.json();
      const eurRates = fbData?.rates as Record<string, number> | undefined;
      const date: string | undefined = fbData?.date;
      if (!eurRates) throw new Error("frankfurter invalid");

      // frankfurter base is EUR. Convert to requested base:
      // rate(base->X) = rate(EUR->X) / rate(EUR->base)
      let normalized: Record<string, number> = {};
      if (base === "EUR") {
        normalized = { ...eurRates, EUR: 1 };
      } else {
        const baseRate = eurRates[base];
        if (!baseRate) throw new Error("base not available in fallback");
        for (const [code, eurToX] of Object.entries(eurRates)) {
          normalized[code] = eurToX / baseRate;
        }
        normalized[base] = 1;
      }

      return NextResponse.json({ base, rates: normalized, provider: "frankfurter", date });
    } catch {
      return NextResponse.json({ base, rates: null, provider: "none" }, { status: 502 });
    }
  }
}
