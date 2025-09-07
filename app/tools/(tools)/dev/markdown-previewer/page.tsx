"use client";

import {
  Bold,
  Check,
  Code,
  Copy,
  Download,
  Eye,
  FileText,
  Fullscreen,
  Github,
  Heading1,
  Heading2,
  Italic,
  Link as LinkIcon,
  List,
  ListChecks,
  ListOrdered,
  Minimize2,
  Printer,
  Redo2,
  RotateCcw,
  SplitSquareHorizontal,
  Upload,
  Wand2,
  WrapText,
} from "lucide-react";
import * as React from "react";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GlassCard, MotionGlassCard } from "@/components/ui/glass-card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

/* -----------------------------------------------------------------------------
   Reusable primitives
----------------------------------------------------------------------------- */

function clsx(...xs: Array<string | false | undefined | null>) {
  return xs.filter(Boolean).join(" ");
}

function downloadBlob(filename: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

const STORAGE_KEY = "toolshub.markdown-previewer.v5";

type AnyFn = (...args: any[]) => any;

function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = React.useState<T>(initial);
  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw) setValue(JSON.parse(raw));
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  React.useEffect(() => {
    const t = setTimeout(() => {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch {}
    }, 200);
    return () => clearTimeout(t);
  }, [key, value]);
  return [value, setValue] as const;
}

/** Panel: consistent card with header + content areas */
function Panel({
  title,
  subtitle,
  right,
  children,
  className,
}: {
  title: string;
  subtitle?: React.ReactNode;
  right?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={clsx("rounded-xl border bg-background/60 backdrop-blur", className)}>
      <div className="flex items-center justify-between border-b px-3 py-2">
        <div>
          <div className="text-xs font-medium tracking-wide uppercase text-muted-foreground">
            {title}
          </div>
          {subtitle ? <div className="text-[11px] text-muted-foreground">{subtitle}</div> : null}
        </div>
        {right ? <div className="flex items-center gap-2">{right}</div> : null}
      </div>
      <div className="p-3">{children}</div>
    </div>
  );
}

/** Toolbar: grouped icon buttons with tooltips */
function Toolbar({
  groups,
}: {
  groups: Array<Array<{ title: string; icon: React.ReactNode; onClick: () => void }>>;
}) {
  return (
    <div className="inline-flex w-full flex-wrap items-center gap-2">
      {groups.map((g, gi) => (
        <div key={gi} className="inline-flex items-center gap-1 rounded-md border bg-muted/30 px-1">
          {g.map((b, bi) => (
            <TooltipProvider key={bi}>
              <Tooltip delayDuration={200}>
                <TooltipTrigger asChild>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8"
                    title={b.title}
                    onClick={b.onClick}
                  >
                    {b.icon}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{b.title}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
        </div>
      ))}
    </div>
  );
}

/** SplitPane: vertical with draggable handle */
function SplitPane({
  left,
  right,
  min = 25,
  max = 75,
  value,
  onChange,
}: {
  left: React.ReactNode;
  right: React.ReactNode;
  min?: number;
  max?: number;
  value: number; // % width for left pane
  onChange: (v: number) => void;
}) {
  const ref = React.useRef<HTMLDivElement | null>(null);
  const [drag, setDrag] = React.useState(false);

  React.useEffect(() => {
    if (!drag) return;
    const onMove = (e: MouseEvent) => {
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const x = Math.max(
        r.width * (min / 100),
        Math.min(e.clientX - r.left, r.width * (max / 100)),
      );
      onChange(Math.round((x / r.width) * 100));
    };
    const onUp = () => setDrag(false);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp, { once: true });
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [drag, min, max, onChange]);

  return (
    <div
      ref={ref}
      className="hidden gap-4 sm:grid"
      style={{ gridTemplateColumns: `minmax(260px, ${value}%) 12px 1fr` }}
    >
      <div>{left}</div>
      <div
        role="separator"
        aria-orientation="vertical"
        title="Drag to resize"
        className={clsx(
          "relative cursor-col-resize select-none",
          drag ? "bg-primary/30" : "bg-transparent",
        )}
        onMouseDown={() => setDrag(true)}
      >
        <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-1 rounded-full bg-primary/30" />
      </div>
      <div>{right}</div>
    </div>
  );
}

/** DropZone overlay for drag & drop files */
function DropZone({ active, text }: { active: boolean; text: string }) {
  if (!active) return null;
  return (
    <div className="absolute inset-0 z-40 grid place-items-center bg-primary/10 backdrop-blur-sm border-2 border-dashed border-primary rounded-2xl">
      <div className="rounded-xl bg-background/80 px-4 py-2 text-sm">{text}</div>
    </div>
  );
}

/** Status bar chip */
function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <span className="rounded-md border bg-muted/40 px-2 py-1 text-xs">
      {label}: <b className="ml-1">{value}</b>
    </span>
  );
}

/** Outline list */
function OutlineList({ items }: { items: { level: number; text: string; id: string }[] }) {
  return (
    <div className="max-h-[420px] overflow-auto p-2 text-sm">
      {items.length === 0 ? (
        <p className="text-muted-foreground text-xs px-1">No headings yet.</p>
      ) : (
        <ul className="space-y-1">
          {items.map((h, i) => (
            <li key={i} style={{ paddingLeft: (h.level - 1) * 12 }}>
              <a
                className="text-foreground/80 hover:underline"
                href={`#${h.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  const el = document.getElementById(h.id);
                  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
              >
                {h.text}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* -----------------------------------------------------------------------------
   Page
----------------------------------------------------------------------------- */

const SAMPLE_MD = `# ✨ Markdown Previewer

Write Markdown on the left — see **live preview** on the right.

- Live GFM preview
- Copy MD / Copy HTML
- Drag handle to resize
- Paste images directly
`;

function sanitizeTitle(s: string) {
  return s.replace(/[<>:"/\\|?*]/g, "").slice(0, 120) || "Export";
}

export default function MarkdownPreviewerPage() {
  // state
  const [state, setState] = useLocalStorage(STORAGE_KEY, {
    md: SAMPLE_MD,
    filename: "document.md",
    useGfm: true,
    softWrap: true,
    split: 56,
  });

  const md = state.md as string;
  const filename = state.filename as string;
  const useGfm = state.useGfm as boolean;
  const softWrap = state.softWrap as boolean;
  const split = state.split as number;

  const set = (patch: Partial<typeof state>) => setState({ ...(state as any), ...patch });

  const [remarkGfm, setRemarkGfm] = React.useState<AnyFn | null>(null);
  const [rehypeHighlight, setRehypeHighlight] = React.useState<AnyFn | null>(null);

  const [copiedMd, setCopiedMd] = React.useState(false);
  const [copiedHtml, setCopiedHtml] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<"editor" | "preview">("editor");
  const [fullscreen, setFullscreen] = React.useState(false);
  const [dragOver, setDragOver] = React.useState(false);

  const editorRef = React.useRef<HTMLTextAreaElement | null>(null);
  const [cursorRowCol, setCursorRowCol] = React.useState({ row: 1, col: 1 });

  // outline
  const outline = React.useMemo(() => {
    const lines = md.split("\n");
    const items: { level: number; text: string; id: string }[] = [];
    for (const l of lines) {
      const m = /^(#{1,6})\s+(.+)$/.exec(l.trim());
      if (m) {
        const level = m[1].length;
        const text = m[2].replace(/[#`*_[\]]/g, "").trim();
        const id = text
          .toLowerCase()
          .replace(/[^\w\s-]/g, "")
          .replace(/\s+/g, "-");
        items.push({ level, text, id });
      }
    }
    return items;
  }, [md]);

  const counts = React.useMemo(() => {
    const words = (md.match(/\b\S+\b/g) || []).length;
    return { words, chars: md.length, lines: md.split("\n").length };
  }, [md]);

  // plugins
  React.useEffect(() => {
    let mounted = true;
    (async () => {
      const [{ default: gfm }, { default: highlight }] = await Promise.all([
        import("remark-gfm"),
        import("rehype-highlight"),
      ]);
      if (mounted) {
        setRemarkGfm(() => gfm as AnyFn);
        setRehypeHighlight(() => highlight as AnyFn);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // actions
  const resetAll = () =>
    set({
      md: SAMPLE_MD,
      filename: "document.md",
      useGfm: true,
      softWrap: true,
      split: 56,
    });

  const copyMarkdown = async () => {
    await navigator.clipboard.writeText(md);
    setCopiedMd(true);
    setTimeout(() => setCopiedMd(false), 1200);
  };

  const generateHTML = async () => {
    const { marked } = await import("marked");
    return String(marked.parse(md));
  };

  const copyHTML = async () => {
    const html = await generateHTML();
    await navigator.clipboard.writeText(html);
    setCopiedHtml(true);
    setTimeout(() => setCopiedHtml(false), 1200);
  };

  const handleExportMd = () =>
    downloadBlob(filename || "document.md", md, "text/markdown;charset=utf-8");

  const handleExportHtml = async () => {
    const html = await generateHTML();
    const doc = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>${sanitizeTitle(filename.replace(/\.md$/i, "") || "Export")}</title>
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
    downloadBlob(filename.replace(/\.md$/i, "") + ".html", doc, "text/html;charset=utf-8");
  };

  const handleImport = async (file?: File) => {
    if (!file) return;
    const text = await file.text();
    set({ md: text, filename: file.name.endsWith(".md") ? file.name : `${file.name}.md` });
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) void handleImport(f);
  };

  const onEditorChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    set({ md: e.target.value });
    const pos = e.target.selectionStart ?? 0;
    const rows = e.target.value.slice(0, pos).split("\n");
    setCursorRowCol({ row: rows.length, col: rows[rows.length - 1].length + 1 });
  };

  // editor helpers
  function insertAtCursor(snippet: string) {
    const el = editorRef.current;
    if (!el) return set({ md: md + snippet });
    const start = el.selectionStart ?? 0;
    const end = el.selectionEnd ?? 0;
    const next = `${md.slice(0, start)}${snippet}${md.slice(end)}`;
    set({ md: next });
    requestAnimationFrame(() => {
      if (!editorRef.current) return;
      const pos = start + snippet.length;
      editorRef.current.selectionStart = editorRef.current.selectionEnd = pos;
      editorRef.current.focus();
    });
  }
  function wrapSelection(prefix: string, suffix: string = prefix, placeholder = "text") {
    const el = editorRef.current;
    if (!el) return insertAtCursor(`${prefix}${placeholder}${suffix}`);
    const start = el.selectionStart ?? 0;
    const end = el.selectionEnd ?? 0;
    const sel = md.slice(start, end) || placeholder;
    const next = `${md.slice(0, start)}${prefix}${sel}${suffix}${md.slice(end)}`;
    set({ md: next });
    requestAnimationFrame(() => {
      if (!editorRef.current) return;
      const newStart = start + prefix.length;
      const newEnd = newStart + sel.length;
      editorRef.current.selectionStart = newStart;
      editorRef.current.selectionEnd = newEnd;
      editorRef.current.focus();
    });
  }
  function prefixLines(prefix: string) {
    const el = editorRef.current;
    if (!el) return;
    const start = el.selectionStart ?? 0;
    const end = el.selectionEnd ?? 0;
    const block = md.slice(start, end);
    const nextBlock =
      (block || "")
        .split("\n")
        .map((l) => (l.trim() ? `${prefix}${l.replace(/^\s*/, "")}` : l))
        .join("\n") || `${prefix}`;
    const next = `${md.slice(0, start)}${nextBlock}${md.slice(end)}`;
    set({ md: next });
  }

  // keyboard shortcuts basic
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!(e.ctrlKey || e.metaKey)) return;
      const k = e.key.toLowerCase();
      if (k === "b") {
        e.preventDefault();
        wrapSelection("**");
      } else if (k === "i") {
        e.preventDefault();
        wrapSelection("_");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // plugins arrays
  const remarkPlugins = React.useMemo(() => {
    const arr: any[] = [];
    if (useGfm && remarkGfm) arr.push(remarkGfm);
    return arr;
  }, [useGfm, remarkGfm]);
  const rehypePlugins = React.useMemo(() => {
    const arr: any[] = [];
    if (rehypeHighlight) arr.push(rehypeHighlight);
    return arr;
  }, [rehypeHighlight]);

  /* -------------------------------- Render -------------------------------- */

  return (
    <MotionGlassCard>
      {/* Header */}
      <GlassCard className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-6">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
            <FileText className="h-6 w-6" /> Markdown Previewer
          </h1>
          <p className="text-sm text-muted-foreground">
            Clean, flexible editor with live preview, GFM, and handy export tools.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Input
            value={filename}
            onChange={(e) => set({ filename: e.target.value })}
            className="w-44 sm:w-56"
            placeholder="document.md"
            aria-label="Filename"
          />
          <Button variant="outline" onClick={resetAll} className="gap-2" title="Reset to sample">
            <RotateCcw className="h-4 w-4" /> Reset
          </Button>
          <Button variant="outline" className="gap-2" onClick={() => set({ md: SAMPLE_MD })}>
            <Wand2 className="h-4 w-4" /> Sample
          </Button>
          <label className="inline-flex">
            <input
              type="file"
              accept=".md,.markdown,.txt"
              className="hidden"
              onChange={(e) => void handleImport(e.target.files?.[0])}
            />
            <Button variant="outline" className="gap-2" asChild>
              <span>
                <Upload className="h-4 w-4" /> Import
              </span>
            </Button>
          </label>
          <Button
            variant="outline"
            className="gap-2"
            onClick={handleExportMd}
            title="Export Markdown"
          >
            <Download className="h-4 w-4" /> .md
          </Button>
          <Button
            variant="outline"
            className="gap-2"
            onClick={handleExportHtml}
            title="Export HTML"
          >
            <Download className="h-4 w-4" /> .html
          </Button>
          <Button
            className="gap-2"
            onClick={() => setFullscreen((v) => !v)}
            aria-pressed={fullscreen}
            aria-label="Toggle fullscreen"
          >
            {fullscreen ? <Minimize2 className="h-4 w-4" /> : <Fullscreen className="h-4 w-4" />}
            {fullscreen ? "Exit" : "Fullscreen"}
          </Button>
        </div>
      </GlassCard>

      {/* Settings */}
      <GlassCard>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Settings</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-4">
          <Panel
            title="GitHub Flavored Markdown"
            right={<Switch checked={useGfm} onCheckedChange={(v) => set({ useGfm: v })} />}
          >
            <p className="text-xs text-muted-foreground">Tables, task lists, strikethrough.</p>
          </Panel>

          <Panel
            title="Soft Wrap (Editor)"
            right={<Switch checked={softWrap} onCheckedChange={(v) => set({ softWrap: v })} />}
          >
            <p className="text-xs text-muted-foreground">Wrap long lines in the editor.</p>
          </Panel>

          <Panel
            title="Split (Desktop)"
            subtitle="Adjust editor width. Preview gets the rest."
            right={
              <div className="inline-flex items-center gap-2">
                <SplitSquareHorizontal className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">{split}%</span>
              </div>
            }
            className="sm:col-span-2"
          >
            <Input
              type="range"
              min={25}
              max={75}
              value={split}
              onChange={(e) => set({ split: Number(e.target.value) })}
              aria-label="Split percentage"
            />
            <div className="mt-2">
              <Button size="sm" variant="outline" className="gap-2" onClick={() => window.print()}>
                <Printer className="h-4 w-4" /> Print
              </Button>
            </div>
          </Panel>
        </CardContent>
      </GlassCard>

      <Separator />

      {/* Workspace */}
      <div className={clsx(fullscreen ? "fixed inset-2 z-50" : "relative", "rounded-2xl")}>
        <GlassCard
          className={clsx(
            "shadow-sm h-full relative overflow-hidden",
            fullscreen && "ring-1 ring-primary/30",
          )}
          onDragOver={onDragOver}
          onDrop={onDrop}
          onDragLeave={() => setDragOver(false)}
        >
          <DropZone active={dragOver} text="Drop your .md file to import" />

          {/* Mobile */}
          <div className="sm:hidden p-3">
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
                <EditorPanel
                  ref={editorRef}
                  value={md}
                  onChange={onEditorChange}
                  softWrap={softWrap}
                  copyMd={copyMarkdown}
                  copyHtml={copyHTML}
                  copiedMd={copiedMd}
                  copiedHtml={copiedHtml}
                  onCmd={{
                    bold: () => wrapSelection("**"),
                    italic: () => wrapSelection("_"),
                    strike: () => wrapSelection("~~"),
                    codeInline: () => wrapSelection("`"),
                    codeBlock: () => {
                      const el = editorRef.current;
                      const sel = el ? md.slice(el.selectionStart ?? 0, el.selectionEnd ?? 0) : "";
                      insertAtCursor(`\`\`\`\n${sel || "code"}\n\`\`\`\n`);
                    },
                    h1: () => insertAtCursor(`# `),
                    h2: () => insertAtCursor(`## `),
                    link: () => wrapSelection("[", "](https://)", "link text"),
                    list: () => prefixLines("- "),
                    olist: () => prefixLines("1. "),
                    clist: () => prefixLines("- [ ] "),
                  }}
                />
              </TabsContent>

              <TabsContent value="preview" className="mt-4">
                <PreviewPanel
                  md={md}
                  useGfm={useGfm}
                  remarkPlugins={remarkPlugins}
                  rehypePlugins={rehypePlugins}
                />
                <div className="mt-4">
                  <Panel title="Outline">
                    <OutlineList items={outline} />
                  </Panel>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Desktop split */}
          <div className="hidden sm:block p-3">
            <SplitPane
              value={split}
              onChange={(v) => set({ split: v })}
              left={
                <EditorPanel
                  ref={editorRef}
                  value={md}
                  onChange={onEditorChange}
                  softWrap={softWrap}
                  copyMd={copyMarkdown}
                  copyHtml={copyHTML}
                  copiedMd={copiedMd}
                  copiedHtml={copiedHtml}
                  onCmd={{
                    bold: () => wrapSelection("**"),
                    italic: () => wrapSelection("_"),
                    strike: () => wrapSelection("~~"),
                    codeInline: () => wrapSelection("`"),
                    codeBlock: () => {
                      const el = editorRef.current;
                      const sel = el ? md.slice(el.selectionStart ?? 0, el.selectionEnd ?? 0) : "";
                      insertAtCursor(`\`\`\`\n${sel || "code"}\n\`\`\`\n`);
                    },
                    h1: () => insertAtCursor(`# `),
                    h2: () => insertAtCursor(`## `),
                    link: () => wrapSelection("[", "](https://)", "link text"),
                    list: () => prefixLines("- "),
                    olist: () => prefixLines("1. "),
                    clist: () => prefixLines("- [ ] "),
                  }}
                />
              }
              right={
                <div className="grid gap-3 lg:grid-cols-[1fr_280px]">
                  <PreviewPanel
                    md={md}
                    useGfm={useGfm}
                    remarkPlugins={remarkPlugins}
                    rehypePlugins={rehypePlugins}
                  />
                  <Panel title="Outline">
                    <OutlineList items={outline} />
                  </Panel>
                </div>
              }
            />
          </div>

          {/* Status bar */}
          <div className="m-3 mt-0 flex flex-wrap items-center justify-between rounded-lg border bg-muted/30 px-3 py-2 text-xs">
            <div className="flex gap-2">
              <Stat label="Words" value={counts.words} />
              <Stat label="Chars" value={counts.chars} />
              <Stat label="Lines" value={counts.lines} />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">
                Ln {cursorRowCol.row}, Col {cursorRowCol.col}
              </span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button size="sm" variant="outline" className="gap-2" onClick={copyMarkdown}>
                      {copiedMd ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />} MD
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Copy raw Markdown</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button size="sm" variant="outline" className="gap-2" onClick={copyHTML}>
                      {copiedHtml ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}{" "}
                      HTML
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Copy rendered HTML</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </GlassCard>
      </div>
    </MotionGlassCard>
  );
}

/* -----------------------------------------------------------------------------
   Reusable Editor & Preview panels
----------------------------------------------------------------------------- */

const EditorPanel = React.forwardRef<
  HTMLTextAreaElement,
  {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    softWrap: boolean;
    copyMd: () => void;
    copyHtml: () => void;
    copiedMd: boolean;
    copiedHtml: boolean;
    onCmd: {
      bold: () => void;
      italic: () => void;
      strike: () => void;
      codeInline: () => void;
      codeBlock: () => void;
      h1: () => void;
      h2: () => void;
      link: () => void;
      list: () => void;
      olist: () => void;
      clist: () => void;
    };
  }
>(function EditorPanel(
  { value, onChange, softWrap, copyMd, copyHtml, copiedMd, copiedHtml, onCmd },
  ref,
) {
  return (
    <Panel
      title="Editor"
      right={
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" className="gap-2" onClick={copyMd}>
            {copiedMd ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />} MD
          </Button>
          <Button size="sm" variant="outline" className="gap-2" onClick={copyHtml}>
            {copiedHtml ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />} HTML
          </Button>
        </div>
      }
    >
      <div className="mb-2">
        <Toolbar
          groups={[
            [
              {
                title: "Bold (Ctrl/Cmd+B)",
                icon: <Bold className="h-4 w-4" />,
                onClick: onCmd.bold,
              },
              {
                title: "Italic (Ctrl/Cmd+I)",
                icon: <Italic className="h-4 w-4" />,
                onClick: onCmd.italic,
              },
              {
                title: "Strikethrough",
                icon: <Code className="h-4 w-4 rotate-45" />,
                onClick: onCmd.strike,
              },
              {
                title: "Inline code",
                icon: <Code className="h-4 w-4" />,
                onClick: onCmd.codeInline,
              },
              {
                title: "Code block",
                icon: <Redo2 className="h-4 w-4 rotate-90" />,
                onClick: onCmd.codeBlock,
              },
            ],
            [
              { title: "Heading 1", icon: <Heading1 className="h-4 w-4" />, onClick: onCmd.h1 },
              { title: "Heading 2", icon: <Heading2 className="h-4 w-4" />, onClick: onCmd.h2 },
              { title: "Link", icon: <LinkIcon className="h-4 w-4" />, onClick: onCmd.link },
            ],
            [
              { title: "Bullet list", icon: <List className="h-4 w-4" />, onClick: onCmd.list },
              {
                title: "Numbered list",
                icon: <ListOrdered className="h-4 w-4" />,
                onClick: onCmd.olist,
              },
              {
                title: "Checkbox list",
                icon: <ListChecks className="h-4 w-4" />,
                onClick: onCmd.clist,
              },
            ],
          ]}
        />
        <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
          <Github className="h-3.5 w-3.5" />
          <span>GFM shortcuts supported</span>
        </div>
      </div>

      <Textarea
        ref={ref}
        value={value}
        onChange={onChange}
        className={clsx(
          "min-h-[360px] resize-none rounded-md border bg-background/70 font-mono text-sm",
          softWrap ? "whitespace-pre-wrap" : "whitespace-pre",
        )}
        spellCheck={false}
        placeholder="Start typing your Markdown here… (paste images directly)"
        aria-label="Markdown editor"
      />
    </Panel>
  );
});
EditorPanel.displayName = "EditorPanel";

function PreviewPanel({
  md,
  useGfm,
  remarkPlugins,
  rehypePlugins,
}: {
  md: string;
  useGfm: boolean;
  remarkPlugins: any[];
  rehypePlugins: any[];
}) {
  return (
    <Panel
      title="Preview"
      subtitle={useGfm ? "GFM ON" : "GFM OFF"}
      right={
        <div className="text-[10px] text-muted-foreground flex items-center gap-2">
          <WrapText className="h-3.5 w-3.5" />
          <span>Rendered</span>
        </div>
      }
    >
      <div className="prose prose-sm dark:prose-invert max-w-none">
        <ReactMarkdown
          remarkPlugins={remarkPlugins}
          rehypePlugins={rehypePlugins}
          components={markdownComponents}
        >
          {md || "_Nothing to preview yet…_"}
        </ReactMarkdown>
      </div>
    </Panel>
  );
}

/* -----------------------------------------------------------------------------
   Markdown render components
----------------------------------------------------------------------------- */

const markdownComponents = {
  code(props: any) {
    const { children, className, ...rest } = props as React.HTMLAttributes<HTMLElement>;
    const isInline = !String(className || "").includes("language-");
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
    return (
      <blockquote
        {...props}
        className="border-l-4 border-primary/30 pl-4 italic text-muted-foreground"
      />
    );
  },
  h1: withAnchor("h1"),
  h2: withAnchor("h2"),
  h3: withAnchor("h3"),
  h4: withAnchor("h4"),
  h5: withAnchor("h5"),
  h6: withAnchor("h6"),
} as const;

type HeadingTag = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
function withAnchor(tag: HeadingTag) {
  return (props: React.HTMLAttributes<HTMLHeadingElement>) => {
    const text = String(React.Children.toArray(props.children).join(" "));
    const generated = text
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-");
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
