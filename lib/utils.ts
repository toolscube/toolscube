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

export function countWords(t: string) {
  const m = t.match(/[\p{L}\p{N}]+(?:'[^\s]|[’][^\s])?/gu);
  return m ? m.length : 0;
}

export function normalizeEOL(s: string) {
  return s.replace(/\r\n?/g, "\n");
}

export function toSentenceCase(s: string) {
  return s.toLowerCase().replace(/(^\s*[a-z\p{Ll}]|[.!?]\s*[a-z\p{Ll}])/gu, (m) => m.toUpperCase());
}

export function toTitleCase(t: string) {
  return t.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
}

export const pad = (n: number, w = 2) => n.toString().padStart(w, "0");

export function formatDateInput(d: Date): string {
  const y = d.getFullYear();
  const m = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  return `${y}-${m}-${day}`;
}

export function formatTimeInput(d: Date): string {
  const h = pad(d.getHours());
  const m = pad(d.getMinutes());
  return `${h}:${m}`;
}

export function getLocalTimeZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}