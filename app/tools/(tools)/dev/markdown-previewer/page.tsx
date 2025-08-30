'use client';

import * as React from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GlassCard, MotionGlassCard } from '@/components/ui/glass-card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

import { Check, Copy, Download, Eye, FileText, Fullscreen, Github, ListTree, Minimize2, Printer, RotateCcw, SplitSquareHorizontal, Upload, Wand2, WrapText } from 'lucide-react';

import ReactMarkdown from 'react-markdown';

type AnyFn = (...args: any[]) => any;

const SAMPLE_MD = `# ✨ Markdown Previewer

Write Markdown on the left — see **live preview** on the right.

## Features
- **GFM** support (tables, task lists, strikethrough)
- Import/Export: \`.md\` & rendered \`.html\`
- Drag & drop files, paste images
- Copy raw Markdown
- LocalStorage persistence
- Adjustable split
- Syntax highlighting

## Table
| Feature | Status |
| ------ | ------ |
| GFM | ✅ |
| Copy | ✅ |
| Import/Export | ✅ |

## Task List
- [x] Build UI
- [x] Add GFM
- [ ] Add Math (KaTeX)

\`\`\`ts
function greet(name: string) {
  console.log('Hello, ' + name);
}
\`\`\`

> Tip: Toggle "Soft Wrap" if long lines overflow.
`;

const STORAGE_KEY = 'toolshub.markdown-previewer.v3';

/* ----------------------------- small utilities ---------------------------- */

function downloadBlob(filename: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function clsx(...arr: Array<string | false | undefined>) {
  return arr.filter(Boolean).join(' ');
}

async function fileToDataURL(file: File): Promise<string> {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(String(r.result));
    r.onerror = rej;
    r.readAsDataURL(file);
  });
}

function sanitizeTitle(s: string) {
  return s.replace(/[<>:"/\\|?*]/g, '').slice(0, 120) || 'Export';
}

/* ---------------------------------- Page ---------------------------------- */

export default function MarkdownPreviewerPage() {
  const [md, setMd] = useState('');
  const [filename, setFilename] = useState('document.md');
  const [copied, setCopied] = useState(false);
  const [useGfm, setUseGfm] = useState(true);
  const [softWrap, setSoftWrap] = useState(true);
  const [split, setSplit] = useState(50);
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');
  const [fullscreen, setFullscreen] = useState(false);

  // runtime plugins
  const [remarkGfm, setRemarkGfm] = useState<AnyFn | null>(null);
  const [rehypeHighlight, setRehypeHighlight] = useState<AnyFn | null>(null);

  // cursor / outline
  const editorRef = useRef<HTMLTextAreaElement | null>(null);
  const [cursorRowCol, setCursorRowCol] = useState({ row: 1, col: 1 });

  const outline = useMemo(() => {
    const lines = md.split('\n');
    const items: { level: number; text: string; id: string }[] = [];
    for (const l of lines) {
      const m = /^(#{1,6})\s+(.+)$/.exec(l.trim());
      if (m) {
        const level = m[1].length;
        const text = m[2].replace(/[#`*_[\]]/g, '').trim();
        const id = text
          .toLowerCase()
          .replace(/[^\w\s-]/g, '')
          .replace(/\s+/g, '-');
        items.push({ level, text, id });
      }
    }
    return items;
  }, [md]);

  const counts = useMemo(() => {
    const words = (md.match(/\b\S+\b/g) || []).length;
    return { words, chars: md.length, lines: md.split('\n').length };
  }, [md]);

  // load from storage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const s = JSON.parse(saved);
        setMd(s.md ?? '');
        setUseGfm(s.useGfm ?? true);
        setSoftWrap(s.softWrap ?? true);
        setSplit(s.split ?? 50);
        setFilename(s.filename ?? 'document.md');
      } else {
        setMd(SAMPLE_MD);
      }
    } catch {
      setMd(SAMPLE_MD);
    }
  }, []);

  // persist to storage
  useEffect(() => {
    const t = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ md, useGfm, softWrap, split, filename }));
      } catch {}
    }, 200);
    return () => clearTimeout(t);
  }, [md, useGfm, softWrap, split, filename]);

  // load plugins (correct way)
  useEffect(() => {
    let mounted = true;
    (async () => {
      const [{ default: gfm }, { default: highlight }] = await Promise.all([import('remark-gfm'), import('rehype-highlight')]);
      if (mounted) {
        setRemarkGfm(() => gfm as AnyFn);
        setRehypeHighlight(() => highlight as AnyFn);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  /* -------------------------------- actions ------------------------------- */

  const resetAll = () => {
    setMd(SAMPLE_MD);
    setUseGfm(true);
    setSoftWrap(true);
    setSplit(50);
    setFilename('document.md');
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(md);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {}
  };

  const handleImport = async (file?: File) => {
    if (!file) return;
    const text = await file.text();
    setMd(text);
    setFilename(file.name.endsWith('.md') ? file.name : `${file.name}.md`);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f) handleImport(f);
  };

  const handlePaste = async (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (const it of items as any) {
      if (it.kind === 'file') {
        const file = it.getAsFile();
        if (file && file.type.startsWith('image/')) {
          const dataUrl = await fileToDataURL(file);
          const el = editorRef.current;
          const start = el?.selectionStart ?? md.length;
          const end = el?.selectionEnd ?? md.length;
          const before = md.slice(0, start);
          const after = md.slice(end);
          const insert = `![pasted-image](${dataUrl})`;
          const next = `${before}${insert}${after}`;
          setMd(next);
          requestAnimationFrame(() => {
            if (!editorRef.current) return;
            const pos = start + insert.length;
            editorRef.current.selectionStart = editorRef.current.selectionEnd = pos;
            editorRef.current.focus();
          });
          e.preventDefault();
          return;
        }
      }
    }
  };

  const handleExportMd = () => downloadBlob(filename || 'document.md', md, 'text/markdown;charset=utf-8');

  const handleExportHtml = async () => {
    const { marked } = await import('marked');
    const html = marked.parse(md);
    const doc = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>${sanitizeTitle(filename.replace(/\.md$/i, '') || 'Export')}</title>
<meta name="viewport" content="width=device-width, initial-scale=1" />
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github-dark.min.css">
<style>
  :root { color-scheme: light dark; }
  body { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Noto Sans, Ubuntu, Cantarell, Helvetica Neue, Arial; margin: 2rem; line-height: 1.65; }
  pre { background: rgba(0,0,0,0.06); padding: 1rem; overflow:auto; border-radius: 10px; }
  table { border-collapse: collapse; }
  th, td { border: 1px solid rgba(0,0,0,0.15); padding: 6px 10px; }
  blockquote { border-left: 3px solid rgba(0,0,0,0.2); margin: 0; padding: .5rem 1rem; }
  h1,h2,h3,h4,h5 { line-height: 1.25; }
  @media print { a[href^="http"]::after { content: " (" attr(href) ")"; font-size: 0.85em; } }
</style>
</head>
<body>
${html}
</body>
</html>`;
    downloadBlob(filename.replace(/\.md$/i, '') + '.html', doc, 'text/html;charset=utf-8');
  };

  const handlePrint = () => window.print();

  const onCursor = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMd(e.target.value);
    updateRowCol(e.target);
  };
  const updateRowCol = (el: HTMLTextAreaElement) => {
    const pos = el.selectionStart ?? 0;
    const textUpto = el.value.slice(0, pos);
    const rows = textUpto.split('\n');
    setCursorRowCol({ row: rows.length, col: rows[rows.length - 1].length + 1 });
  };

  // plugins arrays
  const remarkPlugins = useMemo(() => {
    const arr: any[] = [];
    if (useGfm && remarkGfm) arr.push(remarkGfm);
    return arr;
  }, [useGfm, remarkGfm]);

  const rehypePlugins = useMemo(() => {
    const arr: any[] = [];
    if (rehypeHighlight) arr.push(rehypeHighlight);
    return arr;
  }, [rehypeHighlight]);

  /* --------------------------------- render -------------------------------- */

  return (
    <MotionGlassCard>
      {/* Top bar */}
      <GlassCard className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-6">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
            <FileText className="h-6 w-6" /> Markdown Previewer
          </h1>
          <p className="text-sm text-muted-foreground">Live GFM preview, drag & drop, paste images, export HTML/PDF.</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Input value={filename} onChange={(e) => setFilename(e.target.value)} className="w-40 sm:w-56" placeholder="document.md" />
          <Button variant="outline" onClick={resetAll} className="gap-2">
            <RotateCcw className="h-4 w-4" /> Reset
          </Button>
          <Button variant="outline" className="gap-2" onClick={() => setMd(SAMPLE_MD)}>
            <Wand2 className="h-4 w-4" /> Sample
          </Button>
          <label className="inline-flex">
            <input type="file" accept=".md,.markdown,.txt" className="hidden" onChange={(e) => handleImport(e.target.files?.[0])} />
            <Button variant="outline" className="gap-2" asChild>
              <span>
                <Upload className="h-4 w-4" /> Import
              </span>
            </Button>
          </label>
          <Button variant="outline" className="gap-2" onClick={handleExportMd}>
            <Download className="h-4 w-4" /> .md
          </Button>
          <Button variant="outline" className="gap-2" onClick={handleExportHtml}>
            <Download className="h-4 w-4" /> .html
          </Button>
          <Button className="gap-2" onClick={() => setFullscreen((v) => !v)}>
            {fullscreen ? <Minimize2 className="h-4 w-4" /> : <Fullscreen className="h-4 w-4" />}
            {fullscreen ? 'Exit' : 'Fullscreen'}
          </Button>
        </div>
      </GlassCard>

      {/* Settings */}
      <GlassCard className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Settings</CardTitle>
          <CardDescription>Rendering options & layout preferences.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-4">
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div className="space-y-0.5">
              <Label className="flex items-center gap-2">
                <Github className="h-4 w-4" /> GitHub Flavored Markdown
              </Label>
              <p className="text-xs text-muted-foreground">Tables, task lists, strikethrough.</p>
            </div>
            <Switch checked={useGfm} onCheckedChange={setUseGfm} />
          </div>

          <div className="flex items-center justify-between rounded-lg border p-3">
            <div className="space-y-0.5">
              <Label className="flex items-center gap-2">
                <WrapText className="h-4 w-4" /> Soft Wrap (Editor)
              </Label>
              <p className="text-xs text-muted-foreground">Wrap long lines in the editor.</p>
            </div>
            <Switch checked={softWrap} onCheckedChange={setSoftWrap} />
          </div>

          <div className="sm:col-span-2 rounded-lg border p-3">
            <Label className="flex items-center gap-2 mb-2">
              <SplitSquareHorizontal className="h-4 w-4" /> Split (Desktop)
            </Label>
            <div className="flex items-center gap-3">
              <Input type="range" min={25} max={75} value={split} onChange={(e) => setSplit(Number(e.target.value))} />
              <span className="w-10 text-right text-xs text-muted-foreground">{split}%</span>
              <div className="ml-auto flex gap-2">
                <Button size="sm" variant="outline" className="gap-2" onClick={handlePrint}>
                  <Printer className="h-4 w-4" /> Print
                </Button>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Adjust editor width (preview gets the rest). Printing uses the preview.</p>
          </div>
        </CardContent>
      </GlassCard>

      <Separator />

      {/* Main workspace */}
      <div className={clsx(fullscreen ? 'fixed inset-2 z-50' : 'relative', 'rounded-2xl')}>
        <GlassCard className={clsx('shadow-sm h-full', fullscreen && 'ring-1 ring-primary/30')}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Editor & Preview</CardTitle>
                <CardDescription>Use tabs on mobile; split view on larger screens. Drag & drop a file anywhere.</CardDescription>
              </div>
              <div className="hidden sm:flex items-center gap-2">
                <ListTree className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">{outline.length} headings</span>
              </div>
            </div>
          </CardHeader>

          <CardContent onDragOver={(e) => e.preventDefault()} onDrop={handleDrop}>
            {/* Mobile tabs */}
            <div className="sm:hidden mb-4">
              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="editor" className="gap-2">
                    <FileText className="h-4 w-4" /> Editor
                  </TabsTrigger>
                  <TabsTrigger value="preview" className="gap-2">
                    <Eye className="h-4 w-4" /> Preview
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="editor" className="mt-4">
                  <EditorCard ref={editorRef} value={md} onChange={onCursor} softWrap={softWrap} onCopy={handleCopy} copied={copied} onPaste={handlePaste} />
                </TabsContent>
                <TabsContent value="preview" className="mt-4">
                  <div className="grid gap-4">
                    <PreviewWithOutline md={md} useGfm={useGfm} remarkPlugins={remarkPlugins} rehypePlugins={rehypePlugins} outline={outline} />
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            {/* Desktop split */}
            <div className="hidden sm:grid gap-4" style={{ gridTemplateColumns: `minmax(280px, ${split}%) 1fr 240px` }}>
              <EditorCard ref={editorRef} value={md} onChange={onCursor} softWrap={softWrap} onCopy={handleCopy} copied={copied} onPaste={handlePaste} />
              <PreviewPane md={md} useGfm={useGfm} remarkPlugins={remarkPlugins} rehypePlugins={rehypePlugins} />
              <OutlinePane outline={outline} />
            </div>

            {/* Status bar */}
            <div className="mt-3 flex flex-wrap items-center justify-between rounded-lg border bg-muted/30 px-3 py-2 text-xs">
              <div className="flex gap-3">
                <span>
                  Words: <b>{counts.words}</b>
                </span>
                <span>
                  Chars: <b>{counts.chars}</b>
                </span>
                <span>
                  Lines: <b>{counts.lines}</b>
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-muted-foreground">
                  Ln {cursorRowCol.row}, Col {cursorRowCol.col}
                </span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button size="sm" variant="outline" className="gap-2" onClick={handleCopy}>
                        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />} {copied ? 'Copied' : 'Copy MD'}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Copy raw Markdown</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </CardContent>
        </GlassCard>
      </div>
    </MotionGlassCard>
  );
}

/* ------------------------------ Subcomponents ------------------------------ */

const EditorCard = React.forwardRef<
  HTMLTextAreaElement,
  {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    onPaste: (e: React.ClipboardEvent<HTMLTextAreaElement>) => void;
    softWrap: boolean;
    copied: boolean;
    onCopy: () => void;
  }
>(({ value, onChange, onPaste, softWrap, copied, onCopy }, ref) => {
  return (
    <div className="flex flex-col rounded-lg border overflow-hidden">
      <div className="flex items-center justify-between border-b bg-muted/40 px-3 py-2">
        <div className="text-xs font-medium tracking-wide uppercase text-muted-foreground">Editor</div>
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="sm" variant="outline" className="gap-2" onClick={onCopy}>
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  {copied ? 'Copied' : 'Copy MD'}
                </Button>
              </TooltipTrigger>
              <TooltipContent>Copy raw Markdown</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      <Textarea
        ref={ref}
        value={value}
        onChange={onChange}
        onPaste={onPaste}
        className={clsx('min-h-[360px] resize-y rounded-none border-0 focus-visible:ring-0 font-mono text-sm', softWrap ? 'whitespace-pre-wrap' : 'whitespace-pre')}
        spellCheck={false}
        placeholder="Start typing your Markdown here… (paste images directly)"
      />
    </div>
  );
});
EditorCard.displayName = 'EditorCard';

function PreviewPane({ md, useGfm, remarkPlugins, rehypePlugins }: { md: string; useGfm: boolean; remarkPlugins: any[]; rehypePlugins: any[] }) {
  return (
    <div className="flex flex-col rounded-lg border overflow-hidden">
      <div className="flex items-center justify-between border-b bg-muted/40 px-3 py-2">
        <div className="text-xs font-medium tracking-wide uppercase text-muted-foreground">Preview</div>
        <div className="text-[10px] text-muted-foreground">{useGfm ? 'GFM ON' : 'GFM OFF'}</div>
      </div>
      <div className="prose prose-sm dark:prose-invert max-w-none p-4 print:p-0">
        <ReactMarkdown remarkPlugins={remarkPlugins} rehypePlugins={rehypePlugins} components={markdownComponents}>
          {md || '_Nothing to preview yet…_'}
        </ReactMarkdown>
      </div>
    </div>
  );
}

function PreviewWithOutline({
  md,
  useGfm,
  remarkPlugins,
  rehypePlugins,
  outline,
}: {
  md: string;
  useGfm: boolean;
  remarkPlugins: any[];
  rehypePlugins: any[];
  outline: { level: number; text: string; id: string }[];
}) {
  return (
    <>
      <PreviewPane md={md} useGfm={useGfm} remarkPlugins={remarkPlugins} rehypePlugins={rehypePlugins} />
      <OutlinePane outline={outline} />
    </>
  );
}

function OutlinePane({ outline }: { outline: { level: number; text: string; id: string }[] }) {
  return (
    <div className="rounded-lg border overflow-hidden">
      <div className="border-b bg-muted/40 px-3 py-2 text-xs font-medium tracking-wide uppercase text-muted-foreground">Outline</div>
      <div className="max-h-[420px] overflow-auto p-2 text-sm">
        {outline.length === 0 && <p className="text-muted-foreground text-xs px-1">No headings yet.</p>}
        <ul className="space-y-1">
          {outline.map((h, i) => (
            <li key={i} style={{ paddingLeft: (h.level - 1) * 10 }}>
              <a
                className="text-foreground/80 hover:underline"
                href={`#${h.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  const el = document.getElementById(h.id);
                  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}>
                {h.text}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/* --------------------------- MD components (UI) --------------------------- */

const markdownComponents = {
  code(props: any) {
    const { children, className, ...rest } = props as React.HTMLAttributes<HTMLElement>;
    const isInline = !String(className || '').includes('language-');
    return isInline ? (
      <code {...rest} className="rounded bg-muted px-1 py-0.5">
        {children}
      </code>
    ) : (
      <pre className="rounded-lg bg-muted/60 p-3 overflow-auto">
        <code className="font-mono text-xs">{children}</code>
      </pre>
    );
  },
  table(props: any) {
    return (
      <div className="not-prose overflow-x-auto">
        <table {...props} className="w-full border-collapse" />
      </div>
    );
  },
  th(props: any) {
    return <th {...props} className="border px-2 py-1 text-left" />;
  },
  td(props: any) {
    return <td {...props} className="border px-2 py-1" />;
  },
  blockquote(props: any) {
    return <blockquote {...props} className="border-l-4 border-primary/30 pl-4 italic text-muted-foreground" />;
  },
  h1: withAnchor('h1'),
  h2: withAnchor('h2'),
  h3: withAnchor('h3'),
  h4: withAnchor('h4'),
  h5: withAnchor('h5'),
  h6: withAnchor('h6'),
} as const;

type HeadingTag = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
function withAnchor(tag: HeadingTag) {
  return (props: React.HTMLAttributes<HTMLHeadingElement>) => {
    const text = String(React.Children.toArray(props.children).join(' '));
    const generated = text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-');
    const existingId = (props as any).id as string | undefined;
    const finalId = existingId || generated;
    const Comp: any = tag;
    return (
      <Comp id={finalId} {...props}>
        <a href={`#${finalId}`} className="no-underline hover:underline">
          {props.children}
        </a>
      </Comp>
    );
  };
}
