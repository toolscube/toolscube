import { Button } from '@/components/ui/button';
import { GlassCard, MotionGlassCard } from '@/components/ui/glass-card';
import { getAnalytics } from '@/lib/actions/shortener';
import { ExternalLink, Link as LinkIcon } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

// Client components
import ClicksByDayChart from '@/components/root/clicks-by-day-chart';
import TopTable from '@/components/root/top-table';

export default async function AnalyticsPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const data = await getAnalytics(id);
  if (!data) notFound();

  const { link, total, first, last, byDay, topReferrers, topCountries } = data;

  const createdStr = new Date(first).toLocaleString();
  const lastStr = last ? new Date(last).toLocaleString() : '—';
  const shortPath = `/${link.short}`;

  return (
    <div className="container mx-auto max-w-5xl px-4 py-10">
      <MotionGlassCard className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <div className="text-xs text-muted-foreground">Short</div>
            <div className="flex items-center gap-2">
              <div className="truncate text-2xl font-semibold">{shortPath}</div>
              <Link href={`/tools/url/shortener/interstitial/${link.short}`} className="text-xs underline underline-offset-4">
                Interstitial
              </Link>
            </div>
            <div className="mt-1 truncate text-sm">→ {link.targetUrl}</div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline" className="gap-2">
              <a href={link.targetUrl} target="_blank" rel="noreferrer">
                <ExternalLink className="h-4 w-4" />
                Open target
              </a>
            </Button>
            <Button asChild className="gap-2">
              <Link href="/tools/url/shortener">
                <LinkIcon className="h-4 w-4" />
                Make another
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-3 sm:grid-cols-3">
          <StatCard label="Total Clicks" value={total.toLocaleString()} />
          <StatCard label="Created" value={createdStr} />
          <StatCard label="Last Click" value={lastStr} />
        </div>

        {/* Clicks chart + referrers */}
        <div className="grid gap-6 md:grid-cols-2">
          <GlassCard className="p-4">
            <div className="mb-3 text-sm font-medium">Clicks by Day</div>
            {byDay.length === 0 ? <p className="text-xs text-muted-foreground">— No clicks yet —</p> : <ClicksByDayChart data={byDay.map(([date, n]) => ({ date, clicks: n }))} height={220} />}
          </GlassCard>

          <GlassCard className="p-4">
            <div className="mb-3 text-sm font-medium">Top Referrers</div>
            {topReferrers.length === 0 ? (
              <p className="text-xs text-muted-foreground">—</p>
            ) : (
              <TopTable rows={topReferrers.map(([label, n]) => ({ label, value: n }))} labelClassName="truncate max-w-[18rem]" />
            )}
          </GlassCard>

          <GlassCard className="p-4 md:col-span-2">
            <div className="mb-3 text-sm font-medium">Top Countries</div>
            {topCountries.length === 0 ? <p className="text-xs text-muted-foreground">—</p> : <TopTable rows={topCountries.map(([label, n]) => ({ label, value: n }))} />}
          </GlassCard>
        </div>
      </MotionGlassCard>
    </div>
  );
}

/* ------------------------------ Small Server Bits ------------------------------ */
function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <GlassCard className="p-4">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 text-xl font-semibold">{value}</div>
    </GlassCard>
  );
}
