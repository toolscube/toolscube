"use client";

import {
  ArrowLeftRight,
  Copy,
  Info,
  Ruler,
  Scale,
  Settings,
  Sparkles,
  Table2,
  ThermometerSun,
} from "lucide-react";
import { type JSX, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { ActionButton, ResetButton } from "@/components/shared/action-buttons";
import { InputField } from "@/components/shared/form-fields/input-field";
import ToolPageHeader from "@/components/shared/tool-page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GlassCard } from "@/components/ui/glass-card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const CATEGORIES = ["Length", "Weight", "Temperature"] as const;
type Category = (typeof CATEGORIES)[number];

const UNITS: Record<Category, readonly string[]> = {
  Length: ["m", "km", "cm", "mm", "mi", "yd", "ft", "in"] as const,
  Weight: ["kg", "g", "lb", "oz"] as const,
  Temperature: ["C", "F", "K"] as const,
};

const ICON_BY_CATEGORY: Record<Category, JSX.Element> = {
  Length: <Ruler className="h-4 w-4" />,
  Weight: <Scale className="h-4 w-4" />,
  Temperature: <ThermometerSun className="h-4 w-4" />,
};

// Conversion helpers
const lengthToBase: Record<string, number> = {
  m: 1,
  km: 1000,
  cm: 0.01,
  mm: 0.001,
  mi: 1609.344,
  yd: 0.9144,
  ft: 0.3048,
  in: 0.0254,
};
const weightToBase: Record<string, number> = {
  kg: 1,
  g: 0.001,
  lb: 0.45359237,
  oz: 0.028349523125,
};
const lengthFromBase: Record<string, number> = {
  m: 1,
  km: 1 / 1000,
  cm: 100,
  mm: 1000,
  mi: 1 / 1609.344,
  yd: 1 / 0.9144,
  ft: 1 / 0.3048,
  in: 1 / 0.0254,
};
const weightFromBase: Record<string, number> = {
  kg: 1,
  g: 1000,
  lb: 1 / 0.45359237,
  oz: 1 / 0.028349523125,
};

function toBase(category: Category, value: number, unit: string): number {
  switch (category) {
    case "Length":
      return value * (lengthToBase[unit] ?? 1);
    case "Weight":
      return value * (weightToBase[unit] ?? 1);
    case "Temperature":
      if (unit === "C") return value;
      if (unit === "F") return (value - 32) * (5 / 9);
      if (unit === "K") return value - 273.15;
      return value;
  }
}

function fromBase(category: Category, baseValue: number, unit: string): number {
  switch (category) {
    case "Length":
      return baseValue * (lengthFromBase[unit] ?? 1);
    case "Weight":
      return baseValue * (weightFromBase[unit] ?? 1);
    case "Temperature":
      if (unit === "C") return baseValue;
      if (unit === "F") return baseValue * (9 / 5) + 32;
      if (unit === "K") return baseValue + 273.15;
      return baseValue;
  }
}

const nf = new Intl.NumberFormat(undefined, { maximumSignificantDigits: 8 });
const pretty = (n: number | null) => (n == null || !Number.isFinite(n) ? "—" : nf.format(n));

export default function UnitConverterClient() {
  const [category, setCategory] = useState<Category>("Length");
  const [fromUnit, setFromUnit] = useState<string>(UNITS["Length"][0]);
  const [toUnit, setToUnit] = useState<string>(UNITS["Length"][1]);
  const [amount, setAmount] = useState<string>("1");
  const [copied, setCopied] = useState(false);
  const [showTable, setShowTable] = useState(false);

  const sanitize = (raw: string) => {
    const allowMinus = category === "Temperature";
    let v = raw.replace(/[^\d.-]/g, "");
    if (!allowMinus) v = v.replace(/-/g, "");
    const parts = v.split(".");
    if (parts.length > 2) v = `${parts[0]}.${parts.slice(1).join("")}`;
    if (allowMinus && v.lastIndexOf("-") > 0) v = v.replace(/-/g, "");
    return v;
  };

  const result = useMemo(() => {
    const num = parseFloat(amount);
    if (!Number.isFinite(num)) return null;
    const base = toBase(category, num, fromUnit);
    return fromBase(category, base, toUnit);
  }, [category, fromUnit, toUnit, amount]);

  const handleCategory = (v: Category) => {
    setCategory(v);
    setFromUnit(UNITS[v][0]);
    setToUnit(UNITS[v][1] ?? UNITS[v][0]);
    setAmount(v === "Temperature" ? "0" : "1");
  };

  const swapUnits = () => {
    setFromUnit((prev) => {
      const f = toUnit;
      setToUnit(prev);
      return f;
    });
  };

  const copyResult = async () => {
    try {
      if (result == null) return;
      await navigator.clipboard.writeText(`${pretty(result)} ${toUnit}`);
      setCopied(true);
      toast.success("Copied successfully!");
      setTimeout(() => setCopied(false), 1000);
    } catch {
      toast.error("Copy failed");
    }
  };

  const resetAll = () => {
    handleCategory("Length");
    setAmount("1");
    setCopied(false);
    setShowTable(false);
  };

  const tableRows = useMemo(() => {
    const num = parseFloat(amount);
    if (!Number.isFinite(num)) return [];
    const base = toBase(category, num, fromUnit);
    const units = UNITS[category];
    return units.map((u) => ({
      unit: u,
      value: fromBase(category, base, u),
    }));
  }, [amount, category, fromUnit]);

  return (
    <>
      {/* header */}
      <ToolPageHeader
        icon={Sparkles}
        description="Select a category, pick units, input an amount—then copy or explore the full table."
        title="Conversion"
        actions={
          <>
            <ResetButton onClick={resetAll} />
            <ActionButton
              icon={Table2}
              label={`${showTable ? "Hide" : "Show"} Conversions`}
              variant="default"
              onClick={() => setShowTable((s) => !s)}
            />
          </>
        }
      />

      {/* Settings */}
      <GlassCard className="shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Settings className="w-4 h-4" /> <span>Settings</span>
            </CardTitle>
            <Badge variant="secondary" className="ml-1">
              {ICON_BY_CATEGORY[category]} <span className="ml-1 hidden sm:inline">{category}</span>
            </Badge>
          </div>
          <CardDescription>Pick category, enter amount, choose From/To units.</CardDescription>
        </CardHeader>

        <CardContent className="grid gap-6 lg:grid-cols-2">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label>Category</Label>
              <Select value={category} onValueChange={(v) => handleCategory(v as Category)}>
                <SelectTrigger className="bg-background/60 backdrop-blur">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      <div className="flex items-center gap-2">
                        {ICON_BY_CATEGORY[c]}
                        <span>{c}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <div className="flex items-end gap-2">
                <InputField
                  label="From"
                  inputMode="decimal"
                  value={amount}
                  onChange={(e) => setAmount(sanitize(e.target.value))}
                  aria-label="Amount"
                />
                <Select value={fromUnit} onValueChange={(v) => setFromUnit(v)}>
                  <SelectTrigger className="w-40 bg-background/60 backdrop-blur">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {UNITS[category].map((u) => (
                      <SelectItem key={u} value={u}>
                        {u}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <ActionButton size="icon" onClick={swapUnits} icon={ArrowLeftRight} />
              </div>
            </div>

            <div className="grid gap-2">
              <Label>To</Label>
              <Select value={toUnit} onValueChange={(v) => setToUnit(v)}>
                <SelectTrigger className="w-40 bg-background/60 backdrop-blur">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {UNITS[category].map((u) => (
                    <SelectItem key={u} value={u}>
                      {u}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Quick presets */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {["1", "10", "100", "1000"].map((p) => (
                <Badge
                  key={p}
                  variant="outline"
                  className="cursor-pointer hover:bg-primary/10"
                  onClick={() => setAmount(p)}
                >
                  {p}
                </Badge>
              ))}
            </div>
          </div>

          {/* Result & Info */}
          <div className="grid gap-4">
            <GlassCard className="rounded-2xl p-6">
              <div className="text-sm text-muted-foreground">Result</div>
              <div className="mt-2 flex items-baseline gap-3">
                <div className="text-4xl font-semibold tracking-tight">
                  {pretty(result)} {toUnit}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={copyResult}
                  title="Copy"
                  className="hover:bg-primary/10"
                >
                  <Copy className={`h-4 w-4 ${copied ? "animate-pulse" : ""}`} />
                </Button>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Base units: meter (m), kilogram (kg), Celsius (°C).
              </p>
            </GlassCard>

            <GlassCard className="rounded-2xl p-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-2 font-medium text-foreground">
                <Info className="h-3.5 w-3.5" /> Notes
              </div>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                <li>Temperature supports negative values; others disallow minus.</li>
                <li>Length & weight use precise SI factors.</li>
                <li>Use the swap button to flip units instantly.</li>
              </ul>
            </GlassCard>
          </div>
        </CardContent>
      </GlassCard>

      {/* Optional full table */}
      {showTable && (
        <GlassCard className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">All Conversions in {category}</CardTitle>
            <CardDescription>
              Converts{" "}
              <span className="font-medium">
                {amount || "—"} {fromUnit}
              </span>{" "}
              into every unit in this category.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {tableRows.map((row) => (
              <div
                key={row.unit}
                className="flex items-center justify-between rounded-md border p-3"
              >
                <span className="text-sm text-muted-foreground uppercase">{row.unit}</span>
                <span className="font-mono">{pretty(row.value)}</span>
              </div>
            ))}
          </CardContent>
        </GlassCard>
      )}
    </>
  );
}
