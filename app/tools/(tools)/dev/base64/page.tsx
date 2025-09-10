"use client";

import {
  ArrowLeftRight,
  Check,
  Copy,
  Download,
  FileDown,
  FileUp,
  Image as ImageIcon,
  Link2,
  RefreshCw,
  RotateCcw,
  Settings2,
  ShieldCheck,
  Zap,
} from "lucide-react";
import type * as React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GlassCard, MotionGlassCard } from "@/components/ui/glass-card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

type Mode = "encode" | "decode";

const STORAGE_KEY = "toolshub.base64.v2";

function _clsx(...arr: Array<string | false | undefined>) {
  return arr.filter(Boolean).join(" ");
}

/** Robust downloader that accepts strings, typed arrays, ArrayBuffer, or Blob. */
/** Robust downloader: accepts string, Blob, ArrayBuffer, or any typed array/DataView. */
function downloadBlob(
  filename: string,
  content: string | Blob | ArrayBuffer | ArrayBufferView,
  type = "application/octet-stream",
) {
  let blob: Blob;

  if (content instanceof Blob) {
    blob = content;
  } else if (typeof content === "string") {
    blob = new Blob([content], { type });
  } else if (content instanceof ArrayBuffer) {
    blob = new Blob([content], { type });
  } else if (ArrayBuffer.isView(content)) {
    // TS DOM types mark .buffer as ArrayBufferLike; make a true ArrayBuffer slice
    const view = content as ArrayBufferView;
    const ab = new ArrayBuffer(view.byteLength);
    new Uint8Array(ab).set(
      new Uint8Array(view.buffer as ArrayBuffer, view.byteOffset, view.byteLength),
    );
    blob = new Blob([ab], { type });
  } else {
    // Fallback
    blob = new Blob([String(content)], { type });
  }

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/* --------------------------- base64 helpers (UTF-8) --------------------------- */

function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

function base64ToBytes(b64: string): Uint8Array {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

function encodeTextToBytes(s: string): Uint8Array {
  return new TextEncoder().encode(s);
}

function decodeTextFromBytes(bytes: Uint8Array): string {
  return new TextDecoder().decode(bytes);
}

function toUrlSafe(b64: string, keepPadding: boolean): string {
  let s = b64.replace(/\+/g, "-").replace(/\//g, "_");
  if (!keepPadding) s = s.replace(/=+$/g, "");
  return s;
}

function fromUrlSafe(b64: string): string {
  let s = b64.replace(/-/g, "+").replace(/_/g, "/");
  const pad = s.length % 4;
  if (pad) s += "=".repeat(4 - pad);
  return s;
}

function wrapAt(s: string, width = 76): string {
  if (width <= 0) return s;
  const parts: string[] = [];
  for (let i = 0; i < s.length; i += width) parts.push(s.slice(i, i + width));
  return parts.join("\n");
}

function stripWhitespace(s: string) {
  return s.replace(/\s+/g, "");
}

/* ----------------------------- data URI helpers ----------------------------- */

function makeDataUri(mime: string, b64: string) {
  return `data:${mime || "text/plain;charset=utf-8"};base64,${b64}`;
}
function parseDataUri(uri: string): { ok: boolean; mime?: string; base64?: string } {
  const m = /^data:([^;,]+);base64,(.+)$/i.exec(uri.trim());
  if (!m) return { ok: false };
  return { ok: true, mime: m[1], base64: m[2] };
}

/* ---------------------------------- page ---------------------------------- */

export default function Base64ToolPage() {
  const [mode, setMode] = useState<Mode>("encode");

  // shared text I/O
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState<"IN" | "OUT" | null>(null);

  // options
  const [urlSafe, setUrlSafe] = useState(false);
  const [keepPadding, setKeepPadding] = useState(true);
  const [wrap, setWrap] = useState(false);
  const [wrapWidth, setWrapWidth] = useState(76);
  const [ignoreWs, setIgnoreWs] = useState(true);

  // data URI
  const [useDataUri, setUseDataUri] = useState(false);
  const [mimeType, setMimeType] = useState("text/plain;charset=utf-8");

  // files
  const [fileInfo, setFileInfo] = useState<{ name: string; type: string; size: number } | null>(
    null,
  );

  // preview
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // errors
  const [error, setError] = useState<string | null>(null);

  // refs
  const inRef = useRef<HTMLTextAreaElement | null>(null);
  const outRef = useRef<HTMLTextAreaElement | null>(null);

  // load settings
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const s = JSON.parse(raw);
        setMode(s.mode ?? "encode");
        setUrlSafe(!!s.urlSafe);
        setKeepPadding(s.keepPadding ?? true);
        setWrap(s.wrap ?? false);
        setWrapWidth(s.wrapWidth ?? 76);
        setIgnoreWs(s.ignoreWs ?? true);
        setUseDataUri(s.useDataUri ?? false);
        setMimeType(s.mimeType ?? "text/plain;charset=utf-8");
        setInput(s.input ?? SAMPLE_TEXT);
      } else {
        setInput(SAMPLE_TEXT);
      }
    } catch {
      setInput(SAMPLE_TEXT);
    }
  }, []);

  // persist
  useEffect(() => {
    const t = setTimeout(() => {
      try {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            mode,
            urlSafe,
            keepPadding,
            wrap,
            wrapWidth,
            ignoreWs,
            useDataUri,
            mimeType,
            input,
          }),
        );
      } catch {}
    }, 180);
    return () => clearTimeout(t);
  }, [mode, urlSafe, keepPadding, wrap, wrapWidth, ignoreWs, useDataUri, mimeType, input]);

  /* -------------------------------- actions -------------------------------- */

  const resetAll = () => {
    setMode("encode");
    setInput(SAMPLE_TEXT);
    setOutput("");
    setUrlSafe(false);
    setKeepPadding(true);
    setWrap(false);
    setWrapWidth(76);
    setIgnoreWs(true);
    setUseDataUri(false);
    setMimeType("text/plain;charset=utf-8");
    setFileInfo(null);
    setError(null);
    setImagePreview(null);
  };

  const swapInOut = () => {
    setInput(output);
    setOutput(input);
    setMode((m) => (m === "encode" ? "decode" : "encode"));
    setError(null);
    setImagePreview(null);
  };

  const copy = async (which: "IN" | "OUT") => {
    try {
      const val = which === "IN" ? input : output;
      await navigator.clipboard.writeText(val || "");
      setCopied(which);
      setTimeout(() => setCopied(null), 900);
    } catch {}
  };

  const onDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f) await handleFile(f);
  };

  const onPick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) await handleFile(f);
  };

  const handleFile = async (file: File) => {
    setFileInfo({
      name: file.name,
      type: file.type || "application/octet-stream",
      size: file.size,
    });
    setError(null);
    // read as bytes; we decide header later
    const buf = new Uint8Array(await file.arrayBuffer());
    let b64 = bytesToBase64(buf);
    if (urlSafe) b64 = toUrlSafe(b64, keepPadding);
    const result = useDataUri ? makeDataUri(file.type || "application/octet-stream", b64) : b64;
    setInput(result);
    setMode("decode"); // nudge to try decoding/downloading
  };

  const encode = () => {
    try {
      setError(null);
      setImagePreview(null);
      const bytes = encodeTextToBytes(input);
      let b64 = bytesToBase64(bytes);
      if (urlSafe) b64 = toUrlSafe(b64, keepPadding);
      if (wrap) b64 = wrapAt(b64, wrapWidth || 76);
      const out = useDataUri ? makeDataUri(mimeType, stripWhitespace(b64)) : b64;
      setOutput(out);
    } catch (e: any) {
      setError(String(e?.message || e));
      setOutput("");
    }
  };

  const _decode = () => {
    try {
      setError(null);
      let raw = input.trim();
      let mime = mimeType;
      const parsed = parseDataUri(raw);
      if (parsed.ok) {
        raw = parsed.base64!;
        mime = parsed.mime!;
      }
      if (ignoreWs) raw = stripWhitespace(raw);
      if (urlSafe) raw = fromUrlSafe(raw);
      const bytes = base64ToBytes(raw);
      const text = decodeTextFromBytes(bytes);
      setOutput(text);

      if (parsed.ok && /^image\//i.test(mime)) {
        setImagePreview(`data:${mime};base64,${parsed.base64}`);
      } else if (useDataUri && /^image\//i.test(mimeType)) {
        setImagePreview(
          `data:${mimeType};base64,${stripWhitespace(input.replace(/^data:[^,]+,/, ""))}`,
        );
      } else {
        setImagePreview(null);
      }
    } catch {
      setError("Invalid Base64 or mismatched options.");
      setOutput("");
      setImagePreview(null);
    }
  };

  const downloadDecoded = () => {
    try {
      let raw = input.trim();
      let mime = mimeType;
      const parsed = parseDataUri(raw);
      if (parsed.ok) {
        raw = parsed.base64!;
        mime = parsed.mime!;
      }
      if (ignoreWs) raw = stripWhitespace(raw);
      if (urlSafe) raw = fromUrlSafe(raw);
      const bytes = base64ToBytes(raw);
      const name = parsed.ok ? guessNameFromMime(mime) : "decoded.bin";
      downloadBlob(name, bytes, mime || "application/octet-stream");
    } catch {
      setError("Cannot download: invalid Base64 or options.");
    }
  };

  // sizes
  const bytesIn = useMemo(() => new TextEncoder().encode(input).length, [input]);
  const bytesOut = useMemo(() => new TextEncoder().encode(output).length, [output]);

  /* --------------------------------- render -------------------------------- */

  return (
    <MotionGlassCard>
      {/* Header */}
      <GlassCard className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-6">
        <div className="w-1/2">
          <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
            <Zap className="h-6 w-6" /> Base64 Encoder / Decoder
          </h1>
          <p className="text-sm text-muted-foreground">
            Encode & decode text/files, URL-safe mode, line-wrapping & data URIs. Drag & drop
            supported.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" className="gap-2" onClick={swapInOut}>
            <ArrowLeftRight className="h-4 w-4" /> Swap
          </Button>
          <Button variant="outline" className="gap-2" onClick={resetAll}>
            <RotateCcw className="h-4 w-4" /> Reset
          </Button>
          {mode === "decode" ? (
            <Button className="gap-2" onClick={downloadDecoded}>
              <FileDown className="h-4 w-4" /> Download decoded
            </Button>
          ) : (
            <Button className="gap-2" onClick={encode}>
              <ShieldCheck className="h-4 w-4" /> Encode
            </Button>
          )}
        </div>
      </GlassCard>

      {/* Settings */}
      <GlassCard>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Settings</CardTitle>
          <CardDescription>Choose operation, safety, wrapping & Data URI options.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 lg:grid-cols-4">
          <div className="rounded-lg border p-3 space-y-3">
            <Label className="flex items-center gap-2">
              <Settings2 className="h-4 w-4" /> Operation
            </Label>
            <Tabs value={mode} onValueChange={(v) => setMode(v as Mode)}>
              <TabsList className="grid grid-cols-2">
                <TabsTrigger value="encode">Encode</TabsTrigger>
                <TabsTrigger value="decode">Decode</TabsTrigger>
              </TabsList>
            </Tabs>
            <div className="mt-2 grid gap-2">
              <div className="flex items-center justify-between rounded-lg border p-2">
                <span className="text-sm">URL-safe</span>
                <Switch checked={urlSafe} onCheckedChange={setUrlSafe} />
              </div>
              <div className="flex items-center justify-between rounded-lg border p-2">
                <span className="text-sm">Keep padding</span>
                <Switch checked={keepPadding} onCheckedChange={setKeepPadding} />
              </div>
              <div className="flex items-center justify-between rounded-lg border p-2">
                <span className="text-sm">Ignore whitespace (decode)</span>
                <Switch checked={ignoreWs} onCheckedChange={setIgnoreWs} />
              </div>
            </div>
          </div>

          <div className="rounded-lg border p-3 space-y-3">
            <Label className="flex items-center gap-2">
              <Link2 className="h-4 w-4" /> Data URI
            </Label>
            <div className="flex items-center justify-between rounded-lg border p-2">
              <span className="text-sm">
                Prefix with <code>data:</code>
              </span>
              <Switch checked={useDataUri} onCheckedChange={setUseDataUri} />
            </div>
            <div className="space-y-1.5">
              <Label>MIME type</Label>
              <Input
                value={mimeType}
                onChange={(e) => setMimeType(e.target.value)}
                placeholder="e.g. image/png or text/plain;charset=utf-8"
              />
              <p className="text-xs text-muted-foreground">
                Used when building data URIs during encode or download.
              </p>
            </div>
          </div>

          <div className="rounded-lg border p-3 space-y-3">
            <Label className="flex items-center gap-2">
              <FileUp className="h-4 w-4" /> Line Wrapping
            </Label>
            <div className="flex items-center justify-between rounded-lg border p-2">
              <span className="text-sm">Wrap at 76 chars</span>
              <Switch checked={wrap} onCheckedChange={setWrap} />
            </div>
            <div className="space-y-1.5">
              <Label>Width</Label>
              <Input
                type="number"
                min={4}
                max={200}
                value={wrapWidth}
                onChange={(e) => setWrapWidth(clampInt(e.target.value, 4, 200))}
              />
              <p className="text-xs text-muted-foreground">
                For visual formatting (MIME style). Not applied to data URI prefix.
              </p>
            </div>
          </div>

          <div className="rounded-lg border p-3 space-y-3">
            <Label className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4" /> File / Image
            </Label>
            <label className="inline-flex">
              <input className="hidden" type="file" onChange={onPick} />
              <Button variant="outline" className="gap-2" asChild>
                <span>
                  <FileUp className="h-4 w-4" /> Choose file
                </span>
              </Button>
            </label>
            {fileInfo && (
              <p className="text-xs text-muted-foreground">
                <b>{fileInfo.name}</b> • {(fileInfo.size / 1024).toFixed(1)} KB •{" "}
                {fileInfo.type || "application/octet-stream"}
              </p>
            )}
            {imagePreview && (
              <div className="rounded-lg border overflow-hidden">
                <img alt="preview" src={imagePreview} className="w-full h-auto" />
              </div>
            )}
          </div>
        </CardContent>
      </GlassCard>

      <Separator />

      {/* Editor & Result */}
      <GlassCard>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Editor & Result</CardTitle>
          <CardDescription>
            Drag & drop any file onto this area to auto-fill input with Base64.
          </CardDescription>
        </CardHeader>
        <CardContent onDragOver={(e) => e.preventDefault()} onDrop={onDrop}>
          <div className="grid gap-4 md:grid-cols-2">
            {/* LEFT: Input */}
            <div className="flex flex-col rounded-lg border overflow-hidden">
              <div className="flex items-center justify-between border-b bg-muted/40 px-3 py-2">
                <div className="text-xs font-medium tracking-wide uppercase text-muted-foreground">
                  {mode === "encode" ? "Plain Text (to encode)" : "Base64 / Data URI (to decode)"}
                </div>
                <div className="flex items-center gap-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-2"
                          onClick={() => copy("IN")}
                        >
                          {copied === "IN" ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}{" "}
                          Copy
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Copy input</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
              <Textarea
                ref={inRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="min-h-[300px] rounded-none border-0 focus-visible:ring-0 font-mono text-sm"
                spellCheck={false}
                placeholder={
                  mode === "encode"
                    ? "Type or paste text here…"
                    : "Paste Base64 or data:[mime];base64,... here…"
                }
              />
              <div className="flex items-center justify-between border-t bg-muted/30 px-3 py-2 text-xs">
                <span className="text-muted-foreground">
                  Bytes: <b>{bytesIn}</b>
                </span>
                <Button size="sm" variant="ghost" className="gap-2" onClick={() => setInput("")}>
                  <RefreshCw className="h-4 w-4" /> Clear
                </Button>
              </div>
            </div>

            {/* RIGHT: Output */}
            <div className="flex flex-col rounded-lg border overflow-hidden">
              <div className="flex items-center justify-between border-b bg-muted/40 px-3 py-2">
                <div className="text-xs font-medium tracking-wide uppercase text-muted-foreground">
                  {mode === "encode"
                    ? useDataUri
                      ? "Base64 (Data URI)"
                      : "Base64"
                    : "Decoded Text"}
                </div>
                <div className="flex items-center gap-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-2"
                          onClick={() => copy("OUT")}
                        >
                          {copied === "OUT" ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}{" "}
                          Copy
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Copy result</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
              <Textarea
                ref={outRef}
                readOnly
                value={output}
                className="min-h-[300px] rounded-none border-0 focus-visible:ring-0 font-mono text-sm"
                placeholder="Result will appear here…"
              />
              <div className="flex items-center justify-between border-t bg-muted/30 px-3 py-2 text-xs">
                <span className="text-muted-foreground">
                  Bytes: <b>{bytesOut}</b>
                </span>
                <div className="flex items-center gap-2">
                  {mode === "encode" ? (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="gap-2"
                      onClick={() => downloadBlob("base64.txt", output, "text/plain;charset=utf-8")}
                    >
                      <Download className="h-4 w-4" /> Export .txt
                    </Button>
                  ) : (
                    <Button size="sm" variant="ghost" className="gap-2" onClick={downloadDecoded}>
                      <FileDown className="h-4 w-4" /> Download decoded
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="mt-4 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm">
              {error}
            </div>
          )}

          {/* Action bar */}
          <div className="mt-4 flex flex-wrap items-center justify-between rounded-lg border bg-muted/30 px-3 py-2 text-xs">
            <div className="flex gap-3">
              <span>
                Mode: <b className="uppercase">{mode}</b>
              </span>
              <span>
                URL-safe: <b>{urlSafe ? "ON" : "OFF"}</b>
              </span>
              <span>
                Padding: <b>{keepPadding ? "Keep" : "Strip"}</b>
              </span>
              <span>
                Wrap: <b>{wrap ? `${wrapWidth}` : "OFF"}</b>
              </span>
              <span>
                Data URI: <b>{useDataUri ? "ON" : "OFF"}</b>
              </span>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                className="gap-2"
                onClick={() => setMode("encode")}
              >
                <ShieldCheck className="h-4 w-4" /> Encode
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="gap-2"
                onClick={() => setMode("decode")}
              >
                <FileDown className="h-4 w-4" /> Decode
              </Button>
            </div>
          </div>
        </CardContent>
      </GlassCard>
    </MotionGlassCard>
  );
}

/* --------------------------------- sample --------------------------------- */

const SAMPLE_TEXT = `Hello, Base64 👋

- Toggle URL-safe to swap +/ → -_
- Keep/strip padding =
- Wrap to 76 chars for MIME-style lines
- Turn on Data URI and set MIME to "text/plain;charset=utf-8"

Tip: drop an image file here and then click "Decode" → "Download decoded" to get the original back.`;

function clampInt(v: string, min: number, max: number) {
  const n = parseInt(v.replace(/[^\d-]/g, ""), 10);
  if (Number.isNaN(n)) return min;
  return Math.max(min, Math.min(max, n));
}

function guessNameFromMime(mime?: string) {
  if (!mime) return "decoded.bin";
  const table: Record<string, string> = {
    "image/png": "image.png",
    "image/jpeg": "image.jpg",
    "image/webp": "image.webp",
    "image/gif": "image.gif",
    "text/plain": "decoded.txt",
    "application/pdf": "document.pdf",
  };
  const base = table[mime.split(";")[0]] || "decoded.bin";
  return base;
}
