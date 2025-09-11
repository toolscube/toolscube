import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function collapseSpaces(s: string) {
  return s
    .replace(/[ \t]+/g, " ")
    .replace(/ *\n */g, "\n")
    .replace(/\n{3,}/g, "\n\n");
}

export function removePunctuation(s: string) {
  return s.replace(/[^\p{L}\p{N}\s]/gu, "");
}

export function removeDiacritics(s: string) {
  return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

export function toSentenceCase(s: string) {
  const lower = s.toLowerCase();
  const parts = lower.split(/([.!?]+\s+)/);
  for (let i = 0; i < parts.length; i += 2) {
    const seg = parts[i];
    if (seg?.trim()) {
      parts[i] = seg.replace(/^[\s]*([a-zA-Z\p{L}])/u, (m) => m.toUpperCase());
    }
  }
  return parts.join("");
}

export function countWords(t: string) {
  const m = t.match(/[\p{L}\p{N}]+(?:'[^\s]|[’][^\s])?/gu);
  return m ? m.length : 0;
}
