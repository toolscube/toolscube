'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Check, Copy, Key, RotateCcw } from 'lucide-react';
import React from 'react';

function generatePassword(length: number, opts: { upper: boolean; lower: boolean; numbers: boolean; symbols: boolean }): string {
  const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lower = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*()-_=+[]{};:,.<>/?';

  let chars = '';
  if (opts.upper) chars += upper;
  if (opts.lower) chars += lower;
  if (opts.numbers) chars += numbers;
  if (opts.symbols) chars += symbols;
  if (!chars) chars = lower;

  let pwd = '';
  const array = new Uint32Array(length);
  crypto.getRandomValues(array);
  for (let i = 0; i < length; i++) {
    pwd += chars[array[i] % chars.length];
  }
  return pwd;
}

export default function PasswordGeneratorPage() {
  const [length, setLength] = React.useState(16);
  const [upper, setUpper] = React.useState(true);
  const [lower, setLower] = React.useState(true);
  const [numbers, setNumbers] = React.useState(true);
  const [symbols, setSymbols] = React.useState(false);
  const [count, setCount] = React.useState(5);

  const [passwords, setPasswords] = React.useState<string[]>([]);
  const [copied, setCopied] = React.useState<string | null>(null);

  function run() {
    const list: string[] = [];
    for (let i = 0; i < count; i++) {
      list.push(generatePassword(length, { upper, lower, numbers, symbols }));
    }
    setPasswords(list);
  }

  function resetAll() {
    setLength(16);
    setUpper(true);
    setLower(true);
    setNumbers(true);
    setSymbols(false);
    setCount(5);
    setPasswords([]);
  }

  async function copyOne(pwd: string) {
    await navigator.clipboard.writeText(pwd);
    setCopied(pwd);
    setTimeout(() => setCopied(null), 1200);
  }

  return (
    <div className="container mx-auto max-w-4xl p-4 md:p-6 lg:p-8">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
            <Key className="h-6 w-6" /> Password Generator
          </h1>
          <p className="text-sm text-muted-foreground">Generate secure random passwords with custom rules.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={resetAll} className="gap-2">
            <RotateCcw className="h-4 w-4" /> Reset
          </Button>
          <Button onClick={run} className="gap-2">
            <Key className="h-4 w-4" /> Generate
          </Button>
        </div>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Settings</CardTitle>
          <CardDescription>Customize password length and character sets.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="length">Length</Label>
            <Input id="length" type="number" min={4} max={128} value={length} onChange={(e) => setLength(Number(e.target.value) || 4)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="count">Count</Label>
            <Input id="count" type="number" min={1} max={50} value={count} onChange={(e) => setCount(Number(e.target.value) || 1)} />
          </div>
          <div className="col-span-2 space-y-2">
            <Label>Character Sets</Label>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <Switch checked={upper} onCheckedChange={setUpper} /> Uppercase
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={lower} onCheckedChange={setLower} /> Lowercase
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={numbers} onCheckedChange={setNumbers} /> Numbers
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={symbols} onCheckedChange={setSymbols} /> Symbols
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Separator className="my-6" />

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Generated Passwords</CardTitle>
          <CardDescription>Click copy to save a password.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          {passwords.length === 0 && <p className="text-sm text-muted-foreground">No passwords yet. Click Generate.</p>}
          {passwords.map((pwd, i) => (
            <div key={i} className="flex flex-col gap-2 rounded-md border p-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-sm">Password {i + 1}</span>
                <Button variant="outline" size="sm" className="gap-2" onClick={() => copyOne(pwd)}>
                  {copied === pwd ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  Copy
                </Button>
              </div>
              <Textarea readOnly value={pwd} className="min-h-[60px] font-mono" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
