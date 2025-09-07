// app/tools/(tools)/dev/csv-json/page.tsx
"use client";

import { Copy, Download, Info, RefreshCw, RotateCcw, Settings2, Table } from "lucide-react";
import React from "react";
import {
  ActionButton,
  CopyButton,
  ExportTextButton,
  ResetButton,
} from "@/components/shared/action-buttons";
import InputField from "@/components/shared/form-fields/input-field";
import SelectField from "@/components/shared/form-fields/select-field";
import SwitchRow from "@/components/shared/form-fields/switch-row";
import TextareaField from "@/components/shared/form-fields/textarea-field";
import ToolPageHeader from "@/components/shared/tool-page-header";
import { GlassCard, MotionGlassCard } from "@/components/ui/glass-card";
import { Separator } from "@/components/ui/separator";

type Direction = "auto" | "csv-to-json" | "json-to-csv";

/* ------------------------------- CSV helpers ------------------------------ */

type ParseOpts = {
  delimiter: string;
  quote: string;
  trim: boolean;
};

function parseCSV(text: string, opts: ParseOpts): string[][] {
  const { delimiter, quote, trim } = opts;
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let i = 0;
  let inQuotes = false;

  while (i < text.length) {
    const c = text[i];

    if (inQuotes) {
      if (c === quote) {
        if (text[i + 1] === quote) {
          field += quote;
          i += 2;
        } else {
          inQuotes = false;
          i += 1;
        }
      } else {
        field += c;
        i += 1;
      }
    } else {
      if (c === quote) {
        inQuotes = true;
        i += 1;
      } else if (c === delimiter) {
        row.push(trim ? field.trim() : field);
        field = "";
        i += 1;
      } else if (c === "\n") {
        row.push(trim ? field.trim() : field);
        rows.push(row);
        row = [];
        field = "";
        i += 1;
      } else if (c === "\r") {
        // handle CRLF
        if (text[i + 1] === "\n") i += 1;
        row.push(trim ? field.trim() : field);
        rows.push(row);
        row = [];
        field = "";
        i += 1;
      } else {
        field += c;
        i += 1;
      }
    }
  }
  row.push(trim ? field.trim() : field);
  rows.push(row);
  // drop trailing empty line
  if (rows.length && rows[rows.length - 1].length === 1 && rows[rows.length - 1][0] === "") {
    rows.pop();
  }
  return rows;
}

function stringifyCSV(
  rows: string[][],
  delimiter: string,
  quote: string,
  alwaysQuote: boolean,
  newline: "\n" | "\r\n",
) {
  const q = quote;
  const needsQ = (s: string) =>
    alwaysQuote || s.includes(delimiter) || s.includes(q) || s.includes("\n") || s.includes("\r");

  return rows
    .map((r) =>
      r
        .map((cell) => {
          const s = cell ?? "";
          if (needsQ(s)) return q + s.replaceAll(q, q + q) + q;
          return s;
        })
        .join(delimiter),
    )
    .join(newline);
}

/* ------------------------------- JSON helpers ----------------------------- */

function tryParseJSON(text: string): any {
  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
}

/* ---------------------------------- Page ---------------------------------- */

export default function CsvJsonPage() {
  // IO
  const [input, setInput] = React.useState("");
  const [output, setOutput] = React.useState("");

  // direction
  const [direction, setDirection] = React.useState<Direction>("auto");
  const [autoRun, setAutoRun] = React.useState(true);

  // CSV opts
  const [delimiter, setDelimiter] = React.useState<string>(",");
  const [quote, setQuote] = React.useState<string>('"');
  const [trimCells, setTrimCells] = React.useState(true);
  const [headers, setHeaders] = React.useState(true);
  const [newline, setNewline] = React.useState<"\n" | "\r\n">("\n");

  // JSON opts
  const [jsonSpaces, setJsonSpaces] = React.useState(2);
  const [jsonLines, setJsonLines] = React.useState(false); // CSV → JSON lines

  // JSON → CSV opts
  const [includeHeaders, setIncludeHeaders] = React.useState(true);
  const [fieldOrder, setFieldOrder] = React.useState<"first" | "union-alpha">("first");
  const [alwaysQuote, setAlwaysQuote] = React.useState(false);

  const [error, setError] = React.useState<string | null>(null);
  const [copied, setCopied] = React.useState(false);

  // detect direction
  const detectDirection = React.useCallback((s: string): Direction => {
    const t = s.trim();
    if (!t) return "auto";
    if (tryParseJSON(t) !== undefined) return "json-to-csv";
    if (t.includes(",") || t.includes("\t")) return "csv-to-json";
    return "csv-to-json";
  }, []);

  const convertCsvToJson = React.useCallback(() => {
    const delim = delimiter === "\\t" ? "\t" : delimiter;
    const rows = parseCSV(input, { delimiter: delim, quote, trim: trimCells });

    if (!rows.length) return "";

    if (headers) {
      const hdr = rows[0]!.map((h) => (trimCells ? h.trim() : h));
      const body = rows.slice(1);
      if (jsonLines) {
        return body
          .map((r) => JSON.stringify(Object.fromEntries(hdr.map((k, i) => [k, r[i] ?? ""]))))
          .join("\n");
      }
      const records = body.map((r) => Object.fromEntries(hdr.map((k, i) => [k, r[i] ?? ""])));
      return JSON.stringify(records, null, jsonSpaces);
    }

    // no headers
    if (jsonLines) {
      return rows.map((r) => JSON.stringify(r)).join("\n");
    }
    return JSON.stringify(rows, null, jsonSpaces);
  }, [input, delimiter, quote, trimCells, headers, jsonSpaces, jsonLines]);

  const convertJsonToCsv = React.useCallback(() => {
    const delim = delimiter === "\\t" ? "\t" : delimiter;
    const data = tryParseJSON(input);
    if (data === undefined) throw new Error("Invalid JSON input.");

    const toRows = (): string[][] => {
      if (Array.isArray(data)) {
        if (data.length === 0) return [];
        if (Array.isArray(data[0])) {
          // array of arrays
          return data.map((r: any[]) => r.map((v) => String(v ?? "")));
        } else if (typeof data[0] === "object") {
          const arr: Record<string, any>[] = data;
          let keys: string[];
          if (fieldOrder === "first") {
            keys = Object.keys(arr[0]!);
          } else {
            keys = Array.from(new Set(arr.flatMap((o) => Object.keys(o)))).sort((a, b) =>
              a.localeCompare(b),
            );
          }
          const rows = arr.map((obj) => keys.map((k) => String(obj?.[k] ?? "")));
          return includeHeaders ? [keys, ...rows] : rows;
        }
      }
      // single object → one row
      if (data && typeof data === "object") {
        const keys = Object.keys(data);
        const row = keys.map((k) => String((data as any)[k] ?? ""));
        return includeHeaders ? [keys, row] : [row];
      }
      // primitive → single cell
      return [[String(data)]];
    };

    const rows = toRows();
    return stringifyCSV(rows, delim, quote, alwaysQuote, newline);
  }, [input, delimiter, quote, includeHeaders, fieldOrder, alwaysQuote, newline]);

  const convert = React.useCallback(() => {
    if (!input.trim()) {
      setError(null);
      setOutput("");
      return;
    }
    setError(null);

    const dir = direction === "auto" ? detectDirection(input) : direction;

    try {
      if (dir === "csv-to-json") {
        setOutput(convertCsvToJson());
      } else {
        setOutput(convertJsonToCsv());
      }
    } catch (e: any) {
      setError(String(e?.message || e));
      setOutput("");
    }
  }, [input, direction, detectDirection, convertCsvToJson, convertJsonToCsv]);

  React.useEffect(() => {
    if (autoRun) convert();
  }, [
    input,
    direction,
    autoRun,
    delimiter,
    quote,
    trimCells,
    headers,
    jsonSpaces,
    jsonLines,
    includeHeaders,
    fieldOrder,
    alwaysQuote,
    newline,
    convert,
  ]);

  const copyOut = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1000);
  };

  const resetAll = () => {
    setInput("");
    setOutput("");
    setDirection("auto");
    setAutoRun(true);
    setDelimiter(",");
    setQuote('"');
    setTrimCells(true);
    setHeaders(true);
    setJsonSpaces(2);
    setJsonLines(false);
    setIncludeHeaders(true);
    setFieldOrder("first");
    setAlwaysQuote(false);
    setNewline("\n");
    setCopied(false);
    setError(null);
  };

  const sampleCSV = `id,name,active
1,Alice,true
2,Bob,false`;
  const sampleJSON = `[
  {"id":1,"name":"Alice","active":true},
  {"id":2,"name":"Bob","active":false}
]`;

  const exportPayload = React.useMemo(
    () => ({
      input,
      direction,
      csv: { delimiter, quote, trimCells, headers, newline },
      json: { jsonSpaces, jsonLines, includeHeaders, fieldOrder, alwaysQuote },
      output,
      generatedAt: new Date().toISOString(),
    }),
    [
      input,
      direction,
      delimiter,
      quote,
      trimCells,
      headers,
      newline,
      jsonSpaces,
      jsonLines,
      includeHeaders,
      fieldOrder,
      alwaysQuote,
      output,
    ],
  );

  return (
    <MotionGlassCard className="p-4 md:p-6 lg:p-8">
      <ToolPageHeader
        title="CSV ⇄ JSON"
        description="Convert tabular data into JSON and back. Header-aware, JSON Lines, custom delimiter/quotes."
        icon={Table}
        actions={
          <div className="flex flex-wrap gap-2">
            <ActionButton
              icon={RefreshCw}
              label="Normalize"
              onClick={() => setInput((s) => s.trim())}
            />

            <ActionButton
              label="Load CSV Sample"
              onClick={() => {
                setInput(sampleCSV);
                setDirection("csv-to-json");
              }}
            />

            <ActionButton
              label="Load JSON Sample"
              onClick={() => {
                setInput(sampleJSON);
                setDirection("json-to-csv");
              }}
            />

            <ExportTextButton
              icon={Download}
              label="Export JSON"
              filename="csv-json-session.json"
              getText={() => JSON.stringify(exportPayload, null, 2)}
            />
            <ResetButton onClick={resetAll} />
          </div>
        }
      />

      <GlassCard>
        <div className="grid gap-4 lg:grid-cols-3">
          {/* Left: input */}
          <div className="lg:col-span-2">
            <TextareaField
              id="input"
              label="Input"
              placeholder="Paste CSV or JSON here…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              autoResize
              className="min-h-[180px]"
            />

            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <SelectField
                id="direction"
                label="Direction"
                value={direction}
                onValueChange={(v) => setDirection(v as Direction)}
                options={[
                  { value: "auto", label: "Auto-detect" },
                  { value: "csv-to-json", label: "CSV → JSON" },
                  { value: "json-to-csv", label: "JSON → CSV" },
                ]}
              />
              <SwitchRow label="Auto-run" checked={autoRun} onCheckedChange={setAutoRun} />
            </div>

            {error && (
              <div className="mt-3 flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/10 p-2 text-destructive">
                <Info className="mt-0.5 h-4 w-4" />
                <div className="text-sm">{error}</div>
              </div>
            )}
          </div>

          {/* Right: options */}
          <div className="rounded-lg border p-3">
            <div className="mb-2 flex items-center gap-2">
              <Settings2 className="h-4 w-4" />
              <div className="text-sm font-medium">CSV Options</div>
            </div>

            <div className="grid gap-2">
              <SelectField
                id="delimiter"
                label="Delimiter"
                value={delimiter}
                onValueChange={(v) => setDelimiter(v)}
                options={[
                  { value: ",", label: "Comma (,)" },
                  { value: "\\t", label: "Tab (\\t)" },
                  { value: ";", label: "Semicolon (;)" },
                  { value: "|", label: "Pipe (|)" },
                ]}
              />
              <SelectField
                id="quote"
                label="Quote"
                value={quote}
                onValueChange={(v) => setQuote(v)}
                options={[
                  { value: '"', label: `"` },
                  { value: "'", label: `'` },
                ]}
              />
              <SwitchRow label="Trim cells" checked={trimCells} onCheckedChange={setTrimCells} />
              <SwitchRow
                label="First row is header"
                checked={headers}
                onCheckedChange={setHeaders}
              />
              <SelectField
                id="newline"
                label="Newline"
                value={newline}
                onValueChange={(v) => setNewline(v as "\n" | "\r\n")}
                options={[
                  { value: "\n", label: "LF (\\n)" },
                  { value: "\r\n", label: "CRLF (\\r\\n)" },
                ]}
              />
            </div>

            <Separator className="my-3" />

            <div className="grid gap-2">
              <div className="text-xs font-medium opacity-80">JSON Options</div>
              <InputField
                id="spaces"
                type="number"
                label="Pretty spaces"
                min={0}
                max={8}
                value={String(jsonSpaces)}
                onChange={(e) => setJsonSpaces(Math.max(0, Number(e.target.value) || 0))}
              />
              <SwitchRow
                label="JSON Lines (CSV → JSON)"
                checked={jsonLines}
                onCheckedChange={setJsonLines}
              />
            </div>

            <Separator className="my-3" />

            <div className="grid gap-2">
              <div className="text-xs font-medium opacity-80">JSON → CSV</div>
              <SwitchRow
                label="Include header row"
                checked={includeHeaders}
                onCheckedChange={setIncludeHeaders}
              />
              <SelectField
                id="fieldOrder"
                label="Field order"
                value={fieldOrder}
                onValueChange={(v) => setFieldOrder(v as "first" | "union-alpha")}
                options={[
                  { value: "first", label: "From first object" },
                  { value: "union-alpha", label: "Union of keys (A→Z)" },
                ]}
              />
              <SwitchRow
                label="Always quote fields"
                checked={alwaysQuote}
                onCheckedChange={setAlwaysQuote}
              />
            </div>
          </div>
        </div>
      </GlassCard>

      <Separator className="my-6" />

      {/* Output */}
      <GlassCard>
        <div className="flex items-center justify-between px-3 pt-3">
          <div className="text-sm font-medium">Output</div>
          <div className="flex gap-2">
            <CopyButton icon={Copy} disabled={!copied} onClick={copyOut} />

            <ExportTextButton
              icon={Download}
              label="Download .txt"
              filename="converted.txt"
              getText={() => output}
              disabled={!output}
            />
          </div>
        </div>
        <div className="p-3">
          <TextareaField id="output" value={output} readOnly autoResize className="min-h-[220px]" />
        </div>
      </GlassCard>
    </MotionGlassCard>
  );
}
