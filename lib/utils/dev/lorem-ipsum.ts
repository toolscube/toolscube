import { WORDS } from "@/data/data";

export function mulberry32(seed: number) {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

export function capitalizeFirst(s: string) {
  return s.length ? s[0].toUpperCase() + s.slice(1) : s;
}

export function generateParagraph(opts: GenOptions): string {
  const { wordsPerParagraph, startWithClassic, punctuation, rng } = opts;
  const parts: string[] = [];

  for (let i = 0; i < wordsPerParagraph; i++) {
    const w = WORDS[Math.floor(rng() * WORDS.length)] || "lorem";
    parts.push(w.toLowerCase());
  }

  if (punctuation && parts.length > 8) {
    const step = 10 + Math.floor(rng() * 6);
    for (let i = step; i < parts.length - 4; i += step) {
      parts[i] = parts[i].replace(/,$/, "");
      parts[i] += ",";
    }
  }

  let sentence = parts.join(" ").replace(/\s+,/g, ",");
  sentence = capitalizeFirst(sentence);
  if (!/[.!?]$/.test(sentence)) sentence += ".";

  if (startWithClassic) {
    const classic = "Lorem ipsum dolor sit amet,";
    if (!sentence.startsWith("Lorem ipsum")) {
      sentence = `${classic} ${sentence.charAt(0).toLowerCase()}${sentence.slice(1)}`;
      sentence = capitalizeFirst(sentence);
    }
  }

  return sentence;
}
