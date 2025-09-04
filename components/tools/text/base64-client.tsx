"use client";

import {
  ArrowLeftRight,
  File as FileIcon,
  FileText,
  Image as ImageIcon,
  UploadCloud,
} from "lucide-react";
import * as React from "react";
import {
  ActionButton,
  CopyButton,
  ExportFromUrlButton,
  ExportTextButton,
  LinkButton,
  ResetButton,
} from "@/components/shared/action-buttons";
import { InputField } from "@/components/shared/form-fields/input-field";
import TextareaField from "@/components/shared/form-fields/textarea-field";
import ToolPageHeader from "@/components/shared/tool-page-header";
import { Badge } from "@/components/ui/badge";
import { GlassCard } from "@/components/ui/glass-card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

/** Base64 Utilities */
// Convert Uint8Array to base64 (standard)
function u8ToBase64(u8: Uint8Array): string {
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < u8.length; i += chunk) {
    binary += String.fromCharCode.apply(
      null,
      Array.from(u8.subarray(i, i + chunk)) as unknown as number[],
    );
  }
  return btoa(binary);
}

// Convert base64 (standard) to Uint8Array
function base64ToU8(b64: string): Uint8Array {
  const binary = atob(b64);
  const len = binary.length;
  const u8 = new Uint8Array(len);
  for (let i = 0; i < len; i++) u8[i] = binary.charCodeAt(i);
  return u8;
}

// URL-safe transform
function toUrlSafe(b64: string, noPadding: boolean): string {
  let s = b64.replace(/\+/g, "-").replace(/\//g, "_");
  if (noPadding) s = s.replace(/=+$/g, "");
  return s;
}
function fromUrlSafe(b64: string): string {
  let s = b64.replace(/-/g, "+").replace(/_/g, "/");
  const pad = s.length % 4;
  if (pad) s += "=".repeat(4 - pad);
  return s;
}

// Wrap lines at column width
function wrapLines(text: string, col: number): string {
  if (!col || col <= 0) return text;
  const chunks: string[] = [];
  for (let i = 0; i < text.length; i += col) chunks.push(text.slice(i, i + col));
  return chunks.join("\n");
}

function fileToU8(file: File): Promise<Uint8Array> {
  return new Promise((res, rej) => {
    const fr = new FileReader();
    fr.onload = () => res(new Uint8Array(fr.result as ArrayBuffer));
    fr.onerror = () => rej(fr.error);
    fr.readAsArrayBuffer(file);
  });
}

function inferPreviewKind(type: string) {
  if (type.startsWith("image/")) return "image";
  if (type.startsWith("text/") || type === "application/json") return "text";
  return "binary";
}
// Put this near your other utils
function u8ToBlob(u8: Uint8Array, type = "application/octet-stream"): Blob {
  const copy = new Uint8Array(u8.byteLength);
  copy.set(u8);
  return new Blob([copy], { type });
}

/** Component  */
export default function Base64Client() {
  const [tab, setTab] = React.useState<TabKey>("text");
  const [mode, setMode] = React.useState<Mode>("encode");

  // options
  const [urlSafe, setUrlSafe] = React.useState<boolean>(false);
  const [noPadding, setNoPadding] = React.useState<boolean>(false);
  const [wrapCol, setWrapCol] = React.useState<number>(0); // 0 = no wrap

  // text
  const [inputText, setInputText] = React.useState<string>("");
  const [outputText, setOutputText] = React.useState<string>("");

  // files
  const [inFile, setInFile] = React.useState<File | null>(null);
  const [inInfo, setInInfo] = React.useState<FileInfo | null>(null);
  const [outFileInfo, setOutFileInfo] = React.useState<FileInfo | null>(null);
  const [outBlobUrl, setOutBlobUrl] = React.useState<string>("");
  const [previewText, setPreviewText] = React.useState<string>("");

  const dropRef = React.useRef<HTMLLabelElement | null>(null);
  const previewRef = React.useRef<HTMLTextAreaElement | null>(null);

  React.useEffect(() => {
    return () => {
      if (outBlobUrl) URL.revokeObjectURL(outBlobUrl);
    };
  }, [outBlobUrl]);

  React.useEffect(() => {
    try {
      if (!inputText) {
        setOutputText("");
        return;
      }

      if (mode === "encode") {
        const u8 = new TextEncoder().encode(inputText);
        let b64 = u8ToBase64(u8);
        if (urlSafe) b64 = toUrlSafe(b64, noPadding);
        setOutputText(wrapCol > 0 ? wrapLines(b64, wrapCol) : b64);
      } else {
        const cleaned = inputText.replace(/\s+/g, "");
        const restored = urlSafe ? fromUrlSafe(cleaned) : cleaned;
        const u8 = base64ToU8(restored);
        setOutputText(new TextDecoder().decode(u8));
      }
    } catch {
      setOutputText("Failed to process. Check your input.");
    }
  }, [inputText, mode, urlSafe, noPadding, wrapCol]);

  const resetAll = () => {
    setMode("encode");
    setUrlSafe(false);
    setNoPadding(false);
    setWrapCol(0);
    setInputText("");
    setOutputText("");
    setInFile(null);
    setInInfo(null);
    setOutFileInfo(null);
    setPreviewText("");
    if (outBlobUrl) {
      URL.revokeObjectURL(outBlobUrl);
      setOutBlobUrl("");
    }
  };

  /** Actions */
  // File encode: file -> base64.txt
  const encodeFile = async () => {
    if (!inFile) return;
    const data = await fileToU8(inFile);
    let b64 = u8ToBase64(data);
    if (urlSafe) b64 = toUrlSafe(b64, noPadding);
    const wrapped = wrapCol > 0 ? wrapLines(b64, wrapCol) : b64;

    const out = new Blob([wrapped], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(out);
    if (outBlobUrl) URL.revokeObjectURL(outBlobUrl);
    setOutBlobUrl(url);
    setOutFileInfo({
      name: `${inFile.name}.base64.txt`,
      size: out.size,
      type: "text/plain",
    });

    if (out.size < 200 * 1024) {
      const preview = await out.text();
      setPreviewText(preview.slice(0, 20_000));
    } else {
      setPreviewText("");
    }
  };

  // File decode: base64.txt
  const decodeFile = async () => {
    if (!inFile) return;
    const text = await inFile.text();
    const cleaned = text.replace(/\s+/g, "");
    const restored = urlSafe ? fromUrlSafe(cleaned) : cleaned;

    try {
      const u8 = base64ToU8(restored);
      let type = "";
      if (u8[0] === 0x89 && String.fromCharCode(...u8.slice(1, 4)) === "PNG") type = "image/png";
      else if (u8[0] === 0xff && u8[1] === 0xd8) type = "image/jpeg";
      else if (String.fromCharCode(...u8.slice(0, 3)) === "GIF") type = "image/gif";
      else if (String.fromCharCode(...u8.slice(0, 4)) === "%PDF") type = "application/pdf";
      else {
        const sample = new TextDecoder().decode(u8.slice(0, 64));
        if (/^[\t\n\r\u0020-\u007E]/.test(sample)) {
          type = "text/plain";
        }
      }

      const out = u8ToBlob(u8, type || "application/octet-stream");
      const url = URL.createObjectURL(out);
      if (outBlobUrl) URL.revokeObjectURL(outBlobUrl);
      setOutBlobUrl(url);
      setOutFileInfo({
        name: inFile.name.replace(/\.base64(\.txt)?$/i, "") || "decoded.bin",
        size: out.size,
        type: type || "application/octet-stream",
      });

      if (
        type &&
        (type.startsWith("text/") || type === "application/json") &&
        out.size < 200 * 1024
      ) {
        const preview = await out.text();
        setPreviewText(preview.slice(0, 20_000));
      } else {
        setPreviewText("");
      }
    } catch {
      if (outBlobUrl) {
        URL.revokeObjectURL(outBlobUrl);
        setOutBlobUrl("");
      }
      setOutFileInfo({
        name: "decode-error.txt",
        size: 0,
        type: "text/plain",
      });
      setPreviewText("");
    }
  };

  const onDropFiles: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setInFile(f);
    setInInfo({ name: f.name, size: f.size, type: f.type || "application/octet-stream" });
    setOutFileInfo(null);
    setPreviewText("");  
    if (outBlobUrl) {
      URL.revokeObjectURL(outBlobUrl);
      setOutBlobUrl("");
    }
  };

  return (
    <>
      {/* Header */}
      <ToolPageHeader
        icon={ArrowLeftRight}
        title="Base64 Encoder / Decoder"
        description="Encode or decode strings & files in Base64"
        actions={<ResetButton variant="default" onClick={resetAll} />}
      />

      {/* Mode + Options */}
      <GlassCard className="p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <ActionButton
                label="Encode"
                variant={mode === "encode" ? "default" : "outline"}
                size="sm"
                onClick={() => setMode("encode")}
              />
              <ActionButton
                label="Decode"
                variant={mode === "decode" ? "default" : "outline"}
                size="sm"
                onClick={() => setMode("decode")}
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center justify-between rounded-lg border p-2">
              <div className="mr-3">
                <p className="text-sm font-medium leading-none">URL-safe</p>
                <p className="text-xs text-muted-foreground">
                  Use <code>-</code> and <code>_</code> instead of <code>+</code>/<code>/</code>.
                </p>
              </div>
              <Switch checked={urlSafe} onCheckedChange={setUrlSafe} />
            </div>

            <div className="flex items-center justify-between rounded-lg border p-2">
              <div className="mr-3">
                <p className="text-sm font-medium leading-none">No padding</p>
                <p className="text-xs text-muted-foreground">
                  Remove trailing <code>=</code> signs.
                </p>
              </div>
              <Switch checked={noPadding} onCheckedChange={setNoPadding} />
            </div>

            <div className="flex items-center gap-2">
              <InputField
                label="Line wrap"
                id="wrap"
                type="number"
                min={0}
                placeholder="0 (off)"
                value={wrapCol || ""}
                onChange={(e) => setWrapCol(Math.max(0, Number(e.target.value) || 0))}
                className="w-28"
              />
            </div>
          </div>
        </div>
      </GlassCard>

      <Separator />

      {/* Tabs: Text / File */}
      <Tabs value={tab} onValueChange={(v) => setTab(v as TabKey)} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="text" className="gap-2">
            <FileText className="h-4 w-4" /> Text
          </TabsTrigger>
          <TabsTrigger value="file" className="gap-2">
            <FileIcon className="h-4 w-4" /> File
          </TabsTrigger>
        </TabsList>

        {/* TEXT */}
        <TabsContent value="text" className="grid gap-4 md:grid-cols-2">
          <GlassCard className="p-5 flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <Label className="text-sm font-medium">Input</Label>
              <CopyButton getText={() => inputText} />
            </div>
            <TextareaField
              value={inputText}
              onValueChange={setInputText}
              placeholder={mode === "encode" ? "Type text to encode…" : "Paste Base64 to decode…"}
              textareaClassName="min-h-[250px]"
              autoResize
            />
          </GlassCard>

          <GlassCard className="p-5 flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <Label className="text-sm font-medium">Output</Label>
              <div className="flex gap-2">
                <CopyButton getText={() => outputText} />
                <ExportTextButton
                  variant="default"
                  filename="encoded-base64.txt"
                  getText={() => outputText}
                  disabled={!outputText}
                />
              </div>
            </div>
            <TextareaField
              value={outputText}
              readOnly
              placeholder="Result appears here…"
              textareaClassName="min-h-[250px]"
              autoResize
            />
          </GlassCard>
        </TabsContent>

        {/* FILE */}
        <TabsContent value="file">
          <div className="grid gap-4 md:grid-cols-2">
            {/* LEFT: Input file */}
            <GlassCard className="p-5">
              <div className="flex justify-between items-center">
                <Label className="text-sm font-medium">Input File</Label>

                <div className="flex items-center gap-2">
                  <ResetButton onClick={resetAll} />
                  <ActionButton
                    variant="default"
                    onClick={mode === "encode" ? encodeFile : decodeFile}
                    disabled={!inFile}
                    icon={ArrowLeftRight}
                    label={mode === "encode" ? "Encode" : "Decode"}
                  />
                </div>
              </div>

              <label
                ref={dropRef}
                htmlFor="file-input"
                className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed p-8 text-center transition hover:bg-muted/50 min-h-[200]"
              >
                <UploadCloud className="h-7 w-7" />
                <div className="text-sm font-medium">Drag & drop or click to upload</div>
                <div className="text-xs text-muted-foreground">
                  Any file type • Max depends on browser memory
                </div>
                <Input id="file-input" type="file" className="hidden" onChange={onDropFiles} />
              </label>

              {inInfo && (
                <div className="rounded-lg border p-3 text-sm">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary">{inInfo.type || "application/octet-stream"}</Badge>
                    <span className="text-muted-foreground">
                      {(inInfo.size / 1024).toFixed(1)} KB
                    </span>
                  </div>
                  <div className="mt-1 font-mono text-xs">{inInfo.name}</div>
                </div>
              )}
            </GlassCard>

            {/* RIGHT: Output */}
            <GlassCard className="p-5">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Output</Label>

                {outFileInfo && (
                  <div className="flex flex-wrap gap-2">
                    <CopyButton getText={() => outBlobUrl || ""} disabled={!outBlobUrl} />
                    {outBlobUrl && (
                      <ExportFromUrlButton
                        filename={outFileInfo.name}
                        url={outBlobUrl}
                        label="Download"
                        variant="default"
                      />
                    )}
                    {outBlobUrl && inferPreviewKind(outFileInfo.type) === "image" && (
                      <LinkButton
                        href={outBlobUrl}
                        label="Open preview"
                        variant="default"
                        icon={ImageIcon}
                      />
                    )}
                  </div>
                )}
              </div>

              {outFileInfo && (
                <div className="flex flex-col gap-2 border p-3 rounded-md">
                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    <Badge variant="secondary">{outFileInfo.type}</Badge>
                    <span className="text-muted-foreground">
                      {(outFileInfo.size / 1024).toFixed(1)} KB
                    </span>
                  </div>
                  <div className="text-xs">{outFileInfo.name}</div>
                </div>
              )}

              {!outFileInfo && (
                <div className="text-xs text-muted-foreground">
                  After processing, your downloadable file will appear here.
                </div>
              )}

              {outFileInfo && (
                <div>
                  {outBlobUrl &&
                    inferPreviewKind(outFileInfo.type) === "text" &&
                    outFileInfo.size < 200 * 1024 && (
                      <>
                        <Label className="text-xs text-muted-foreground mb-1">Preview</Label>
                        <TextareaField
                          ref={previewRef}
                          readOnly
                          textareaClassName="min-h-[180px]"
                          value={previewText}
                        />
                      </>
                    )}
                </div>
              )}
            </GlassCard>
          </div>
        </TabsContent>
      </Tabs>
    </>
  );
}
