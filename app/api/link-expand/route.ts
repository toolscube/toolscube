import { NextResponse } from "next/server";

type Hop = {
  index: number;
  url: string;
  status: number;
  statusText: string;
  location?: string | null;
};

type Meta = {
  title?: string;
  description?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  finalUrl?: string;
  contentType?: string;
};

function sanitizeUrl(raw: string) {
  const t = raw.trim();
  try {
    return new URL(t).toString();
  } catch {
    return new URL(`https://${t}`).toString();
  }
}

function parseMeta(html: string, baseUrl: string): Meta {
  const pick = (re: RegExp) => html.match(re)?.[1]?.trim();
  const relToAbs = (u?: string) => {
    if (!u) return undefined;
    try {
      return new URL(u, baseUrl).toString();
    } catch {
      return undefined;
    }
  };
  const title = pick(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const description = pick(
    /<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["'][^>]*>/i,
  );
  const ogTitle = pick(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']*)["'][^>]*>/i);
  const ogDescription = pick(
    /<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']*)["'][^>]*>/i,
  );
  const ogImage = relToAbs(
    pick(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']*)["'][^>]*>/i),
  );
  return { title, description, ogTitle, ogDescription, ogImage, finalUrl: baseUrl };
}

export async function POST(req: Request) {
  try {
    const { url, maxHops = 10 } = (await req.json()) as { url: string; maxHops?: number };
    const start = Date.now();

    const inputUrl = sanitizeUrl(url);
    let current = inputUrl;
    const hops: Hop[] = [];
    let finalUrl = inputUrl;

    for (let i = 0; i < Math.min(30, Math.max(1, Number(maxHops) || 10)); i++) {
      const res = await fetch(current, { redirect: "manual" });
      const hop: Hop = {
        index: i + 1,
        url: current,
        status: res.status,
        statusText: res.statusText,
        location: res.headers.get("location"),
      };
      hops.push(hop);

      // 3xx with Location => follow
      if (res.status >= 300 && res.status < 400 && hop.location) {
        current = new URL(hop.location, current).toString();
        finalUrl = current;
        continue;
      }

      // reached final (non-redirect) or redirect without location
      finalUrl = current;
      break;
    }

    // Try to fetch final for meta (best-effort)
    let meta: Meta | undefined;
    try {
      const finRes = await fetch(finalUrl, { redirect: "follow" });
      const contentType = finRes.headers.get("content-type") || undefined;
      if (contentType?.includes("text/html")) {
        const html = await finRes.text();
        meta = parseMeta(html, finalUrl);
        meta.contentType = contentType;
      } else {
        meta = { finalUrl, contentType };
      }
    } catch {
      // ignore meta errors
    }

    const ok = true;
    const totalHops = hops.length;
    const payload = {
      ok,
      inputUrl,
      finalUrl,
      totalHops,
      hops,
      meta,
      startedAt: new Date(start).toISOString(),
      ms: Date.now() - start,
    };

    return NextResponse.json(payload, { status: 200 });
  } catch (e: any) {
    return NextResponse.json(
      {
        ok: false,
        inputUrl: "",
        finalUrl: "",
        totalHops: 0,
        hops: [],
        error: e?.message ?? "Failed to expand link",
        startedAt: new Date().toISOString(),
        ms: 0,
      },
      { status: 200 },
    );
  }
}
