export function normalizeUrl(input: string) {
  let url = input.trim();
  if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
  try {
    const u = new URL(url);
    // Optional: strip hash, keep query
    u.hash = '';
    // Optional: lower-case host
    u.hostname = u.hostname.toLowerCase();
    return u.toString();
  } catch {
    return null;
  }
}
