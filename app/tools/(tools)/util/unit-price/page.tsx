"use client";

import {
  BadgePercent,
  Beaker,
  Boxes,
  Calculator,
  Check,
  Copy,
  Plus,
  RotateCcw,
  Scale,
  SortAsc,
  Trash2,
} from "lucide-react";
import * as React from "react";

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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

// ---------- Types ----------
type UnitKind = "weight" | "volume" | "count" | "custom";
type Unit = "mg" | "g" | "kg" | "ml" | "l" | "unit" | "pcs" | "piece" | "custom";

type Item = {
  id: string;
  name: string;
  qty: number; // numeric quantity in given unit
  unit: Unit;
  customRatio?: number; // how many base units in 1 custom unit (e.g., 1 custom = 250 g => 250)
  price: number;
  discountPct: number; // 0-100
  taxPct: number; // 0-100
};

type DisplayPer = "g" | "kg" | "ml" | "l" | "unit";

// ---------- Unit helpers ----------
const unitKind: Record<Unit, UnitKind> = {
  mg: "weight",
  g: "weight",
  kg: "weight",
  ml: "volume",
  l: "volume",
  unit: "count",
  pcs: "count",
  piece: "count",
  custom: "custom",
};

const toBaseFactor: Record<Unit, number> = {
  // base for weight is grams (g)
  mg: 0.001,
  g: 1,
  kg: 1000,
  // base for volume is milliliters (ml)
  ml: 1,
  l: 1000,
  // base for count is unit
  unit: 1,
  pcs: 1,
  piece: 1,
  // custom handled separately
  custom: 1,
};

function detectDisplayKind(displayPer: DisplayPer): UnitKind {
  if (displayPer === "g" || displayPer === "kg") return "weight";
  if (displayPer === "ml" || displayPer === "l") return "volume";
  return "count";
}

function displayPerFactor(displayPer: DisplayPer): number {
  // convert base to display unit
  // base weight = g, base volume = ml, base count = unit
  switch (displayPer) {
    case "g":
      return 1;
    case "kg":
      return 1 / 1000;
    case "ml":
      return 1;
    case "l":
      return 1 / 1000;
    case "unit":
      return 1;
  }
}

// ---------- Math ----------
function finalPrice(price: number, discountPct: number, taxPct: number) {
  const afterDiscount = price * (1 - (isFinite(discountPct) ? discountPct : 0) / 100);
  return afterDiscount * (1 + (isFinite(taxPct) ? taxPct : 0) / 100);
}

function qtyInBase(item: Item): number | null {
  const kind = unitKind[item.unit];
  if (kind === "custom") {
    // customRatio represents how many base units one custom unit equals.
    // For weight-kind custom: base is g
    // For volume-kind custom: base is ml
    // For count-kind custom: base is unit
    // We cannot know the kind automatically for custom; we’ll treat custom as weight by default
    // unless the name hints. To avoid magic, we’ll rely on customRatio alone and consider it “base units”.
    if (!item.customRatio || item.customRatio <= 0) return null;
    return item.qty * item.customRatio;
  }
  const factor = toBaseFactor[item.unit];
  return item.qty * factor;
}

function perUnitPrice(item: Item, displayPer: DisplayPer): number | null {
  const kind = unitKind[item.unit];
  const targetKind = detectDisplayKind(displayPer);
  // If kinds are incompatible and not custom, we can't compute
  if (kind !== "custom" && kind !== targetKind) return null;

  const baseQty = qtyInBase(item);
  if (!baseQty || baseQty <= 0) return null;

  const price = finalPrice(item.price, item.discountPct, item.taxPct);
  // base -> display
  const f = displayPerFactor(displayPer);
  const qtyInDisplayUnits = baseQty * f;

  if (qtyInDisplayUnits <= 0) return null;
  return price / qtyInDisplayUnits;
}

function fmt(n: number, digits = 4) {
  const x = Number.isFinite(n) ? n : 0;
  const s = x >= 100 ? x.toFixed(2) : x >= 10 ? x.toFixed(3) : x.toFixed(digits);
  // trim trailing zeros
  return s.replace(/(\.\d*?[1-9])0+$/u, "$1").replace(/\.0+$/u, "");
}

// ---------- Component ----------
export default function UnitPricePage() {
  // Items
  const [items, setItems] = React.useState<Item[]>([
    {
      id: crypto.randomUUID(),
      name: "Sample A (rice 2kg)",
      qty: 2,
      unit: "kg",
      price: 240,
      discountPct: 0,
      taxPct: 0,
    },
    {
      id: crypto.randomUUID(),
      name: "Sample B (rice 5kg)",
      qty: 5,
      unit: "kg",
      price: 575,
      discountPct: 0,
      taxPct: 0,
    },
  ]);

  // Global settings
  const [displayPer, setDisplayPer] = React.useState<DisplayPer>("kg");
  const [currency, setCurrency] = React.useState<string>("৳"); // BDT by default
  const [autoSort, setAutoSort] = React.useState<boolean>(true);
  const [showAdvanced, setShowAdvanced] = React.useState<boolean>(false);

  // Derived: compute unit price for each
  const computed = React.useMemo(() => {
    const rows = items.map((it) => ({
      ...it,
      perUnit: perUnitPrice(it, displayPer),
    }));
    const comparable = rows.filter((r) => r.perUnit !== null) as (Item & { perUnit: number })[];
    const cheapest = comparable.length ? Math.min(...comparable.map((r) => r.perUnit)) : null;
    const sorted = autoSort
      ? [...rows].sort((a, b) => {
          const aa = a.perUnit ?? Number.POSITIVE_INFINITY;
          const bb = b.perUnit ?? Number.POSITIVE_INFINITY;
          return aa - bb;
        })
      : rows;
    return { rows: sorted, cheapest };
  }, [items, displayPer, autoSort]);

  function updateItem(id: string, patch: Partial<Item>) {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...patch } : it)));
  }
  function addItem() {
    setItems((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        name: "",
        qty: 1,
        unit: "g",
        price: 0,
        discountPct: 0,
        taxPct: 0,
        customRatio: undefined,
      },
    ]);
  }
  function cloneItem(id: string) {
    setItems((prev) => {
      const it = prev.find((x) => x.id === id);
      if (!it) return prev;
      const { id: _old, ...copy } = it;
      return [...prev, { ...copy, id: crypto.randomUUID(), name: it.name + " (copy)" }];
    });
  }
  function removeItem(id: string) {
    setItems((prev) => prev.filter((x) => x.id !== id));
  }
  function resetAll() {
    setItems([]);
  }

  // Bulk import: "name, qty unit, price"
  const [bulk, setBulk] = React.useState<string>("");
  function parseBulk() {
    // Examples:
    // Rice Small, 2 kg, 240
    // Oil, 500 ml, 120
    // Eggs, 12 unit, 180
    const lines = bulk
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);

    const parsed: Item[] = [];
    for (const line of lines) {
      const parts = line.split(",").map((p) => p.trim());
      if (parts.length < 3) continue;
      const [name, qtyUnit, priceStr] = parts;
      const m = qtyUnit.match(/^([\d.]+)\s*([a-zA-Z]+)$/u);
      const price = parseFloat(priceStr);
      if (!m || isNaN(price)) continue;
      const qty = parseFloat(m[1]);
      const unitRaw = m[2].toLowerCase();
      const allowed = ["mg", "g", "kg", "ml", "l", "unit", "pcs", "piece"] as const;
      const unit = (allowed.includes(unitRaw as any) ? unitRaw : "custom") as Unit;
      parsed.push({
        id: crypto.randomUUID(),
        name,
        qty: isFinite(qty) ? qty : 0,
        unit,
        price: isFinite(price) ? price : 0,
        discountPct: 0,
        taxPct: 0,
        customRatio: unit === "custom" ? 1 : undefined,
      });
    }
    if (parsed.length) {
      setItems((prev) => [...prev, ...parsed]);
      setBulk("");
    }
  }

  function exportCSV() {
    const header = [
      "Name",
      "Qty",
      "Unit",
      "Price",
      "Discount(%)",
      "Tax(%)",
      `Price per ${displayPer}`,
    ];
    const rows = computed.rows.map((r) => [
      r.name,
      String(r.qty),
      r.unit,
      String(r.price),
      String(r.discountPct),
      String(r.taxPct),
      r.perUnit == null ? "" : String(r.perUnit),
    ]);
    const csv = [header, ...rows]
      .map((r) => r.map((x) => `"${String(x).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "unit-price-compare.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  const unitIcon = (kind: UnitKind) =>
    kind === "weight" ? (
      <Scale className="h-4 w-4" />
    ) : kind === "volume" ? (
      <Beaker className="h-4 w-4" />
    ) : (
      <Boxes className="h-4 w-4" />
    );

  return (
    <MotionGlassCard className="space-y-4">
      {/* Header */}
      <GlassCard className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-6">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
            <Calculator className="h-6 w-6" /> Unit Price Compare
          </h1>
          <p className="text-sm text-muted-foreground">
            Find which product size is cheaper. Supports weight (g/kg), volume (ml/L), and count.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={resetAll} className="gap-2">
            <RotateCcw className="h-4 w-4" /> Reset
          </Button>
          <Button variant="outline" onClick={exportCSV} className="gap-2">
            <Copy className="h-4 w-4" /> Export CSV
          </Button>
          <Button onClick={addItem} className="gap-2">
            <Plus className="h-4 w-4" /> Add Item
          </Button>
        </div>
      </GlassCard>

      {/* Global Settings */}
      <GlassCard className="shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Settings</CardTitle>
          <CardDescription>
            Choose display unit, currency, sorting, and advanced options.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label>Display price per</Label>
            <Select value={displayPer} onValueChange={(v: DisplayPer) => setDisplayPer(v)}>
              <SelectTrigger>
                <SelectValue placeholder="Per…" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="g">per gram (g)</SelectItem>
                <SelectItem value="kg">per kilogram (kg)</SelectItem>
                <SelectItem value="ml">per milliliter (ml)</SelectItem>
                <SelectItem value="l">per liter (L)</SelectItem>
                <SelectItem value="unit">per unit</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Currency symbol</Label>
            <Input
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              placeholder="৳ / $ / €"
            />
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <SortAsc className="h-4 w-4" /> Auto-sort by cheapest
            </Label>
            <div className="flex items-center gap-2">
              <Switch checked={autoSort} onCheckedChange={setAutoSort} />
              <span className="text-sm text-muted-foreground">
                {autoSort ? "Enabled" : "Disabled"}
              </span>
            </div>
          </div>

          <div className="sm:col-span-3 flex items-center justify-between rounded-md border p-3">
            <div className="flex items-center gap-2">
              <BadgePercent className="h-4 w-4" />
              <span className="text-sm">Show discount & tax fields</span>
            </div>
            <Switch checked={showAdvanced} onCheckedChange={setShowAdvanced} />
          </div>
        </CardContent>
      </GlassCard>

      {/* Items */}
      <div className="grid gap-4">
        {computed.rows.length === 0 && (
          <GlassCard className="p-6 text-sm text-muted-foreground">
            No items yet. Click “Add Item” or paste a list below.
          </GlassCard>
        )}

        {computed.rows.map((it) => {
          const kind = unitKind[it.unit];
          const isCheapest =
            computed.cheapest != null &&
            it.perUnit != null &&
            Math.abs(it.perUnit - (computed.cheapest as number)) < 1e-12;
          const perText =
            it.perUnit == null ? "N/A" : `${currency}${fmt(it.perUnit)} / ${displayPer}`;

          return (
            <GlassCard
              key={it.id}
              className={cn(
                "shadow-sm border relative overflow-hidden",
                isCheapest && "ring-1 ring-primary",
              )}
            >
              {isCheapest && (
                <div className="absolute right-3 top-3 z-10">
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                    <Check className="h-3.5 w-3.5" /> Best value
                  </span>
                </div>
              )}
              <CardHeader className="pb-2 pr-24">
                <div className="flex items-center gap-2">
                  {unitIcon(kind)}
                  <CardTitle className="text-base">Product</CardTitle>
                </div>
                <CardDescription>
                  Enter pack size and price; we’ll compute price per {displayPer}.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label>Name</Label>
                    <Input
                      value={it.name}
                      onChange={(e) => updateItem(it.id, { name: e.target.value })}
                      placeholder="e.g., Rice 5kg"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-2">
                      <Label>Quantity</Label>
                      <Input
                        type="number"
                        min={0}
                        step="any"
                        value={it.qty}
                        onChange={(e) =>
                          updateItem(it.id, { qty: parseFloat(e.target.value || "0") })
                        }
                        placeholder="e.g., 500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Unit</Label>
                      <Select
                        value={it.unit}
                        onValueChange={(v: Unit) => updateItem(it.id, { unit: v })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Unit" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="mg">mg</SelectItem>
                          <SelectItem value="g">g</SelectItem>
                          <SelectItem value="kg">kg</SelectItem>
                          <SelectItem value="ml">ml</SelectItem>
                          <SelectItem value="l">L</SelectItem>
                          <SelectItem value="unit">unit</SelectItem>
                          <SelectItem value="pcs">pcs</SelectItem>
                          <SelectItem value="piece">piece</SelectItem>
                          <SelectItem value="custom">custom</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Price ({currency})</Label>
                    <Input
                      type="number"
                      min={0}
                      step="any"
                      value={it.price}
                      onChange={(e) =>
                        updateItem(it.id, { price: parseFloat(e.target.value || "0") })
                      }
                      placeholder="e.g., 199"
                    />
                  </div>
                </div>

                {it.unit === "custom" && (
                  <div className="grid gap-2 rounded-md border p-3">
                    <div className="text-sm text-muted-foreground">
                      Custom unit: set how many <span className="font-medium">base units</span>{" "}
                      equals <span className="font-medium">1 custom</span>. Base is{" "}
                      <span className="font-medium">g</span> for weight,{" "}
                      <span className="font-medium">ml</span> for volume, or{" "}
                      <span className="font-medium">unit</span> for count. Since type is ambiguous,
                      we’ll treat this as “base units” directly for comparison.
                    </div>
                    <div className="grid gap-2 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label>1 custom = how many base units?</Label>
                        <Input
                          type="number"
                          min={0}
                          step="any"
                          value={it.customRatio ?? 1}
                          onChange={(e) =>
                            updateItem(it.id, {
                              customRatio: parseFloat(e.target.value || "0") || 0,
                            })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Example</Label>
                        <Input readOnly value="e.g., 1 pouch = 250 base units" />
                      </div>
                    </div>
                  </div>
                )}

                {showAdvanced && (
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Discount (%)</Label>
                      <Input
                        type="number"
                        min={0}
                        max={100}
                        step="any"
                        value={it.discountPct}
                        onChange={(e) =>
                          updateItem(it.id, { discountPct: parseFloat(e.target.value || "0") })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Tax (%)</Label>
                      <Input
                        type="number"
                        min={0}
                        step="any"
                        value={it.taxPct}
                        onChange={(e) =>
                          updateItem(it.id, { taxPct: parseFloat(e.target.value || "0") })
                        }
                      />
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border p-3">
                  <div className="text-sm">
                    <div className="text-muted-foreground">Price per {displayPer}</div>
                    <div className="text-lg font-semibold tabular-nums">
                      {it.perUnit == null ? "—" : `${currency}${fmt(it.perUnit)}`}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => cloneItem(it.id)}>
                      Duplicate
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeItem(it.id)}
                      className="gap-2"
                    >
                      <Trash2 className="h-4 w-4" /> Remove
                    </Button>
                  </div>
                </div>
              </CardContent>
            </GlassCard>
          );
        })}
      </div>

      <Separator />

      {/* Bulk Import */}
      <GlassCard className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Bulk paste</CardTitle>
          <CardDescription>
            One per line: <code>Name, qty unit, price</code> — e.g., <em>Rice, 5 kg, 575</em>
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3">
          <Textarea
            value={bulk}
            onChange={(e) => setBulk(e.target.value)}
            placeholder={`Rice Small, 2 kg, 240\nOil, 500 ml, 120\nEggs, 12 unit, 180`}
            className="min-h-[120px]"
          />
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" className="gap-2" onClick={() => setBulk("")}>
              <RotateCcw className="h-4 w-4" /> Clear
            </Button>
            <Button onClick={parseBulk} className="gap-2">
              <Plus className="h-4 w-4" /> Add Lines
            </Button>
          </div>
        </CardContent>
      </GlassCard>

      {/* Legend / Tips */}
      <GlassCard className="p-4 text-xs text-muted-foreground">
        Tips: Choose a meaningful “display per” (e.g., per kg when comparing rice bags). If items
        show “N/A”, they may use incompatible units—switch display unit accordingly.
      </GlassCard>
    </MotionGlassCard>
  );
}
