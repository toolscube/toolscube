export const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));
const byLines = (s: string) => s.split(/\r?\n/);
const byWords = (s: string) => s.match(/\S+|\s+/g) ?? [];
const byChars = (s: string) => Array.from(s);

export function buildUnified(chunks: DiffChunk[], context = 3): string {
  const out: string[] = [];
  let aLine = 1;
  let bLine = 1;
  const pending: string[] = [];
  let open = false;

  const flush = () => {
    if (!pending.length) return;
    const aCount = pending.filter((l) => l.startsWith("-") || l.startsWith(" ")).length;
    const bCount = pending.filter((l) => l.startsWith("+") || l.startsWith(" ")).length;
    out.push(
      `@@ -${aLine - aCount},${Math.max(0, aCount)} +${bLine - bCount},${Math.max(0, bCount)} @@`,
    );
    out.push(...pending);
    pending.length = 0;
    open = false;
  };

  for (const chunk of chunks) {
    const left = (chunk.op === "add" ? [] : chunk.a).join("").split("\n");
    const right = (chunk.op === "remove" ? [] : chunk.b).join("").split("\n");

    if (chunk.op === "equal") {
      if (!open) {
        aLine += left.length;
        bLine += left.length;
        continue;
      }
      const head = left.slice(0, context);
      for (const l of head) {
        pending.push(` ${l}`);
        aLine++;
        bLine++;
      }
      flush();
      const skipped = Math.max(0, left.length - head.length);
      aLine += skipped;
      bLine += skipped;
      continue;
    }

    open = true;

    if (chunk.op === "remove") {
      for (const l of left) {
        pending.push(`-${l}`);
        aLine++;
      }
    } else {
      for (const l of right) {
        pending.push(`+${l}`);
        bLine++;
      }
    }
  }

  flush();
  return out.join("\n");
}

export function diffTokens(a: string[], b: string[]): DiffChunk[] {
  const n = a.length;
  const m = b.length;

  const MAX_COMPLEXITY = 1200000;
  if (n * m > MAX_COMPLEXITY) {
    const fallback: DiffChunk[] = [];
    if (n) fallback.push({ op: "remove", a, b: [] });
    if (m) fallback.push({ op: "add", a: [], b });
    return fallback;
  }

  const dp = Array.from({ length: n + 1 }, () => new Array<number>(m + 1).fill(0));
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      dp[i][j] = a[i] === b[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }

  const out: DiffChunk[] = [];
  const push = (op: Op, aa: string[], bb: string[]) => {
    if (aa.length === 0 && bb.length === 0) return;
    const last = out[out.length - 1];
    if (last && last.op === op) {
      last.a.push(...aa);
      last.b.push(...bb);
    } else {
      out.push({ op, a: aa.slice(), b: bb.slice() });
    }
  };

  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (a[i] === b[j]) {
      push("equal", [a[i++]], [b[j++]]);
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      push("remove", [a[i++]], []);
    } else {
      push("add", [], [b[j++]]);
    }
  }
  while (i < n) push("remove", [a[i++]], []);
  while (j < m) push("add", [], [b[j++]]);
  return out;
}

export function tokenize(text: string, mode: Granularity) {
  switch (mode) {
    case "line":
      return byLines(text);
    case "word":
      return byWords(text);
    default:
      return byChars(text);
  }
}

export function normalize(text: string, opts: { ignoreCase: boolean; ignoreWs: boolean }) {
  let s = text;
  if (opts.ignoreCase) s = s.toLowerCase();
  if (opts.ignoreWs) s = s.replace(/[ \t]+/g, " ").trim();
  return s;
}
