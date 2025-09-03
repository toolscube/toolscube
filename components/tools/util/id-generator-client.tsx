"use client";

import { Hash, Play, Shuffle, Wand2 } from "lucide-react";
import { useMemo, useState } from "react";
import {
  ActionButton,
  CopyButton,
  ExportCSVButton,
  ExportTextButton,
  ResetButton,
} from "@/components/shared/action-buttons";
import { InputField } from "@/components/shared/form-fields/input-field";
import SelectField from "@/components/shared/form-fields/select-field";
import SwitchRow from "@/components/shared/form-fields/switch-row";
import ToolPageHeader from "@/components/shared/tool-page-header";
import { Badge } from "@/components/ui/badge";
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GlassCard } from "@/components/ui/glass-card";
import { Separator } from "@/components/ui/separator";

type Mode = "uuid" | "ulid" | "nanoid" | "hex" | "order";

function pad(n: number, w = 2) {
  return n.toString().padStart(w, "0");
}
function todayYmd() {
  const d = new Date();
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`;
}

/** Generators */
function uuidV4({ upper = false, noHyphen = false }: { upper?: boolean; noHyphen?: boolean } = {}) {
  let s = typeof crypto.randomUUID === "function" ? crypto.randomUUID() : fallbackUuidV4();
  if (noHyphen) s = s.replace(/-/g, "");
  if (upper) s = s.toUpperCase();
  return s;
}
function fallbackUuidV4() {
  const a = new Uint8Array(16);
  crypto.getRandomValues(a);
  a[6] = (a[6] & 0x0f) | 0x40;
  a[8] = (a[8] & 0x3f) | 0x80;
  const s = Array.from(a)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return `${s.slice(0, 8)}-${s.slice(8, 12)}-${s.slice(12, 16)}-${s.slice(16, 20)}-${s.slice(20)}`;
}

function ulid({ upper = true }: { upper?: boolean } = {}) {
  const ENCODING = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
  const time = Date.now();
  const timeChars = new Array(10);
  let t = time;
  for (let i = 9; i >= 0; i--) {
    timeChars[i] = ENCODING[t % 32];
    t = Math.floor(t / 32);
  }
  const rand = new Uint8Array(16); // 128 bits; we’ll only use 80 bits (five 16-bit chunks)
  crypto.getRandomValues(rand);
  // 80 bits -> 16 Base32 chars
  const randChars = new Array(16);
  // pack bits 80 => 16*5 groups
  // We'll compute by consuming 5 bits at a time across the 80 random bits
  // Create a bit reader from first 10 bytes (80 bits)
  let acc = 0;
  let bits = 0;
  let idx = 0;
  for (let i = 0; i < 10; i++) {
    acc = (acc << 8) | rand[i];
    bits += 8;
    while (bits >= 5 && idx < 16) {
      bits -= 5;
      randChars[idx++] = ENCODING[(acc >> bits) & 31];
    }
  }
  const out = (timeChars.join("") + randChars.join("")) as string;
  return upper ? out : out.toLowerCase();
}

function nanoId(
  len = 12,
  alphabet = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
) {
  const a = new Uint8Array(len);
  crypto.getRandomValues(a);
  const al = alphabet.length;
  return Array.from(a, (b) => alphabet[b % al]).join("");
}

function randomHex(len = 16) {
  const bytes = new Uint8Array(Math.ceil(len / 2));
  crypto.getRandomValues(bytes);
  let hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
  if (len % 2) hex = hex.slice(0, len);
  return hex;
}

function makeOrderId({
  prefix = "ORD",
  includeDate = true,
}: {
  prefix?: string;
  includeDate?: boolean;
} = {}) {
  const ts = includeDate ? todayYmd() : Date.now().toString();
  const tail = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0");
  return `${prefix}-${ts}-${tail}`;
}

export default function IdGeneratorClient() {
  const [mode, setMode] = useState<Mode>("uuid");

  // batch/options
  const [count, setCount] = useState(5);
  const [ensureUnique, setEnsureUnique] = useState(true);
  const [sortOut, setSortOut] = useState(false);

  // global post-processing
  const [prefix, setPrefix] = useState("");
  const [suffix, setSuffix] = useState("");
  const [separator, setSeparator] = useState<"newline" | "comma" | "space">("newline");

  // per-mode options
  const [uuidUpper, setUuidUpper] = useState(false);
  const [uuidNoHyphen, setUuidNoHyphen] = useState(false);

  const [ulidUpper, setUlidUpper] = useState(true);

  const [nanoLen, setNanoLen] = useState(12);
  const [nanoAlphabet, setNanoAlphabet] = useState(
    "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
  );

  const [hexLen, setHexLen] = useState(16);

  const [orderPrefix, setOrderPrefix] = useState("ORD");
  const [orderIncludeDate, setOrderIncludeDate] = useState(true);

  const [rows, setRows] = useState<string[]>([]);

  const sepStr = separator === "newline" ? "\n" : separator === "comma" ? "," : " ";
  const processed = useMemo(() => {
    let out = rows;
    if (ensureUnique) {
      const seen = new Set<string>();
      out = out.filter((x) => (seen.has(x) ? false : (seen.add(x), true)));
    }
    if (sortOut) {
      out = [...out].sort();
    }
    if (prefix || suffix) {
      out = out.map((x) => `${prefix}${x}${suffix}`);
    }
    return out;
  }, [rows, ensureUnique, sortOut, prefix, suffix]);

  const generate = () => {
    const res: string[] = [];
    for (let i = 0; i < Math.max(1, Math.min(1000, count)); i++) {
      switch (mode) {
        case "uuid":
          res.push(uuidV4({ upper: uuidUpper, noHyphen: uuidNoHyphen }));
          break;
        case "ulid":
          res.push(ulid({ upper: ulidUpper }));
          break;
        case "nanoid":
          res.push(
            nanoId(
              Math.max(4, Math.min(64, nanoLen)),
              nanoAlphabet || "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
            ),
          );
          break;
        case "hex":
          res.push(randomHex(Math.max(4, Math.min(128, hexLen))));
          break;
        case "order":
          res.push(
            makeOrderId({
              prefix: orderPrefix || "ORD",
              includeDate: orderIncludeDate,
            }),
          );
          break;
      }
    }
    setRows(res);
  };

  const copyAllText = () => processed.join(sepStr);

  const resetAll = () => {
    setMode("uuid");
    setCount(5);
    setEnsureUnique(true);
    setSortOut(false);
    setPrefix("");
    setSuffix("");
    setSeparator("newline");

    setUuidUpper(false);
    setUuidNoHyphen(false);

    setUlidUpper(true);

    setNanoLen(12);
    setNanoAlphabet("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz");

    setHexLen(16);

    setOrderPrefix("ORD");
    setOrderIncludeDate(true);

    setRows([]);
  };

  return (
    <>
      <ToolPageHeader
        icon={Hash}
        title="GUID / Order ID"
        description="Generate UUIDs, ULIDs, NanoIDs, HEX strings, and readable order IDs. Copy, export, and tweak formats."
        actions={
          <>
            <ResetButton onClick={resetAll} />
            <ExportTextButton
              variant="default"
              filename="ids.txt"
              getText={() => processed.join("\n")}
              label="Export .txt"
              disabled={processed.length === 0}
            />
            <ExportCSVButton
              filename="ids.csv"
              getRows={() => processed.map((x, i) => [i + 1, x])}
              label="Export .csv"
              disabled={processed.length === 0}
            />
          </>
        }
      />

      {/* Settings */}
      <GlassCard className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Settings</CardTitle>
          <CardDescription>Pick the ID type and customize generation.</CardDescription>
        </CardHeader>

        <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <SelectField
            label="Type"
            value={mode}
            onValueChange={(v) => setMode((v as Mode) ?? "uuid")}
            options={[
              { label: "UUID v4", value: "uuid" },
              { label: "ULID", value: "ulid" },
              { label: "NanoID", value: "nanoid" },
              { label: "HEX", value: "hex" },
              { label: "Order ID", value: "order" },
            ]}
          />
          <InputField
            label="Count"
            type="number"
            min={1}
            max={1000}
            value={count}
            onChange={(e) => setCount(Math.max(1, Math.min(1000, Number(e.target.value) || 1)))}
          />
          <SelectField
            label="Copy All Separator"
            value={separator}
            onValueChange={(v) => setSeparator((v as any) ?? "newline")}
            options={[
              { label: "New line", value: "newline" },
              { label: "Comma", value: "comma" },
              { label: "Space", value: "space" },
            ]}
          />

          {/* Global post-processing */}
          <InputField
            label="Add Prefix"
            value={prefix}
            onChange={(e) => setPrefix(e.target.value)}
          />
          <InputField
            label="Add Suffix"
            value={suffix}
            onChange={(e) => setSuffix(e.target.value)}
          />
          <div className="grid gap-2">
            <SwitchRow
              label="Ensure unique (within batch)"
              checked={ensureUnique}
              onCheckedChange={setEnsureUnique}
            />
            <SwitchRow label="Sort output" checked={sortOut} onCheckedChange={setSortOut} />
          </div>

          {/* Per-mode options */}
          {mode === "uuid" && (
            <>
              <div className="grid gap-2">
                <SwitchRow label="Uppercase" checked={uuidUpper} onCheckedChange={setUuidUpper} />
                <SwitchRow
                  label="Remove hyphens"
                  checked={uuidNoHyphen}
                  onCheckedChange={setUuidNoHyphen}
                />
              </div>
            </>
          )}

          {mode === "ulid" && (
            <>
              <div className="grid gap-2">
                <SwitchRow label="Uppercase" checked={ulidUpper} onCheckedChange={setUlidUpper} />
              </div>
            </>
          )}

          {mode === "nanoid" && (
            <>
              <InputField
                label="Length"
                type="number"
                min={4}
                max={64}
                value={nanoLen}
                onChange={(e) => setNanoLen(Math.max(4, Math.min(64, Number(e.target.value) || 4)))}
              />
              <InputField
                label="Alphabet"
                value={nanoAlphabet}
                onChange={(e) => setNanoAlphabet(e.target.value)}
                hint="Leave blank to use default A–Z, a–z, 0–9"
              />
            </>
          )}

          {mode === "hex" && (
            <>
              <InputField
                label="Length (chars)"
                type="number"
                min={4}
                max={128}
                value={hexLen}
                onChange={(e) =>
                  setHexLen(Math.max(4, Math.min(128, Number(e.target.value) || 16)))
                }
              />
            </>
          )}

          {mode === "order" && (
            <>
              <InputField
                label="Prefix"
                value={orderPrefix}
                onChange={(e) => setOrderPrefix(e.target.value)}
              />
              <div className="grid gap-2">
                <SwitchRow
                  label="Include YYYYMMDD date"
                  checked={orderIncludeDate}
                  onCheckedChange={setOrderIncludeDate}
                />
              </div>
            </>
          )}

          <div className="flex items-end gap-2">
            <ActionButton icon={Play} label="Generate" onClick={generate} variant="default" />
            <ActionButton icon={Shuffle} label="Regenerate" onClick={generate} />
          </div>
        </CardContent>
      </GlassCard>

      <Separator />

      {/* Results */}
      <GlassCard className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Generated IDs</CardTitle>
          <CardDescription>Copy individual IDs or use “Copy All”.</CardDescription>
        </CardHeader>

        <CardContent className="space-y-3">
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <Badge variant="secondary">{rows.length} raw</Badge>
            <Badge variant="secondary">{processed.length} after filters</Badge>
          </div>

          <div className="flex gap-2">
            <ActionButton
              icon={Wand2}
              label="Copy All"
              onClick={() => navigator.clipboard.writeText(copyAllText())}
              disabled={processed.length === 0}
              variant="outline"
            />
            <ExportTextButton
              filename="ids.txt"
              getText={() => processed.join("\n")}
              label="Export .txt"
              disabled={processed.length === 0}
            />
          </div>

          {processed.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No IDs yet. Configure settings and click Generate.
            </p>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {processed.map((id) => (
                <div key={id} className="flex items-center justify-between rounded-md border p-3">
                  <span className="font-mono text-sm break-all">{id}</span>
                  <CopyButton getText={() => id} />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </GlassCard>
    </>
  );
}
