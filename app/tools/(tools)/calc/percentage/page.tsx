"use client";

import { Calculator, FunctionSquare, Percent } from "lucide-react";
import * as React from "react";
import {
  ActionButton,
  CopyButton,
  ExportCSVButton,
  LinkButton,
  ResetButton,
} from "@/components/shared/action-buttons";
import InputField from "@/components/shared/form-fields/input-field";
import ToolPageHeader from "@/components/shared/tool-page-header";
import { GlassCard, MotionGlassCard } from "@/components/ui/glass-card";
import { Separator } from "@/components/ui/separator";

/* utils */
const toNum = (s: string) => {
  const n = Number(String(s).replace(/,/g, "").trim());
  return Number.isFinite(n) ? n : NaN;
};
const pretty = (n: number, max = 2) =>
  new Intl.NumberFormat(undefined, { maximumFractionDigits: max }).format(n);

export default function PercentageCalculatorClient() {
  const [part, setPart] = React.useState("");
  const [whole, setWhole] = React.useState("");
  const [percent, setPercent] = React.useState("");
  const [base, setBase] = React.useState("");
  const [changePct, setChangePct] = React.useState("");

  // presets for quick taps
  const pctPresets = React.useMemo(() => [5, 10, 12.5, 15, 18, 20, 25, 30, 40, 50], []);

  // X is what % of Y?  |  What is R% of Y?
  const { percentOfWhole, valueOfPercent } = React.useMemo(() => {
    const p = toNum(part);
    const w = toNum(whole);
    const r = toNum(percent);

    const percentOfWhole =
      Number.isFinite(p) && Number.isFinite(w) && w !== 0 ? (p / w) * 100 : null;

    const valueOfPercent = Number.isFinite(w) && Number.isFinite(r) ? (w * r) / 100 : null;

    return { percentOfWhole, valueOfPercent };
  }, [part, whole, percent]);

  // Increase / Decrease by %
  const { incVal, decVal } = React.useMemo(() => {
    const b = toNum(base);
    const c = toNum(changePct);
    if (!Number.isFinite(b) || !Number.isFinite(c))
      return { incVal: null as number | null, decVal: null as number | null };
    return { incVal: b * (1 + c / 100), decVal: b * (1 - c / 100) };
  }, [base, changePct]);

  const resetAll = React.useCallback(() => {
    setPart("");
    setWhole("");
    setPercent("");
    setBase("");
    setChangePct("");
  }, []);

  const rowsForCSV = React.useCallback(() => {
    const rows: (string | number)[][] = [
      ["Section", "Input A", "Input B", "Result"],
      [
        "X is what % of Y?",
        part || "—",
        whole || "—",
        percentOfWhole != null ? `${percentOfWhole.toFixed(4)}%` : "—",
      ],
      [
        "What is R% of Y?",
        percent || "—",
        whole || "—",
        valueOfPercent != null ? valueOfPercent.toFixed(4) : "—",
      ],
      ["Increase by %", base || "—", changePct || "—", incVal != null ? incVal.toFixed(4) : "—"],
      ["Decrease by %", base || "—", changePct || "—", decVal != null ? decVal.toFixed(4) : "—"],
    ];
    return rows;
  }, [part, whole, percent, base, changePct, percentOfWhole, valueOfPercent, incVal, decVal]);

  return (
    <>
      <ToolPageHeader
        icon={Percent}
        title="Percentage Calculator"
        description="Find percentages fast: what percent, percent of, and increase/decrease by %."
        actions={
          <>
            <ResetButton onClick={resetAll} />
            <ExportCSVButton
              variant="default"
              filename="percentage-results.csv"
              getRows={rowsForCSV}
            />
          </>
        }
      />

      {/* Quick nav */}
      <GlassCard className="px-4 py-3">
        <div className="mb-1 flex flex-wrap gap-2">
          <LinkButton size="sm" icon={Calculator} label="Standard" href="/tools/calc/standard" />
          <LinkButton
            size="sm"
            icon={FunctionSquare}
            label="Scientific"
            href="/tools/calc/scientific"
          />
          <LinkButton
            size="sm"
            variant="default"
            icon={Percent}
            label="Percentage"
            href="/tools/calc/percentage"
          />
        </div>
      </GlassCard>

      <Separator className="my-4" />

      <MotionGlassCard>
        <div className="grid gap-6 sm:grid-cols-2">
          {/* X is what % of Y */}
          <GlassCard className="p-4">
            <div className="grid gap-3">
              <div className="text-sm font-medium">X is what % of Y?</div>
              <div className="grid gap-2 sm:grid-cols-2">
                <InputField
                  label="X"
                  inputMode="decimal"
                  value={part}
                  onChange={(e) => setPart(e.target.value)}
                />
                <InputField
                  label="Y"
                  inputMode="decimal"
                  value={whole}
                  onChange={(e) => setWhole(e.target.value)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Result:&nbsp;
                  <span className="font-medium">
                    {percentOfWhole != null ? `${percentOfWhole.toFixed(2)}%` : "—"}
                  </span>
                </div>
                <CopyButton
                  size="sm"
                  label="Copy"
                  disabled={percentOfWhole == null}
                  getText={() => `${percentOfWhole?.toFixed(4)}%`}
                />
              </div>
            </div>
          </GlassCard>

          {/* What is R% of Y */}
          <GlassCard className="p-4">
            <div className="grid gap-3">
              <div className="text-sm font-medium">What is R% of Y?</div>
              <div className="grid gap-2 sm:grid-cols-2">
                <InputField
                  label="R %"
                  inputMode="decimal"
                  value={percent}
                  onChange={(e) => setPercent(e.target.value)}
                />
                <InputField
                  label="Y"
                  inputMode="decimal"
                  value={whole}
                  onChange={(e) => setWhole(e.target.value)}
                />
              </div>

              {/* quick presets */}
              <div className="flex flex-wrap gap-2">
                {pctPresets.map((p) => (
                  <ActionButton
                    key={p}
                    size="sm"
                    variant={Number(toNum(percent)) === p ? "default" : "outline"}
                    label={`${p}%`}
                    onClick={() => setPercent(String(p))}
                  />
                ))}
              </div>

              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Result:&nbsp;
                  <span className="font-medium">
                    {valueOfPercent != null ? pretty(valueOfPercent, 4) : "—"}
                  </span>
                </div>
                <CopyButton
                  size="sm"
                  label="Copy"
                  disabled={valueOfPercent == null}
                  getText={() => String(valueOfPercent)}
                />
              </div>
            </div>
          </GlassCard>
        </div>

        <Separator />

        {/* Increase / Decrease by % */}
        <GlassCard className="p-4">
          <div className="grid gap-3">
            <div className="text-sm font-medium">Increase / Decrease by %</div>
            <div className="grid gap-2 sm:grid-cols-2">
              <InputField
                label="Base"
                inputMode="decimal"
                value={base}
                onChange={(e) => setBase(e.target.value)}
              />
              <InputField
                label="Change %"
                inputMode="decimal"
                value={changePct}
                onChange={(e) => setChangePct(e.target.value)}
              />
            </div>

            {/* quick presets */}
            <div className="flex flex-wrap gap-2">
              {pctPresets.map((p) => (
                <ActionButton
                  key={`chg-${p}`}
                  size="sm"
                  variant={Number(toNum(changePct)) === p ? "default" : "outline"}
                  label={`${p}%`}
                  onClick={() => setChangePct(String(p))}
                />
              ))}
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              <ResultBox
                label="Increase to"
                value={incVal != null ? pretty(incVal, 4) : "—"}
                copyText={incVal != null ? String(incVal) : ""}
              />
              <ResultBox
                label="Decrease to"
                value={decVal != null ? pretty(decVal, 4) : "—"}
                copyText={decVal != null ? String(decVal) : ""}
              />
            </div>
          </div>
        </GlassCard>
      </MotionGlassCard>
    </>
  );
}

/* tiny presentational piece */
function ResultBox({
  label,
  value,
  copyText,
}: {
  label: string;
  value: string;
  copyText?: string;
}) {
  return (
    <div className="rounded-xl border p-3">
      <div className="mb-1 flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{label}</span>
        <CopyButton size="sm" disabled={!copyText} getText={() => copyText || ""} />
      </div>
      <div className="text-lg font-semibold tabular-nums">{value}</div>
    </div>
  );
}
