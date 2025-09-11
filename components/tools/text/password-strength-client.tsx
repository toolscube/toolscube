"use client";

import { Eye, EyeOff, Info, Key, Shield, ShieldAlert, ShieldCheck, Timer } from "lucide-react";
import * as React from "react";
import { ActionButton, CopyButton, ResetButton } from "@/components/shared/action-buttons";
import TextareaField from "@/components/shared/form-fields/textarea-field";
import ToolPageHeader from "@/components/shared/tool-page-header";
import { Badge } from "@/components/ui/badge";
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GlassCard } from "@/components/ui/glass-card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  bandColor,
  bandFromEntropy,
  calcEntropyBits,
  crackTimes,
  findIssues,
} from "@/lib/utils/password-strength";

export default function PasswordStrengthClient() {
  const [pw, setPw] = React.useState("");
  const [show, setShow] = React.useState(false);
  const [showEntropyDetail, setShowEntropyDetail] = React.useState(false);

  const bits = React.useMemo(() => calcEntropyBits(pw), [pw]);
  const band = React.useMemo(() => bandFromEntropy(bits), [bits]);
  const issues = React.useMemo(() => findIssues(pw), [pw]);
  const times = React.useMemo(() => crackTimes(bits), [bits]);

  const meterPct = React.useMemo(() => {
    const capped = Math.max(0, Math.min(140, bits));
    return Math.round((capped / 140) * 100);
  }, [bits]);

  function resetAll() {
    setPw("");
    setShow(false);
    setShowEntropyDetail(false);
  }

  const estimatedCrackTimes = [
    { label: "Online (10/sec)", value: times.online_throttled },
    { label: "Online Fast (100/sec)", value: times.online_fast },
    { label: "Offline (slow hash ~100k/sec)", value: times.offline_slow_hash },
    { label: "Offline (fast hash ~10B/sec)", value: times.offline_fast_hash },
    { label: "Nation-state (1T/sec)", value: times.nation_state },
  ];

  return (
    <>
      {/* Header */}
      <ToolPageHeader
        icon={ShieldCheck}
        title="Password Strength"
        description="Check password entropy, estimated crack times, and get actionable hints to harden your password."
        actions={
          <>
            <ResetButton onClick={resetAll} />
            <CopyButton variant="default" getText={() => pw || ""} disabled={!pw} />
          </>
        }
      />

      {/* Input & Meter */}
      <GlassCard>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Enter Password</CardTitle>
          <CardDescription>
            Your password is processed locally in the browser — never sent anywhere.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="space-y-2">
            <Label htmlFor="pw" className="flex items-center gap-2">
              <Key className="h-4 w-4" /> Password
            </Label>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 overflow-hidden rounded-md dark:bg-transparent w-full">
                <Input
                  id="pw"
                  type={show ? "text" : "password"}
                  value={pw}
                  onChange={(e) => setPw(e.target.value)}
                  placeholder="Type a password to evaluate…"
                  autoComplete="off"
                />
              </div>
              <ActionButton icon={show ? EyeOff : Eye} onClick={() => setShow((s) => !s)} />
            </div>
          </div>

          {/* Meter */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                {band === "Very Weak" || band === "Weak" ? (
                  <ShieldAlert className="h-4 w-4 text-orange-500" />
                ) : (
                  <Shield className="h-4 w-4 text-emerald-600" />
                )}
                <span className="font-medium">{band}</span>
              </div>
              <Badge variant="secondary" className="font-normal">
                {bits.toFixed(1)} bits
              </Badge>
            </div>
            <div className="h-2 w-full rounded-md bg-muted overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${bandColor(band)}`}
                style={{ width: `${meterPct}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>0</span>
              <span>140+ bits</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Info className="h-3.5 w-3.5" />
                <span>
                  Entropy is estimated as <code className="font-mono">length × log₂(charset)</code>.
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Label htmlFor="detail" className="text-xs text-muted-foreground">
                  Show details
                </Label>
                <Switch
                  id="detail"
                  checked={showEntropyDetail}
                  onCheckedChange={setShowEntropyDetail}
                />
              </div>
            </div>

            {showEntropyDetail && (
              <div className="rounded-md border p-3 text-xs text-muted-foreground">
                <p>
                  Charset estimate considers lowercase (26), uppercase (26), digits (10), symbols
                  (~33) and spaces. Non-ASCII chars add extra variety. This is a theoretical upper
                  bound; real attackers use dictionaries & patterns.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </GlassCard>

      <Separator />

      {/* Crack time & Hints */}
      <GlassCard>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Estimated Crack Times</CardTitle>
          <CardDescription>
            How long a brute-force/dictionary attack could take, under different assumptions.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2">
          <div className="space-y-3">
            <div className="grid grid-cols-1 gap-2 text-sm">
              {estimatedCrackTimes.map((time, idx) => (
                <div
                  key={idx as number}
                  className="flex items-center justify-between rounded-md border p-2"
                >
                  <div className="flex items-center gap-2">
                    <Timer className="h-4 w-4" />
                    {time.label}
                  </div>
                  <Badge className="capitalize" variant="outline">
                    {time.value}
                  </Badge>
                </div>
              ))}
            </div>

            <p className="text-xs text-muted-foreground">
              Reality varies with attacker hardware, hashing algorithm, rate limits, 2FA, and
              whether the password appears in breach dumps.
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Hints & Findings</Label>
                <p className="text-xs text-muted-foreground">Suggestions update as you type.</p>
              </div>
              <Badge variant="secondary">
                {issues.length === 0 ? "Looking good" : `${issues.length} hints`}
              </Badge>
            </div>

            <div className="rounded-md border p-3">
              {pw.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Start typing above to see tailored hints.
                </p>
              ) : issues.length === 0 ? (
                <div className="flex items-center gap-2 text-sm text-emerald-600">
                  <ShieldCheck className="h-4 w-4" />
                  No obvious weaknesses detected. Consider using a password manager for unique, long
                  passwords.
                </div>
              ) : (
                <ul className="list-disc pl-6 text-sm space-y-1">
                  {issues.map((i, idx) => (
                    <li key={idx as number}>{i}</li>
                  ))}
                </ul>
              )}
            </div>

            <div className="rounded-md border p-3 text-xs text-muted-foreground">
              <p className="font-medium mb-1">Best practices</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Use 14–20+ characters; passphrases are great (four+ random words).</li>
                <li>
                  Mix lower/upper, digits, and symbols — but avoid predictable substitutions (e.g.,{" "}
                  <code>a→@</code>).
                </li>
                <li>
                  Avoid dictionary words, names, dates, keyboard patterns, or company/product names.
                </li>
                <li>Never reuse passwords; enable 2FA wherever possible.</li>
                <li>Prefer a password manager to generate & store unique passwords.</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </GlassCard>

      {/* Optional: quick scratchpad to test multiple candidates */}
      <GlassCard>
        <CardHeader>
          <CardTitle className="text-base">Batch Test (Optional)</CardTitle>
          <CardDescription>
            One candidate per line — we’ll score them quickly (no data leaves your browser).
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3">
          <BatchTester />
        </CardContent>
      </GlassCard>
    </>
  );
}

// Batch Tester
function BatchTester() {
  const [text, setText] = React.useState("");
  const lines = React.useMemo(
    () =>
      text
        .split("\n")
        .filter((l) => l.length > 0)
        .slice(0, 200),
    [text],
  );

  const rows = React.useMemo(() => {
    return lines.map((l) => {
      const b = calcEntropyBits(l);
      const band = bandFromEntropy(b);
      return { sample: l, bits: b, band, issues: findIssues(l) };
    });
  }, [lines]);

  return (
    <>
      <TextareaField
        value={text}
        onValueChange={setText}
        placeholder="candidate-one
P@ssw0rd!
Tr0ub4dor&3
correct horse battery staple"
        textareaClassName="min-h-[140px]"
        autoResize
      />
      <div className="rounded-md border p-2 overflow-x-auto">
        {rows.length === 0 ? (
          <p className="text-sm text-muted-foreground px-1">Add lines above to see results.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-muted-foreground">
                <th className="py-2 pr-4">Password</th>
                <th className="py-2 pr-4">Entropy (bits)</th>
                <th className="py-2 pr-4">Band</th>
                <th className="py-2">Hints</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i as number} className="border-t">
                  <td className="py-2 pr-4 font-mono break-all">{r.sample}</td>
                  <td className="py-2 pr-4">{r.bits.toFixed(1)}</td>
                  <td className="py-2 pr-4">
                    <span
                      className={`inline-flex items-center rounded px-2 py-0.5 text-xs text-white ${bandColor(r.band)} `}
                    >
                      {r.band}
                    </span>
                  </td>
                  <td className="py-2">
                    {r.issues.length === 0 ? (
                      <span className="text-emerald-600">OK</span>
                    ) : (
                      <span className="text-muted-foreground">{r.issues.join(" • ")}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
