import { EN_STOPWORDS } from "@/data/data";

export function normalizeText(t: string) {
  return t.replace(/\r\n?/g, "\n");
}

export function countCharacters(t: string) {
  return t.length;
}

export function countCharactersNoSpaces(t: string) {
  return t.replace(/\s+/g, "").length;
}

export function countLines(t: string) {
  if (!t) return 0;
  return t.split("\n").length;
}

export function countParagraphs(t: string) {
  const blocks = normalizeText(t)
    .split(/\n{2,}/g)
    .map((s) => s.trim())
    .filter(Boolean);
  return blocks.length;
}

export function countSentences(t: string) {
  const s = t.replace(/\s+/g, " ").trim();
  if (!s) return 0;
  const m = s.match(/[^.!?]+[.!?]+(\s|$)/g);
  return m ? m.length : 1;
}

export function formatTimeFromWPM(words: number, wpm: number) {
  if (words === 0) return "0:00";
  const minutes = words / wpm;
  const totalSec = Math.max(1, Math.round(minutes * 60));
  const mm = Math.floor(totalSec / 60);
  const ss = totalSec % 60;
  return `${mm}:${ss.toString().padStart(2, "0")}`;
}

export function slugify(t: string) {
  return t
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
}

export function squeezeSpaces(t: string) {
  return t
    .replace(/[ \t]+/g, " ")
    .replace(/ *\n */g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function computeDensity(
  t: string,
  { excludeStopwords }: { excludeStopwords: boolean },
): DensityRow[] {
  const words = (t.toLowerCase().match(/[\p{L}\p{N}]+/gu) || []).filter((w) =>
    excludeStopwords ? !EN_STOPWORDS.has(w) : true,
  );
  const total = words.length || 1;
  const map = new Map<string, number>();
  for (const w of words) map.set(w, (map.get(w) || 0) + 1);
  const rows: DensityRow[] = [...map.entries()].map(([word, count]) => ({
    word,
    count,
    percent: (count / total) * 100,
  }));
  rows.sort((a, b) => b.count - a.count || a.word.localeCompare(b.word));
  return rows.slice(0, 20);
}
