export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Extracted = {
  title?: string;
  description?: string;
  siteName?: string;
  ogType?: string;
  canonical?: string;
  twitterCard?: string;
  twitterSite?: string;
  images: string[];
  icons: string[];
  allMeta: Record<string, string[]>;
};

function normalizeUrl(u: string) {
  try {
    if (!/^https?:\/\//i.test(u)) u = `https://${u}`;
    return new URL(u).toString();
  } catch {
    return null;
  }
}

function abs(base: string, maybe: string | undefined) {
  if (!maybe) return undefined;
  try {
    return new URL(maybe, base).toString();
  } catch {
    return undefined;
  }
}

function parseAttrs(tag: string) {
  const attrs: Record<string, string> = {};
  const r = /([^\s=]+)\s*=\s*("([^"]*)"|'([^']*)'|([^\s>]+))/g;

  for (let m = r.exec(tag); m; m = r.exec(tag)) {
    const key = m[1].toLowerCase();
    const val = m[3] ?? m[4] ?? m[5] ?? "";
    attrs[key] = val;
  }

  return attrs;
}

function extractMeta(html: string, baseUrl: string): Extracted {
  const meta: Record<string, string[]> = {};
  const push = (k: string, v: string) => {
    const kk = k.toLowerCase();
    if (!meta[kk]) {
      meta[kk] = [];
    }
    meta[kk].push(v);
  };

  // <meta ...>
  const metaTags = html.match(/<meta\s+[^>]*>/gi) ?? [];
  for (const t of metaTags) {
    const a = parseAttrs(t);
    const key = (a.property ?? a.name)?.toLowerCase();
    const val = a.content ?? "";
    if (key && val) push(key, val);
  }

  // <title>
  let title = "";
  const mt = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  if (mt) title = mt[1].trim();

  // description fallback
  const description =
    meta["og:description"]?.[0] ?? meta["twitter:description"]?.[0] ?? meta.description?.[0] ?? "";

  // site name
  const siteName = meta["og:site_name"]?.[0];

  // canonical + icons
  let canonical = "";
  const linkTags = html.match(/<link\s+[^>]*>/gi) ?? [];
  const icons: string[] = [];
  for (const t of linkTags) {
    const a = parseAttrs(t);
    const rel = (a.rel ?? "").toLowerCase();
    if (rel.includes("canonical") && a.href) canonical = abs(baseUrl, a.href) || canonical;
    if (rel.includes("icon") && a.href) {
      const u = abs(baseUrl, a.href);
      if (u) icons.push(u);
    }
  }

  // images (og/twitter)
  const imgs: string[] = [];
  ["og:image", "og:image:url", "og:image:secure_url", "twitter:image"].forEach((k) => {
    const arr = meta[k] || [];
    for (const v of arr) {
      const u = abs(baseUrl, v);
      if (u && !imgs.includes(u)) imgs.push(u);
    }
  });

  return {
    title: meta["og:title"]?.[0] ?? meta["twitter:title"]?.[0] ?? title,
    description,
    siteName,
    ogType: meta["og:type"]?.[0],
    canonical: canonical || meta["og:url"]?.[0],
    twitterCard: meta["twitter:card"]?.[0],
    twitterSite: meta["twitter:site"]?.[0],
    images: imgs,
    icons,
    allMeta: meta,
  };
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const input = searchParams.get("url");
    const nocache = searchParams.get("nocache") === "1";
    if (!input) {
      return Response.json({ ok: false, error: "Missing ?url=" }, { status: 400 });
    }
    const normalized = normalizeUrl(input);
    if (!normalized) {
      return Response.json({ ok: false, error: "Invalid URL" }, { status: 400 });
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 12000);

    const res = await fetch(normalized, {
      method: "GET",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; ToolsHub-OGPreview/1.0; +https://example.com/bot) AppleWebKit/537.36",
        Accept: "text/html,application/xhtml+xml",
        "Accept-Language": "en-US,en;q=0.8",
      },
      cache: nocache ? "no-store" : "force-cache",
      redirect: "follow",
      signal: controller.signal,
    }).catch((e) => {
      throw new Error(e?.message || "Fetch failed");
    });
    clearTimeout(timer);

    const contentType = res.headers.get("content-type") || "";
    if (!contentType.includes("text/html")) {
      // some sites return 200 with non-HTML; still try to read small text
      const text = await res.text().catch(() => "");
      return Response.json(
        {
          ok: true,
          url: res.url,
          status: res.status,
          contentType,
          fetchedAt: new Date().toISOString(),
          ...extractMeta(text || "", res.url),
        },
        { headers: { "Cache-Control": "no-store" } },
      );
    }

    // cap read to ~2.5MB to avoid huge pages
    const reader = res.body?.getReader();
    let html = "";
    if (reader) {
      const decoder = new TextDecoder("utf-8");
      let total = 0;
      const LIMIT = 2_500_000;
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        total += value.byteLength;
        html += decoder.decode(value, { stream: true });
        if (total > LIMIT) break;
      }
      html += decoder.decode();
    } else {
      html = await res.text();
    }

    const payload = extractMeta(html, res.url);

    return Response.json(
      {
        ok: true,
        url: res.url,
        status: res.status,
        contentType,
        fetchedAt: new Date().toISOString(),
        ...payload,
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (e: unknown) {
    const err = e as { name?: string; message?: string };
    const msg =
      err?.name === "AbortError" ? "Request timed out" : (err?.message ?? "Unexpected error");

    return Response.json(
      { ok: false, error: msg },
      { status: 500, headers: { "Cache-Control": "no-store" } },
    );
  }
}
