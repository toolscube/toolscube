export function u8ToBase64(u8: Uint8Array): string {
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < u8.length; i += chunk) {
    binary += String.fromCharCode.apply(
      null,
      Array.from(u8.subarray(i, i + chunk)) as unknown as number[],
    );
  }
  return btoa(binary);
}

export function base64ToU8(b64: string): Uint8Array {
  const binary = atob(b64);
  const len = binary.length;
  const u8 = new Uint8Array(len);
  for (let i = 0; i < len; i++) u8[i] = binary.charCodeAt(i);
  return u8;
}

export function toUrlSafe(b64: string, noPadding: boolean): string {
  let s = b64.replace(/\+/g, "-").replace(/\//g, "_");
  if (noPadding) s = s.replace(/=+$/g, "");
  return s;
}

export function fromUrlSafe(b64: string): string {
  let s = b64.replace(/-/g, "+").replace(/_/g, "/");
  const pad = s.length % 4;
  if (pad) s += "=".repeat(4 - pad);
  return s;
}

export function wrapLines(text: string, col: number): string {
  if (!col || col <= 0) return text;
  const chunks: string[] = [];
  for (let i = 0; i < text.length; i += col) chunks.push(text.slice(i, i + col));
  return chunks.join("\n");
}

export function fileToU8(file: File): Promise<Uint8Array> {
  return new Promise((res, rej) => {
    const fr = new FileReader();
    fr.onload = () => res(new Uint8Array(fr.result as ArrayBuffer));
    fr.onerror = () => rej(fr.error);
    fr.readAsArrayBuffer(file);
  });
}

export function inferPreviewKind(type: string) {
  if (type.startsWith("image/")) return "image";
  if (type.startsWith("text/") || type === "application/json") return "text";
  return "binary";
}

export function u8ToBlob(u8: Uint8Array, type = "application/octet-stream"): Blob {
  const copy = new Uint8Array(u8.byteLength);
  copy.set(u8);
  return new Blob([copy], { type });
}
