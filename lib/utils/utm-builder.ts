export function rid(prefix = "row") {
  return `${prefix}-${crypto.randomUUID?.() ?? Math.random().toString(36).slice(2, 10)}`;
}

export function encodeVal(v: string, should: boolean) {
  return should ? encodeURIComponent(v) : v;
}

export function cleanBaseUrl(url: string) {
  const trimmed = url.trim();
  if (!trimmed) return "";
  try {
    const u = new URL(trimmed);
    return `${u.origin}${u.pathname}${u.hash ?? ""}`;
  } catch {
    try {
      const u = new URL(`https://${trimmed}`);
      return `${u.origin}${u.pathname}${u.hash ?? ""}`;
    } catch {
      return trimmed;
    }
  }
}

export function genShortId() {
  if (crypto?.getRandomValues) {
    const bytes = new Uint8Array(6);
    crypto.getRandomValues(bytes);
    return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
  }
  return Math.random().toString(36).slice(2, 10);
}

export function isValidUrl(s: string) {
  try {
    new URL(/^https?:\/\//i.test(s) ? s : `https://${s}`);
    return true;
  } catch {
    return false;
  }
}

export function buildSingle(baseUrl: string, utm: UTMState, opts: OptionsState) {
  if (!baseUrl || !baseUrl.trim()) return "";

  let base = baseUrl.trim();
  if (!/^https?:\/\//i.test(base)) base = `https://${base}`;

  let u: URL;
  try {
    u = new URL(base);
    if (!u.hostname) return "";
  } catch {
    return "";
  }

  const params = new URLSearchParams(opts.keepExisting ? u.search : "");

  const key = (k: string) => (opts.lowercaseKeys ? k.toLowerCase() : k);
  const set = (k: string, v: string) => {
    if (!v) return;
    params.set(key(k), encodeVal(v, opts.encodeParams));
  };

  set("utm_source", utm.source);
  set("utm_medium", utm.medium);
  set("utm_campaign", utm.campaign);
  set("utm_term", utm.term);
  set("utm_content", utm.content);
  set("utm_id", utm.id);

  for (const c of utm.custom) {
    if (!c.enabled || !c.key) continue;
    const k = opts.prefixCustomWithUTM ? `utm_${c.key.replace(/^utm_/i, "")}` : c.key;
    set(k, c.value);
  }

  u.search = params.toString();
  return u.toString();
}
