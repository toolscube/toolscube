import { COMMON_PASSWORDS, COMMON_WORDS } from "@/data/data";

const SEQ_ASC = "abcdefghijklmnopqrstuvwxyz";
const SEQ_NUM = "0123456789";
const KEY_ROWS = ["qwertyuiop", "asdfghjkl", "zxcvbnm"];

export function estimateCharset(pw: string) {
  let size = 0;
  const hasLower = /[a-z]/.test(pw);
  const hasUpper = /[A-Z]/.test(pw);
  const hasDigit = /\d/.test(pw);
  const hasSpace = /\s/.test(pw);
  const symbolMatch = pw.match(/[!@#$%^&*()\-_=+[\]{};:'",.<>/?`~\\|]/g);
  const asciiOnly = /^\p{ASCII}*$/u.test(pw);

  if (hasLower) size += 26;
  if (hasUpper) size += 26;
  if (hasDigit) size += 10;
  if (symbolMatch) size += 33;
  if (hasSpace) size += 1;

  if (!asciiOnly) {
    const extras = new Set(
      [...pw].filter((ch) => !/[A-Za-z0-9\s!@#$%^&*()\-_=+[\]{};:'",.<>/?`~\\|]/.test(ch)),
    );
    size += Math.max(1, extras.size);
  }

  return size;
}

export function calcEntropyBits(pw: string) {
  if (!pw) return 0;
  const charset = estimateCharset(pw);
  if (charset < 2) return 0;
  return pw.length * Math.log2(charset);
}

type StrengthBand = "Very Weak" | "Weak" | "Fair" | "Strong" | "Very Strong";
export function bandFromEntropy(bits: number): StrengthBand {
  if (bits < 28) return "Very Weak";
  if (bits < 36) return "Weak";
  if (bits < 60) return "Fair";
  if (bits < 128) return "Strong";
  return "Very Strong";
}

export function bandColor(band: StrengthBand) {
  switch (band) {
    case "Very Weak":
      return "bg-red-500";
    case "Weak":
      return "bg-orange-500";
    case "Fair":
      return "bg-yellow-500";
    case "Strong":
      return "bg-green-500";
    case "Very Strong":
      return "bg-emerald-600";
  }
}

export function humanTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds <= 0) return "instant";

  const units: [number, string][] = [
    [60, "sec"],
    [60, "min"],
    [24, "hr"],
    [365, "day"],
    [Infinity, "yr"],
  ];

  let n = seconds;
  let idx = 0;

  for (; idx < units.length; idx++) {
    const [step] = units[idx];
    if (n < step) break;
    n /= step;
  }

  const label = units[idx]?.[1] ?? "sec";
  return `${n.toFixed(n >= 10 ? 0 : 1)} ${label}${n >= 2 ? "s" : ""}`;
}

export function findIssues(pw: string) {
  const issues: string[] = [];
  if (COMMON_PASSWORDS.has(pw.toLowerCase())) issues.push("Common & easily guessed password.");
  if (pw.length < 12) issues.push("Short length — aim for 14–20+ characters.");
  if (!/[a-z]/.test(pw)) issues.push("No lowercase letters.");
  if (!/[A-Z]/.test(pw)) issues.push("No uppercase letters.");
  if (!/\d/.test(pw)) issues.push("No digits.");
  if (!/[^\w\s]/.test(pw)) issues.push("No symbols.");

  const lower = pw.toLowerCase();
  if (COMMON_WORDS.some((w) => lower.includes(w)))
    issues.push("Contains common word or brand. Avoid dictionary words.");

  if (/(.)\1{2,}/.test(pw)) issues.push("Contains repeated characters (e.g., aaa).");

  const hasAlphaSeq =
    SEQ_ASC.includes(lower) || SEQ_ASC.split("").reverse().join("").includes(lower);
  const hasNumSeq = SEQ_NUM.includes(pw) || SEQ_NUM.split("").reverse().join("").includes(pw);
  if (hasAlphaSeq || hasNumSeq) issues.push("Sequential patterns (e.g., abc, 123).");

  // keyboard row sequences
  if (KEY_ROWS.some((row) => row.includes(lower))) issues.push("Keyboard sequence (e.g., qwerty).");

  return issues;
}

const RATES = {
  online_throttled: 10,
  online_fast: 100,
  offline_slow_hash: 1e5,
  offline_fast_hash: 1e10,
  nation_state: 1e12,
};

export function crackTimes(bits: number) {
  const guesses = 2 ** bits;
  return {
    online_throttled: humanTime(guesses / RATES.online_throttled),
    online_fast: humanTime(guesses / RATES.online_fast),
    offline_slow_hash: humanTime(guesses / RATES.offline_slow_hash),
    offline_fast_hash: humanTime(guesses / RATES.offline_fast_hash),
    nation_state: humanTime(guesses / RATES.nation_state),
  };
}
