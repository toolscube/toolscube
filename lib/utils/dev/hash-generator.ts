export function hex(bytes: Uint8Array, uppercase: boolean) {
  const h = Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return uppercase ? h.toUpperCase() : h;
}

export function base64(bytes: Uint8Array) {
  let str = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    str += String.fromCharCode.apply(
      null,
      Array.from(bytes.subarray(i, i + chunk)) as unknown as number[],
    );
  }
  return btoa(str);
}

export function md5(input: Uint8Array): Uint8Array {
  const K = new Uint32Array(64);
  for (let i = 0; i < 64; i++) K[i] = Math.floor(Math.abs(Math.sin(i + 1)) * 2 ** 32) >>> 0;

  const S = [
    7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9,
    14, 20, 5, 9, 14, 20, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 6, 10, 15, 21,
    6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21,
  ];

  function rotl(x: number, n: number) {
    return ((x << n) | (x >>> (32 - n))) >>> 0;
  }
  function F(x: number, y: number, z: number) {
    return (x & y) | (~x & z);
  }
  function G(x: number, y: number, z: number) {
    return (x & z) | (y & ~z);
  }
  function H(x: number, y: number, z: number) {
    return x ^ y ^ z;
  }
  function I(x: number, y: number, z: number) {
    return y ^ (x | ~z);
  }

  const bytes = new Uint8Array((((input.length + 8) >> 6) << 6) + 64);
  bytes.set(input);
  bytes[input.length] = 0x80;
  const bitLen = input.length * 8;
  const view = new DataView(bytes.buffer);
  view.setUint32(bytes.length - 8, bitLen >>> 0, true);
  view.setUint32(bytes.length - 4, Math.floor(bitLen / 2 ** 32) >>> 0, true);

  let a = 0x67452301 >>> 0;
  let b = 0xefcdab89 >>> 0;
  let c = 0x98badcfe >>> 0;
  let d = 0x10325476 >>> 0;

  const M = new Uint32Array(16);

  for (let i = 0; i < bytes.length; i += 64) {
    for (let j = 0; j < 16; j++) M[j] = view.getUint32(i + j * 4, true);

    let A = a,
      B = b,
      C = c,
      D = d;

    for (let k = 0; k < 64; k++) {
      let f = 0,
        g = 0;
      if (k < 16) {
        f = F(B, C, D);
        g = k;
      } else if (k < 32) {
        f = G(B, C, D);
        g = (5 * k + 1) % 16;
      } else if (k < 48) {
        f = H(B, C, D);
        g = (3 * k + 5) % 16;
      } else {
        f = I(B, C, D);
        g = (7 * k) % 16;
      }
      const tmp = D;
      D = C;
      C = B;
      const t = (A + f + K[k] + M[g]) >>> 0;
      B = (B + rotl(t, S[k])) >>> 0;
      A = tmp;
    }

    a = (a + A) >>> 0;
    b = (b + B) >>> 0;
    c = (c + C) >>> 0;
    d = (d + D) >>> 0;
  }

  const out = new Uint8Array(16);
  const outView = new DataView(out.buffer);
  outView.setUint32(0, a, true);
  outView.setUint32(4, b, true);
  outView.setUint32(8, c, true);
  outView.setUint32(12, d, true);
  return out;
}

function toArrayBufferStrict(u8: Uint8Array): ArrayBuffer {
  const buf = new ArrayBuffer(u8.byteLength);
  new Uint8Array(buf).set(u8);
  return buf;
}

export async function digest(
  algo: "MD5" | "SHA-1" | "SHA-256" | "SHA-384" | "SHA-512",
  data: Uint8Array,
): Promise<Uint8Array> {
  if (algo === "MD5") return md5(data);
  const ab = await crypto.subtle.digest(algo, toArrayBufferStrict(data));
  return new Uint8Array(ab);
}

export async function hmac(
  algo: "MD5" | "SHA-1" | "SHA-256" | "SHA-384" | "SHA-512",
  key: Uint8Array,
  msg: Uint8Array,
): Promise<Uint8Array> {
  const blockSize = algo === "SHA-384" || algo === "SHA-512" ? 128 : 64;
  let k = key;
  if (k.length > blockSize) k = await digest(algo, k);
  if (k.length < blockSize) {
    const nk = new Uint8Array(blockSize);
    nk.set(k);
    k = nk;
  }
  const o = new Uint8Array(blockSize);
  const i = new Uint8Array(blockSize);
  for (let idx = 0; idx < blockSize; idx++) {
    o[idx] = k[idx] ^ 0x5c;
    i[idx] = k[idx] ^ 0x36;
  }
  const inner = await digest(algo, new Uint8Array([...i, ...msg]));
  const outer = await digest(algo, new Uint8Array([...o, ...inner]));
  return outer;
}
