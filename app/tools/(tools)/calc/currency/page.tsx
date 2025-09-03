"use client";

import {
  ArrowLeftRight,
  Copy,
  Download,
  Globe,
  Link2,
  RotateCcw,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GlassCard, MotionGlassCard } from "@/components/ui/glass-card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

// ====== Config ======
const PROVIDER = "exchangerate.host"; // public, no key
const CACHE_HOURS = 12;

// Common + popular currencies (extend anytime)
const CURRENCIES: { code: string; name: string; symbol?: string }[] = [
  { code: "USD", name: "US Dollar", symbol: "$" },
  { code: "EUR", name: "Euro", symbol: "€" },
  { code: "GBP", name: "British Pound", symbol: "£" },
  { code: "INR", name: "Indian Rupee", symbol: "₹" },
  { code: "BDT", name: "Bangladeshi Taka", symbol: "৳" },
  { code: "AUD", name: "Australian Dollar", symbol: "A$" },
  { code: "CAD", name: "Canadian Dollar", symbol: "C$" },
  { code: "JPY", name: "Japanese Yen", symbol: "¥" },
  { code: "CNY", name: "Chinese Yuan", symbol: "¥" },
  { code: "SAR", name: "Saudi Riyal" },
  { code: "AED", name: "UAE Dirham" },
  { code: "SGD", name: "Singapore Dollar" },
  { code: "MYR", name: "Malaysian Ringgit" },
  { code: "THB", name: "Thai Baht" },
  { code: "PKR", name: "Pakistani Rupee" },
  { code: "NPR", name: "Nepalese Rupee" },
  { code: "LKR", name: "Sri Lankan Rupee" },
  { code: "ZAR", name: "South African Rand" },
  { code: "TRY", name: "Turkish Lira" },
  { code: "CHF", name: "Swiss Franc" },
];

// ====== Types ======
type RatesMap = Record<string, number>;
type Favorite = { from: string; to: string };

// ====== Utils ======
const qs = (k: string, fallback: string) => {
  if (typeof window === "undefined") return fallback;
  return new URLSearchParams(window.location.search).get(k) ?? fallback;
};

const setParams = (params: Record<string, string | number>) => {
  if (typeof window === "undefined") return;
  const url = new URL(window.location.href);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, String(v)));
  window.history.replaceState({}, "", url.toString());
};

const nowISO = () => new Date().toISOString();
const hoursAgo = (iso: string) => (Date.now() - new Date(iso).getTime()) / 36e5;

function formatNumber(n: number, max = 6) {
  const abs = Math.abs(n);
  const digits = abs >= 1 ? 2 : max; // more precision for small values
  return new Intl.NumberFormat(undefined, { maximumFractionDigits: digits }).format(n);
}

function csvDownload(filename: string, rows: (string | number)[][]) {
  const content = rows
    .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
    .join("\n");

  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function pairKey(from: string, to: string) {
  return `${from}_${to}`;
}

// ====== Page ======
export default function CurrencyConverterPage() {
  // Query-param backed defaults (handy for sharing)
  const [amount, setAmount] = useState<string>(qs("amt", "100"));
  const [from, setFrom] = useState<string>(qs("from", "USD"));
  const [to, setTo] = useState<string>(qs("to", "BDT"));

  const [rates, setRates] = useState<RatesMap>({});
  const [base, setBase] = useState<string>(from);
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "cached" | "error">("idle");

  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [history, setHistory] = useState<
    { ts: string; from: string; to: string; amount: number; result: number; rate: number }[]
  >([]);

  // Load favorites & history
  useEffect(() => {
    try {
      const fav = JSON.parse(localStorage.getItem("cc_favorites") || "[]") as Favorite[];
      setFavorites(Array.isArray(fav) ? fav : []);
      const hist = JSON.parse(localStorage.getItem("cc_history") || "[]") as typeof history;
      setHistory(Array.isArray(hist) ? hist : []);
    } catch {}
  }, []);

  // Persist favorites & history
  useEffect(() => localStorage.setItem("cc_favorites", JSON.stringify(favorites)), [favorites]);
  useEffect(
    () => localStorage.setItem("cc_history", JSON.stringify(history.slice(0, 50))),
    [history],
  );

  // Keep URL synced for sharing
  useEffect(() => {
    setParams({ amt: amount || 0, from, to });
  }, [amount, from, to]);

  // Fetch rates (with cache)
  async function fetchRates(baseCode: string) {
    setStatus("loading");
    try {
      const cacheKey = `cc_rates_${baseCode}`;
      const cachedRaw = localStorage.getItem(cacheKey);
      if (cachedRaw) {
        const cached = JSON.parse(cachedRaw) as {
          updatedAt: string;
          rates: RatesMap;
          provider?: string;
        };
        // keep using the same CACHE_HOURS you already set
        if (cached.updatedAt && hoursAgo(cached.updatedAt) < CACHE_HOURS) {
          setRates(cached.rates);
          setLastUpdated(cached.updatedAt);
          setStatus("cached");
          return;
        }
      }

      const res = await fetch(`/api/rates?base=${encodeURIComponent(baseCode)}`);
      if (!res.ok) throw new Error(`Rate API failed (${res.status})`);
      const data = (await res.json()) as { base: string; rates: RatesMap | null; provider: string };
      if (!data.rates) throw new Error("No rates in response");

      const updatedAt = nowISO();
      localStorage.setItem(
        `cc_rates_${baseCode}`,
        JSON.stringify({ updatedAt, rates: data.rates, provider: data.provider }),
      );

      setRates(data.rates);
      setLastUpdated(updatedAt);
      setStatus("ok");
    } catch (e) {
      // Try stale cache
      const cacheKey = `cc_rates_${baseCode}`;
      const cachedRaw = localStorage.getItem(cacheKey);
      if (cachedRaw) {
        const cached = JSON.parse(cachedRaw) as {
          updatedAt: string;
          rates: RatesMap;
          provider?: string;
        };
        setRates(cached.rates);
        setLastUpdated(cached.updatedAt + " (stale)");
        setStatus("cached");
      } else {
        setRates({});
        setLastUpdated("");
        setStatus("error");
      }
    }
  }

  // Initial + when base changes
  useEffect(() => {
    setBase(from);
  }, [from]);

  useEffect(() => {
    if (base) fetchRates(base);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [base]);

  // Derived conversion
  const { result, rate } = useMemo(() => {
    const amt = Number(amount) || 0;
    const r = rates?.[to] ?? 0;
    return { result: amt * r, rate: r };
  }, [amount, rates, to]);

  function swap() {
    const prevFrom = from;
    setFrom(to);
    setTo(prevFrom);
  }

  function resetAll() {
    setAmount("100");
    setFrom("USD");
    setTo("BDT");
    setTimeout(() => fetchRates("USD"), 0);
  }

  function convert() {
    if (!rate) return;
    setHistory((h) => [
      { ts: nowISO(), from, to, amount: Number(amount) || 0, result, rate },
      ...h,
    ]);
  }

  function toggleFavorite() {
    const key = pairKey(from, to);
    setFavorites((favs) => {
      const exists = favs.some((f) => pairKey(f.from, f.to) === key);
      return exists
        ? favs.filter((f) => pairKey(f.from, f.to) !== key)
        : [{ from, to }, ...favs].slice(0, 15);
    });
  }

  const isFavorite = favorites.some((f) => f.from === from && f.to === to);
  const shareUrl = typeof window !== "undefined" ? window.location.href : "";

  function copy(text: string) {
    navigator.clipboard.writeText(text);
  }

  function exportHistoryCSV() {
    const rows: string[][] = [
      ["Time", "From", "To", "Amount", "Rate", "Result"],
      ...history.map((h) => [
        String(h.ts),
        h.from,
        h.to,
        String(h.amount),
        String(h.rate),
        String(h.result),
      ]),
    ];
    csvDownload("currency-history.csv", rows);
  }

  const inlineRate = rate ? `1 ${from} = ${formatNumber(rate)} ${to}` : "—";

  return (
    <div className="container mx-auto max-w-5xl px-3 py-6 sm:py-10">
      <MotionGlassCard>
        {/* Header */}
        <GlassCard className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-6">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
              <Globe className="h-6 w-6" /> Currency Converter
            </h1>
            <p className="text-sm text-muted-foreground">
              Convert currencies with live rates ({PROVIDER}). Cached for {CACHE_HOURS}h to load
              fast.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" className="gap-2" onClick={resetAll}>
              <RotateCcw className="h-4 w-4" /> Reset
            </Button>
            <Button className="gap-2" onClick={convert} disabled={!rate}>
              <TrendingUp className="h-4 w-4" /> Convert
            </Button>
          </div>
        </GlassCard>

        {/* Inputs */}
        <GlassCard className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Amount & Currencies</CardTitle>
            <CardDescription>Pick currencies and set the amount to convert.</CardDescription>
          </CardHeader>

          <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {/* Amount */}
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                inputMode="decimal"
                placeholder="100"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
              <div className="text-xs text-muted-foreground">
                Inline rate: <span className="font-medium">{inlineRate}</span>
              </div>
              {lastUpdated && (
                <div className="text-xs text-muted-foreground">
                  Updated: {new Date(lastUpdated).toLocaleString()}
                </div>
              )}
            </div>

            {/* From */}
            <div className="space-y-2">
              <Label htmlFor="from">From</Label>
              <Select value={from} onValueChange={(v) => setFrom(v)}>
                <SelectTrigger id="from">
                  <SelectValue placeholder="Base currency" />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map((c) => (
                    <SelectItem key={c.code} value={c.code}>
                      {c.code} — {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* To */}
            <div className="space-y-2">
              <Label htmlFor="to">To</Label>
              <Select value={to} onValueChange={(v) => setTo(v)}>
                <SelectTrigger id="to">
                  <SelectValue placeholder="Target currency" />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map((c) => (
                    <SelectItem key={c.code} value={c.code}>
                      {c.code} — {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Swap + Actions */}
            <div className="sm:col-span-2 lg:col-span-3 flex flex-wrap items-center gap-2">
              <Button variant="outline" className="gap-2" onClick={swap}>
                <ArrowLeftRight className="h-4 w-4" /> Swap
              </Button>
              <Button
                variant={isFavorite ? "default" : "outline"}
                className="gap-2"
                onClick={toggleFavorite}
              >
                <Sparkles className="h-4 w-4" /> {isFavorite ? "Favorited" : "Add Favorite"}
              </Button>
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => shareUrl && copy(shareUrl)}
              >
                <Link2 className="h-4 w-4" /> Copy Share Link
              </Button>
              <div className="ml-auto">
                <Badge
                  variant={
                    status === "ok"
                      ? "default"
                      : status === "cached"
                        ? "outline"
                        : status === "loading"
                          ? "outline"
                          : "destructive"
                  }
                >
                  {status === "loading"
                    ? "Fetching rates…"
                    : status === "ok"
                      ? "Live"
                      : status === "cached"
                        ? "Cached"
                        : "Error"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </GlassCard>

        {/* Results */}
        <GlassCard className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Result</CardTitle>
            <CardDescription>Calculated using the latest available rate.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border p-4">
              <div className="text-xs text-muted-foreground">Rate</div>
              <div className="mt-1 text-xl font-semibold">
                {rate ? `1 ${from} = ${formatNumber(rate)} ${to}` : "—"}
              </div>
              <div className="mt-1 text-xs text-muted-foreground">Provider: {PROVIDER}</div>
            </div>

            <div className="rounded-xl border p-4">
              <div className="text-xs text-muted-foreground">Converted Amount</div>
              <div className="mt-1 text-xl font-semibold">
                {rate ? `${formatNumber(Number(amount || 0) * rate)} ${to}` : "—"}
              </div>
            </div>
          </CardContent>
        </GlassCard>

        <Separator />

        {/* Favorites & Recent */}
        {(favorites.length > 0 || history.length > 0) && (
          <div className="grid gap-4 lg:grid-cols-2">
            {favorites.length > 0 && (
              <GlassCard className="shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base">Favorites</CardTitle>
                  <CardDescription>Quickly jump to your frequent pairs.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                  {favorites.map((f, i) => (
                    <Button
                      key={i}
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setFrom(f.from);
                        setTo(f.to);
                      }}
                    >
                      {f.from} → {f.to}
                    </Button>
                  ))}
                  {favorites.length === 0 && (
                    <p className="text-sm text-muted-foreground">No favorites yet.</p>
                  )}
                </CardContent>
              </GlassCard>
            )}

            {history.length > 0 && (
              <GlassCard className="shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base">Recent Conversions</CardTitle>
                  <CardDescription>Last 50 conversions are saved locally.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      onClick={exportHistoryCSV}
                    >
                      <Download className="h-4 w-4" /> Export CSV
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      onClick={() => {
                        setHistory([]);
                      }}
                    >
                      Clear
                    </Button>
                  </div>
                  <div className="overflow-auto rounded-md border">
                    <table className="w-full min-w-[640px] border-collapse text-sm">
                      <thead className="sticky top-0 bg-background/80 backdrop-blur">
                        <tr className="[&>th]:border-b [&>th]:px-3 [&>th]:py-2 text-muted-foreground">
                          <th className="text-left">Time</th>
                          <th className="text-left">Pair</th>
                          <th className="text-right">Amount</th>
                          <th className="text-right">Rate</th>
                          <th className="text-right">Result</th>
                          <th className="text-right">Copy</th>
                        </tr>
                      </thead>
                      <tbody>
                        {history.map((h, idx) => (
                          <tr key={idx} className="[&>td]:border-b [&>td]:px-3 [&>td]:py-2">
                            <td className="text-left">{new Date(h.ts).toLocaleString()}</td>
                            <td className="text-left">
                              {h.from} → {h.to}
                            </td>
                            <td className="text-right">{formatNumber(h.amount)}</td>
                            <td className="text-right">{formatNumber(h.rate)}</td>
                            <td className="text-right">{formatNumber(h.result)}</td>
                            <td className="text-right">
                              <Button
                                variant="outline"
                                size="sm"
                                className="gap-2"
                                onClick={() => navigator.clipboard.writeText(String(h.result))}
                              >
                                <Copy className="h-4 w-4" /> Copy
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </GlassCard>
            )}
          </div>
        )}
      </MotionGlassCard>
    </div>
  );
}
