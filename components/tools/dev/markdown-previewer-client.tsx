/** biome-ignore-all lint/suspicious/noExplicitAny: <> */
"use client";

import {
  Bold,
  Code,
  Download,
  Eye,
  FileText,
  Github,
  Heading1,
  Heading2,
  Heading3,
  Image as ImageIcon,
  Italic,
  Link as LinkIcon,
  List,
  ListChecks,
  ListOrdered,
  Minus,
  Quote,
  Redo2,
  Strikethrough,
  Wand2,
  WrapText,
} from "lucide-react";
import * as React from "react";
import type { Components } from "react-markdown";
import ReactMarkdown from "react-markdown";
import type { PluggableList } from "unified";
import {
  ActionButton,
  CopyButton,
  ExportFileButton,
  ExportTextButton,
  ResetButton,
} from "@/components/shared/action-buttons";
import InputField from "@/components/shared/form-fields/input-field";
import SwitchRow from "@/components/shared/form-fields/switch-row";
import TextareaField from "@/components/shared/form-fields/textarea-field";
import ToolPageHeader from "@/components/shared/tool-page-header";
import { Button } from "@/components/ui/button";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GlassCard } from "@/components/ui/glass-card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useMDXComponents } from "@/mdx-components";

/* utils */
function sanitizeTitle(s: string) {
  return s.replace(/[<>:"/\\|?*]/g, "").slice(0, 120) || "Export";
}

function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = React.useState<T>(initial);

  // load once
  React.useEffect(() => {
    try {
      if (typeof window === "undefined") return;
      const raw = localStorage.getItem(key);
      if (raw) setValue(JSON.parse(raw) as T);
    } catch {}
  }, [key]);

  // save (debounced)
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const t = window.setTimeout(() => {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch {}
    }, 200);
    return () => window.clearTimeout(t);
  }, [key, value]);

  return [value, setValue] as const;
}

/* UI shell */

function Panel({
  title,
  subtitle,
  right,
  left,
  children,
  className,
}: {
  title: string;
  subtitle?: React.ReactNode;
  right?: React.ReactNode;
  left?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("rounded-xl border bg-background/60 backdrop-blur", className)}>
      <div className="flex items-center justify-between border-b px-3 py-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {title}
            </span>
            {left ? <span className="inline-flex items-center">{left}</span> : null}
          </div>
          {subtitle ? <div className="text-[11px] text-muted-foreground">{subtitle}</div> : null}
        </div>
        {right ? <div className="flex items-center gap-2">{right}</div> : null}
      </div>
      <div className="p-3">{children}</div>
    </div>
  );
}

const STORAGE_KEY = "toolshub.markdown-previewer.v9";
const SAMPLE_MD = `# ✨ Markdown Previewer

Write in **Write** tab — see live **Preview**.

- GFM: tables, task lists, strikethrough
- Copy MD / Copy HTML
- Export .md / .html
`;

/* page */

export default function MarkdownPreviewerClient() {
  const [state, setState] = useLocalStorage(STORAGE_KEY, {
    md: SAMPLE_MD,
    filename: "document.md",
    useGfm: true,
    softWrap: true,
  });

  const setPatch = React.useCallback(
    (patch: Partial<typeof state>) => setState((prev) => ({ ...prev, ...patch })),
    [setState],
  );

  const md = state.md as string;
  const filename = state.filename as string;
  const useGfm = state.useGfm as boolean;
  const softWrap = state.softWrap as boolean;

  // plugins (lazy)
  const [gfmList, setGfmList] = React.useState<PluggableList>([]);
  const [highlightList, setHighlightList] = React.useState<PluggableList>([]);
  React.useEffect(() => {
    let mounted = true;
    (async () => {
      const [{ default: gfm }, { default: highlight }] = await Promise.all([
        import("remark-gfm"),
        import("rehype-highlight"),
      ]);
      if (mounted) {
        setGfmList([gfm]);
        setHighlightList([highlight]);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);
  const remarkPlugins = React.useMemo<PluggableList>(
    () => (useGfm ? gfmList : []),
    [useGfm, gfmList],
  );
  const rehypePlugins = React.useMemo<PluggableList>(() => highlightList, [highlightList]);

  const [activeTab, setActiveTab] = React.useState<"write" | "preview">("write");
  const editorRef = React.useRef<HTMLTextAreaElement | null>(null);
  const [cursorRowCol, setCursorRowCol] = React.useState({ row: 1, col: 1 });

  const counts = React.useMemo(() => {
    const words = (md.match(/\b\S+\b/g) || []).length;
    return { words, chars: md.length, lines: md.split("\n").length };
  }, [md]);

  const resetAll = () =>
    setPatch({
      md: SAMPLE_MD,
      filename: "document.md",
      useGfm: true,
      softWrap: true,
    });

  const generateHTML = React.useCallback(async () => {
    const { marked } = await import("marked");
    return String(marked.parse(md));
  }, [md]);

  /* selection helpers (stable) */
  const insertAtCursor = React.useCallback(
    (snippet: string) => {
      const el = editorRef.current;
      if (!el) return setPatch({ md: md + snippet });
      const start = el.selectionStart ?? 0;
      const end = el.selectionEnd ?? 0;
      const next = `${md.slice(0, start)}${snippet}${md.slice(end)}`;
      setPatch({ md: next });
      requestAnimationFrame(() => {
        if (!editorRef.current) return;
        const pos = start + snippet.length;
        editorRef.current.selectionStart = editorRef.current.selectionEnd = pos;
        editorRef.current.focus();
      });
    },
    [md, setPatch],
  );

  const wrapSelection = React.useCallback(
    (prefix: string, suffix: string = prefix, placeholder = "text") => {
      const el = editorRef.current;
      if (!el) return insertAtCursor(`${prefix}${placeholder}${suffix}`);
      const start = el.selectionStart ?? 0;
      const end = el.selectionEnd ?? 0;
      const sel = md.slice(start, end) || placeholder;
      const next = `${md.slice(0, start)}${prefix}${sel}${suffix}${md.slice(end)}`;
      setPatch({ md: next });
      requestAnimationFrame(() => {
        if (!editorRef.current) return;
        const newStart = start + prefix.length;
        const newEnd = newStart + sel.length;
        editorRef.current.selectionStart = newStart;
        editorRef.current.selectionEnd = newEnd;
        editorRef.current.focus();
      });
    },
    [insertAtCursor, md, setPatch],
  );

  const prefixLines = React.useCallback(
    (prefix: string) => {
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
      setPatch({ md: next });
    },
    [md, setPatch],
  );

  // keyboard shortcuts
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
  }, [wrapSelection]);

  // editor change
  const onEditorChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPatch({ md: e.target.value });
    const pos = e.target.selectionStart ?? 0;
    const rows = e.target.value.slice(0, pos).split("\n");
    setCursorRowCol({ row: rows.length, col: rows[rows.length - 1].length + 1 });
  };

  // MDX bridge
  type MDXProvidedComponents = {
    code?: React.ComponentType<{ code: string; language?: string }>;
    [key: string]: any;
  };
  const mdx = useMDXComponents() as MDXProvidedComponents;
  const components = React.useMemo<Components>(() => buildMarkdownComponents(mdx), [mdx]);

  return (
    <>
      <ToolPageHeader
        title="Markdown Previewer"
        description="GitHub-style Write/Preview tabs with GFM & export tools."
        icon={FileText}
        actions={
          <>
            <ResetButton onClick={resetAll} />
            <ActionButton icon={Wand2} label="Sample" onClick={() => setPatch({ md: SAMPLE_MD })} />
            <InputField
              fileButtonVariant="default"
              type="file"
              accept=".md,.markdown,.txt"
              multiple={false}
              onFilesChange={async (files) => {
                const f = files?.[0];
                if (!f) return;
                const text = await f.text();
                setPatch({
                  md: text,
                  filename: f.name.endsWith(".md") ? f.name : `${f.name}.md`,
                });
              }}
            />
          </>
        }
      />

      {/* Settings */}
      <GlassCard>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Settings</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3 items-end">
          <SwitchRow
            label="GitHub Flavored Markdown"
            hint="Tables, task lists, strikethrough."
            checked={useGfm}
            onCheckedChange={(v) => setPatch({ useGfm: v })}
          />
          <SwitchRow
            label="Soft Wrap (Editor)"
            hint="Wrap long lines in the editor."
            checked={softWrap}
            onCheckedChange={(v) => setPatch({ softWrap: v })}
          />

          <div className="flex items-center gap-2 ml-auto">
            <ExportTextButton
              label="Export .md"
              filename={filename || "document.md"}
              mime="text/markdown;charset=utf-8"
              getText={() => md}
            />
            <ExportFileButton
              icon={Download}
              label="Export .html"
              filename={`${filename.replace(/\.md$/i, "")}.html`}
              mime="text/html;charset=utf-8"
              getContent={async () => {
                const html = await generateHTML();
                return `<!doctype html>
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
              }}
            />
          </div>
        </CardContent>
      </GlassCard>

      <Separator className="my-4" />

      {/* Workspace */}
      <GlassCard>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "write" | "preview")}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="write" className="gap-2">
                Write
              </TabsTrigger>
              <TabsTrigger value="preview" className="gap-2">
                <Eye className="h-4 w-4" /> Preview
              </TabsTrigger>
            </TabsList>

            <TabsContent value="write" className="mt-4">
              <EditorPanel
                ref={editorRef}
                value={md}
                onChange={onEditorChange}
                softWrap={softWrap}
                onCmd={{
                  bold: () => wrapSelection("**"),
                  italic: () => wrapSelection("_"),
                  strike: () => wrapSelection("~~"),
                  codeInline: () => wrapSelection("`"),
                  codeBlock: () => {
                    const el = editorRef.current;
                    const sel = el ? md.slice(el.selectionStart ?? 0, el.selectionEnd ?? 0) : "";
                    insertAtCursor(`\n\`\`\`\n${sel || "code"}\n\`\`\`\n`);
                  },
                  h1: () => insertAtCursor("# "),
                  h2: () => insertAtCursor("## "),
                  h3: () => insertAtCursor("### "),
                  link: () => wrapSelection("[", "](https://)", "link text"),
                  quote: () => prefixLines("> "),
                  hr: () => insertAtCursor("\n---\n"),
                  table: () =>
                    insertAtCursor(
                      `\n| Column 1 | Column 2 |\n| -------- | -------- |\n| Value    | Value    |\n`,
                    ),
                  image: () => insertAtCursor(`![alt text](https://)\n`),
                  list: () => prefixLines("- "),
                  olist: () => prefixLines("1. "),
                  clist: () => prefixLines("- [ ] "),
                }}
              />
            </TabsContent>

            <TabsContent value="preview" className="mt-4">
              <PreviewPanel
                md={md}
                remarkPlugins={remarkPlugins}
                rehypePlugins={rehypePlugins}
                gfmOn={useGfm}
                components={components}
              />
            </TabsContent>
          </Tabs>

          {/* Status bar */}
          <div className="mt-3 flex flex-wrap items-center justify-between rounded-lg border bg-muted/30 px-3 py-2 text-xs">
            <div className="flex gap-2">
              <span className="rounded-md border bg-muted/40 px-2 py-1">
                Words: <b className="ml-1">{counts.words}</b>
              </span>
              <span className="rounded-md border bg-muted/40 px-2 py-1">
                Chars: <b className="ml-1">{counts.chars}</b>
              </span>
              <span className="rounded-md border bg-muted/40 px-2 py-1">
                Lines: <b className="ml-1">{counts.lines}</b>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">
                Ln {cursorRowCol.row}, Col {cursorRowCol.col}
              </span>
            </div>
          </div>
        </CardContent>
      </GlassCard>
    </>
  );
}

/* panels */

const EditorPanel = React.forwardRef<
  HTMLTextAreaElement,
  {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    softWrap: boolean;
    onCmd: {
      bold: () => void;
      italic: () => void;
      strike: () => void;
      codeInline: () => void;
      codeBlock: () => void;
      h1: () => void;
      h2: () => void;
      h3: () => void;
      link: () => void;
      quote: () => void;
      hr: () => void;
      table: () => void;
      image: () => void;
      list: () => void;
      olist: () => void;
      clist: () => void;
    };
  }
>(function EditorPanel({ value, onChange, softWrap, onCmd }, ref) {
  return (
    <Panel
      title="Editor"
      right={
        <div className="flex items-center gap-2">
          <CopyButton size="sm" label="Copy MD" getText={() => value} />
          <CopyButton
            size="sm"
            label="Copy HTML"
            getText={async () => {
              const { marked } = await import("marked");
              return String(marked.parse(value));
            }}
          />
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
                icon: <Strikethrough className="h-4 w-4" />,
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
              { title: "Heading 3", icon: <Heading3 className="h-4 w-4" />, onClick: onCmd.h3 },
              { title: "Link", icon: <LinkIcon className="h-4 w-4" />, onClick: onCmd.link },
            ],
            [
              { title: "Quote", icon: <Quote className="h-4 w-4" />, onClick: onCmd.quote },
              { title: "Horizontal rule", icon: <Minus className="h-4 w-4" />, onClick: onCmd.hr },
              { title: "Table", icon: <List className="h-4 w-4" />, onClick: onCmd.table },
              { title: "Image", icon: <ImageIcon className="h-4 w-4" />, onClick: onCmd.image },
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

      <TextareaField
        ref={ref}
        value={value}
        onChange={onChange}
        textareaClassName={cn(
          "min-h-[360px] resize-none rounded-md border bg-background/70 font-mono text-sm",
          softWrap ? "whitespace-pre-wrap" : "whitespace-pre",
        )}
        placeholder="Start typing your Markdown here… (paste images directly)"
        aria-label="Markdown editor"
      />
    </Panel>
  );
});
EditorPanel.displayName = "EditorPanel";

function PreviewPanel({
  md,
  remarkPlugins,
  rehypePlugins,
  gfmOn,
  components,
}: {
  md: string;
  remarkPlugins: PluggableList;
  rehypePlugins: PluggableList;
  gfmOn: boolean;
  components: Components;
}) {
  return (
    <Panel
      title="Preview"
      subtitle={gfmOn ? "GFM ON" : "GFM OFF"}
      right={
        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
          <WrapText className="h-3.5 w-3.5" />
          <span>Rendered</span>
        </div>
      }
    >
      <div className="prose prose-sm max-w-none dark:prose-invert">
        <ReactMarkdown
          components={components}
          remarkPlugins={remarkPlugins}
          rehypePlugins={rehypePlugins}
        >
          {md || "_Nothing to preview yet…_"}
        </ReactMarkdown>
      </div>
    </Panel>
  );
}

/* ReactMarkdown x MDX bridge (typed) */

type MDXProvided = {
  code?: React.ComponentType<{ code: string; language?: string }>;
  [key: string]: any;
};

function buildMarkdownComponents(mdx: MDXProvided): Components {
  type HeadingTag = "h1" | "h2" | "h3" | "h4";
  const m: MDXProvided = mdx || {};

  const withAnchor = (Tag: HeadingTag) => (props: React.HTMLAttributes<HTMLHeadingElement>) => {
    const text = String(React.Children.toArray(props.children).join(" "));
    const generated = text
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-");
    const id = (props as { id?: string }).id ?? generated;
    const Comp = Tag as unknown as React.ElementType;
    return (
      <Comp id={id} {...props} className={cn("group scroll-mt-20", props.className)}>
        <a href={`#${id}`} className="no-underline hover:underline">
          {props.children}
        </a>
      </Comp>
    );
  };

  type CodeRendererProps = React.HTMLAttributes<HTMLElement> & {
    inline?: boolean;
    className?: string;
    children?: React.ReactNode;
  };

  const DefaultCodeBlock = ({ children }: { children?: React.ReactNode }) => (
    <pre className="overflow-auto rounded-lg bg-muted/60 p-3">
      <code className="font-mono text-xs">{children}</code>
    </pre>
  );

  return {
    code({ inline, className, children, ...rest }: CodeRendererProps) {
      const isInline = inline ?? !String(className ?? "").includes("language-");
      if (isInline) {
        return (
          <code {...rest} className="rounded bg-muted px-1 py-0.5">
            {children}
          </code>
        );
      }

      const language = /language-([\w-]+)/.exec(className ?? "")?.[1] ?? undefined;
      const codeText =
        typeof children === "string" ? children : String(React.Children.toArray(children).join(""));

      if (m.code) {
        const MDXCodeBlock = m.code as React.ComponentType<{ code: string; language?: string }>;
        return <MDXCodeBlock code={codeText} language={language} />;
      }
      return <DefaultCodeBlock>{codeText}</DefaultCodeBlock>;
    },

    h1: (props) =>
      withAnchor("h1")({
        ...props,
        className: cn(props.className, "text-3xl font-semibold tracking-tight pt-10 pb-4"),
      }),
    h2: (props) =>
      withAnchor("h2")({
        ...props,
        className: cn(props.className, "text-2xl font-semibold tracking-tight pt-8 pb-3"),
      }),
    h3: (props) =>
      withAnchor("h3")({
        ...props,
        className: cn(props.className, "text-xl font-medium pt-6 pb-2"),
      }),
    h4: (props) =>
      withAnchor("h4")({
        ...props,
        className: cn(props.className, "text-lg font-medium pt-5 pb-1"),
      }),

    p: (props) => (m.p ? m.p(props) : <p className="mb-4 leading-relaxed" {...props} />),
    ol: (props) => (m.ol ? m.ol(props) : <ol className="list-decimal space-y-2 pl-5" {...props} />),
    ul: (props) => (m.ul ? m.ul(props) : <ul className="list-disc space-y-1 pl-5" {...props} />),
    li: (props) => (m.li ? m.li(props) : <li className="pl-1" {...props} />),

    em: (props) => (m.em ? m.em(props) : <em className="italic" {...props} />),
    strong: (props) =>
      m.strong ? m.strong(props) : <strong className="font-semibold" {...props} />,

    a: ({ href, children, ...props }) => {
      const cls = "text-blue-600 hover:underline dark:text-blue-400 dark:hover:text-blue-300";
      if (m.a) return m.a({ href, children, ...props });
      if (href?.startsWith("/"))
        return (
          <a href={href} className={cls} {...props}>
            {children}
          </a>
        );
      if (href?.startsWith("#"))
        return (
          <a href={href} className={cls} {...props}>
            {children}
          </a>
        );
      return (
        <a href={href} target="_blank" rel="noopener noreferrer" className={cls} {...props}>
          {children}
        </a>
      );
    },

    blockquote: (props) =>
      m.blockquote ? (
        m.blockquote(props)
      ) : (
        <blockquote className="ml-2 border-l-4 pl-4 italic opacity-80" {...props} />
      ),

    table: (props) =>
      m.table ? m.table(props) : <table className="my-4 w-full table-auto" {...props} />,
    thead: (props) => (m.thead ? m.thead(props) : <thead className="bg-muted/40" {...props} />),
    tbody: (props) => (m.tbody ? m.tbody(props) : <tbody {...props} />),
    tr: (props) => (m.tr ? m.tr(props) : <tr className="border-t" {...props} />),
    th: (props) =>
      m.th ? m.th(props) : <th className="p-2 text-left text-sm font-semibold" {...props} />,
    td: (props) => (m.td ? m.td(props) : <td className="p-2 text-sm" {...props} />),
  };
}

/* small UI */

function Toolbar({
  groups,
}: {
  groups: Array<Array<{ title: string; icon: React.ReactNode; onClick: () => void }>>;
}) {
  return (
    <div className="inline-flex w-full flex-wrap items-center gap-2">
      {groups.map((g, gi) => (
        <div
          key={`grp-${gi as number}`}
          className="inline-flex items-center gap-1 rounded-md border bg-muted/30 px-1"
        >
          {g.map((b, bi) => (
            <Button
              key={`btn-${gi}-${bi as number}`}
              size="icon"
              variant="ghost"
              className="h-8 w-8"
              title={b.title}
              onClick={b.onClick}
              aria-label={b.title}
            >
              {b.icon}
            </Button>
          ))}
        </div>
      ))}
    </div>
  );
}
