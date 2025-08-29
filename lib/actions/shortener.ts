'use server';

import { normalizeUrl } from '@/lib/normalize-url';
import { headers } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import crypto from 'node:crypto';
import prisma from '../prisma';

const ALPHABET = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

async function slugExists(slug: string) {
  const link = await prisma.link.findUnique({ where: { short: slug } });
  return !!link;
}

export async function generateUniqueSlug() {
  for (let len = 4; len <= 8; len++) {
    for (let tries = 0; tries < 4; tries++) {
      let s = '';
      for (let i = 0; i < len; i++) s += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
      if (!(await slugExists(s))) return s;
    }
  }
  return crypto.randomBytes(6).toString('base64url');
}

export async function createShort({ url, preferredSlug, userId }: { url: string; preferredSlug?: string | null; userId?: string | null }) {
  const targetUrl = normalizeUrl(url);
  if (!targetUrl) return { ok: false as const, error: 'INVALID_URL' };

  const existing = await prisma.link.findFirst({ where: { targetUrl } });
  if (existing) {
    return { ok: true as const, existed: true, link: existing };
  }

  let short = preferredSlug?.trim() || '';
  if (short) {
    short = short.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 32);
    const taken = await prisma.link.findUnique({ where: { short } });
    if (taken) short = '';
  }
  if (!short) short = await generateUniqueSlug();

  const link = await prisma.link.create({
    data: { short, targetUrl, userId: userId ?? null },
  });
  return { ok: true as const, existed: false, link };
}

export async function getLink(short: string) {
  return prisma.link.findUnique({ where: { short } });
}

export type AnalyticsResponse = {
  link: { id: string; short: string; targetUrl: string; createdAt: Date };
  total: number;
  first: Date;
  last: Date | null;
  byDay: [string, number][];
  topReferrers: [string, number][];
  topCountries: [string, number][];
};

export async function getAnalytics(short: string): Promise<AnalyticsResponse | null> {
  const link = await prisma.link.findUnique({
    where: { short },
    include: { clicks: true },
  });
  if (!link) return null;

  const byDay = new Map<string, number>();
  for (const c of link.clicks) {
    const d = new Date(c.ts);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    byDay.set(key, (byDay.get(key) ?? 0) + 1);
  }

  const refCounts = new Map<string, number>();
  const countryCounts = new Map<string, number>();
  for (const c of link.clicks) {
    if (c.referrer) refCounts.set(c.referrer, (refCounts.get(c.referrer) ?? 0) + 1);
    if (c.country) countryCounts.set(c.country, (countryCounts.get(c.country) ?? 0) + 1);
  }

  const sort = (m: Map<string, number>) => Array.from(m.entries()).sort((a, b) => b[1] - a[1]);

  return {
    link: { id: link.id, short: link.short, targetUrl: link.targetUrl, createdAt: link.createdAt },
    total: link.clicks.length,
    first: link.createdAt,
    last: link.clicks.length ? link.clicks[link.clicks.length - 1].ts : null,
    byDay: Array.from(byDay.entries()).sort((a, b) => a[0].localeCompare(b[0])),
    topReferrers: sort(refCounts).slice(0, 10),
    topCountries: sort(countryCounts).slice(0, 10),
  };
}

export async function recordClickAndRedirect(short: string) {
  const h = await headers();

  const referrer = h.get('referer') ?? h.get('referrer') ?? undefined;
  const country = h.get('x-vercel-ip-country') ?? h.get('cf-ipcountry') ?? undefined;
  const ua = h.get('user-agent') ?? '';
  const ipHeader = h.get('x-forwarded-for') ?? '';
  const ip = ipHeader.split(',')[0]?.trim() || '';

  const link = await prisma.link.findUnique({ where: { short } });
  if (!link) notFound();

  const sha = (x?: string) => (x ? crypto.createHash('sha256').update(x).digest('base64url') : undefined);

  await prisma.click.create({
    data: {
      linkId: link.id,
      referrer,
      country,
      uaHash: sha(ua),
      ipHash: sha(ip),
    },
  });

  redirect(link.targetUrl);
}
