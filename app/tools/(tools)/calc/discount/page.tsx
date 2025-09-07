"use client";

import { ArrowLeftRight, Calculator, Copy, Download, Minus, Plus, Tag } from "lucide-react";
import * as React from "react";
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
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

/* Types & helpers */
type Currency = "BDT" | "USD" | "INR";
type Mode = "forward" | "reverse";

type HistoryItem = {
  ts: string;
  mode: Mode;
  original: number;
  discountPct: number;
  extraPct: number;
  fixedOff: number;
  taxPct: number;
  qty: number;
  finalEach: number;
  finalTotal: number;
  effectivePct: number;
};

type FormState = {
  currency: Currency;
  mode: Mode;
  original: string;
  discountPct: string;
  extraPct: string;
  fixedOff: string;
  taxPct: string;
  qty: string;
  targetFinal: string;
  compare: string;
};

const HISTORY_KEY = "df_history";

function parseNum(n: string | number): number {
  const v = typeof n === "number" ? n : Number(String(n).replace(/,/g, "").trim());
  return Number.isFinite(v) ? v : 0;
}

function fmt(n: number, currency: Currency) {
  const locale = currency === "USD" ? "en-US" : "en-IN";
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(Math.round(n * 100) / 100);
}

function qs(k: string, fallback: string) {
  if (typeof window === "undefined") return fallback;
  return new URLSearchParams(window.location.search).get(k) ?? fallback;
}

function setParams(params: Record<string, string | number>) {
  if (typeof window === "undefined") return;
  const url = new URL(window.location.href);
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, String(v)); // no implicit return in loop
  }
  window.history.replaceState({}, "", url.toString());
}

const currencyOptions = [
  { value: "BDT", label: <span>BDT — Bangladeshi Taka (৳)</span> },
  { value: "USD", label: <span>USD — US Dollar ($)</span> },
  { value: "INR", label: <span>INR — Indian Rupee (₹)</span> },
];

export default function DiscountFinderClient() {
  // Single state for all form inputs
  const [form, setForm] = React.useState<FormState>(() => ({
    currency: (qs("c", "BDT") as Currency) || "BDT",
    mode: (qs("m", "forward") as Mode) || "forward",
    original: qs("op", "1200") || "1200",
    discountPct: qs("dp", "15") || "15",
    extraPct: qs("xp", "0") || "0",
    fixedOff: qs("fx", "0") || "0",
    taxPct: qs("tx", "0") || "0",
    qty: qs("q", "1") || "1",
    targetFinal: qs("tf", "") || "",
    compare: qs("cmp", "") || "",
  }));

  const updateForm = (patch: Partial<FormState>) => setForm((s) => ({ ...s, ...patch }));

  const [history, setHistory] = React.useState<HistoryItem[]>([]);
  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(HISTORY_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      if (Array.isArray(parsed)) setHistory(parsed);
    } catch {}
  }, []);
  React.useEffect(() => {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 50)));
  }, [history]);

  // Keep URL synced
  React.useEffect(() => {
    const {
      currency,
      mode,
      original,
      discountPct,
      extraPct,
      fixedOff,
      taxPct,
      qty,
      targetFinal,
      compare,
    } = form;
    setParams({
      c: currency,
      m: mode,
      op: parseNum(original),
      dp: parseNum(discountPct),
      xp: parseNum(extraPct),
      fx: parseNum(fixedOff),
      tx: parseNum(taxPct),
      q: Math.max(1, parseNum(qty)),
      tf: parseNum(targetFinal),
      cmp: parseNum(compare),
    });
  }, [form]);

  const o = React.useMemo(() => Math.max(0, parseNum(form.original)), [form.original]);
  const dp = React.useMemo(() => Math.max(0, parseNum(form.discountPct)), [form.discountPct]);
  const xp = React.useMemo(() => Math.max(0, parseNum(form.extraPct)), [form.extraPct]);
  const fx = React.useMemo(() => Math.max(0, parseNum(form.fixedOff)), [form.fixedOff]);
  const tx = React.useMemo(() => Math.max(0, parseNum(form.taxPct)), [form.taxPct]);
  const q = React.useMemo(() => Math.max(1, parseNum(form.qty)), [form.qty]);
  const cmp = React.useMemo(() => Math.max(0, parseNum(form.compare)), [form.compare]);
  const tf = React.useMemo(() => Math.max(0, parseNum(form.targetFinal)), [form.targetFinal]);

  const {
    discountedEachBeforeTax,
    taxEach,
    finalEach,
    finalTotal,
    totalSavings,
    totalSavingsPct,
    effectivePct,
    needPctForTarget,
  } = React.useMemo(() => {
    const afterFirst = o * (1 - dp / 100);
    const afterSecond = afterFirst * (1 - xp / 100);
    const discountedEachBeforeTax = Math.max(0, afterSecond - fx);
    const taxEach = (discountedEachBeforeTax * tx) / 100;
    const finalEach = discountedEachBeforeTax + taxEach;
    const finalTotal = finalEach * q;

    const originalTotal = o * q;
    const totalSavings = Math.max(0, originalTotal - finalTotal);
    const totalSavingsPct = originalTotal > 0 ? (totalSavings / originalTotal) * 100 : 0;

    const effectivePct = o > 0 ? ((o - discountedEachBeforeTax) / o) * 100 : 0;

    let needPctForTarget = 0;
    if (o > 0 && 1 - xp / 100 > 0 && tf > 0) {
      const rhs = tf / (1 + tx / 100) + fx;
      const denom = o * (1 - xp / 100);
      const oneMinusDp = denom > 0 ? rhs / denom : 0;
      needPctForTarget = (1 - oneMinusDp) * 100;
      if (!Number.isFinite(needPctForTarget)) needPctForTarget = 0;
    }

    return {
      discountedEachBeforeTax,
      taxEach,
      finalEach,
      finalTotal,
      totalSavings,
      totalSavingsPct,
      effectivePct,
      needPctForTarget,
    };
  }, [o, dp, xp, fx, tx, q, tf]);

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";

  function resetAll() {
    updateForm({
      currency: "BDT",
      mode: "forward",
      original: "1200",
      discountPct: "15",
      extraPct: "0",
      fixedOff: "0",
      taxPct: "0",
      qty: "1",
      compare: "",
      targetFinal: "",
    });
  }

  function saveHistory() {
    setHistory((h) => [
      {
        ts: new Date().toISOString(),
        mode: form.mode,
        original: o,
        discountPct: dp,
        extraPct: xp,
        fixedOff: fx,
        taxPct: tx,
        qty: q,
        finalEach,
        finalTotal,
        effectivePct,
      },
      ...h,
    ]);
  }

  const currentRows = React.useMemo<(string | number)[][]>(
    () => [
      ["Currency", form.currency],
      ["Mode", form.mode],
      ["Original (each)", o],
      ["Discount %", dp],
      ["Extra %", xp],
      ["Fixed Off (each)", fx],
      ["Tax %", tx],
      ["Quantity", q],
      ["Price After Discounts (pre-tax, each)", discountedEachBeforeTax],
      ["Tax (each)", taxEach],
      ["Final (each)", finalEach],
      ["Final (total)", finalTotal],
      ["Effective Discount % (pre-tax)", effectivePct.toFixed(2)],
      ...(form.mode === "reverse" && tf
        ? [
            [
              "Required % Discount for target",
              Number.isFinite(needPctForTarget) ? needPctForTarget.toFixed(2) : "—",
            ],
          ]
        : []),
    ],
    [
      form.currency,
      form.mode,
      o,
      dp,
      xp,
      fx,
      tx,
      q,
      discountedEachBeforeTax,
      taxEach,
      finalEach,
      finalTotal,
      effectivePct,
      needPctForTarget,
      tf,
    ],
  );

  const historyRows = React.useMemo<(string | number)[][]>(
    () => [
      [
        "Time",
        "Mode",
        "Original",
        "Discount %",
        "Extra %",
        "Fixed Off",
        "Tax %",
        "Qty",
        "Final Each",
        "Final Total",
        "Effective %",
      ],
      ...history.map((r) => [
        r.ts,
        r.mode,
        r.original,
        r.discountPct,
        r.extraPct,
        r.fixedOff,
        r.taxPct,
        r.qty,
        r.finalEach,
        r.finalTotal,
        r.effectivePct,
      ]),
    ],
    [history],
  );

  const summaryText = React.useMemo(
    () =>
      `Original: ${fmt(o, form.currency)} | Disc: ${dp}% + ${xp}% & -${fmt(
        fx,
        form.currency,
      )} | Tax: ${tx}% | Final(each): ${fmt(finalEach, form.currency)} | Total: ${fmt(
        finalTotal,
        form.currency,
      )} | Savings: ${fmt(totalSavings, form.currency)} (${totalSavingsPct.toFixed(2)}%)`,
    [o, form.currency, dp, xp, fx, tx, finalEach, finalTotal, totalSavings, totalSavingsPct],
  );

  const discountPresets = React.useMemo(() => [5, 10, 12.5, 15, 20, 25, 30, 40, 50, 60, 70], []);

  return (
    <>
      <ToolPageHeader
        icon={Tag}
        title="Discount Finder"
        description="Before/after price, savings, and effective discount."
        actions={
          <>
            <ResetButton onClick={resetAll} />
            <ActionButton
              icon={ArrowLeftRight}
              label={form.mode === "forward" ? "Switch to Reverse" : "Switch to Forward"}
              onClick={() => updateForm({ mode: form.mode === "forward" ? "reverse" : "forward" })}
            />
            <ActionButton
              variant="default"
              icon={Calculator}
              label="Save Result"
              onClick={saveHistory}
            />
          </>
        }
      />

      {/* Inputs */}
      <GlassCard className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Inputs</CardTitle>
          <CardDescription>
            Enter original price and discounts. Use Reverse to solve for a target.
          </CardDescription>
        </CardHeader>

        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* Currency */}
          <SelectField
            label="Currency"
            value={form.currency}
            onValueChange={(v) => updateForm({ currency: v as Currency })}
            options={currencyOptions}
          />

          {/* Original */}
          <InputField
            label="Original Price (each)"
            id="original"
            inputMode="decimal"
            value={form.original}
            onChange={(e) => updateForm({ original: e.target.value })}
            placeholder="e.g. 1200"
          />

          {/* Quantity with stepper */}
          <div className="space-y-2">
            <Label htmlFor="qty">Quantity</Label>
            <div className="flex items-center gap-2">
              <ActionButton
                variant="outline"
                size="icon"
                icon={Minus}
                aria-label="decrease quantity"
                onClick={() => updateForm({ qty: String(Math.max(1, parseNum(form.qty) - 1)) })}
              />
              <InputField
                id="qty"
                inputMode="numeric"
                value={form.qty}
                onChange={(e) => updateForm({ qty: e.target.value })}
              />
              <ActionButton
                variant="outline"
                size="icon"
                icon={Plus}
                aria-label="increase quantity"
                onClick={() => updateForm({ qty: String(Math.max(1, parseNum(form.qty) + 1)) })}
              />
            </div>
          </div>

          {/* Discount % */}
          <div className="space-y-2">
            <InputField
              label="Discount (%)"
              id="discount"
              inputMode="decimal"
              value={form.discountPct}
              onChange={(e) => updateForm({ discountPct: e.target.value })}
            />
            <div className="flex flex-wrap gap-1">
              {discountPresets.map((p) => (
                <Badge
                  key={p}
                  variant={parseNum(form.discountPct) === p ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => updateForm({ discountPct: String(p) })}
                >
                  {p}%
                </Badge>
              ))}
            </div>
          </div>

          {/* Extra % */}
          <InputField
            label="Extra Discount (%)"
            id="extra"
            inputMode="decimal"
            value={form.extraPct}
            onChange={(e) => updateForm({ extraPct: e.target.value })}
            placeholder="e.g. 5"
          />

          {/* Fixed off */}
          <InputField
            label="Fixed Off (each)"
            id="fixed"
            inputMode="decimal"
            value={form.fixedOff}
            onChange={(e) => updateForm({ fixedOff: e.target.value })}
            placeholder="e.g. 100"
          />

          {/* Tax */}
          <InputField
            label="Tax (%)"
            id="tax"
            inputMode="decimal"
            value={form.taxPct}
            onChange={(e) => updateForm({ taxPct: e.target.value })}
            placeholder="e.g. 0 or 7.5"
          />

          {/* Compare */}
          <InputField
            label="Competitor Price (each, optional)"
            id="compare"
            inputMode="decimal"
            value={form.compare}
            onChange={(e) => updateForm({ compare: e.target.value })}
            placeholder="e.g. 999"
          />

          {/* Reverse target */}
          {form.mode === "reverse" && (
            <InputField
              label="Target Final Price (each)"
              id="target"
              inputMode="decimal"
              value={form.targetFinal}
              onChange={(e) => updateForm({ targetFinal: e.target.value })}
              placeholder="e.g. 950"
            />
          )}
        </CardContent>
      </GlassCard>

      {/* Results */}
      <GlassCard className="my-4">
        <CardHeader>
          <CardTitle className="text-base">Results</CardTitle>
          <CardDescription>
            Pre-tax vs final price, savings, and effective discount.
          </CardDescription>
        </CardHeader>

        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border p-4">
            <div className="text-xs text-muted-foreground">
              Price After Discounts (pre-tax, each)
            </div>
            <div className="mt-1 text-xl font-semibold">
              {fmt(discountedEachBeforeTax, form.currency)}
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              Effective discount: {effectivePct.toFixed(2)}%
            </div>
          </div>

          <div className="rounded-xl border p-4">
            <div className="text-xs text-muted-foreground">Tax (each)</div>
            <div className="mt-1 text-xl font-semibold">{fmt(taxEach, form.currency)}</div>
            <div className="mt-1 text-xs text-muted-foreground">{tx}%</div>
          </div>

          <div className="rounded-xl border p-4">
            <div className="text-xs text-muted-foreground">Final Price (each)</div>
            <div className="mt-1 text-xl font-semibold">{fmt(finalEach, form.currency)}</div>
            <div className="mt-1 text-xs text-muted-foreground">Per unit</div>
          </div>

          <div className="rounded-xl border p-4">
            <div className="text-xs text-muted-foreground">Final Total</div>
            <div className="mt-1 text-xl font-semibold">{fmt(finalTotal, form.currency)}</div>
            <div className="mt-1 text-xs text-muted-foreground">Qty: {q}</div>
          </div>

          <div className="rounded-xl border p-4 sm:col-span-2 lg:col-span-2">
            <div className="text-xs text-muted-foreground">Savings</div>
            <div className="mt-1 text-xl font-semibold">
              {fmt(totalSavings, form.currency)} ({totalSavingsPct.toFixed(2)}%)
            </div>
            {cmp > 0 && (
              <div className="mt-1 text-xs text-muted-foreground">
                vs competitor: {fmt(cmp, form.currency)} — You save{" "}
                {fmt(Math.max(0, (cmp - finalEach) * q), form.currency)} total
              </div>
            )}
          </div>

          {form.mode === "reverse" && (
            <div className="rounded-xl border p-4 sm:col-span-2 lg:col-span-2">
              <div className="text-xs text-muted-foreground">Required % Discount for target</div>
              <div className="mt-1 text-xl font-semibold">
                {Number.isFinite(needPctForTarget) ? `${needPctForTarget.toFixed(2)}%` : "—"}
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                To reach {tf ? fmt(tf, form.currency) : "target"} per unit (final, after tax).
              </div>
            </div>
          )}
        </CardContent>
      </GlassCard>

      <Separator />

      {/* Actions */}
      <div className="flex flex-wrap gap-2 mt-4">
        <CopyButton label="Copy Summary" icon={Copy} getText={() => summaryText} />
        <CopyButton
          label="Copy Share Link"
          icon={Copy}
          getText={() => (shareUrl ? shareUrl : "")}
        />

        <ExportCSVButton
          filename="discount-current.csv"
          label="Export This Calc"
          icon={Download}
          variant="outline"
          getRows={async () => currentRows}
        />

        {history.length > 0 && (
          <ExportCSVButton
            filename="discount-history.csv"
            label="Export History"
            icon={Download}
            variant="outline"
            getRows={async () => historyRows}
          />
        )}

        {history.length > 0 && (
          <ActionButton variant="outline" label="Clear History" onClick={() => setHistory([])} />
        )}
      </div>

      {/* History */}
      {history.length > 0 && (
        <GlassCard className="mt-4">
          <CardHeader>
            <CardTitle className="text-base">Recent Calculations</CardTitle>
            <CardDescription>Last 50 are stored locally.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-auto rounded-md border">
              <table className="w-full min-w-[860px] border-collapse text-sm">
                <thead className="sticky top-0 bg-background/80 backdrop-blur">
                  <tr className="[&>th]:border-b [&>th]:px-3 [&>th]:py-2 text-muted-foreground">
                    <th className="text-left">Time</th>
                    <th className="text-left">Mode</th>
                    <th className="text-right">Original</th>
                    <th className="text-right">Disc %</th>
                    <th className="text-right">Extra %</th>
                    <th className="text-right">Fixed</th>
                    <th className="text-right">Tax %</th>
                    <th className="text-right">Qty</th>
                    <th className="text-right">Final(each)</th>
                    <th className="text-right">Final(total)</th>
                    <th className="text-right">Effective %</th>
                    <th className="text-right">Copy</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((h, idx) => (
                    <tr key={idx as number} className="[&>td]:border-b [&>td]:px-3 [&>td]:py-2">
                      <td className="text-left">{new Date(h.ts).toLocaleString()}</td>
                      <td className="text-left">{h.mode === "forward" ? "Forward" : "Reverse"}</td>
                      <td className="text-right">{fmt(h.original, form.currency)}</td>
                      <td className="text-right">{h.discountPct}</td>
                      <td className="text-right">{h.extraPct}</td>
                      <td className="text-right">{fmt(h.fixedOff, form.currency)}</td>
                      <td className="text-right">{h.taxPct}</td>
                      <td className="text-right">{h.qty}</td>
                      <td className="text-right">{fmt(h.finalEach, form.currency)}</td>
                      <td className="text-right">{fmt(h.finalTotal, form.currency)}</td>
                      <td className="text-right">{h.effectivePct.toFixed(2)}</td>
                      <td className="text-right">
                        <CopyButton
                          size="sm"
                          label="Copy"
                          getText={() =>
                            `Mode: ${h.mode} | Original: ${h.original} | Disc: ${h.discountPct}% + ${h.extraPct}% | Fixed: ${h.fixedOff} | Tax: ${h.taxPct}% | Qty: ${h.qty} | Final(each): ${h.finalEach} | Final(total): ${h.finalTotal} | Effective: ${h.effectivePct.toFixed(2)}%`
                          }
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </GlassCard>
      )}
    </>
  );
}
