'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { GlassCard, MotionGlassCard } from '@/components/ui/glass-card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';

import { Backpack, Briefcase, CalendarRange, ClipboardList, Copy, Download, Filter, Luggage, Mountain, Plus, RotateCcw, Sun, ThermometerSun, Trash2, Umbrella, Upload } from 'lucide-react';
import toast from 'react-hot-toast';

/* =========================
   Types & helpers
   ========================= */

type Climate = 'mild' | 'warm' | 'cold' | 'rainy';
type Template = 'basic' | 'business' | 'beach' | 'hiking';

type Item = {
  id: string;
  cat: string; // Category name (e.g., Clothing)
  label: string; // “T-Shirts”
  qty?: number; // quantity
  checked?: boolean;
  note?: string;
  must?: boolean; // pinned essentials
};

// uid helper
const uid = () => Math.random().toString(36).slice(2, 9);

// categories ordering (for grouping)
const CATS = ['Documents', 'Clothing', 'Toiletries', 'Tech', 'Health', 'Accessories', 'Misc'] as const;

/* smart templates (base set) */
const BASE_TEMPLATE: Item[] = [
  { id: uid(), cat: 'Documents', label: 'Passport / ID', must: true },
  { id: uid(), cat: 'Documents', label: 'Tickets / Boarding pass' },
  { id: uid(), cat: 'Documents', label: 'Wallet (cards + cash)' },
  { id: uid(), cat: 'Tech', label: 'Phone + Charger', must: true },
  { id: uid(), cat: 'Tech', label: 'Power bank' },
  { id: uid(), cat: 'Clothing', label: 'Underwear', qty: 3 },
  { id: uid(), cat: 'Clothing', label: 'Socks', qty: 3 },
  { id: uid(), cat: 'Toiletries', label: 'Toothbrush / Paste' },
  { id: uid(), cat: 'Toiletries', label: 'Deodorant' },
  { id: uid(), cat: 'Misc', label: 'Reusable water bottle' },
];

const BUSINESS_TEMPLATE: Item[] = [
  { id: uid(), cat: 'Clothing', label: 'Dress shirt', qty: 2 },
  { id: uid(), cat: 'Clothing', label: 'Trousers / Skirt', qty: 1 },
  { id: uid(), cat: 'Clothing', label: 'Blazer', qty: 1 },
  { id: uid(), cat: 'Accessories', label: 'Belt / Tie / Scarf' },
  { id: uid(), cat: 'Tech', label: 'Laptop + Charger', must: true },
  { id: uid(), cat: 'Documents', label: 'Business cards' },
];

const BEACH_TEMPLATE: Item[] = [
  { id: uid(), cat: 'Clothing', label: 'Swimsuit', qty: 1 },
  { id: uid(), cat: 'Accessories', label: 'Sunglasses' },
  { id: uid(), cat: 'Accessories', label: 'Hat / Cap' },
  { id: uid(), cat: 'Health', label: 'Sunscreen (100ml TSA)' },
  { id: uid(), cat: 'Misc', label: 'Beach towel' },
];

const HIKING_TEMPLATE: Item[] = [
  { id: uid(), cat: 'Accessories', label: 'Daypack' },
  { id: uid(), cat: 'Clothing', label: 'Hiking socks', qty: 2 },
  { id: uid(), cat: 'Health', label: 'Basic first-aid kit' },
  { id: uid(), cat: 'Tech', label: 'Headlamp' },
  { id: uid(), cat: 'Misc', label: 'Snacks / Trail mix' },
];

// climate adjuster
function climateAdds(climate: Climate): Item[] {
  switch (climate) {
    case 'warm':
      return [
        { id: uid(), cat: 'Clothing', label: 'Light T-shirts', qty: 2 },
        { id: uid(), cat: 'Clothing', label: 'Shorts', qty: 1 },
      ];
    case 'cold':
      return [
        { id: uid(), cat: 'Clothing', label: 'Jacket / Fleece', qty: 1 },
        { id: uid(), cat: 'Accessories', label: 'Beanie / Gloves' },
      ];
    case 'rainy':
      return [
        { id: uid(), cat: 'Accessories', label: 'Compact umbrella' },
        { id: uid(), cat: 'Clothing', label: 'Rain jacket' },
      ];
    default:
      return [];
  }
}

// length scaling (very light heuristic)
function scaleByNights(items: Item[], nights: number) {
  const mult = Math.max(1, Math.ceil(nights / 2)); // every 2 nights → +1 unit
  return items.map((it) => (/underwear|socks|t-?shirts?/i.test(it.label) ? { ...it, qty: Math.max(it.qty ?? 1, mult + (it.qty ?? 0)) } : it));
}

/* =========================
   Component
   ========================= */

export default function PackingChecklistPage() {
  const LS_KEY = 'packing-checklist.v1';

  const [template, setTemplate] = useState<Template>('basic');
  const [climate, setClimate] = useState<Climate>('mild');
  const [nights, setNights] = useState<number>(2);

  const [items, setItems] = useState<Item[]>([]);
  const [filter, setFilter] = useState<'all' | 'todo' | 'must'>('all');
  const [query, setQuery] = useState('');

  // load / persist
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) setItems(JSON.parse(raw));
      else smartFill(); // first time, auto fill
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify(items));
  }, [items]);

  /* smart fill from template */
  function smartFill() {
    let base = [...BASE_TEMPLATE];
    if (template === 'business') base = base.concat(BUSINESS_TEMPLATE);
    if (template === 'beach') base = base.concat(BEACH_TEMPLATE);
    if (template === 'hiking') base = base.concat(HIKING_TEMPLATE);

    base = base.concat(climateAdds(climate));
    base = scaleByNights(base, nights);

    // de-dupe by label+cat keeping highest qty/must
    const map = new Map<string, Item>();
    for (const it of base) {
      const key = `${it.cat}::${it.label.toLowerCase()}`;
      if (!map.has(key)) map.set(key, { ...it, id: uid(), checked: false });
      else {
        const prev = map.get(key)!;
        map.set(key, {
          ...prev,
          qty: Math.max(prev.qty ?? 0, it.qty ?? 0) || undefined,
          must: prev.must || it.must,
        });
      }
    }
    setItems([...map.values()]);
  }

  function resetAll() {
    setItems([]);
  }

  function addItem(cat = 'Misc') {
    const label = prompt('Item name');
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
    if (filter === 'todo') arr = arr.filter((x) => !x.checked);
    if (filter === 'must') arr = arr.filter((x) => x.must);
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
    return orderedCatNames.filter((c) => byCat[c]?.length).map((c) => ({ cat: c, items: byCat[c].sort((a, b) => (a.must === b.must ? 0 : a.must ? -1 : 1)) }));
  }, [items, filter, query]);

  async function copyText() {
    const lines = [
      `Packing Checklist — ${template} • ${nights} night(s) • ${climate}`,
      ...filtered.flatMap((g) => [`\n# ${g.cat}`, ...g.items.map((i) => `${i.checked ? '[x]' : '[ ]'} ${i.label}${i.qty ? ` ×${i.qty}` : ''}${i.must ? ' ★' : ''}${i.note ? ` — ${i.note}` : ''}`)]),
    ].join('\n');
    try {
      await navigator.clipboard.writeText(lines);
      toast.success('Checklist copied!');
    } catch {
      toast.error('Copy failed');
    }
  }

  function exportJSON() {
    const blob = new Blob([JSON.stringify({ items }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'packing-checklist.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  const fileRef = useRef<HTMLInputElement>(null);
  function importJSON(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(String(reader.result));
        if (Array.isArray(data.items)) setItems(data.items);
        toast.success('Imported!');
      } catch {
        toast.error('Invalid file');
      } finally {
        e.target.value = '';
      }
    };
    reader.readAsText(file);
  }

  return (
    <div className="container mx-auto py-10 space-y-8">
      {/* <SectionHeader title="Packing Checklist" desc="Smart, templated packing lists — tuned by trip length & climate. Add, check, filter, and save locally." /> */}

      <MotionGlassCard className="space-y-4">
        {/* Flowing header */}
        <GlassCard className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-6 py-5">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
              <Luggage className="h-6 w-6" /> Packing Checklist
            </h1>
            <p className="text-sm text-muted-foreground">Template → tune → check off. Everything saves in your browser.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={smartFill} className="gap-2">
              <ClipboardList className="h-4 w-4" /> Smart Fill
            </Button>
            <Button variant="outline" onClick={copyText} className="gap-2">
              <Copy className="h-4 w-4" /> Copy
            </Button>
            <Button variant="outline" onClick={exportJSON} className="gap-2">
              <Download className="h-4 w-4" /> Export
            </Button>
            <Button variant="outline" onClick={() => fileRef.current?.click()} className="gap-2">
              <Upload className="h-4 w-4" /> Import
            </Button>
            <input type="file" accept="application/json" className="hidden" ref={fileRef} onChange={importJSON} />
            <Button variant="outline" onClick={resetAll} className="gap-2">
              <RotateCcw className="h-4 w-4" /> Reset
            </Button>
          </div>
        </GlassCard>

        {/* Settings */}
        <GlassCard className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Trip Settings</CardTitle>
            <CardDescription>Choose a template, trip length, and expected climate. Then hit Smart Fill.</CardDescription>
          </CardHeader>

          <CardContent className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div className="grid gap-2">
              <Label>Template</Label>
              <Select value={template} onValueChange={(v) => setTemplate(v as Template)}>
                <SelectTrigger className="bg-background/60 backdrop-blur">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="basic">
                    <div className="flex items-center gap-2">
                      <Backpack className="h-4 w-4" /> Basic
                    </div>
                  </SelectItem>
                  <SelectItem value="business">
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4" /> Business
                    </div>
                  </SelectItem>
                  <SelectItem value="beach">
                    <div className="flex items-center gap-2">
                      <Sun className="h-4 w-4" /> Beach
                    </div>
                  </SelectItem>
                  <SelectItem value="hiking">
                    <div className="flex items-center gap-2">
                      <Mountain className="h-4 w-4" /> Hiking
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>Nights</Label>
              <div className="flex items-center gap-2">
                <Input type="number" min={0} value={nights} onChange={(e) => setNights(Math.max(0, Number(e.target.value) || 0))} className="bg-background/60 backdrop-blur" />
                <Badge variant="secondary" className="gap-1">
                  <CalendarRange className="h-3.5 w-3.5" /> length-aware
                </Badge>
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Climate</Label>
              <Select value={climate} onValueChange={(v) => setClimate(v as Climate)}>
                <SelectTrigger className="bg-background/60 backdrop-blur">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mild">
                    <div className="flex items-center gap-2">
                      <ThermometerSun className="h-4 w-4" /> Mild
                    </div>
                  </SelectItem>
                  <SelectItem value="warm">
                    <div className="flex items-center gap-2">
                      <Sun className="h-4 w-4" /> Warm
                    </div>
                  </SelectItem>
                  <SelectItem value="cold">
                    <div className="flex items-center gap-2">
                      <ThermometerSun className="h-4 w-4 rotate-180" /> Cold
                    </div>
                  </SelectItem>
                  <SelectItem value="rainy">
                    <div className="flex items-center gap-2">
                      <Umbrella className="h-4 w-4" /> Rainy
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>Quick add</Label>
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" onClick={() => addItem('Documents')}>
                  Docs +
                </Button>
                <Button variant="secondary" size="sm" onClick={() => addItem('Clothing')}>
                  Clothes +
                </Button>
                <Button variant="secondary" size="sm" onClick={() => addItem('Tech')}>
                  Tech +
                </Button>
              </div>
            </div>
          </CardContent>
        </GlassCard>

        <Separator />

        {/* Toolbar */}
        <GlassCard className="px-6 py-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            <Select value={filter} onValueChange={(v) => setFilter(v as any)}>
              <SelectTrigger className="w-40 bg-background/60 backdrop-blur">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Show: All</SelectItem>
                <SelectItem value="todo">Show: To do</SelectItem>
                <SelectItem value="must">Show: Essentials ★</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1" />

          <div className="flex items-center gap-2">
            <Input placeholder="Search items or categories..." value={query} onChange={(e) => setQuery(e.target.value)} className="w-full md:w-72 bg-background/60 backdrop-blur" />
          </div>
        </GlassCard>

        {/* Checklist */}
        <GlassCard className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Your List</CardTitle>
            <CardDescription>Check items as you pack. Quantities and notes are saved automatically.</CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {filtered.length === 0 && <p className="text-sm text-muted-foreground">No items. Try Smart Fill or add items with Quick add.</p>}

            {filtered.map((group) => (
              <div key={group.cat}>
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="text-sm font-medium tracking-tight">{group.cat}</h3>
                  <Button variant="ghost" size="sm" className="gap-1" onClick={() => addItem(group.cat)} title={`Add to ${group.cat}`}>
                    <Plus className="h-4 w-4" /> Add
                  </Button>
                </div>

                <div className="grid gap-2">
                  {group.items.map((it) => (
                    <div key={it.id} className="flex flex-col rounded-xl border p-3 sm:flex-row sm:items-center sm:gap-3">
                      <div className="flex items-center gap-3 sm:w-[40%]">
                        <Checkbox checked={!!it.checked} onCheckedChange={(v) => toggleCheck(it.id, !!v)} aria-label={`check ${it.label}`} />
                        <span className={`text-sm ${it.checked ? 'line-through text-muted-foreground' : ''}`}>
                          {it.label}{' '}
                          {it.must && (
                            <Badge variant="outline" className="ml-1">
                              ★
                            </Badge>
                          )}
                        </span>
                      </div>

                      <div className="mt-2 grid flex-1 grid-cols-2 gap-2 sm:mt-0 sm:grid-cols-3">
                        <div className="flex items-center gap-2">
                          <Label className="text-xs text-muted-foreground">Qty</Label>
                          <Input type="number" min={0} value={it.qty ?? ''} onChange={(e) => updateQty(it.id, Number(e.target.value))} className="h-8" />
                        </div>
                        <div className="col-span-2 sm:col-span-2">
                          <Textarea placeholder="Note (optional)" value={it.note ?? ''} onChange={(e) => updateNote(it.id, e.target.value)} className="h-8 min-h-8" />
                        </div>
                      </div>

                      <div className="mt-2 flex items-center gap-2 sm:mt-0">
                        <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600" onClick={() => removeItem(it.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </GlassCard>
      </MotionGlassCard>
    </div>
  );
}
