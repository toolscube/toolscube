"use client";

import {
  Backpack,
  Briefcase,
  ClipboardList,
  Luggage,
  Mountain,
  Plus,
  Sun,
  ThermometerSnowflake,
  ThermometerSun,
  Trash2,
  Umbrella,
} from "lucide-react";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ActionButton, ResetButton } from "@/components/shared/action-buttons";
import InputField from "@/components/shared/form-fields/input-field";
import SelectField from "@/components/shared/form-fields/select-field";
import ToolPageHeader from "@/components/shared/tool-page-header";
import { Badge } from "@/components/ui/badge";
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { GlassCard } from "@/components/ui/glass-card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

// Types & helpers
type Climate = "mild" | "warm" | "cold" | "rainy";
type Template = "basic" | "business" | "beach" | "hiking";
type Filter = "must" | "all" | "todo";

type Item = {
  id: string;
  cat: string;
  label: string;
  qty?: number;
  checked?: boolean;
  note?: string;
  must?: boolean;
};

// uid helper
const uid = () => Math.random().toString(36).slice(2, 9);

// categories ordering
const CATS = [
  "Documents",
  "Clothing",
  "Toiletries",
  "Tech",
  "Health",
  "Accessories",
  "Misc",
] as const;

/* smart templates */
const BASE_TEMPLATE: Item[] = [
  { id: uid(), cat: "Documents", label: "Passport / ID", must: true },
  { id: uid(), cat: "Documents", label: "Tickets / Boarding pass" },
  { id: uid(), cat: "Documents", label: "Wallet (cards + cash)" },
  { id: uid(), cat: "Tech", label: "Phone + Charger", must: true },
  { id: uid(), cat: "Tech", label: "Power bank" },
  { id: uid(), cat: "Clothing", label: "Underwear", qty: 3 },
  { id: uid(), cat: "Clothing", label: "Socks", qty: 3 },
  { id: uid(), cat: "Toiletries", label: "Toothbrush / Paste" },
  { id: uid(), cat: "Toiletries", label: "Deodorant" },
  { id: uid(), cat: "Misc", label: "Reusable water bottle" },
];

const BUSINESS_TEMPLATE: Item[] = [
  { id: uid(), cat: "Clothing", label: "Dress shirt", qty: 2 },
  { id: uid(), cat: "Clothing", label: "Trousers / Skirt", qty: 1 },
  { id: uid(), cat: "Clothing", label: "Blazer", qty: 1 },
  { id: uid(), cat: "Accessories", label: "Belt / Tie / Scarf" },
  { id: uid(), cat: "Tech", label: "Laptop + Charger", must: true },
  { id: uid(), cat: "Documents", label: "Business cards" },
];

const BEACH_TEMPLATE: Item[] = [
  { id: uid(), cat: "Clothing", label: "Swimsuit", qty: 1 },
  { id: uid(), cat: "Accessories", label: "Sunglasses" },
  { id: uid(), cat: "Accessories", label: "Hat / Cap" },
  { id: uid(), cat: "Health", label: "Sunscreen (100ml TSA)" },
  { id: uid(), cat: "Misc", label: "Beach towel" },
];

const HIKING_TEMPLATE: Item[] = [
  { id: uid(), cat: "Accessories", label: "Daypack" },
  { id: uid(), cat: "Clothing", label: "Hiking socks", qty: 2 },
  { id: uid(), cat: "Health", label: "Basic first-aid kit" },
  { id: uid(), cat: "Tech", label: "Headlamp" },
  { id: uid(), cat: "Misc", label: "Snacks / Trail mix" },
];

// climate adjuster
function climateAdds(climate: Climate): Item[] {
  switch (climate) {
    case "warm":
      return [
        { id: uid(), cat: "Clothing", label: "Light T-shirts", qty: 2 },
        { id: uid(), cat: "Clothing", label: "Shorts", qty: 1 },
      ];
    case "cold":
      return [
        { id: uid(), cat: "Clothing", label: "Jacket / Fleece", qty: 1 },
        { id: uid(), cat: "Accessories", label: "Beanie / Gloves" },
      ];
    case "rainy":
      return [
        { id: uid(), cat: "Accessories", label: "Compact umbrella" },
        { id: uid(), cat: "Clothing", label: "Rain jacket" },
      ];
    default:
      return [];
  }
}

// length scaling
function scaleByNights(items: Item[], nights: number) {
  const mult = Math.max(1, Math.ceil(nights / 2));
  return items.map((it) =>
    /underwear|socks|t-?shirts?/i.test(it.label)
      ? { ...it, qty: Math.max(it.qty ?? 1, mult + (it.qty ?? 0)) }
      : it,
  );
}

export default function PackingChecklistClient() {
  const LS_KEY = "packing-checklist.v1";

  const [template, setTemplate] = useState<Template>("basic");
  const [climate, setClimate] = useState<Climate>("mild");
  const [nights, setNights] = useState<number>(2);

  const [items, setItems] = useState<Item[]>([]);
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");

  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify(items));
  }, [items]);

  /* smart fill from template */
  const smartFill = useCallback(() => {
    let base = [...BASE_TEMPLATE];
    if (template === "business") base = base.concat(BUSINESS_TEMPLATE);
    if (template === "beach") base = base.concat(BEACH_TEMPLATE);
    if (template === "hiking") base = base.concat(HIKING_TEMPLATE);

    base = base.concat(climateAdds(climate));
    base = scaleByNights(base, nights);

    const map = new Map<string, Item>();
    for (const it of base) {
      const key = `${it.cat}::${String(it.label).toLowerCase()}`;
      const existing = map.get(key);
      if (!existing) {
        map.set(key, { ...it, id: uid(), checked: false });
      } else {
        map.set(key, {
          ...existing,
          qty: Math.max(existing.qty ?? 0, it.qty ?? 0) || undefined,
          must: Boolean(existing.must || it.must),
        });
      }
    }
    setItems(Array.from(map.values()));
  }, [template, climate, nights]);

  // load / persist
  React.useEffect(() => {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) {
      try {
        setItems(JSON.parse(raw));
      } catch {
        smartFill();
      }
    } else {
      smartFill();
    }
  }, [smartFill]);

  function resetAll() {
    setItems([]);
  }

  function addItem(cat = "Misc") {
    const label = prompt("Item name");
    if (!label) return;
    setItems((s) => [{ id: uid(), cat, label, qty: 1, checked: false }, ...s]);
  }

  function removeItem(id: string) {
    setItems((s) => s.filter((x) => x.id !== id));
  }

  function toggleCheck(id: string, v: boolean) {
    setItems((s) => s.map((x) => (x.id === id ? { ...x, checked: v } : x)));
  }

  function updateQty(id: string, qty: number) {
    setItems((s) => s.map((x) => (x.id === id ? { ...x, qty: qty || undefined } : x)));
  }

  function updateNote(id: string, note: string) {
    setItems((s) => s.map((x) => (x.id === id ? { ...x, note } : x)));
  }

  const filtered = useMemo(() => {
    let arr = items;
    if (filter === "todo") arr = arr.filter((x) => !x.checked);
    if (filter === "must") arr = arr.filter((x) => x.must);
    if (query.trim()) {
      const q = query.toLowerCase();
      arr = arr.filter((x) => x.label.toLowerCase().includes(q) || x.cat.toLowerCase().includes(q));
    }
    // group by category using CATS order
    const byCat: Record<string, Item[]> = {};
    for (const it of arr) {
      if (!byCat[it.cat]) byCat[it.cat] = [];
      byCat[it.cat].push(it);
    }
    const orderedCatNames = [...new Set([...CATS, ...Object.keys(byCat)])];
    return orderedCatNames
      .filter((c) => byCat[c]?.length)
      .map((c) => ({
        cat: c,
        items: byCat[c].sort((a, b) => (a.must === b.must ? 0 : a.must ? -1 : 1)),
      }));
  }, [items, filter, query]);

  return (
    <>
      {/* Flowing header */}
      <ToolPageHeader
        icon={Luggage}
        title="Packing Checklist"
        description="Template → tune → check off. Everything saves in your browser."
        actions={
          <>
            <ResetButton onClick={resetAll} />
            <ActionButton
              variant="default"
              icon={ClipboardList}
              label="Smart Fill"
              onClick={smartFill}
            />
          </>
        }
      />

      {/* Settings */}
      <GlassCard>
        <CardHeader>
          <CardTitle className="text-base">Trip Settings</CardTitle>
          <CardDescription>
            Choose a template, trip length, and expected climate. Then hit Smart Fill.
          </CardDescription>
        </CardHeader>

        <CardContent className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 items-center">
          <SelectField
            label="Template"
            value={template}
            onValueChange={(v) => setTemplate(v as Template)}
            options={[
              { icon: Backpack, value: "basic", label: "Basic" },
              { icon: Briefcase, value: "business", label: "Business" },
              { icon: Sun, value: "beach", label: "Beach" },
              { icon: Mountain, value: "hiking", label: "Hiking" },
            ]}
          />

          <InputField
            label="Nights"
            type="number"
            min={0}
            value={nights}
            onChange={(e) => setNights(Math.max(0, Number(e.target.value) || 0))}
          />

          <SelectField
            label="Climate"
            value={climate}
            onValueChange={(v) => setClimate(v as Climate)}
            options={[
              { icon: ThermometerSun, value: "mild", label: "Mild" },
              { icon: Sun, value: "warm", label: "Warm" },
              { icon: ThermometerSnowflake, value: "cold", label: "Cold" },
              { icon: Umbrella, value: "rainy", label: "Rainy" },
            ]}
          />

          <div className="space-y-2">
            <Label>Quick add</Label>
            <div className="flex gap-2">
              <ActionButton size="sm" label="Docs +" onClick={() => addItem("Documents")} />
              <ActionButton size="sm" label=" Clothes +" onClick={() => addItem("Clothing")} />
              <ActionButton size="sm" label=" Tech +" onClick={() => addItem("Tech")} />
            </div>
          </div>
        </CardContent>
      </GlassCard>

      <Separator className="my-4" />

      {/* Toolbar */}
      <GlassCard className="px-6 py-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <SelectField
          value={filter}
          onValueChange={(v) => setFilter(v as Filter)}
          options={[
            { value: "all", label: "Show: All" },
            { value: "todo", label: "Show: To Do" },
            { value: "must", label: "Show: Essentials ★" },
          ]}
        />

        <div className="flex-1" />

        <div className="flex items-center gap-2">
          <InputField
            placeholder="Search items or categories..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </GlassCard>

      {/* Checklist */}
      <GlassCard className="mt-4">
        <CardHeader>
          <CardTitle className="text-base">Your List</CardTitle>
          <CardDescription>
            Check items as you pack. Quantities and notes are saved automatically.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {filtered.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No items. Try Smart Fill or add items with Quick add.
            </p>
          )}

          {filtered.map((group) => (
            <div key={group.cat}>
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-sm font-medium tracking-tight">{group.cat}</h3>
                <ActionButton
                  icon={Plus}
                  variant="ghost"
                  size="sm"
                  onClick={() => addItem(group.cat)}
                  label="Add"
                />
              </div>

              <div className="grid gap-2">
                {group.items.map((it) => (
                  <div
                    key={it.id}
                    className="flex flex-col rounded-xl border p-3 sm:flex-row sm:items-center sm:gap-3"
                  >
                    <div className="flex items-center gap-3 sm:w-[40%]">
                      <Checkbox
                        checked={!!it.checked}
                        onCheckedChange={(v) => toggleCheck(it.id, !!v)}
                        aria-label={`check ${it.label}`}
                      />
                      <span
                        className={`text-sm ${it.checked ? "line-through text-muted-foreground" : ""}`}
                      >
                        {it.label}{" "}
                        {it.must && (
                          <Badge variant="outline" className="ml-1">
                            ★
                          </Badge>
                        )}
                      </span>
                    </div>

                    <div className="grid flex-1 grid-cols-2 gap-2 sm:grid-cols-3 items-end">
                      <InputField
                        placeholder="Qty"
                        type="number"
                        min={0}
                        value={it.qty ?? ""}
                        onChange={(e) => updateQty(it.id, Number(e.target.value))}
                      />
                      <div className="col-span-2 sm:col-span-2">
                        <InputField
                          placeholder="Note (optional)"
                          value={it.note ?? ""}
                          onChange={(e) => updateNote(it.id, e.target.value)}
                        />
                      </div>
                    </div>

                    <ActionButton
                      icon={Trash2}
                      variant="destructive"
                      size="icon"
                      onClick={() => removeItem(it.id)}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </GlassCard>
    </>
  );
}
