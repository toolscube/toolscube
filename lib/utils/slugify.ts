export const delimiterFromKey = (k: DelimiterKey): DelimiterChar =>
  k === "dash" ? "-" : k === "underscore" ? "_" : "";

export function deburr(input: string) {
  return input.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

export function applyCustomMap(text: string, map: Record<string, string>) {
  const entries = Object.entries(map)
    .filter(([k]) => k.length > 0)
    .sort((a, b) => b[0].length - a[0].length);

  for (const [from, to] of entries) {
    const re = new RegExp(escapeRegExp(from), "g");
    text = text.replace(re, to);
  }
  return text;
}

export function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function tokenize(text: string) {
  return text.split(/[^A-Za-z0-9_]+/).filter(Boolean);
}

export function removeStopwords(tokens: string[], stop: string[]) {
  if (!stop.length) return tokens;
  const set = new Set(stop.map((w) => w.toLowerCase().trim()).filter(Boolean));
  return tokens.filter((t) => !set.has(t.toLowerCase()));
}

export function toWordsFromCamel(text: string) {
  return text.replace(/([a-z0-9])([A-Z])/g, "$1 $2").replace(/([A-Za-z])(\d+)/g, "$1 $2");
}

export function slugify(input: string, o: Options): string {
  let s = input ?? "";

  s = toWordsFromCamel(s);
  s = applyCustomMap(s, o.customMap);
  if (o.transliterate) s = deburr(s);
  if (o.trim) s = s.trim();

  s = s.replace(/[^\p{Letter}\p{Number}_]+/gu, " ");

  let tokens = tokenize(s);
  tokens = removeStopwords(tokens, o.stopwords);

  if (!o.keepNumbers) tokens = tokens.filter((t) => !/^\d+$/.test(t));

  let out = tokens.join(o.delimiter || "");

  if (o.collapse && o.delimiter) {
    const re = new RegExp(`${escapeRegExp(o.delimiter)}{2,}`, "g");
    out = out.replace(re, o.delimiter);
  }

  if (o.delimiter)
    out = out.replace(
      new RegExp(`^${escapeRegExp(o.delimiter)}|${escapeRegExp(o.delimiter)}$`, "g"),
      "",
    );

  if (o.lowercase) out = out.toLowerCase();

  if (o.maxLen > 0 && out.length > o.maxLen) {
    if (o.delimiter && out.includes(o.delimiter)) {
      const parts = out.split(o.delimiter);
      const keep: string[] = [];
      let len = 0;
      for (const p of parts) {
        const add = (len ? o.delimiter.length : 0) + p.length;
        if (len + add > o.maxLen) break;
        keep.push(p);
        len += add;
      }
      out = keep.length ? keep.join(o.delimiter) : out.slice(0, o.maxLen);
    } else {
      out = out.slice(0, o.maxLen);
    }
  }

  if (o.preserveUnderscore) {
    if (o.delimiter && o.delimiter !== "_") out = out.replace(/_+/g, o.delimiter);
  } else {
    if (o.delimiter && o.delimiter !== "_") out = out.replace(/_+/g, o.delimiter);
    else if (!o.delimiter) out = out.replace(/_+/g, "");
  }

  return out;
}
