"use client";

import {
  Check,
  Copy,
  DownloadCloud,
  Hash,
  Lock,
  RotateCcw,
  TimerReset as Timer,
  Upload,
} from "lucide-react";
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { GlassCard, MotionGlassCard } from "@/components/ui/glass-card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

// ---- Helpers: bytes / encoders ----
const enc = new TextEncoder();
const dec = new TextDecoder();

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
  // Convert to binary string in chunks to avoid call stack issues for large arrays
  let str = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    str += String.fromCharCode.apply(null, Array.from(bytes.subarray(i, i + chunk)));
  }
  // btoa works on Latin1/Binary strings
  // eslint-disable-next-line unicorn/prefer-atob
  return btoa(str);
}

// ---- MD5 (RFC 1321) — tiny implementation for Uint8Array ----
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

// Always return a fresh, plain ArrayBuffer (never SharedArrayBuffer)
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
  const ab = await crypto.subtle.digest(algo, toArrayBufferStrict(data)); // <-- pass ArrayBuffer
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

// ---- UI Component ----

type AlgoKey = "MD5" | "SHA-1" | "SHA-256" | "SHA-384" | "SHA-512";
const ALL_ALGOS: AlgoKey[] = ["MD5", "SHA-1", "SHA-256", "SHA-384", "SHA-512"];

export default function HashGeneratorPage() {
  const [mode, setMode] = React.useState<"text" | "file">("text");
  const [text, setText] = React.useState("Hello, World!");
  const [fileName, setFileName] = React.useState<string>("");
  const [fileBytes, setFileBytes] = React.useState<Uint8Array | null>(null);

  const [algos, setAlgos] = React.useState<Record<AlgoKey, boolean>>({
    MD5: true,
    "SHA-1": true,
    "SHA-256": true,
    "SHA-384": false,
    "SHA-512": false,
  });
  const [useHmac, setUseHmac] = React.useState(false);
  const [hmacKey, setHmacKey] = React.useState("");
  const [salt, setSalt] = React.useState("");
  const [saltBefore, setSaltBefore] = React.useState(true);

  const [encoding, setEncoding] = React.useState<"hex" | "base64">("hex");
  const [uppercase, setUppercase] = React.useState(false);
  const [autoRun, setAutoRun] = React.useState(true);

  const [results, setResults] = React.useState<{ name: AlgoKey; value: string }[]>([]);
  const [copied, setCopied] = React.useState<string | null>(null);
  const [perf, setPerf] = React.useState<number | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const sourceBytes = React.useMemo(() => {
    const payload = mode === "text" ? toBytes(text) : (fileBytes ?? new Uint8Array());
    const s = toBytes(salt);
    if (s.length === 0) return payload;
    return saltBefore ? new Uint8Array([...s, ...payload]) : new Uint8Array([...payload, ...s]);
  }, [mode, text, fileBytes, salt, saltBefore]);

  async function run() {
    setError(null);
    const start = performance.now();
    try {
      const list: { name: AlgoKey; value: string }[] = [];
      for (const algo of ALL_ALGOS) {
        if (!algos[algo]) continue;
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
    } catch (e: any) {
      setError(e?.message || "Failed to hash input.");
      setResults([]);
      setPerf(null);
    }
  }

  React.useEffect(() => {
    if (autoRun) void run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, text, fileBytes, algos, useHmac, hmacKey, salt, saltBefore, encoding, uppercase]);

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

  async function copy(text: string) {
    await navigator.clipboard.writeText(text);
    setCopied(text);
    setTimeout(() => setCopied(null), 1200);
  }

  function downloadResults() {
    const payload = {
      mode,
      fileName,
      algorithms: Object.keys(algos).filter((k) => (algos as any)[k]),
      hmac: useHmac,
      encoding,
      uppercase,
      salt,
      saltBefore,
      generatedAt: new Date().toISOString(),
      results,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "hash-results.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <MotionGlassCard>
      <GlassCard className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-6">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
            <Hash className="h-6 w-6" /> Hash Generator
          </h1>
          <p className="text-sm text-muted-foreground">
            MD5, SHA‑1, SHA‑256/384/512 • Text or File • Hex/Base64 • Optional HMAC & Salt.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={resetAll} className="gap-2">
            <RotateCcw className="h-4 w-4" /> Reset
          </Button>
          <Button variant="outline" onClick={downloadResults} className="gap-2">
            <DownloadCloud className="h-4 w-4" /> Export JSON
          </Button>
        </div>
      </GlassCard>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Left: Settings */}
        <GlassCard className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Input & Settings</CardTitle>
            <CardDescription>Choose input type, algorithms and output format.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Mode</Label>
              <div className="flex items-center gap-3">
                <Button
                  variant={mode === "text" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setMode("text")}
                >
                  Text
                </Button>
                <Button
                  variant={mode === "file" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setMode("file")}
                >
                  File
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Algorithms</Label>
              <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
                {ALL_ALGOS.map((name) => (
                  <Button
                    key={name}
                    type="button"
                    variant={algos[name] ? "default" : "outline"}
                    size="sm"
                    onClick={() => setAlgos((p) => ({ ...p, [name]: !p[name] }))}
                  >
                    {name}
                  </Button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Encoding</Label>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant={encoding === "hex" ? "default" : "outline"}
                    onClick={() => setEncoding("hex")}
                  >
                    Hex
                  </Button>
                  <Button
                    size="sm"
                    variant={encoding === "base64" ? "default" : "outline"}
                    onClick={() => setEncoding("base64")}
                  >
                    Base64
                  </Button>
                </div>
              </div>
              <div className="space-y-1">
                <Label>Uppercase</Label>
                <div className="flex items-center gap-2">
                  <Switch checked={uppercase} onCheckedChange={setUppercase} />{" "}
                  <span className="text-sm text-muted-foreground">Apply to hex</span>
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                  <Lock className="h-4 w-4" /> HMAC
                </Label>
                <Switch checked={useHmac} onCheckedChange={setUseHmac} />
              </div>
              <Input
                placeholder="Secret key (UTF‑8)"
                value={hmacKey}
                onChange={(e) => setHmacKey(e.target.value)}
                disabled={!useHmac}
              />
              <p className="text-xs text-muted-foreground">
                When enabled, computes HMAC-
                {Object.keys(algos)
                  .filter((k) => (algos as any)[k])
                  .join(", ")}{" "}
                over the input.
              </p>
            </div>

            <div className="space-y-2">
              <Label>Salt (optional)</Label>
              <Input
                placeholder="Salt string (UTF‑8)"
                value={salt}
                onChange={(e) => setSalt(e.target.value)}
              />
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Switch checked={saltBefore} onCheckedChange={setSaltBefore} />
                <span>Prefix salt (off = suffix)</span>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-md border p-2 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <Timer className="h-3.5 w-3.5" /> {perf ? `${perf.toFixed(2)}ms` : "—"}{" "}
              </span>
              <span>Auto-run</span>
              <Switch checked={autoRun} onCheckedChange={setAutoRun} />
            </div>

            {error && (
              <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-destructive">
                <p className="text-sm font-medium">{error}</p>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex gap-2">
            <Button onClick={run} className="gap-2">
              <Hash className="h-4 w-4" /> Hash
            </Button>
            <Button variant="outline" onClick={resetAll} className="gap-2">
              <RotateCcw className="h-4 w-4" /> Reset
            </Button>
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
              <div className="space-y-2">
                <Label htmlFor="text">Text</Label>
                <Textarea
                  id="text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="min-h-[140px] font-mono"
                  placeholder="Type or paste text here..."
                />
              </div>
            ) : (
              <div className="space-y-2">
                <Label>Pick a file</Label>
                <div className="relative inline-flex items-center">
                  <input
                    type="file"
                    className="absolute inset-0 z-10 cursor-pointer opacity-0"
                    onChange={onPickFile}
                  />
                  <Button variant="outline" className="pointer-events-none gap-2">
                    <Upload className="h-4 w-4" /> Choose file
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  {fileName ? `Selected: ${fileName}` : "No file selected."}
                </p>
              </div>
            )}

            <Separator />

            <div className="space-y-2">
              <Label>Results</Label>
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
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        onClick={() => copy(r.value)}
                      >
                        {copied === r.value ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                        Copy
                      </Button>
                    </div>
                    <Textarea readOnly value={r.value} className="min-h-[72px] font-mono" />
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </GlassCard>
      </div>

      <Separator />

      <GlassCard className="shadow-sm">
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
            <li>
              Salt is simply concatenated (prefix or suffix) before hashing; not the same as a KDF.
            </li>
          </ul>
        </CardContent>
      </GlassCard>
    </MotionGlassCard>
  );
}
