export function formatUrl(s: string) {
  try {
    const u = new URL(s.trim().replace(/\s+/g, ""));
    return u.toString();
  } catch {
    try {
      return new URL(`https://${s}`).toString();
    } catch {
      return s;
    }
  }
}

export function isLikelyShortener(host: string) {
  const list = [
    "bit.ly",
    "t.co",
    "goo.gl",
    "tinyurl.com",
    "ow.ly",
    "is.gd",
    "buff.ly",
    "rebrand.ly",
    "cutt.ly",
    "shorte.st",
    "rb.gy",
    "lnkd.in",
    "fb.me",
    "bl.ink",
    "t.ly",
  ];
  return list.some((d) => host.endsWith(d));
}
