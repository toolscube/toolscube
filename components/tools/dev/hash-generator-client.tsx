"use client";

import {
  Check,
  DownloadCloud,
  Hash,
  Lock,
  RotateCcw,
  TimerReset as Timer,
  Upload,
} from "lucide-react";
import type React from "react";
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

import { Badge } from "@/components/ui/badge";
import {
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { GlassCard } from "@/components/ui/glass-card";
import { Separator } from "@/components/ui/separator";

// Helpers: bytes / encoders
const enc = new TextEncoder();
// const dec = new TextDecoder();

function toBytes(s: string) {
  return enc.encode(s);
}

function hex(bytes: Uint8Array, uppercase: boolean) {
  const h = Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return uppercase ? h.toUpperCase() : h;
}

function base64(bytes: Uint8Array) {
  let str = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    str += String.fromCharCode.apply(
      null,
      Array.from(bytes.subarray(i, i + chunk)) as unknown as number[],
    );
  }
  return btoa(str);
}

// MD5 (RFC 1321) — tiny implementation for Uint8Array
// Public domain implementation adapted for TS + Uint8Array
function md5(input: Uint8Array): Uint8Array {
  const K = new Uint32Array(64);
  for (let i = 0; i < 64; i++) K[i] = Math.floor(Math.abs(Math.sin(i + 1)) * 2 ** 32) >>> 0;

  const S = [
    7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9,
    14, 20, 5, 9, 14, 20, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 6, 10, 15, 21,
    6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21,
  ];

  function rotl(x: number, n: number) {
    return ((x << n) | (x >>> (32 - n))) >>> 0;
  }
  function F(x: number, y: number, z: number) {
    return (x & y) | (~x & z);
  }
  function G(x: number, y: number, z: number) {
    return (x & z) | (y & ~z);
  }
  function H(x: number, y: number, z: number) {
    return x ^ y ^ z;
  }
  function I(x: number, y: number, z: number) {
    return y ^ (x | ~z);
  }

  const bytes = new Uint8Array((((input.length + 8) >> 6) << 6) + 64);
  bytes.set(input);
  bytes[input.length] = 0x80;
  const bitLen = input.length * 8;
  const view = new DataView(bytes.buffer);
  view.setUint32(bytes.length - 8, bitLen >>> 0, true);
  view.setUint32(bytes.length - 4, Math.floor(bitLen / 2 ** 32) >>> 0, true);

  let a = 0x67452301 >>> 0;
  let b = 0xefcdab89 >>> 0;
  let c = 0x98badcfe >>> 0;
  let d = 0x10325476 >>> 0;

  const M = new Uint32Array(16);

  for (let i = 0; i < bytes.length; i += 64) {
    for (let j = 0; j < 16; j++) M[j] = view.getUint32(i + j * 4, true);

    let A = a,
      B = b,
      C = c,
      D = d;

    for (let k = 0; k < 64; k++) {
      let f = 0,
        g = 0;
      if (k < 16) {
        f = F(B, C, D);
        g = k;
      } else if (k < 32) {
        f = G(B, C, D);
        g = (5 * k + 1) % 16;
      } else if (k < 48) {
        f = H(B, C, D);
        g = (3 * k + 5) % 16;
      } else {
        f = I(B, C, D);
        g = (7 * k) % 16;
      }
      const tmp = D;
      D = C;
      C = B;
      const t = (A + f + K[k] + M[g]) >>> 0;
      B = (B + rotl(t, S[k])) >>> 0;
      A = tmp;
    }

    a = (a + A) >>> 0;
    b = (b + B) >>> 0;
    c = (c + C) >>> 0;
    d = (d + D) >>> 0;
  }

  const out = new Uint8Array(16);
  const outView = new DataView(out.buffer);
  outView.setUint32(0, a, true);
  outView.setUint32(4, b, true);
  outView.setUint32(8, c, true);
  outView.setUint32(12, d, true);
  return out;
}

// Always return a fresh, plain ArrayBuffer
function toArrayBufferStrict(u8: Uint8Array): ArrayBuffer {
  const buf = new ArrayBuffer(u8.byteLength);
  new Uint8Array(buf).set(u8);
  return buf;
}

// Generic digest wrapper (returns bytes)
async function digest(
  algo: "MD5" | "SHA-1" | "SHA-256" | "SHA-384" | "SHA-512",
  data: Uint8Array,
): Promise<Uint8Array> {
  if (algo === "MD5") return md5(data);
  const ab = await crypto.subtle.digest(algo, toArrayBufferStrict(data));
  return new Uint8Array(ab);
}

// HMAC (any hash via digest() above)
async function hmac(
  algo: "MD5" | "SHA-1" | "SHA-256" | "SHA-384" | "SHA-512",
  key: Uint8Array,
  msg: Uint8Array,
): Promise<Uint8Array> {
  const blockSize = algo === "SHA-384" || algo === "SHA-512" ? 128 : 64;
  let k = key;
  if (k.length > blockSize) k = await digest(algo, k);
  if (k.length < blockSize) {
    const nk = new Uint8Array(blockSize);
    nk.set(k);
    k = nk;
  }
  const o = new Uint8Array(blockSize);
  const i = new Uint8Array(blockSize);
  for (let idx = 0; idx < blockSize; idx++) {
    o[idx] = k[idx] ^ 0x5c;
    i[idx] = k[idx] ^ 0x36;
  }
  const inner = await digest(algo, new Uint8Array([...i, ...msg]));
  const outer = await digest(algo, new Uint8Array([...o, ...inner]));
  return outer;
}

type AlgoKey = "MD5" | "SHA-1" | "SHA-256" | "SHA-384" | "SHA-512";
const ALL_ALGOS: AlgoKey[] = ["MD5", "SHA-1", "SHA-256", "SHA-384", "SHA-512"];

type ResultRow = { name: AlgoKey; value: string };

export default function HashGeneratorClient() {
  const [mode, setMode] = useState<"text" | "file">("text");
  const [text, setText] = useState<string>("Hello, World!");
  const [fileName, setFileName] = useState<string>("");
  const [fileBytes, setFileBytes] = useState<Uint8Array | null>(null);

  const [algos, setAlgos] = useState<Record<AlgoKey, boolean>>({
    MD5: true,
    "SHA-1": true,
    "SHA-256": true,
    "SHA-384": false,
    "SHA-512": false,
  });
  const [useHmac, setUseHmac] = useState<boolean>(false);
  const [hmacKey, setHmacKey] = useState<string>("");
  const [salt, setSalt] = useState<string>("");
  const [saltBefore, setSaltBefore] = useState<boolean>(true);

  const [encoding, setEncoding] = useState<"hex" | "base64">("hex");
  const [uppercase, setUppercase] = useState<boolean>(false);
  const [autoRun, setAutoRun] = useState<boolean>(true);

  const [results, setResults] = useState<ResultRow[]>([]);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [perf, setPerf] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const selectedAlgoList = useMemo(() => ALL_ALGOS.filter((a) => algos[a]), [algos]);

  const sourceBytes = useMemo(() => {
    const payload = mode === "text" ? toBytes(text) : (fileBytes ?? new Uint8Array());
    const s = toBytes(salt);
    if (s.length === 0) return payload;
    return saltBefore ? new Uint8Array([...s, ...payload]) : new Uint8Array([...payload, ...s]);
  }, [mode, text, fileBytes, salt, saltBefore]);

  const run = useCallback(async () => {
    setError(null);
    const start = performance.now();
    try {
      const list: ResultRow[] = [];
      for (const algo of selectedAlgoList) {
        let outBytes: Uint8Array;
        if (useHmac) {
          const keyBytes = toBytes(hmacKey);
          outBytes = await hmac(algo, keyBytes, sourceBytes);
        } else {
          outBytes = await digest(algo, sourceBytes);
        }
        const str = encoding === "hex" ? hex(outBytes, uppercase) : base64(outBytes);
        list.push({ name: algo, value: str });
      }
      setResults(list);
      setPerf(performance.now() - start);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to hash input.");
      setResults([]);
      setPerf(null);
    }
  }, [selectedAlgoList, useHmac, hmacKey, sourceBytes, encoding, uppercase]);

  useEffect(() => {
    if (autoRun) void run();
  }, [autoRun, run]);

  function onPickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFileName(f.name);
    const reader = new FileReader();
    reader.onload = () => {
      const ab = reader.result as ArrayBuffer;
      setFileBytes(new Uint8Array(ab));
    };
    reader.readAsArrayBuffer(f);
  }

  function resetAll() {
    setMode("text");
    setText("Hello, World!");
    setFileName("");
    setFileBytes(null);
    setAlgos({ MD5: true, "SHA-1": true, "SHA-256": true, "SHA-384": false, "SHA-512": false });
    setUseHmac(false);
    setHmacKey("");
    setSalt("");
    setSaltBefore(true);
    setEncoding("hex");
    setUppercase(false);
    setAutoRun(true);
    setResults([]);
    setPerf(null);
    setError(null);
  }

  return (
    <>
      <ToolPageHeader
        icon={Hash}
        title="Hash Generator"
        description="MD5, SHA‑1, SHA‑256/384/512 • Text or File • Hex/Base64 • Optional HMAC & Salt."
        actions={
          <>
            <ResetButton onClick={resetAll} icon={RotateCcw} />
            <ExportTextButton
              variant="outline"
              label="Export JSON"
              filename="hash-results.json"
              icon={DownloadCloud}
              getText={() =>
                JSON.stringify(
                  {
                    mode,
                    fileName,
                    algorithms: selectedAlgoList,
                    hmac: useHmac,
                    encoding,
                    uppercase,
                    salt,
                    saltBefore,
                    generatedAt: new Date().toISOString(),
                    results,
                  },
                  null,
                  2,
                )
              }
            />
          </>
        }
      />

      {/* Top stats */}
      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <Stat
          label="Input bytes"
          value={mode === "text" ? toBytes(text).length : (fileBytes?.length ?? 0)}
          hint={mode === "file" ? fileName || "No file" : "UTF‑8 length"}
        />
        <Stat
          label="Algorithms"
          value={selectedAlgoList.length}
          hint={selectedAlgoList.join(", ") || "None"}
        />
        <Stat
          label="Last run"
          value={perf ? `${perf.toFixed(2)} ms` : "—"}
          hint={autoRun ? "Auto‑run on" : "Manual"}
          Icon={Timer}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Left: Settings */}
        <GlassCard>
          <CardHeader>
            <CardTitle className="text-base">Input & Settings</CardTitle>
            <CardDescription>Choose input type, algorithms and output format.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Mode */}
            <div className="grid grid-cols-2 gap-2">
              <ActionButton
                label="Text"
                variant={mode === "text" ? "default" : "outline"}
                onClick={() => setMode("text")}
              />
              <ActionButton
                label="File"
                variant={mode === "file" ? "default" : "outline"}
                onClick={() => setMode("file")}
              />
            </div>

            {/* Algorithms */}
            <div className="space-y-2">
              <div className="text-sm font-medium">Algorithms</div>
              <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
                {ALL_ALGOS.map((name) => (
                  <ActionButton
                    key={name}
                    size="sm"
                    variant={algos[name] ? "default" : "outline"}
                    label={name}
                    onClick={() => setAlgos((p) => ({ ...p, [name]: !p[name] }))}
                  />
                ))}
              </div>
            </div>

            {/* Output encoding */}
            <div className="grid grid-cols-2 gap-3">
              <ActionButton
                label="Hex"
                variant={encoding === "hex" ? "default" : "outline"}
                onClick={() => setEncoding("hex")}
              />
              <ActionButton
                label="Base64"
                variant={encoding === "base64" ? "default" : "outline"}
                onClick={() => setEncoding("base64")}
              />
            </div>

            <SwitchRow
              label="Uppercase"
              hint="Applied for hex output"
              checked={uppercase}
              onCheckedChange={(v) => setUppercase(Boolean(v))}
            />

            <Separator />

            {/* HMAC */}
            <SwitchRow
              label={
                (
                  <span className="inline-flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    HMAC
                  </span>
                ) as unknown as string
              }
              hint={`Compute HMAC over the input using ${selectedAlgoList.length ? selectedAlgoList.join(", ") : "selected algos"}.`}
              checked={useHmac}
              onCheckedChange={(v) => setUseHmac(Boolean(v))}
            />
            <InputField
              label="Secret key (UTF‑8)"
              value={hmacKey}
              onChange={(e) => setHmacKey(e.target.value)}
              disabled={!useHmac}
              placeholder="Enter HMAC key"
            />

            {/* Salt */}
            <InputField
              label="Salt (optional)"
              value={salt}
              onChange={(e) => setSalt(e.target.value)}
              placeholder="Salt string"
            />
            <SwitchRow
              label="Prefix salt"
              hint="Off = suffix"
              checked={saltBefore}
              onCheckedChange={(v) => setSaltBefore(Boolean(v))}
            />

            {/* Perf & autorun */}
            <SwitchRow
              label="Auto‑run"
              hint="Re-run on every change"
              checked={autoRun}
              onCheckedChange={(v) => setAutoRun(Boolean(v))}
            />

            {error && (
              <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-destructive">
                <p className="text-sm font-medium">{error}</p>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex gap-2">
            <ActionButton label="Hash" onClick={() => void run()} icon={Hash} />
            <ActionButton label="Reset" variant="outline" onClick={resetAll} icon={RotateCcw} />
          </CardFooter>
        </GlassCard>

        {/* Right: Input & Results */}
        <GlassCard className="shadow-sm lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">
              {mode === "text" ? "Text Input" : "File Input"}
            </CardTitle>
            <CardDescription>Paste text or pick a file to hash.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {mode === "text" ? (
              <TextareaField
                label="Text"
                value={text}
                onValueChange={setText}
                textareaClassName="min-h-[140px] font-mono"
                placeholder="Type or paste text here..."
              />
            ) : (
              <div className="space-y-2">
                <div className="text-sm font-medium">Pick a file</div>
                <div className="relative inline-flex items-center">
                  <input
                    type="file"
                    className="absolute inset-0 z-10 cursor-pointer opacity-0"
                    onChange={onPickFile}
                  />
                  <ActionButton
                    variant="outline"
                    label="Choose file"
                    icon={Upload}
                    className="pointer-events-none"
                  />
                </div>

                {/* <InputField type="file" /> */}

                <p className="text-xs text-muted-foreground">
                  {fileName ? `Selected: ${fileName}` : "No file selected."}
                </p>
              </div>
            )}

            <Separator />

            <div className="space-y-2">
              <div className="text-sm font-medium">Results</div>
              <div className="grid gap-2 md:grid-cols-2">
                {results.length === 0 && (
                  <div className="rounded-md border p-3 text-sm text-muted-foreground">
                    No results yet. Click <em>Hash</em> or enable Auto‑run.
                  </div>
                )}
                {results.map((r) => (
                  <div key={r.name} className="flex flex-col gap-2 rounded-md border p-3">
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary">{useHmac ? `HMAC-${r.name}` : r.name}</Badge>
                      <CopyButton
                        variant="outline"
                        size="sm"
                        label={copiedKey === r.name ? "Copied" : "Copy"}
                        icon={copiedKey === r.name ? Check : undefined}
                        getText={() => r.value}
                        onCopied={() => {
                          setCopiedKey(r.name);
                          setTimeout(() => setCopiedKey(null), 1200);
                        }}
                      />
                    </div>
                    <TextareaField
                      readOnly
                      value={r.value}
                      onValueChange={() => {}}
                      textareaClassName="min-h-[72px] font-mono"
                    />
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </GlassCard>
      </div>

      {/* <Separator className="my-4" /> */}

      {/* <GlassCard>
        <CardHeader>
          <CardTitle className="text-base">Notes</CardTitle>
          <CardDescription>About algorithms & file hashing.</CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          <ul className="list-disc space-y-1 pl-5">
            <li>SHA‑1 and SHA‑2 (256/384/512) use the browser's Web Crypto API.</li>
            <li>MD5 is provided via a lightweight in‑app implementation for convenience.</li>
            <li>
              HMAC block size is 64 bytes for MD5/SHA‑1/SHA‑256 and 128 bytes for SHA‑384/512.
            </li>
            <li>Salt is concatenated (prefix or suffix) before hashing; this is not a KDF.</li>
          </ul>
        </CardContent>
      </GlassCard> */}
    </>
  );
}
