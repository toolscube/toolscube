"use client";

import {
  Building2,
  Calendar,
  Check,
  Download,
  FileCheck2,
  FileText,
  Plus,
  Printer,
  RotateCcw,
  Save,
  Trash2,
  Upload,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GlassCard, MotionGlassCard } from "@/components/ui/glass-card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";

// ---------- Types ----------

type LineItem = {
  id: string;
  name: string;
  description?: string;
  qty: number;
  rate: number; // per unit price
};

type Party = {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
};

type InvoiceData = {
  invoiceNo: string;
  issueDate: string; // yyyy-mm-dd
  dueDate: string; // yyyy-mm-dd
  from: Party;
  to: Party;
  currency: string; // e.g., BDT, USD
  items: LineItem[];
  notes?: string;
  taxPercent: number; // 0-100
  discountPercent: number; // 0-100
  shipping: number; // flat amount
};

// ---------- Helpers ----------

function uid(prefix = "id") {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}

function fmt(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency }).format(amount);
  } catch {
    // Fallback if currency not supported
    return `${currency} ${amount.toFixed(2)}`;
  }
}

function toCSV(rows: string[][]) {
  return rows
    .map((r) =>
      r
        .map((c) => {
          const v = c.replaceAll('"', '""');
          return `"${v}"`;
        })
        .join(","),
    )
    .join("\n");
}

function download(filename: string, content: string, mime = "text/plain") {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

const DEFAULT_ITEMS: LineItem[] = [
  { id: uid("row"), name: "Product/Service Name", description: "", qty: 1, rate: 0 },
];

const DEFAULT_INVOICE: InvoiceData = {
  invoiceNo: `INV-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9000) + 1000)}`,
  issueDate: new Date().toISOString().slice(0, 10),
  dueDate: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
  from: { name: "Your Company", email: "", phone: "", address: "" },
  to: { name: "Client Name", email: "", phone: "", address: "" },
  currency: "BDT",
  items: DEFAULT_ITEMS,
  notes: "Thank you for your business! Payment is due by the due date.",
  taxPercent: 0,
  discountPercent: 0,
  shipping: 0,
};

// ---------- Page ----------

export default function SimpleInvoicePage() {
  const [data, setData] = useState<InvoiceData>(DEFAULT_INVOICE);
  const [copied, setCopied] = useState<string | null>(null);
  const printRef = useRef<HTMLDivElement | null>(null);

  // Derived totals
  const { subTotal, discountAmt, taxAmt, grandTotal } = useMemo(() => {
    const sub = data.items.reduce(
      (sum, it) => sum + (Number(it.qty) || 0) * (Number(it.rate) || 0),
      0,
    );
    const disc = (Math.max(0, Math.min(100, Number(data.discountPercent) || 0)) / 100) * sub;
    const taxedBase = Math.max(0, sub - disc) + (Number(data.shipping) || 0);
    const tax = (Math.max(0, Math.min(100, Number(data.taxPercent) || 0)) / 100) * taxedBase;
    const grand = taxedBase + tax;
    return { subTotal: sub, discountAmt: disc, taxAmt: tax, grandTotal: grand };
  }, [data]);

  // Local storage hydration (auto-restore last invoice)
  useEffect(() => {
    try {
      const saved = localStorage.getItem("tools:invoice");
      if (saved) setData(JSON.parse(saved) as InvoiceData);
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("tools:invoice", JSON.stringify(data));
    } catch {}
  }, [data]);

  // Actions
  const resetAll = () => setData({ ...DEFAULT_INVOICE, invoiceNo: nextInvoiceNo() });
  const nextInvoiceNo = () =>
    `INV-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9000) + 1000)}`;

  const addRow = () =>
    setData((d) => ({
      ...d,
      items: [...d.items, { id: uid("row"), name: "", description: "", qty: 1, rate: 0 }],
    }));

  const removeRow = (id: string) =>
    setData((d) => ({ ...d, items: d.items.filter((r) => r.id !== id) }));

  const updateRow = (id: string, patch: Partial<LineItem>) =>
    setData((d) => ({ ...d, items: d.items.map((r) => (r.id === id ? { ...r, ...patch } : r)) }));

  const exportJSON = () =>
    download(`${data.invoiceNo}.json`, JSON.stringify(data, null, 2), "application/json");

  const importJSON = async (file: File) => {
    try {
      const txt = await file.text();
      const parsed = JSON.parse(txt) as InvoiceData;
      // Basic shape check
      if (!parsed.items || !Array.isArray(parsed.items)) throw new Error("Invalid invoice file");
      setData(parsed);
    } catch (e) {
      alert((e as Error).message || "Failed to import invoice JSON");
    }
  };

  const exportCSV = () => {
    const rows: string[][] = [
      ["Invoice No", data.invoiceNo],
      ["Issue Date", data.issueDate],
      ["Due Date", data.dueDate],
      ["Currency", data.currency],
      ["From", data.from.name],
      ["From Email", data.from.email || ""],
      ["From Phone", data.from.phone || ""],
      ["From Address", data.from.address || ""],
      ["To", data.to.name],
      ["To Email", data.to.email || ""],
      ["To Phone", data.to.phone || ""],
      ["To Address", data.to.address || ""],
      [""],
      ["Items:"],
      ["Name", "Description", "Qty", "Rate", "Amount"],
      ...data.items.map((it) => [
        it.name || "",
        it.description || "",
        String(it.qty ?? 0),
        String(it.rate ?? 0),
        String((Number(it.qty) || 0) * (Number(it.rate) || 0)),
      ]),
      [""],
      ["Subtotal", String(subTotal)],
      ["Discount %", String(data.discountPercent)],
      ["Discount Amount", String(discountAmt)],
      ["Shipping", String(data.shipping)],
      ["Tax %", String(data.taxPercent)],
      ["Tax Amount", String(taxAmt)],
      ["Grand Total", String(grandTotal)],
    ];
    download(`${data.invoiceNo}.csv`, toCSV(rows), "text/csv");
  };

  const copyTotal = async () => {
    try {
      await navigator.clipboard.writeText(String(grandTotal.toFixed(2)));
      setCopied("grand");
      setTimeout(() => setCopied(null), 1200);
    } catch {}
  };

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const onPrint = () => {
    // Print only the invoice area using a simple window.print and print-tailwind classes.
    window.print();
  };

  return (
    <div className="space-y-4">
      <MotionGlassCard>
        <GlassCard className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-6">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
              <FileText className="h-6 w-6" /> Simple Invoice
            </h1>
            <p className="text-sm text-muted-foreground">
              Create, print, and export a clean invoice fast.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={resetAll} className="gap-2">
              <RotateCcw className="h-4 w-4" /> Reset
            </Button>
            <Button variant="outline" onClick={exportCSV} className="gap-2">
              <Download className="h-4 w-4" /> CSV
            </Button>
            <Button variant="outline" onClick={exportJSON} className="gap-2">
              <Save className="h-4 w-4" /> Save JSON
            </Button>
            <Button onClick={onPrint} className="gap-2">
              <Printer className="h-4 w-4" /> Print / PDF
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) importJSON(f);
                if (fileInputRef.current) fileInputRef.current.value = "";
              }}
            />
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-4 w-4" /> Load JSON
            </Button>
          </div>
        </GlassCard>

        {/* Meta & Parties */}
        <GlassCard className="shadow-sm print:shadow-none">
          <CardHeader>
            <CardTitle className="text-base">Details</CardTitle>
            <CardDescription>Invoice meta and parties.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 lg:grid-cols-3">
            <div className="space-y-3">
              <Label htmlFor="invoiceNo">Invoice No</Label>
              <div className="flex gap-2">
                <Input
                  id="invoiceNo"
                  value={data.invoiceNo}
                  onChange={(e) => setData({ ...data, invoiceNo: e.target.value })}
                />
                <Button
                  type="button"
                  variant="outline"
                  className="whitespace-nowrap"
                  onClick={() => setData((d) => ({ ...d, invoiceNo: nextInvoiceNo() }))}
                >
                  New
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="issue">Issue Date</Label>
                  <div className="relative">
                    <Calendar className="h-4 w-4 absolute left-2 top-2.5 text-muted-foreground" />
                    <Input
                      id="issue"
                      type="date"
                      className="pl-8"
                      value={data.issueDate}
                      onChange={(e) => setData({ ...data, issueDate: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="due">Due Date</Label>
                  <div className="relative">
                    <Calendar className="h-4 w-4 absolute left-2 top-2.5 text-muted-foreground" />
                    <Input
                      id="due"
                      type="date"
                      className="pl-8"
                      value={data.dueDate}
                      onChange={(e) => setData({ ...data, dueDate: e.target.value })}
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Input
                  id="currency"
                  value={data.currency}
                  onChange={(e) =>
                    setData({ ...data, currency: e.target.value.toUpperCase().slice(0, 3) })
                  }
                  placeholder="BDT"
                />
                <p className="text-xs text-muted-foreground">
                  3-letter code (e.g., BDT, USD, EUR, INR)
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-muted-foreground" />{" "}
                <Label className="font-medium">From</Label>
              </div>
              <Input
                placeholder="Your Company"
                value={data.from.name}
                onChange={(e) => setData({ ...data, from: { ...data.from, name: e.target.value } })}
              />
              <Input
                placeholder="Email"
                value={data.from.email || ""}
                onChange={(e) =>
                  setData({ ...data, from: { ...data.from, email: e.target.value } })
                }
              />
              <Input
                placeholder="Phone"
                value={data.from.phone || ""}
                onChange={(e) =>
                  setData({ ...data, from: { ...data.from, phone: e.target.value } })
                }
              />
              <Textarea
                placeholder="Address"
                value={data.from.address || ""}
                onChange={(e) =>
                  setData({ ...data, from: { ...data.from, address: e.target.value } })
                }
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <FileCheck2 className="h-4 w-4 text-muted-foreground" />{" "}
                <Label className="font-medium">Bill To</Label>
              </div>
              <Input
                placeholder="Client Name"
                value={data.to.name}
                onChange={(e) => setData({ ...data, to: { ...data.to, name: e.target.value } })}
              />
              <Input
                placeholder="Email"
                value={data.to.email || ""}
                onChange={(e) => setData({ ...data, to: { ...data.to, email: e.target.value } })}
              />
              <Input
                placeholder="Phone"
                value={data.to.phone || ""}
                onChange={(e) => setData({ ...data, to: { ...data.to, phone: e.target.value } })}
              />
              <Textarea
                placeholder="Address"
                value={data.to.address || ""}
                onChange={(e) => setData({ ...data, to: { ...data.to, address: e.target.value } })}
              />
            </div>
          </CardContent>
        </GlassCard>

        {/* Items */}
        <GlassCard className="shadow-sm print:shadow-none">
          <CardHeader>
            <CardTitle className="text-base">Items</CardTitle>
            <CardDescription>Add products or services with quantity and rate.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="hidden md:grid grid-cols-12 gap-2 px-2 text-xs text-muted-foreground">
              <div className="col-span-4">Name</div>
              <div className="col-span-3">Description</div>
              <div className="col-span-2">Qty</div>
              <div className="col-span-2">Rate</div>
              <div className="col-span-1 text-right">Actions</div>
            </div>

            {data.items.map((it) => {
              const amount = (Number(it.qty) || 0) * (Number(it.rate) || 0);
              return (
                <div
                  key={it.id}
                  className="grid grid-cols-1 md:grid-cols-12 gap-2 border rounded-lg p-3"
                >
                  <div className="md:col-span-4 space-y-2">
                    <Label className="md:hidden">Name</Label>
                    <Input
                      value={it.name}
                      onChange={(e) => updateRow(it.id, { name: e.target.value })}
                      placeholder="Item name"
                    />
                  </div>
                  <div className="md:col-span-3 space-y-2">
                    <Label className="md:hidden">Description</Label>
                    <Input
                      value={it.description || ""}
                      onChange={(e) => updateRow(it.id, { description: e.target.value })}
                      placeholder="Optional"
                    />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <Label className="md:hidden">Qty</Label>
                    <Input
                      type="number"
                      inputMode="decimal"
                      min={0}
                      value={Number.isFinite(it.qty) ? String(it.qty) : "0"}
                      onChange={(e) => updateRow(it.id, { qty: Number(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <Label className="md:hidden">Rate</Label>
                    <Input
                      type="number"
                      inputMode="decimal"
                      min={0}
                      value={Number.isFinite(it.rate) ? String(it.rate) : "0"}
                      onChange={(e) => updateRow(it.id, { rate: Number(e.target.value) || 0 })}
                    />
                    <p className="text-xs text-muted-foreground">
                      Amount: {fmt(amount, data.currency)}
                    </p>
                  </div>
                  <div className="md:col-span-1 flex md:items-start md:justify-end gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => removeRow(it.id)}
                      aria-label="Remove item"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}

            <div className="flex justify-between">
              <Button variant="outline" className="gap-2" onClick={addRow}>
                <Plus className="h-4 w-4" /> Add Item
              </Button>
              <div className="text-sm text-muted-foreground hidden md:block pr-1">
                Subtotal: {fmt(subTotal, data.currency)}
              </div>
            </div>
          </CardContent>
        </GlassCard>

        {/* Totals & Notes */}
        <GlassCard className="shadow-sm print:shadow-none">
          <CardHeader>
            <CardTitle className="text-base">Summary</CardTitle>
            <CardDescription>Discounts, tax, shipping, and final total.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-3">
              <Label>Notes</Label>
              <Textarea
                value={data.notes || ""}
                onChange={(e) => setData({ ...data, notes: e.target.value })}
                placeholder="Optional notes, payment instructions, bank details, etc."
                className="min-h-[90px]"
              />
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Discount %</Label>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    value={String(data.discountPercent)}
                    onChange={(e) =>
                      setData({
                        ...data,
                        discountPercent: Math.max(0, Math.min(100, Number(e.target.value) || 0)),
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tax %</Label>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    value={String(data.taxPercent)}
                    onChange={(e) =>
                      setData({
                        ...data,
                        taxPercent: Math.max(0, Math.min(100, Number(e.target.value) || 0)),
                      })
                    }
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label>Shipping</Label>
                  <Input
                    type="number"
                    min={0}
                    value={String(data.shipping)}
                    onChange={(e) =>
                      setData({ ...data, shipping: Math.max(0, Number(e.target.value) || 0) })
                    }
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{fmt(subTotal, data.currency)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Discount</span>
                  <span>- {fmt(discountAmt, data.currency)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>{fmt(data.shipping || 0, data.currency)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span>{fmt(taxAmt, data.currency)}</span>
                </div>
                <div className="flex justify-between font-semibold text-base pt-1">
                  <span>Total</span>
                  <span className="flex items-center gap-2">
                    {fmt(grandTotal, data.currency)}
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 px-2 gap-1"
                      onClick={copyTotal}
                    >
                      {copied === "grand" ? (
                        <Check className="h-3.5 w-3.5" />
                      ) : (
                        <FileText className="h-3.5 w-3.5" />
                      )}{" "}
                      Copy
                    </Button>
                  </span>
                </div>
              </div>
              <Badge variant="secondary" className="w-fit">
                All amounts in {data.currency}
              </Badge>
            </div>
          </CardContent>
        </GlassCard>

        {/* Printable Invoice Preview */}
        <GlassCard
          ref={printRef}
          className="shadow-sm print:shadow-none print:bg-white print:border-0"
        >
          <CardHeader>
            <CardTitle className="text-base">Preview</CardTitle>
            <CardDescription>This area is optimized for printing to PDF.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-background/50 rounded-xl border p-6 print:bg-transparent print:border-0">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold">Invoice</h2>
                  <p className="text-sm text-muted-foreground">{data.invoiceNo}</p>
                </div>
                <div className="text-sm">
                  <div>
                    <span className="text-muted-foreground">Issue:</span> {data.issueDate}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Due:</span> {data.dueDate}
                  </div>
                </div>
              </div>

              <div className="mt-6 grid gap-6 sm:grid-cols-2">
                <div>
                  <div className="text-xs text-muted-foreground">From</div>
                  <div className="font-medium">{data.from.name}</div>
                  {data.from.address && (
                    <div className="text-sm whitespace-pre-wrap">{data.from.address}</div>
                  )}
                  {data.from.email && <div className="text-sm">{data.from.email}</div>}
                  {data.from.phone && <div className="text-sm">{data.from.phone}</div>}
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Bill To</div>
                  <div className="font-medium">{data.to.name}</div>
                  {data.to.address && (
                    <div className="text-sm whitespace-pre-wrap">{data.to.address}</div>
                  )}
                  {data.to.email && <div className="text-sm">{data.to.email}</div>}
                  {data.to.phone && <div className="text-sm">{data.to.phone}</div>}
                </div>
              </div>

              <div className="mt-6 overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b text-muted-foreground">
                      <th className="py-2 text-left">Item</th>
                      <th className="py-2 text-left">Description</th>
                      <th className="py-2 text-right">Qty</th>
                      <th className="py-2 text-right">Rate</th>
                      <th className="py-2 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.items.map((it) => (
                      <tr key={it.id} className="border-b last:border-0">
                        <td className="py-2">{it.name || "-"}</td>
                        <td className="py-2 text-muted-foreground">{it.description || "-"}</td>
                        <td className="py-2 text-right">{Number(it.qty) || 0}</td>
                        <td className="py-2 text-right">
                          {fmt(Number(it.rate) || 0, data.currency)}
                        </td>
                        <td className="py-2 text-right">
                          {fmt((Number(it.qty) || 0) * (Number(it.rate) || 0), data.currency)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 sm:flex sm:justify-end">
                <div className="w-full sm:max-w-sm space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{fmt(subTotal, data.currency)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Discount ({data.discountPercent}%)
                    </span>
                    <span>- {fmt(discountAmt, data.currency)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping</span>
                    <span>{fmt(data.shipping || 0, data.currency)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tax ({data.taxPercent}%)</span>
                    <span>{fmt(taxAmt, data.currency)}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-base pt-1">
                    <span>Total</span>
                    <span>{fmt(grandTotal, data.currency)}</span>
                  </div>
                </div>
              </div>

              {data.notes && (
                <div className="mt-6">
                  <div className="text-xs text-muted-foreground mb-1">Notes</div>
                  <div className="text-sm whitespace-pre-wrap">{data.notes}</div>
                </div>
              )}

              <div className="mt-8 text-center text-xs text-muted-foreground">
                Generated with Tools Hub — Simple Invoice
              </div>
            </div>
          </CardContent>
        </GlassCard>
      </MotionGlassCard>

      {/* Print styles */}
      <style jsx global>{`
        @media print {
          body {
            background: white !important;
          }
          header,
          nav,
          footer {
            display: none !important;
          }
          .print\\:shadow-none {
            box-shadow: none !important;
          }
          .print\\:bg-white {
            background: white !important;
          }
          .print\\:border-0 {
            border: 0 !important;
          }
          .print\\:hidden {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
