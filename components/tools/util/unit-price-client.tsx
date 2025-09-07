"use client";

import {
  BadgePercent,
  Beaker,
  Boxes,
  Calculator,
  Check,
  Plus,
  Scale,
  SortAsc,
  Trash2,
} from "lucide-react";
import * as React from "react";
import { ActionButton, ExportCSVButton, ResetButton } from "@/components/shared/action-buttons";
import InputField from "@/components/shared/form-fields/input-field";
import SelectField from "@/components/shared/form-fields/select-field";
import SwitchRow from "@/components/shared/form-fields/switch-row";
import TextareaField from "@/components/shared/form-fields/textarea-field";
import ToolPageHeader from "@/components/shared/tool-page-header";
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GlassCard } from "@/components/ui/glass-card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

// Types
type UnitKind = "weight" | "volume" | "count" | "custom";
type Unit = "mg" | "g" | "kg" | "ml" | "l" | "unit" | "pcs" | "piece" | "custom";

type Item = {
  id: string;
  name: string;
  qty: number;
  unit: Unit;
  customRatio?: number;
  price: number;
  discountPct: number;
  taxPct: number;
};

type DisplayPer = "g" | "kg" | "ml" | "l" | "unit";

// Unit helpers
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
  mg: 0.001,
  g: 1,
  kg: 1000,
  ml: 1,
  l: 1000,
  unit: 1,
  pcs: 1,
  piece: 1,
  custom: 1,
};

function detectDisplayKind(displayPer: DisplayPer): UnitKind {
  if (displayPer === "g" || displayPer === "kg") return "weight";
  if (displayPer === "ml" || displayPer === "l") return "volume";
  return "count";
}

function displayPerFactor(displayPer: DisplayPer): number {
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

// Math
function finalPrice(price: number, discountPct: number, taxPct: number) {
  const afterDiscount = price * (1 - (Number.isFinite(discountPct) ? discountPct : 0) / 100);
  return afterDiscount * (1 + (Number.isFinite(taxPct) ? taxPct : 0) / 100);
}

function qtyInBase(item: Item): number | null {
  const kind = unitKind[item.unit];
  if (kind === "custom") {
    if (!item.customRatio || item.customRatio <= 0) return null;
    return item.qty * item.customRatio;
  }
  const factor = toBaseFactor[item.unit];
  return item.qty * factor;
}

function perUnitPrice(item: Item, displayPer: DisplayPer): number | null {
  const kind = unitKind[item.unit];
  const targetKind = detectDisplayKind(displayPer);
  if (kind !== "custom" && kind !== targetKind) return null;

  const baseQty = qtyInBase(item);
  if (!baseQty || baseQty <= 0) return null;

  const price = finalPrice(item.price, item.discountPct, item.taxPct);
  const f = displayPerFactor(displayPer);
  const qtyInDisplayUnits = baseQty * f;

  if (qtyInDisplayUnits <= 0) return null;
  return price / qtyInDisplayUnits;
}

function fmt(n: number, digits = 4) {
  const x = Number.isFinite(n) ? n : 0;
  const s = x >= 100 ? x.toFixed(2) : x >= 10 ? x.toFixed(3) : x.toFixed(digits);
  return s.replace(/(\.\d*?[1-9])0+$/u, "$1").replace(/\.0+$/u, "");
}

export default function UnitPriceClient() {
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
  const [currency, setCurrency] = React.useState<string>("৳");
  const [autoSort, setAutoSort] = React.useState<boolean>(true);
  const [showAdvanced, setShowAdvanced] = React.useState<boolean>(false);
  const [bulk, setBulk] = React.useState<string>("");

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
      return [...prev, { ...copy, id: crypto.randomUUID(), name: `${it.name} (copy)` }];
    });
  }
  function removeItem(id: string) {
    setItems((prev) => prev.filter((x) => x.id !== id));
  }
  function resetAll() {
    setItems([]);
  }

  // Bulk import: "name, qty unit, price"
  function parseBulk() {
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

      if (!m || Number.isNaN(price)) continue;

      const qty = parseFloat(m[1]);
      const unitRaw = m[2].toLowerCase();
      const allowed = new Set<Unit>(["mg", "g", "kg", "ml", "l", "unit", "pcs", "piece"]);
      const unit: Unit = allowed.has(unitRaw as Unit) ? (unitRaw as Unit) : "custom";

      parsed.push({
        id: crypto.randomUUID(),
        name,
        qty: Number.isFinite(qty) ? qty : 0,
        unit,
        price: Number.isFinite(price) ? price : 0,
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

  const unitIcon = (kind: UnitKind) =>
    kind === "weight" ? (
      <Scale className="h-4 w-4" />
    ) : kind === "volume" ? (
      <Beaker className="h-4 w-4" />
    ) : (
      <Boxes className="h-4 w-4" />
    );

  return (
    <>
      {/* Header */}
      <ToolPageHeader
        icon={Calculator}
        title="Unit Price Compare"
        description="Find which product size is cheaper. Supports weight (g/kg), volume (ml/L), and count."
        actions={
          <>
            <ResetButton onClick={resetAll} />
            <ExportCSVButton
              filename="unit-price-compare.csv"
              getRows={async () => {
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
                  r.qty,
                  r.unit,
                  r.price,
                  r.discountPct,
                  r.taxPct,
                  r.perUnit == null ? "" : r.perUnit,
                ]);
                return [header, ...rows];
              }}
            />
            <ActionButton variant="default" icon={Plus} label="Add Item" onClick={addItem} />
          </>
        }
      />

      {/* Global Settings */}
      <GlassCard>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Settings</CardTitle>
          <CardDescription>
            Choose display unit, currency, sorting, and advanced options.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <SelectField
            label="Display Per"
            className="w-full"
            value={displayPer}
            onValueChange={(v) => {
              if (v) setDisplayPer(v as DisplayPer);
            }}
            placeholder="Per..."
            options={[
              { label: "per gram (g)", value: "g" },
              { label: "per kilogram (kg)", value: "kg" },
              { label: "per milliliter (ml)", value: "ml" },
              { label: "per liter (L)", value: "l" },
              { label: "per unit", value: "unit" },
            ]}
          />

          <InputField
            label="Currency symbol"
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            placeholder="৳ / $ / €"
          />

          <SwitchRow
            icon={SortAsc}
            label="Auto-sort by cheapest"
            checked={autoSort}
            onCheckedChange={setAutoSort}
          />

          <SwitchRow
            className="sm:col-span-3"
            icon={BadgePercent}
            label="Show discount & tax fields"
            checked={showAdvanced}
            onCheckedChange={setShowAdvanced}
          />
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
                  <InputField
                    label="Name"
                    value={it.name}
                    onChange={(e) => updateItem(it.id, { name: e.target.value })}
                    placeholder="e.g., Rice 5kg"
                  />

                  <div className="grid grid-cols-2 gap-2">
                    <InputField
                      label="Quantity"
                      type="number"
                      min={0}
                      step="any"
                      value={it.qty}
                      onChange={(e) =>
                        updateItem(it.id, { qty: parseFloat(e.target.value || "0") })
                      }
                      placeholder="e.g., 500"
                    />
                    <SelectField
                      label="Unit"
                      value={it.unit}
                      onValueChange={(v) => updateItem(it.id, { unit: v as Unit })}
                      placeholder="Select unit"
                      options={[
                        { label: "mg", value: "mg" },
                        { label: "g", value: "g" },
                        { label: "kg", value: "kg" },
                        { label: "ml", value: "ml" },
                        { label: "L", value: "l" },
                        { label: "unit", value: "unit" },
                        { label: "pcs", value: "pcs" },
                        { label: "piece", value: "piece" },
                        { label: "custom", value: "custom" },
                      ]}
                    />
                  </div>

                  <InputField
                    label={`Price (${currency})`}
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
                      <InputField
                        label="1 custom = how many base units?"
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

                      <InputField label="Example" readOnly value="e.g., 1 pouch = 250 base units" />
                    </div>
                  </div>
                )}

                {showAdvanced && (
                  <div className="grid gap-3 sm:grid-cols-2">
                    <InputField
                      label="Discount (%)"
                      type="number"
                      min={0}
                      max={100}
                      step="any"
                      value={it.discountPct}
                      onChange={(e) =>
                        updateItem(it.id, { discountPct: parseFloat(e.target.value || "0") })
                      }
                    />

                    <InputField
                      label="Tax (%)"
                      type="number"
                      min={0}
                      step="any"
                      value={it.taxPct}
                      onChange={(e) =>
                        updateItem(it.id, { taxPct: parseFloat(e.target.value || "0") })
                      }
                    />
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
                    <ActionButton label="Duplicate" size="sm" onClick={() => cloneItem(it.id)} />
                    <ActionButton
                      variant="destructive"
                      icon={Trash2}
                      label="Remove"
                      size="sm"
                      onClick={() => removeItem(it.id)}
                    />
                  </div>
                </div>
              </CardContent>
            </GlassCard>
          );
        })}
      </div>

      <Separator />

      {/* Bulk Import */}
      <GlassCard>
        <CardHeader>
          <CardTitle className="text-base">Bulk paste</CardTitle>
          <CardDescription>
            One per line: <code>Name, qty unit, price</code> — e.g., <em>Rice, 5 kg, 575</em>
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3">
          <TextareaField
            value={bulk}
            onChange={(e) => setBulk(e.target.value)}
            placeholder={`Rice Small, 2 kg, 240\nOil, 500 ml, 120\nEggs, 12 unit, 180`}
            textareaClassName="min-h-[120px]"
          />
          <div className="flex flex-wrap gap-2">
            <ResetButton onClick={() => setBulk("")} />

            <ActionButton variant="default" icon={Plus} label="Add Lines" onClick={parseBulk} />
          </div>
        </CardContent>
      </GlassCard>

      {/* Legend / Tips */}
      <GlassCard className="p-4 text-xs text-muted-foreground">
        Tips: Choose a meaningful “display per” (e.g., per kg when comparing rice bags). If items
        show “N/A”, they may use incompatible units—switch display unit accordingly.
      </GlassCard>
    </>
  );
}
