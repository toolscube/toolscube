export const DEFAULT_SYMBOLS = `!@#$%^&*()-_=+[]{};:,.<>/?`;
export const AMBIGUOUS = "0OoIlI|`'\"{}[]()<>";

function uniqueChars(s: string): string {
  return Array.from(new Set(s.split(""))).join("");
}

export function buildCharset(flags: GenFlags, customSymbols: string): string {
  const U = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const L = "abcdefghijklmnopqrstuvwxyz";
  const N = "0123456789";
  const S = customSymbols || DEFAULT_SYMBOLS;

  let chars = "";
  if (flags.upper) chars += U;
  if (flags.lower) chars += L;
  if (flags.numbers) chars += N;
  if (flags.symbols) chars += S;
  if (!chars) chars = L;

  if (flags.excludeAmbiguous) {
    const amb = new Set(AMBIGUOUS.split(""));
    chars = chars
      .split("")
      .filter((c) => !amb.has(c))
      .join("");
  }

  return uniqueChars(chars);
}

function randInt(maxExclusive: number): number {
  if (maxExclusive <= 0) return 0;
  const maxUint = 0xffffffff;
  const limit = Math.floor((maxUint + 1) / maxExclusive) * maxExclusive;
  const buf = new Uint32Array(1);
  while (true) {
    crypto.getRandomValues(buf);
    const x = buf[0];
    if (x < limit) return x % maxExclusive;
  }
}

function shuffleInPlace<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = randInt(i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function pick(charset: string): string {
  return charset.charAt(randInt(charset.length));
}

export function ensureAtLeastOneFromEach(
  length: number,
  flags: GenFlags,
  charset: string,
  customSymbols: string,
): string {
  const req: string[] = [];
  if (flags.upper) req.push("ABCDEFGHIJKLMNOPQRSTUVWXYZ");
  if (flags.lower) req.push("abcdefghijklmnopqrstuvwxyz");
  if (flags.numbers) req.push("0123456789");
  if (flags.symbols) req.push(customSymbols || DEFAULT_SYMBOLS);

  const out: string[] = [];
  if (flags.requireEachSet) {
    for (const set of req) {
      const setFiltered = charset
        .split("")
        .filter((c) => set.includes(c))
        .join("");
      if (setFiltered.length > 0) out.push(pick(setFiltered));
    }
  }
  // Fill the rest
  while (out.length < length) out.push(pick(charset));
  return shuffleInPlace(out).join("");
}

export function entropyBits(length: number, charsetSize: number): number {
  return length * Math.log2(Math.max(1, charsetSize));
}

export function strengthLabel(bits: number): { label: string; tone: "ok" | "warn" | "good" } {
  if (bits < 60) return { label: "Weak", tone: "warn" };
  if (bits < 80) return { label: "Okay", tone: "ok" };
  if (bits < 100) return { label: "Strong", tone: "good" };
  return { label: "Very strong", tone: "good" };
}
