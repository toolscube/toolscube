"use client";

import { ArrowLeftRight, Globe, Sparkles, TrendingUp } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActionButton,
  CopyButton,
  ExportCSVButton,
  ResetButton,
} from "@/components/shared/action-buttons";
import InputField from "@/components/shared/form-fields/input-field";
import SelectField from "@/components/shared/form-fields/select-field";
import ToolPageHeader from "@/components/shared/tool-page-header";
import { Badge } from "@/components/ui/badge";
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GlassCard } from "@/components/ui/glass-card";
import { Separator } from "@/components/ui/separator";

/* Config & Types */

const PROVIDER_LABEL = "exchangerate.host";
const CACHE_HOURS = 12;

type RatesMap = Record<string, number>;
type Favorite = { from: string; to: string };
type Status = "idle" | "loading" | "ok" | "cached" | "error";

const CURRENCIES: ReadonlyArray<{ code: string; name: string; symbol?: string }> = [
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
] as const;

/* Utils */
const qs = (k: string, fallback: string) => {
  if (typeof window === "undefined") return fallback;
  return new URLSearchParams(window.location.search).get(k) ?? fallback;
};

const setParams = (params: Record<string, string | number>) => {
  if (typeof window === "undefined") return;
  const url = new URL(window.location.href);

  Object.entries(params).forEach(([k, v]) => {
    url.searchParams.set(k, String(v));
  });

  window.history.replaceState({}, "", url.toString());
};

const nowISO = () => new Date().toISOString();
const hoursAgo = (iso: string) => (Date.now() - new Date(iso).getTime()) / 36e5;

function pairKey(from: string, to: string) {
  return `${from}_${to}`;
}

function formatNumber(n: number, decimals: number) {
  return new Intl.NumberFormat(undefined, { maximumFractionDigits: decimals }).format(n);
}

export default function CurrencyConverterClient() {
  // inputs
  const [amount, setAmount] = useState<string>(qs("amt", "100"));
  const [from, setFrom] = useState<string>(qs("from", "USD"));
  const [to, setTo] = useState<string>(qs("to", "BDT"));

  // display options
  const [decimals, setDecimals] = useState<number>(6);

  // data
  const [rates, setRates] = useState<RatesMap>({});
  const [base, setBase] = useState<string>(from);
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const [isStale, setIsStale] = useState<boolean>(false);
  const [status, setStatus] = useState<Status>("idle");

  // favorites & history (persisted)
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
  useEffect(() => {
    localStorage.setItem("cc_favorites", JSON.stringify(favorites));
  }, [favorites]);
  useEffect(() => {
    localStorage.setItem("cc_history", JSON.stringify(history.slice(0, 50)));
  }, [history]);

  // Keep URL synced for sharing
  useEffect(() => {
    setParams({ amt: amount || 0, from, to });
  }, [amount, from, to]);

  const fetchRates = useCallback(async (baseCode: string) => {
    setStatus("loading");
    setIsStale(false);
    try {
      const cacheKey = `cc_rates_${baseCode}`;
      const cachedRaw = localStorage.getItem(cacheKey);
      if (cachedRaw) {
        const cached = JSON.parse(cachedRaw) as {
          updatedAt: string;
          rates: RatesMap;
          provider?: string;
        };
        if (cached.updatedAt && hoursAgo(cached.updatedAt) < CACHE_HOURS) {
          setRates(cached.rates);
          setLastUpdated(cached.updatedAt);
          setStatus("cached");
          return;
        }
      }

      const res = await fetch(`/api/rates?base=${encodeURIComponent(baseCode)}`, {
        cache: "no-store",
      });
      if (!res.ok) throw new Error(`Rate API failed (${res.status})`);
      const data = (await res.json()) as {
        base: string;
        rates: RatesMap | null;
        provider: string;
        date?: string;
      };
      if (!data.rates) throw new Error("No rates in response");

      const updatedAt = data.date || nowISO();
      localStorage.setItem(
        `cc_rates_${baseCode}`,
        JSON.stringify({ updatedAt, rates: data.rates, provider: data.provider }),
      );

      setRates(data.rates);
      setLastUpdated(updatedAt);
      setStatus("ok");
    } catch {
      const cacheKey = `cc_rates_${baseCode}`;
      const cachedRaw = localStorage.getItem(cacheKey);
      if (cachedRaw) {
        const cached = JSON.parse(cachedRaw) as {
          updatedAt: string;
          rates: RatesMap;
          provider?: string;
        };
        setRates(cached.rates);
        setLastUpdated(cached.updatedAt);
        setIsStale(true);
        setStatus("cached");
      } else {
        setRates({});
        setLastUpdated("");
        setStatus("error");
      }
    }
  }, []);

  useEffect(() => {
    setBase(from);
  }, [from]);
  useEffect(() => {
    if (base) fetchRates(base);
  }, [base, fetchRates]);

  const amtNum = useMemo(() => Number(amount) || 0, [amount]);
  const rate = useMemo(() => rates?.[to] ?? 0, [rates, to]);
  const result = useMemo(() => amtNum * rate, [amtNum, rate]);
  const inverseRate = useMemo(() => (rate ? 1 / rate : 0), [rate]);

  const inlineRate = rate ? `1 ${from} = ${formatNumber(rate, decimals)} ${to}` : "—";
  const inlineInverse =
    inverseRate && Number.isFinite(inverseRate)
      ? `1 ${to} = ${formatNumber(inverseRate, decimals)} ${from}`
      : "—";

  const isFavorite = favorites.some((f) => f.from === from && f.to === to);

  /* Actions */
  function swap() {
    setFrom(to);
    setTo(from);
  }

  function resetAll() {
    setAmount("100");
    setFrom("USD");
    setTo("BDT");
    setDecimals(6);
    setBase("USD");
  }

  function convert() {
    if (!rate) return;
    setHistory((h) => [{ ts: nowISO(), from, to, amount: amtNum, result, rate }, ...h]);
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

  const csvRows = useMemo<(string | number)[][]>(() => {
    if (!history.length) return [];
    return [
      ["Time", "From", "To", "Amount", "Rate", "Result"],
      ...history.map((h) => [h.ts, h.from, h.to, h.amount, h.rate, h.result]),
    ];
  }, [history]);

  const currencyOptions = useMemo(
    () =>
      CURRENCIES.map((c) => ({
        value: c.code,
        label: (
          <div className="flex items-center justify-between">
            <span>
              {c.code} — {c.name}
            </span>
            {c.symbol && <span className="ml-2 text-muted-foreground">{c.symbol}</span>}
          </div>
        ),
      })),
    [],
  );

  return (
    <>
      {/* Header */}
      <ToolPageHeader
        icon={Globe}
        title="Currency Converter"
        description={`Convert currencies with live rates (${PROVIDER_LABEL}). Cached for ${CACHE_HOURS}h to load fast.`}
        actions={
          <>
            <ResetButton onClick={resetAll} />
            <ActionButton icon={TrendingUp} label="Convert" onClick={convert} disabled={!rate} />
          </>
        }
      />

      {/* Inputs */}
      <GlassCard>
        <CardHeader>
          <CardTitle className="text-base">Amount & Currencies</CardTitle>
          <CardDescription>Pick currencies and set the amount to convert.</CardDescription>
        </CardHeader>

        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* Amount */}
          <div className="space-y-2">
            <InputField
              id="amount"
              label="Amount"
              inputMode="decimal"
              placeholder="100"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <div className="text-xs text-muted-foreground">
              Rate: <span className="font-medium">{inlineRate}</span>
              {inverseRate ? (
                <>
                  {" • "}
                  <span className="font-medium">{inlineInverse}</span>
                </>
              ) : null}
            </div>
            {!!lastUpdated && (
              <div className="text-xs text-muted-foreground">
                Updated: {new Date(lastUpdated).toLocaleString()} {isStale ? "(stale)" : ""}
              </div>
            )}
          </div>

          {/* From */}
          <SelectField
            label="From"
            value={from}
            onValueChange={(v) => setFrom(v as string)}
            options={currencyOptions}
          />

          {/* To */}
          <SelectField
            label="To"
            value={to}
            onValueChange={(v) => setTo(v as string)}
            options={currencyOptions}
          />

          {/* Options row */}
          <div className="sm:col-span-2 lg:col-span-3 flex flex-wrap items-center gap-2">
            <ActionButton variant="outline" icon={ArrowLeftRight} label="Swap" onClick={swap} />
            <ActionButton
              variant={isFavorite ? "default" : "outline"}
              icon={Sparkles}
              label={isFavorite ? "Favorited" : "Add Favorite"}
              onClick={toggleFavorite}
            />
            <CopyButton
              variant="outline"
              label="Copy Share Link"
              getText={() => (typeof window !== "undefined" ? window.location.href : "")}
              disabled={typeof window === "undefined"}
            />
            <div className="ml-auto flex items-center gap-3">
              <InputField
                id="decimals"
                label="Decimals"
                type="number"
                min={0}
                max={10}
                value={decimals}
                onChange={(e) =>
                  setDecimals(Math.min(10, Math.max(0, Number(e.target.value) || 0)))
                }
                className="w-28"
              />
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
                  ? "Fetching…"
                  : status === "ok"
                    ? "Live"
                    : status === "cached"
                      ? isStale
                        ? "Cached (stale)"
                        : "Cached"
                      : "Error"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </GlassCard>

      {/* Results */}
      <GlassCard className="my-4">
        <CardHeader>
          <CardTitle className="text-base">Result</CardTitle>
          <CardDescription>Calculated using the latest available rate.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border p-4">
            <div className="text-xs text-muted-foreground">Rate</div>
            <div className="mt-1 text-xl font-semibold">
              {rate ? `1 ${from} = ${formatNumber(rate, decimals)} ${to}` : "—"}
            </div>
            <div className="mt-1 text-xs text-muted-foreground">Provider: {PROVIDER_LABEL}</div>
            <div className="mt-2">
              <CopyButton
                size="sm"
                label="Copy rate"
                getText={() => (rate ? `1 ${from} = ${rate} ${to}` : "")}
                disabled={!rate}
              />
            </div>
          </div>

          <div className="rounded-xl border p-4">
            <div className="text-xs text-muted-foreground">Converted Amount</div>
            <div className="mt-1 text-xl font-semibold">
              {rate ? `${formatNumber(result, decimals)} ${to}` : "—"}
            </div>
            <div className="mt-2">
              <CopyButton
                size="sm"
                label="Copy amount"
                getText={() => (rate ? String(result) : "")}
                disabled={!rate}
              />
            </div>
          </div>
        </CardContent>
      </GlassCard>

      <Separator />

      {/* Favorites & Recent */}
      {(favorites.length > 0 || history.length > 0) && (
        <div className="grid gap-4 lg:grid-cols-2">
          {favorites.length > 0 && (
            <GlassCard>
              <CardHeader>
                <CardTitle className="text-base">Favorites</CardTitle>
                <CardDescription>Quickly jump to your frequent pairs.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {favorites.map((f, i) => (
                  <ActionButton
                    key={`${f.from}-${f.to}-${i as number}`}
                    variant="outline"
                    size="sm"
                    label={`${f.from} → ${f.to}`}
                    onClick={() => {
                      setFrom(f.from);
                      setTo(f.to);
                    }}
                  />
                ))}
              </CardContent>
            </GlassCard>
          )}

          {history.length > 0 && (
            <GlassCard>
              <CardHeader>
                <CardTitle className="text-base">Recent Conversions</CardTitle>
                <CardDescription>Last 50 conversions are saved locally.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <ExportCSVButton
                    variant="outline"
                    icon={TrendingUp}
                    label="Export CSV"
                    disabled={!history.length}
                    filename="currency-history.csv"
                    getRows={() => csvRows}
                  />
                  <ActionButton variant="outline" label="Clear" onClick={() => setHistory([])} />
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
                        <tr key={idx as number} className="[&>td]:border-b [&>td]:px-3 [&>td]:py-2">
                          <td className="text-left">{new Date(h.ts).toLocaleString()}</td>
                          <td className="text-left">
                            {h.from} → {h.to}
                          </td>
                          <td className="text-right">{formatNumber(h.amount, decimals)}</td>
                          <td className="text-right">{formatNumber(h.rate, decimals)}</td>
                          <td className="text-right">{formatNumber(h.result, decimals)}</td>
                          <td className="text-right">
                            <CopyButton size="sm" label="Copy" getText={() => String(h.result)} />
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
    </>
  );
}
