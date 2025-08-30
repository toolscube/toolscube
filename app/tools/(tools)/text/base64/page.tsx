'use client';

import * as React from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { GlassCard, MotionGlassCard } from '@/components/ui/glass-card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

import { ArrowDownToLine, ArrowLeftRight, Check, Copy, Download, File as FileIcon, FileText, Image as ImageIcon, Info, Link as LinkIcon, RefreshCcw, UploadCloud } from 'lucide-react';

/** -------------------------------- Types -------------------------------- */
type Mode = 'encode' | 'decode';
type TabKey = 'text' | 'file';

type FileInfo = {
  name: string;
  size: number;
  type: string;
};

/** --------------------------- Base64 Utilities --------------------------- */
// Convert Uint8Array to base64 (standard)
function u8ToBase64(u8: Uint8Array): string {
  let binary = '';
  const chunk = 0x8000;
  for (let i = 0; i < u8.length; i += chunk) {
    binary += String.fromCharCode.apply(null, Array.from(u8.subarray(i, i + chunk)) as unknown as number[]);
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
  let s = b64.replace(/\+/g, '-').replace(/\//g, '_');
  if (noPadding) s = s.replace(/=+$/g, '');
  return s;
}
function fromUrlSafe(b64: string): string {
  let s = b64.replace(/-/g, '+').replace(/_/g, '/');
  const pad = s.length % 4;
  if (pad) s += '='.repeat(4 - pad);
  return s;
}

// Wrap lines at column width
function wrapLines(text: string, col: number): string {
  if (!col || col <= 0) return text;
  const chunks: string[] = [];
  for (let i = 0; i < text.length; i += col) chunks.push(text.slice(i, i + col));
  return chunks.join('\n');
}

/** --------------------------- File helpers --------------------------- */
function fileToU8(file: File): Promise<Uint8Array> {
  return new Promise((res, rej) => {
    const fr = new FileReader();
    fr.onload = () => res(new Uint8Array(fr.result as ArrayBuffer));
    fr.onerror = () => rej(fr.error);
    fr.readAsArrayBuffer(file);
  });
}

function inferPreviewKind(type: string) {
  if (type.startsWith('image/')) return 'image';
  if (type.startsWith('text/') || type === 'application/json') return 'text';
  return 'binary';
}
// Put this near your other utils
function u8ToBlob(u8: Uint8Array, type = 'application/octet-stream'): Blob {
  // Create a new view backed by a regular ArrayBuffer (not SharedArrayBuffer)
  const copy = new Uint8Array(u8.byteLength);
  copy.set(u8); // copy bytes
  return new Blob([copy], { type });
}

/** ============================== Component ============================== */
export default function Base64ToolPage() {
  const [tab, setTab] = React.useState<TabKey>('text');
  const [mode, setMode] = React.useState<Mode>('encode');

  // options
  const [urlSafe, setUrlSafe] = React.useState<boolean>(false);
  const [noPadding, setNoPadding] = React.useState<boolean>(false);
  const [wrapCol, setWrapCol] = React.useState<number>(0); // 0 = no wrap

  // text
  const [inputText, setInputText] = React.useState<string>('');
  const [outputText, setOutputText] = React.useState<string>('');
  const [copied, setCopied] = React.useState<'in' | 'out' | null>(null);

  // files
  const [inFile, setInFile] = React.useState<File | null>(null);
  const [inInfo, setInInfo] = React.useState<FileInfo | null>(null);
  const [outFileInfo, setOutFileInfo] = React.useState<FileInfo | null>(null);
  const [outBlobUrl, setOutBlobUrl] = React.useState<string>('');

  const dropRef = React.useRef<HTMLLabelElement | null>(null);

  React.useEffect(() => {
    return () => {
      if (outBlobUrl) URL.revokeObjectURL(outBlobUrl);
    };
  }, [outBlobUrl]);

  const resetAll = () => {
    setMode('encode');
    setUrlSafe(false);
    setNoPadding(false);
    setWrapCol(0);
    setInputText('');
    setOutputText('');
    setCopied(null);
    setInFile(null);
    setInInfo(null);
    setOutFileInfo(null);
    if (outBlobUrl) {
      URL.revokeObjectURL(outBlobUrl);
      setOutBlobUrl('');
    }
  };

  /** ------------------------------ Actions ------------------------------ */
  const runText = async () => {
    try {
      if (mode === 'encode') {
        const u8 = new TextEncoder().encode(inputText);
        let b64 = u8ToBase64(u8);
        if (urlSafe) b64 = toUrlSafe(b64, noPadding);
        const wrapped = wrapCol > 0 ? wrapLines(b64, wrapCol) : b64;
        setOutputText(wrapped);
      } else {
        const cleaned = inputText.replace(/\s+/g, '');
        const restored = urlSafe ? fromUrlSafe(cleaned) : cleaned;
        const u8 = base64ToU8(restored);
        const text = new TextDecoder().decode(u8);
        setOutputText(text);
      }
    } catch {
      setOutputText('⚠️ Failed to process. Check your input and options.');
    }
  };

  const copyValue = async (kind: 'in' | 'out') => {
    const val = kind === 'in' ? inputText : outputText;
    try {
      await navigator.clipboard.writeText(val);
      setCopied(kind);
      setTimeout(() => setCopied(null), 900);
    } catch {
      // ignore
    }
  };

  // File encode: file -> base64.txt
  const encodeFile = async () => {
    if (!inFile) return;
    const data = await fileToU8(inFile);
    let b64 = u8ToBase64(data);
    if (urlSafe) b64 = toUrlSafe(b64, noPadding);
    const wrapped = wrapCol > 0 ? wrapLines(b64, wrapCol) : b64;

    const out = new Blob([wrapped], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(out);
    if (outBlobUrl) URL.revokeObjectURL(outBlobUrl);
    setOutBlobUrl(url);
    setOutFileInfo({
      name: `${inFile.name}.base64.txt`,
      size: out.size,
      type: 'text/plain',
    });
  };

  // File decode: base64.txt -> original (guess type if possible)
  const decodeFile = async () => {
    if (!inFile) return;
    const text = await inFile.text();
    const cleaned = text.replace(/\s+/g, '');
    const restored = urlSafe ? fromUrlSafe(cleaned) : cleaned;

    try {
      const u8 = base64ToU8(restored);
      // Try to detect MIME via a simple signature (best-effort)
      let type = '';
      // PNG
      if (u8[0] === 0x89 && String.fromCharCode(...u8.slice(1, 4)) === 'PNG') type = 'image/png';
      // JPEG
      else if (u8[0] === 0xff && u8[1] === 0xd8) type = 'image/jpeg';
      // GIF
      else if (String.fromCharCode(...u8.slice(0, 3)) === 'GIF') type = 'image/gif';
      // PDF
      else if (String.fromCharCode(...u8.slice(0, 4)) === '%PDF') type = 'application/pdf';
      // Text (rough)
      else {
        const sample = new TextDecoder().decode(u8.slice(0, 64));
        if (/^[\x09\x0A\x0D\x20-\x7E]/.test(sample)) type = 'text/plain';
      }

      const out = u8ToBlob(u8, type || 'application/octet-stream');
      const url = URL.createObjectURL(out);
      if (outBlobUrl) URL.revokeObjectURL(outBlobUrl);
      setOutBlobUrl(url);
      setOutFileInfo({
        name: inFile.name.replace(/\.base64(\.txt)?$/i, '') || 'decoded.bin',
        size: out.size,
        type: type || 'application/octet-stream',
      });
    } catch {
      if (outBlobUrl) {
        URL.revokeObjectURL(outBlobUrl);
        setOutBlobUrl('');
      }
      setOutFileInfo({
        name: 'decode-error.txt',
        size: 0,
        type: 'text/plain',
      });
    }
  };

  const onDropFiles: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setInFile(f);
    setInInfo({ name: f.name, size: f.size, type: f.type || 'application/octet-stream' });
    setOutFileInfo(null);
    if (outBlobUrl) {
      URL.revokeObjectURL(outBlobUrl);
      setOutBlobUrl('');
    }
  };

  /** -------------------------------- UI --------------------------------- */
  return (
    <div className="mx-auto max-w-6xl p-4 sm:p-6 md:p-8">
      <MotionGlassCard>
        {/* Header */}
        <GlassCard className="px-6 py-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
                <ArrowLeftRight className="h-6 w-6" />
                Base64 Encoder / Decoder
              </h1>
              <p className="text-sm text-muted-foreground">Convert text and files to/from Base64. URL-safe, padding, and line-wrap options included.</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className="gap-1">
                <Info className="h-3.5 w-3.5" />
                Client-side only
              </Badge>
              <Badge variant="secondary" className="gap-1">
                <LinkIcon className="h-3.5 w-3.5" />
                URL-safe mode
              </Badge>
            </div>
          </div>
        </GlassCard>

        {/* Mode + Options */}
        <div className="grid gap-4 md:grid-cols-[1.3fr_0.7fr] mt-4">
          <GlassCard className="p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Label className="text-sm">Mode</Label>
                <div className="flex items-center gap-2">
                  <Button variant={mode === 'encode' ? 'default' : 'outline'} size="sm" onClick={() => setMode('encode')}>
                    Encode
                  </Button>
                  <Button variant={mode === 'decode' ? 'default' : 'outline'} size="sm" onClick={() => setMode('decode')}>
                    Decode
                  </Button>
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
                  <div className="space-y-1">
                    <Label htmlFor="wrap">Line wrap</Label>
                    <Input id="wrap" type="number" min={0} placeholder="0 (off)" value={wrapCol || ''} onChange={(e) => setWrapCol(Math.max(0, Number(e.target.value) || 0))} className="w-28" />
                  </div>
                </div>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-5">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Tip: Encoding a file? Use the <strong>File</strong> tab for drag-and-drop + downloads.
              </div>
              <Button variant="ghost" size="sm" onClick={resetAll} className="gap-2">
                <RefreshCcw className="h-4 w-4" />
                Reset
              </Button>
            </div>
          </GlassCard>
        </div>

        <Separator className="my-6" />

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

          {/* ------------------------------- TEXT ------------------------------- */}
          <TabsContent value="text" className="mt-4">
            <div className="grid gap-4 md:grid-cols-2">
              <GlassCard className="p-5">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Input</Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="sm" className="gap-2" onClick={() => copyValue('in')}>
                          {copied === 'in' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                          {copied === 'in' ? 'Copied' : 'Copy'}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Copy input</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <Textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={mode === 'encode' ? 'Type or paste text to encode…' : 'Paste Base64 to decode…'}
                  className="mt-2 min-h-[200px] font-mono"
                />
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button onClick={runText} className="gap-2">
                    <ArrowLeftRight className="h-4 w-4" />
                    {mode === 'encode' ? 'Encode →' : 'Decode →'}
                  </Button>
                </div>
              </GlassCard>

              <GlassCard className="p-5">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Output</Label>
                  <div className="flex items-center gap-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="sm" className="gap-2" onClick={() => copyValue('out')}>
                            {copied === 'out' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                            {copied === 'out' ? 'Copied' : 'Copy'}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Copy output</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    {mode === 'encode' && outputText && (
                      <a href={`data:text/plain;charset=utf-8,${encodeURIComponent(outputText)}`} download="encoded-base64.txt">
                        <Button size="sm" variant="outline" className="gap-2">
                          <Download className="h-4 w-4" /> Download .txt
                        </Button>
                      </a>
                    )}
                  </div>
                </div>

                <Textarea value={outputText} readOnly placeholder="Result will appear here…" className="mt-2 min-h-[200px] font-mono" />
              </GlassCard>
            </div>
          </TabsContent>

          {/* ------------------------------- FILE ------------------------------- */}
          <TabsContent value="file" className="mt-4">
            <div className="grid gap-4 md:grid-cols-2">
              {/* LEFT: Input file */}
              <GlassCard className="p-5">
                <Label className="text-sm font-medium">Input File</Label>

                <label
                  ref={dropRef}
                  htmlFor="file-input"
                  className="mt-2 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed p-8 text-center transition hover:bg-muted/50">
                  <UploadCloud className="h-7 w-7" />
                  <div className="text-sm font-medium">Drag & drop or click to upload</div>
                  <div className="text-xs text-muted-foreground">Any file type • Max depends on browser memory</div>
                  <Input id="file-input" type="file" className="hidden" onChange={onDropFiles} />
                </label>

                {inInfo && (
                  <div className="mt-3 rounded-lg border p-3 text-sm">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="secondary">{inInfo.type || 'application/octet-stream'}</Badge>
                      <span className="text-muted-foreground">{(inInfo.size / 1024).toFixed(1)} KB</span>
                    </div>
                    <div className="mt-1 font-mono text-xs">{inInfo.name}</div>
                  </div>
                )}

                <div className="mt-4 flex flex-wrap gap-2">
                  <Button onClick={mode === 'encode' ? encodeFile : decodeFile} disabled={!inFile} className="gap-2">
                    <ArrowLeftRight className="h-4 w-4" />
                    {mode === 'encode' ? 'Encode file → Base64' : 'Decode Base64 file → Binary'}
                  </Button>
                  <Button variant="outline" onClick={resetAll} className="gap-2">
                    <RefreshCcw className="h-4 w-4" /> Reset
                  </Button>
                </div>
              </GlassCard>

              {/* RIGHT: Output */}
              <GlassCard className="p-5">
                <Label className="text-sm font-medium">Output</Label>

                {!outFileInfo && <div className="mt-2 text-xs text-muted-foreground">After processing, your downloadable file will appear here.</div>}

                {outFileInfo && (
                  <div className="mt-3 rounded-lg border p-3">
                    <div className="flex flex-wrap items-center gap-2 text-sm">
                      <Badge variant="secondary">{outFileInfo.type}</Badge>
                      <span className="text-muted-foreground">{(outFileInfo.size / 1024).toFixed(1)} KB</span>
                    </div>
                    <div className="mt-1 font-mono text-xs">{outFileInfo.name}</div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {outBlobUrl && (
                        <a href={outBlobUrl} download={outFileInfo.name}>
                          <Button className="gap-2">
                            <ArrowDownToLine className="h-4 w-4" />
                            Download
                          </Button>
                        </a>
                      )}
                      {outBlobUrl && inferPreviewKind(outFileInfo.type) === 'image' && (
                        <Button asChild variant="outline" className="gap-2">
                          <a href={outBlobUrl} target="_blank" rel="noreferrer">
                            <ImageIcon className="h-4 w-4" />
                            Open preview
                          </a>
                        </Button>
                      )}
                    </div>

                    {/* Quick inline text preview for small text/json */}
                    {outBlobUrl && inferPreviewKind(outFileInfo.type) === 'text' && outFileInfo.size < 200 * 1024 && (
                      <div className="mt-3">
                        <Label className="text-xs text-muted-foreground">Preview</Label>
                        <Textarea
                          readOnly
                          className="mt-1 min-h-[120px] font-mono"
                          defaultValue={''}
                          onFocus={async (e) => {
                            // Lazy load preview text
                            const resp = await fetch(outBlobUrl);
                            const txt = await resp.text();
                            e.currentTarget.value = txt.slice(0, 20000);
                          }}
                        />
                      </div>
                    )}
                  </div>
                )}
              </GlassCard>
            </div>
          </TabsContent>
        </Tabs>
      </MotionGlassCard>
    </div>
  );
}
