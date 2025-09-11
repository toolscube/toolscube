export const FLAG_META: Record<Flag, { label: string; title: string }> = {
  g: { label: "g", title: "global" },
  i: { label: "i", title: "ignore case" },
  m: { label: "m", title: "multiline (^, $ across lines)" },
  s: { label: "s", title: "dotAll (dot matches newline)" },
  u: { label: "u", title: "unicode" },
  y: { label: "y", title: "sticky" },
};

export const PRESETS: { name: string; pattern: string }[] = [
  { name: "Email", pattern: String.raw`(?<!\S)[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}(?!\S)` },
  { name: "Bangladeshi Phone", pattern: String.raw`\b(?:\+?88)?01[3-9]\d{8}\b` },
  { name: "URL", pattern: String.raw`https?:\/\/[^\s/$.?#].[^\s]*` },
  { name: "Number", pattern: String.raw`-?\b\d+(?:\.\d+)?\b` },
  { name: "Word (Bengali)", pattern: String.raw`[\u0980-\u09FF]+` },
];

export function escapeHtml(str: string) {
  return str.replaceAll(/&/g, "&amp;").replaceAll(/</g, "&lt;").replaceAll(/>/g, "&gt;");
}
