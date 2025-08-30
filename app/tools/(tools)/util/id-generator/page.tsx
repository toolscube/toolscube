'use client';

import { Button } from '@/components/ui/button';
import { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GlassCard, MotionGlassCard } from '@/components/ui/glass-card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Check, Copy, Download, Hash, RefreshCw, RotateCcw } from 'lucide-react';
import { useState } from 'react';

// ---------- Helpers ----------

function uid(prefix = 'id') {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}

function randomHex(len: number) {
  const arr = new Uint8Array(len / 2);
  crypto.getRandomValues(arr);
  return Array.from(arr)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function makeUUID() {
  // v4 UUID
  const arr = new Uint8Array(16);
  crypto.getRandomValues(arr);
  arr[6] = (arr[6] & 0x0f) | 0x40;
  arr[8] = (arr[8] & 0x3f) | 0x80;
  const s = Array.from(arr)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  return `${s.substr(0, 8)}-${s.substr(8, 4)}-${s.substr(12, 4)}-${s.substr(16, 4)}-${s.substr(20)}`;
}

function makeNanoId(len = 12) {
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  const arr = new Uint8Array(len);
  crypto.getRandomValues(arr);
  return Array.from(arr)
    .map((b) => chars[b % chars.length])
    .join('');
}

function makeOrderId(prefix = 'ORD') {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, '0')}`;
}

function download(filename: string, content: string, mime = 'text/plain') {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

// ---------- Page ----------

export default function IdGeneratorPage() {
  const [uuids, setUuids] = useState<string[]>([]);
  const [count, setCount] = useState(5);
  const [length, setLength] = useState(12);
  const [copied, setCopied] = useState<string | null>(null);

  const run = () => {
    const out: string[] = [];
    for (let i = 0; i < count; i++) {
      out.push(makeUUID());
    }
    setUuids(out);
  };

  const runNano = () => {
    const out: string[] = [];
    for (let i = 0; i < count; i++) {
      out.push(makeNanoId(length));
    }
    setUuids(out);
  };

  const runOrder = () => {
    const out: string[] = [];
    for (let i = 0; i < count; i++) {
      out.push(makeOrderId('ORD'));
    }
    setUuids(out);
  };

  const copyOne = async (txt: string) => {
    try {
      await navigator.clipboard.writeText(txt);
      setCopied(txt);
      setTimeout(() => setCopied(null), 1200);
    } catch {}
  };

  const exportTxt = () => download('ids.txt', uuids.join('\n'), 'text/plain');

  const resetAll = () => {
    setUuids([]);
    setCount(5);
    setLength(12);
  };

  return (
    <div className="space-y-4">
      <MotionGlassCard>
        <GlassCard className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-6">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
              <Hash className="h-6 w-6" /> GUID / Order ID
            </h1>
            <p className="text-sm text-muted-foreground">Generate UUIDs, NanoIDs, and readable order IDs.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={resetAll} className="gap-2">
              <RotateCcw className="h-4 w-4" /> Reset
            </Button>
            <Button variant="outline" onClick={exportTxt} className="gap-2">
              <Download className="h-4 w-4" /> Export
            </Button>
          </div>
        </GlassCard>

        {/* Settings */}
        <GlassCard className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Settings</CardTitle>
            <CardDescription>Configure type and count.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="count">Count</Label>
              <Input id="count" type="number" min={1} max={100} value={count} onChange={(e) => setCount(Number(e.target.value) || 1)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="length">NanoID Length</Label>
              <Input id="length" type="number" min={4} max={64} value={length} onChange={(e) => setLength(Number(e.target.value) || 4)} />
              <p className="text-xs text-muted-foreground">Applies to NanoID only</p>
            </div>
            <div className="flex items-end gap-2">
              <Button onClick={run} className="gap-2">
                <RefreshCw className="h-4 w-4" /> UUID
              </Button>
              <Button onClick={runNano} className="gap-2">
                <RefreshCw className="h-4 w-4" /> NanoID
              </Button>
              <Button onClick={runOrder} className="gap-2">
                <RefreshCw className="h-4 w-4" /> OrderID
              </Button>
            </div>
          </CardContent>
        </GlassCard>

        <Separator />

        {/* Results */}
        <GlassCard className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Generated IDs</CardTitle>
            <CardDescription>Click copy to use an ID.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            {uuids.length === 0 && <p className="text-sm text-muted-foreground">No IDs yet. Click generate above.</p>}
            {uuids.map((id) => (
              <div key={id} className="flex items-center justify-between rounded-md border p-3">
                <span className="font-mono text-sm break-all">{id}</span>
                <Button variant="outline" size="sm" className="gap-2" onClick={() => copyOne(id)}>
                  {copied === id ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />} Copy
                </Button>
              </div>
            ))}
          </CardContent>
        </GlassCard>
      </MotionGlassCard>
    </div>
  );
}
