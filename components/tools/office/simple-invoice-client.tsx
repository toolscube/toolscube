"use client";

import {
  Building2,
  Calendar,
  Copy,
  FileCheck2,
  FileText,
  Plus,
  Printer,
  RotateCcw,
  Trash2,
} from "lucide-react";
import * as React from "react";
import {
  ActionButton,
  CopyButton,
  ExportCSVButton,
  ResetButton,
} from "@/components/shared/action-buttons";
import InputField from "@/components/shared/form-fields/input-field";
import SelectField from "@/components/shared/form-fields/select-field";
import SwitchRow from "@/components/shared/form-fields/switch-row";
import TextareaField from "@/components/shared/form-fields/textarea-field";
import ToolPageHeader from "@/components/shared/tool-page-header";

import { Badge } from "@/components/ui/badge";
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GlassCard } from "@/components/ui/glass-card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

/* Types */
type LineItem = {
  id: string;
  name: string;
  description?: string;
  qty: number;
  rate: number;
};

type Party = {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
};

type InvoiceData = {
  invoiceNo: string;
  issueDate: string;
  dueDate: string;
  from: Party;
  to: Party;
  currency: string;
  currencyMode: "code" | "symbol";
  items: LineItem[];
  notes?: string;
  taxPercent: number;
  discountPercent: number;
  shipping: number;
  paid: boolean;
  amountPaid: number;
};

/* Helpers */
function uid(prefix = "row") {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

function safeNum(n: unknown, fallback = 0): number {
  const v = typeof n === "number" ? n : Number(n);
  return Number.isFinite(v) ? v : fallback;
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function nextInvoiceNo() {
  return `INV-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9000) + 1000)}`;
}

function fmtCurrency(amount: number, currency: string, mode: "code" | "symbol") {
  const value = Number.isFinite(amount) ? amount : 0;
  if (mode === "code") {
    try {
      return new Intl.NumberFormat(undefined, { style: "currency", currency }).format(value);
    } catch {
      return `${currency} ${value.toFixed(2)}`;
    }
  }
  return `${currency}${value.toFixed(2)}`;
}

const DEFAULT_ITEMS: LineItem[] = [
  { id: uid(), name: "Product/Service", description: "", qty: 1, rate: 0 },
];

const DEFAULT_INVOICE: InvoiceData = {
  invoiceNo: nextInvoiceNo(),
  issueDate: new Date().toISOString().slice(0, 10),
  dueDate: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
  from: { name: "Your Company", email: "", phone: "", address: "" },
  to: { name: "Client Name", email: "", phone: "", address: "" },
  currency: "BDT",
  currencyMode: "code",
  items: DEFAULT_ITEMS,
  notes: "Thank you for your business! Payment is due by the due date.",
  taxPercent: 0,
  discountPercent: 0,
  shipping: 0,
  paid: false,
  amountPaid: 0,
};

export default function SimpleInvoiceClient() {
  const [data, setData] = React.useState<InvoiceData>(DEFAULT_INVOICE);

  // Restore & persist
  React.useEffect(() => {
    try {
      const saved = localStorage.getItem("tools:invoice");
      if (saved) setData(JSON.parse(saved) as InvoiceData);
    } catch {}
  }, []);
  React.useEffect(() => {
    try {
      localStorage.setItem("tools:invoice", JSON.stringify(data));
    } catch {}
  }, [data]);

  // Derived totals
  const { subTotal, discountAmt, taxAmt, grandTotal, balanceDue } = React.useMemo(() => {
    const sub = data.items.reduce((sum, it) => sum + safeNum(it.qty) * safeNum(it.rate), 0);
    const discPct = clamp(safeNum(data.discountPercent), 0, 100);
    const disc = (discPct / 100) * sub;

    const shipping = Math.max(0, safeNum(data.shipping));
    const taxedBase = Math.max(0, sub - disc) + shipping;

    const taxPct = clamp(safeNum(data.taxPercent), 0, 100);
    const tax = (taxPct / 100) * taxedBase;

    const total = taxedBase + tax;

    const paid = Math.max(0, safeNum(data.amountPaid));
    const due = Math.max(0, total - paid);

    return {
      subTotal: sub,
      discountAmt: disc,
      taxAmt: tax,
      grandTotal: total,
      balanceDue: due,
    };
  }, [data]);

  /* Actions */
  const resetAll = () => setData({ ...DEFAULT_INVOICE, invoiceNo: nextInvoiceNo() });

  const addRow = () =>
    setData((d) => ({
      ...d,
      items: [...d.items, { id: uid(), name: "", description: "", qty: 1, rate: 0 }],
    }));

  const cloneRow = (id: string) =>
    setData((d) => {
      const it = d.items.find((r) => r.id === id);
      if (!it) return d;
      const { id: _old, ...rest } = it;
      return { ...d, items: [...d.items, { ...rest, id: uid(), name: `${it.name} (copy)` }] };
    });

  const removeRow = (id: string) =>
    setData((d) => ({ ...d, items: d.items.filter((r) => r.id !== id) }));

  const updateRow = (id: string, patch: Partial<LineItem>) =>
    setData((d) => ({ ...d, items: d.items.map((r) => (r.id === id ? { ...r, ...patch } : r)) }));

  const onPrint = () => window.print();

  const CURRENCY_CODE_OPTIONS = [
    { label: "BDT (৳)", value: "BDT" },
    { label: "USD ($)", value: "USD" },
    { label: "EUR (€)", value: "EUR" },
    { label: "INR (₹)", value: "INR" },
    { label: "GBP (£)", value: "GBP" },
  ];

  const CURRENCY_SYMBOL_PRESETS = [
    { label: "৳ (BDT)", value: "৳" },
    { label: "$ (USD)", value: "$" },
    { label: "€ (EUR)", value: "€" },
    { label: "₹ (INR)", value: "₹" },
    { label: "£ (GBP)", value: "£" },
  ];

  const CSVRows: string[][] = [
    ["Invoice No", data.invoiceNo],
    ["Issue Date", data.issueDate],
    ["Due Date", data.dueDate],
    ["Currency", `${data.currencyMode === "code" ? "Code" : "Symbol"}: ${data.currency}`],
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
      String(safeNum(it.qty)),
      String(safeNum(it.rate)),
      String(safeNum(it.qty) * safeNum(it.rate)),
    ]),
    [""],
    ["Subtotal", String(subTotal)],
    ["Discount %", String(data.discountPercent)],
    ["Discount Amount", String(discountAmt)],
    ["Shipping", String(data.shipping)],
    ["Tax %", String(data.taxPercent)],
    ["Tax Amount", String(taxAmt)],
    ["Grand Total", String(grandTotal)],
    ["Amount Paid", String(data.amountPaid)],
    ["Balance Due", String(balanceDue)],
  ];

  return (
    <>
      <ToolPageHeader
        icon={FileText}
        title="Simple Invoice"
        description="Create, print, and export a clean invoice fast."
        actions={
          <>
            <ResetButton onClick={resetAll} />
            <ExportCSVButton
              label="Export CSV"
              filename={`${data.invoiceNo}.csv`}
              getRows={() => CSVRows}
            />
            <ActionButton variant="default" icon={Printer} label="Print / PDF" onClick={onPrint} />
          </>
        }
      />

      {/* Details */}
      <GlassCard>
        <CardHeader>
          <CardTitle className="text-base">Details</CardTitle>
          <CardDescription>Invoice meta, currency, parties & status.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 lg:grid-cols-3">
          {/* Meta */}
          <div className="space-y-4">
            <div className="flex items-end justify-between gap-2">
              <InputField
                label="Invoice No"
                value={data.invoiceNo}
                onChange={(e) => setData({ ...data, invoiceNo: e.target.value })}
                className="w-full"
              />
              <ActionButton
                size="icon"
                icon={RotateCcw}
                onClick={() => setData((d) => ({ ...d, invoiceNo: nextInvoiceNo() }))}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <InputField
                label="Issue Date"
                type="date"
                value={data.issueDate}
                onChange={(e) => setData({ ...data, issueDate: e.target.value })}
                icon={Calendar}
              />
              <InputField
                label="Due Date"
                type="date"
                value={data.dueDate}
                onChange={(e) => setData({ ...data, dueDate: e.target.value })}
                icon={Calendar}
              />
            </div>

            <div className="grid gap-3">
              <SelectField
                label="Currency Mode"
                value={data.currencyMode}
                onValueChange={(v) =>
                  v && setData((d) => ({ ...d, currencyMode: v as "code" | "symbol" }))
                }
                options={[
                  { label: "ISO Code (BDT/USD/EUR)", value: "code" },
                  { label: "Symbol (৳/$/€/₹/£)", value: "symbol" },
                ]}
              />
              {data.currencyMode === "code" ? (
                <div className="grid grid-cols-[2fr_1fr] gap-2">
                  <SelectField
                    label="Currency Code"
                    value={data.currency}
                    onValueChange={(v) =>
                      v && setData((d) => ({ ...d, currency: v.toString().toUpperCase() }))
                    }
                    options={CURRENCY_CODE_OPTIONS}
                    placeholder="Pick currency"
                  />
                  <InputField
                    label="Custom"
                    value={data.currency}
                    onChange={(e) =>
                      setData({
                        ...data,
                        currency: e.target.value.toUpperCase().slice(0, 3),
                      })
                    }
                    placeholder="BDT"
                  />
                </div>
              ) : (
                <div className="grid grid-cols-[2fr_1fr] gap-2">
                  <SelectField
                    label="Symbol"
                    value={data.currency}
                    onValueChange={(v) => v && setData((d) => ({ ...d, currency: v.toString() }))}
                    options={CURRENCY_SYMBOL_PRESETS}
                    placeholder="Pick symbol"
                  />
                  <InputField
                    label="Custom"
                    value={data.currency}
                    onChange={(e) => setData({ ...data, currency: e.target.value.slice(0, 3) })}
                    placeholder="৳"
                  />
                </div>
              )}
            </div>

            <SwitchRow
              label="Mark as Paid"
              checked={data.paid}
              onCheckedChange={(v) => setData((d) => ({ ...d, paid: v }))}
            />
          </div>

          {/* From */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">From</span>
            </div>
            <InputField
              placeholder="Your Company"
              value={data.from.name}
              onChange={(e) => setData({ ...data, from: { ...data.from, name: e.target.value } })}
            />
            <InputField
              placeholder="Email"
              value={data.from.email || ""}
              onChange={(e) => setData({ ...data, from: { ...data.from, email: e.target.value } })}
            />
            <InputField
              placeholder="Phone"
              value={data.from.phone || ""}
              onChange={(e) => setData({ ...data, from: { ...data.from, phone: e.target.value } })}
            />
            <TextareaField
              placeholder="Address"
              value={data.from.address || ""}
              onValueChange={(v) => setData({ ...data, from: { ...data.from, address: v } })}
              textareaClassName="min-h-[82px]"
            />
            <InputField
              label="Amount Paid"
              type="number"
              min={0}
              value={data.amountPaid}
              onChange={(e) =>
                setData({ ...data, amountPaid: Math.max(0, Number(e.target.value) || 0) })
              }
            />
          </div>

          {/* To */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <FileCheck2 className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Bill To</span>
            </div>
            <InputField
              placeholder="Client Name"
              value={data.to.name}
              onChange={(e) => setData({ ...data, to: { ...data.to, name: e.target.value } })}
            />
            <InputField
              placeholder="Email"
              value={data.to.email || ""}
              onChange={(e) => setData({ ...data, to: { ...data.to, email: e.target.value } })}
            />
            <InputField
              placeholder="Phone"
              value={data.to.phone || ""}
              onChange={(e) => setData({ ...data, to: { ...data.to, phone: e.target.value } })}
            />
            <TextareaField
              placeholder="Address"
              value={data.to.address || ""}
              onValueChange={(v) => setData({ ...data, to: { ...data.to, address: v } })}
              textareaClassName="min-h-[150px]"
            />
          </div>
        </CardContent>
      </GlassCard>

      {/* Items */}
      <GlassCard>
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
            const amount = safeNum(it.qty) * safeNum(it.rate);
            return (
              <div
                key={it.id}
                className="grid grid-cols-1 md:grid-cols-12 gap-2 border rounded-lg p-3"
              >
                <div className="md:col-span-4 space-y-2">
                  <Label className="md:hidden">Name</Label>
                  <InputField
                    value={it.name}
                    onChange={(e) => updateRow(it.id, { name: e.target.value })}
                    placeholder="Item name"
                  />
                </div>

                <div className="md:col-span-3 space-y-2">
                  <Label className="md:hidden">Description</Label>
                  <InputField
                    value={it.description || ""}
                    onChange={(e) => updateRow(it.id, { description: e.target.value })}
                    placeholder="Optional"
                  />
                </div>

                <div className="md:col-span-2 space-y-2">
                  <Label className="md:hidden">Qty</Label>
                  <InputField
                    type="number"
                    inputMode="decimal"
                    min={0}
                    value={safeNum(it.qty)}
                    onChange={(e) =>
                      updateRow(it.id, { qty: Math.max(0, Number(e.target.value) || 0) })
                    }
                  />
                </div>

                <div className="md:col-span-2 space-y-2">
                  <Label className="md:hidden">Rate</Label>
                  <InputField
                    type="number"
                    inputMode="decimal"
                    min={0}
                    value={safeNum(it.rate)}
                    onChange={(e) =>
                      updateRow(it.id, { rate: Math.max(0, Number(e.target.value) || 0) })
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    Amount: {fmtCurrency(amount, data.currency, data.currencyMode)}
                  </p>
                </div>

                <div className="md:col-span-1 flex md:items-start  gap-2">
                  <ActionButton
                    icon={Copy}
                    size="icon"
                    aria-label="Clone"
                    onClick={() => cloneRow(it.id)}
                  />
                  <ActionButton
                    icon={Trash2}
                    size="icon"
                    variant="destructive"
                    aria-label="Remove"
                    onClick={() => removeRow(it.id)}
                  />
                </div>
              </div>
            );
          })}

          <div className="flex justify-between">
            <ActionButton icon={Plus} label="Add Item" onClick={addRow} />
            <div className="text-sm text-muted-foreground hidden md:block pr-1">
              Subtotal: {fmtCurrency(subTotal, data.currency, data.currencyMode)}
            </div>
          </div>
        </CardContent>
      </GlassCard>

      {/* Summary */}
      <GlassCard>
        <CardHeader>
          <CardTitle className="text-base">Summary</CardTitle>
          <CardDescription>Discounts, tax, shipping, and total.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-3">
            <TextareaField
              label="Notes"
              value={data.notes || ""}
              onValueChange={(v) => setData({ ...data, notes: v })}
              placeholder="Optional notes, payment instructions, bank details, etc."
              textareaClassName="min-h-[320px]"
            />
          </div>

          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <InputField
                label="Discount %"
                type="number"
                min={0}
                max={100}
                value={safeNum(data.discountPercent)}
                onChange={(e) =>
                  setData((d) => ({
                    ...d,
                    discountPercent: clamp(Number(e.target.value) || 0, 0, 100),
                  }))
                }
              />
              <InputField
                label="Tax %"
                type="number"
                min={0}
                max={100}
                value={safeNum(data.taxPercent)}
                onChange={(e) =>
                  setData((d) => ({
                    ...d,
                    taxPercent: clamp(Number(e.target.value) || 0, 0, 100),
                  }))
                }
              />
              <InputField
                className="col-span-2"
                label="Shipping"
                type="number"
                min={0}
                value={safeNum(data.shipping)}
                onChange={(e) =>
                  setData((d) => ({ ...d, shipping: Math.max(0, Number(e.target.value) || 0) }))
                }
              />
            </div>

            <Separator />

            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{fmtCurrency(subTotal, data.currency, data.currencyMode)}</span>
              </div>
              <div className="flex justify-between">
                <span>Discount</span>
                <span>- {fmtCurrency(discountAmt, data.currency, data.currencyMode)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>{fmtCurrency(data.shipping || 0, data.currency, data.currencyMode)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax</span>
                <span>{fmtCurrency(taxAmt, data.currency, data.currencyMode)}</span>
              </div>

              <div className="flex justify-between font-semibold text-base pt-1">
                <span>Total</span>
                <span className="flex items-center gap-2">
                  {fmtCurrency(grandTotal, data.currency, data.currencyMode)}
                </span>
              </div>

              <div className={cn("flex justify-between", data.paid ? "text-emerald-600" : "")}>
                <span>Balance Due</span>
                <span>{fmtCurrency(balanceDue, data.currency, data.currencyMode)}</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Badge variant="secondary" className="w-fit">
                All amounts in {data.currencyMode === "code" ? data.currency : `“${data.currency}”`}
              </Badge>
              <CopyButton size="sm" getText={() => String(grandTotal.toFixed(2))} />
            </div>
          </div>
        </CardContent>
      </GlassCard>

      {/* Print Preview */}
      <GlassCard className="shadow-sm print:shadow-none print:bg-white print:border-0">
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
                      <td className="py-2 text-right">{safeNum(it.qty)}</td>
                      <td className="py-2 text-right">
                        {fmtCurrency(safeNum(it.rate), data.currency, data.currencyMode)}
                      </td>
                      <td className="py-2 text-right">
                        {fmtCurrency(
                          safeNum(it.qty) * safeNum(it.rate),
                          data.currency,
                          data.currencyMode,
                        )}
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
                  <span>{fmtCurrency(subTotal, data.currency, data.currencyMode)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Discount ({clamp(safeNum(data.discountPercent), 0, 100)}%)
                  </span>
                  <span>- {fmtCurrency(discountAmt, data.currency, data.currencyMode)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>{fmtCurrency(data.shipping || 0, data.currency, data.currencyMode)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Tax ({clamp(safeNum(data.taxPercent), 0, 100)}%)
                  </span>
                  <span>{fmtCurrency(taxAmt, data.currency, data.currencyMode)}</span>
                </div>
                <div className="flex justify-between font-semibold text-base pt-1">
                  <span>Total</span>
                  <span>{fmtCurrency(grandTotal, data.currency, data.currencyMode)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Amount Paid</span>
                  <span>{fmtCurrency(data.amountPaid || 0, data.currency, data.currencyMode)}</span>
                </div>
                <div className={cn("flex justify-between", data.paid ? "text-emerald-600" : "")}>
                  <span>Balance Due</span>
                  <span>{fmtCurrency(balanceDue, data.currency, data.currencyMode)}</span>
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
              Generated with Tools Cube — Simple Invoice
            </div>
          </div>
        </CardContent>
      </GlassCard>
    </>
  );
}
