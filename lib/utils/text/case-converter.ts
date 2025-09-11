import { SMALL_WORDS } from "@/data/data";
import { collapseSpaces, removeDiacritics, removePunctuation, toSentenceCase } from "../../utils";

export function normalizeLF(s: string) {
  return s.replace(/\r\n?/g, "\n");
}

export function trimAll(s: string) {
  return s.trim();
}

export function normalizeQuotes(s: string) {
  return s.replace(/[‘’]/g, "'").replace(/[“”]/g, '"').replace(/—|–/g, "-");
}

export function wordsFrom(s: string) {
  return s.match(/[\p{L}\p{N}]+/gu) || [];
}

export function toCamel(words: string[]) {
  return words
    .map((w, i) =>
      i === 0 ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase(),
    )
    .join("");
}

export function toPascal(words: string[]) {
  return words.map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join("");
}

export function toSnake(words: string[]) {
  return words.map((w) => w.toLowerCase()).join("_");
}

export function toKebab(words: string[]) {
  return words.map((w) => w.toLowerCase()).join("-");
}

export function toConstant(words: string[]) {
  return words.map((w) => w.toUpperCase()).join("_");
}

export function toCapitalized(s: string) {
  return s.replace(
    /\b(\p{L})(\p{L}*)/gu,
    (_, a: string, b: string) => a.toUpperCase() + b.toLowerCase(),
  );
}

export function toAlternating(s: string) {
  let i = 0;
  return s.replace(/./g, (ch) => {
    if (!/\S/.test(ch)) return ch;
    const out = i % 2 === 0 ? ch.toLowerCase() : ch.toUpperCase();
    i++;
    return out;
  });
}

export function toInvert(s: string) {
  return s.replace(/\p{L}/gu, (ch) =>
    ch === ch.toLowerCase() ? ch.toUpperCase() : ch.toLowerCase(),
  );
}

export function toTitleCase(s: string) {
  return s.toLowerCase().replace(/\b(\p{L}[\p{L}\p{N}'’]*)\b/gu, (word, _grp, offset, full) => {
    const isFirst = offset === 0;
    const isLast = offset + word.length === full.length;
    const prev = full.slice(Math.max(0, offset - 2), offset);
    const afterPunct = /[-–—:;.!?]\s?$/.test(prev);
    const lw = word.toLowerCase();
    if (!isFirst && !isLast && !afterPunct && SMALL_WORDS.has(lw)) return lw;
    return lw.charAt(0).toUpperCase() + lw.slice(1);
  });
}

export function applyCase(mode: CaseMode, s: string) {
  switch (mode) {
    case "upper":
      return s.toUpperCase();
    case "lower":
      return s.toLowerCase();
    case "title":
      return toTitleCase(s);
    case "sentence":
      return toSentenceCase(s);
    case "camel":
      return toCamel(wordsFrom(s));
    case "pascal":
      return toPascal(wordsFrom(s));
    case "snake":
      return toSnake(wordsFrom(s));
    case "kebab":
      return toKebab(wordsFrom(s));
    case "constant":
      return toConstant(wordsFrom(s));
    case "capitalized":
      return toCapitalized(s);
    case "alternating":
      return toAlternating(s);
    case "invert":
      return toInvert(s);
  }
}

export function runPipeline(s: string, toggles: Record<PipelineToggle, boolean>) {
  let out = normalizeLF(s);
  if (toggles.trim) out = trimAll(out);
  if (toggles.collapseSpaces) out = collapseSpaces(out);
  if (toggles.normalizeQuotes) out = normalizeQuotes(out);
  if (toggles.removeDiacritics) out = removeDiacritics(out);
  if (toggles.removePunctuation) out = removePunctuation(out);
  return out;
}
