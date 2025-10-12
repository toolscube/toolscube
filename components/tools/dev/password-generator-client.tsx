"use client";

import { Key, ShieldAlert, ShieldCheck } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActionButton,
  CopyButton,
  ExportTextButton,
  ResetButton,
} from "@/components/shared/action-buttons";
import InputField from "@/components/shared/form-fields/input-field";
import SwitchRow from "@/components/shared/form-fields/switch-row";
import TextareaField from "@/components/shared/form-fields/textarea-field";
import Stat from "@/components/shared/stat";
import ToolPageHeader from "@/components/shared/tool-page-header";

import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GlassCard } from "@/components/ui/glass-card";
import { Separator } from "@/components/ui/separator";
import { trackToolConversion, trackToolUsage } from "@/lib/gtm";
import {
  buildCharset,
  DEFAULT_SYMBOLS,
  ensureAtLeastOneFromEach,
  entropyBits,
  strengthLabel,
} from "@/lib/utils/dev/password-generator";

export default function PasswordGeneratorClient() {
  const [length, setLength] = useState<number>(16);
  const [count, setCount] = useState<number>(18);
  const [flags, setFlags] = useState<GenFlags>({
    upper: true,
    lower: true,
    numbers: true,
    symbols: false,
    excludeAmbiguous: true,
    requireEachSet: true,
  });
  const [customSymbols, setCustomSymbols] = useState<string>(DEFAULT_SYMBOLS);
  const [autoRun, setAutoRun] = useState<boolean>(true);
  const [passwords, setPasswords] = useState<string[]>([]);

  const charset = useMemo(() => buildCharset(flags, customSymbols), [flags, customSymbols]);
  const bits = useMemo(() => entropyBits(length, charset.length), [length, charset.length]);
  const strength = useMemo(() => strengthLabel(bits), [bits]);

  const run = useCallback(() => {
    trackToolUsage("Password Generator", "Developer");
    const out: string[] = [];
    for (let i = 0; i < Math.max(1, count); i++) {
      out.push(ensureAtLeastOneFromEach(Math.max(4, length), flags, charset, customSymbols));
    }
    setPasswords(out);
    trackToolConversion("Password Generator", "generated");
  }, [count, length, flags, charset, customSymbols]);

  useEffect(() => {
    if (autoRun) run();
  }, [autoRun, run]);

  function resetAll() {
    setLength(16);
    setCount(18);
    setFlags({
      upper: true,
      lower: true,
      numbers: true,
      symbols: false,
      excludeAmbiguous: true,
      requireEachSet: true,
    });
    setCustomSymbols(DEFAULT_SYMBOLS);
    setPasswords([]);
    setAutoRun(true);
  }

  const allText = useMemo(() => passwords.join("\n"), [passwords]);

  return (
    <>
      <ToolPageHeader
        icon={Key}
        title="Password Generator"
        description="Secure, customizable passwords with entropy and bias‑free randomness."
        actions={
          <>
            <ResetButton onClick={resetAll} />
            <CopyButton getText={() => allText} disabled={!allText} />
            <ExportTextButton
              filename="passwords.txt"
              getText={() => allText || ""}
              disabled={!allText}
            />
            <ActionButton variant="default" label="Generate" icon={Key} onClick={run} />
          </>
        }
      />

      {/* Quick stats */}
      <div className="mb-4 grid gap-3 sm:grid-cols-4">
        <Stat label="Count" value={count} />
        <Stat label="Length" value={length} />
        <Stat label="Charset" value={charset.length} hint="unique characters" />
        <Stat
          label="Entropy"
          value={`${bits.toFixed(1)} bits`}
          hint={strength.label}
          Icon={strength.tone === "warn" ? ShieldAlert : ShieldCheck}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Left: Settings */}
        <GlassCard>
          <CardHeader>
            <CardTitle className="text-base">Settings</CardTitle>
            <CardDescription>Length, count, character sets, and rules.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <InputField
                label="Length"
                type="number"
                min={4}
                max={128}
                value={String(length)}
                onChange={(e) => setLength(Math.min(128, Math.max(4, Number(e.target.value) || 4)))}
              />
              <InputField
                label="Count"
                type="number"
                min={1}
                max={100}
                value={String(count)}
                onChange={(e) => setCount(Math.min(100, Math.max(1, Number(e.target.value) || 1)))}
              />
            </div>

            <SwitchRow
              label="Uppercase (A–Z)"
              checked={flags.upper}
              onCheckedChange={(v) => setFlags((f) => ({ ...f, upper: Boolean(v) }))}
            />
            <SwitchRow
              label="Lowercase (a–z)"
              checked={flags.lower}
              onCheckedChange={(v) => setFlags((f) => ({ ...f, lower: Boolean(v) }))}
            />
            <SwitchRow
              label="Numbers (0–9)"
              checked={flags.numbers}
              onCheckedChange={(v) => setFlags((f) => ({ ...f, numbers: Boolean(v) }))}
            />
            <SwitchRow
              label="Symbols"
              checked={flags.symbols}
              onCheckedChange={(v) => setFlags((f) => ({ ...f, symbols: Boolean(v) }))}
            />
            <TextareaField
              label="Custom symbols"
              value={customSymbols}
              onValueChange={setCustomSymbols}
              textareaClassName="min-h-[64px] font-mono"
              placeholder={DEFAULT_SYMBOLS}
              disabled={!flags.symbols}
            />

            <Separator />

            <SwitchRow
              label="Exclude ambiguous characters"
              hint="Avoid 0/O, 1/l/I, brackets, angle brackets, quotes, etc."
              checked={flags.excludeAmbiguous}
              onCheckedChange={(v) => setFlags((f) => ({ ...f, excludeAmbiguous: Boolean(v) }))}
            />
            <SwitchRow
              label="Require at least one from each selected set"
              checked={flags.requireEachSet}
              onCheckedChange={(v) => setFlags((f) => ({ ...f, requireEachSet: Boolean(v) }))}
            />

            <Separator />

            <SwitchRow
              label="Auto‑generate"
              checked={autoRun}
              onCheckedChange={(v) => setAutoRun(Boolean(v))}
            />
          </CardContent>
        </GlassCard>

        {/* Right: Output */}
        <GlassCard className="shadow-sm lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Generated Passwords</CardTitle>
            <CardDescription>Click a copy button or export all as a text file.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            {passwords.length === 0 ? (
              <div className="rounded-md border p-3 text-sm text-muted-foreground">
                No passwords yet. Click <em>Generate</em> or enable Auto‑generate.
              </div>
            ) : null}
            {passwords.map((pwd, i) => (
              <div
                key={`pwd-${i as number}`}
                className="flex items-center justify-between rounded-md border p-3"
              >
                <span className="font-mono text-sm break-all">{pwd}</span>
                <CopyButton size="sm" getText={() => pwd} />
              </div>
            ))}
          </CardContent>
        </GlassCard>
      </div>
    </>
  );
}
