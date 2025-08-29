import { GlassCard, MotionGlassCard } from '@/components/ui/glass-card';
import { getAnalytics } from '@/lib/actions/shortener';
import { notFound } from 'next/navigation';

export default async function AnalyticsPage({ params }: { params: { id: string } }) {
  const { id } = await params;
  const data = await getAnalytics(id);
  if (!data) notFound();
  const { link, total, first, last, byDay, topReferrers, topCountries } = data;

  return (
    <div className="container mx-auto max-w-4xl px-4 py-10">
      <MotionGlassCard className="p-6">
        <div className="text-sm text-muted-foreground">Short</div>
        <div className="text-2xl font-semibold">/{link.short}</div>
        <div className="mt-1 truncate text-sm">→ {link.targetUrl}</div>

        <div className="my-6 grid gap-3 sm:grid-cols-3">
          <GlassCard className="p-4">
            <div className="text-xs text-muted-foreground">Total Clicks</div>
            <div className="text-2xl font-semibold">{total}</div>
          </GlassCard>
          <GlassCard className="p-4">
            <div className="text-xs text-muted-foreground">Created</div>
            <div className="text-2xl font-semibold">{first.toDateString()}</div>
          </GlassCard>
          <GlassCard className="p-4">
            <div className="text-xs text-muted-foreground">Last Click</div>
            <div className="text-2xl font-semibold">{last ? new Date(last).toDateString() : '—'}</div>
          </GlassCard>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <GlassCard className="p-4">
            <div className="mb-2 text-sm font-medium">Clicks by Day</div>
            <div className="space-y-1 text-sm text-muted-foreground">
              {byDay.length === 0
                ? '—'
                : byDay.map(([d, n]) => (
                    <div key={d} className="flex justify-between">
                      <span>{d}</span>
                      <span className="tabular-nums">{n}</span>
                    </div>
                  ))}
            </div>
          </GlassCard>
          <GlassCard className="p-4">
            <div className="mb-2 text-sm font-medium">Top Referrers</div>
            <div className="space-y-1 text-sm text-muted-foreground">
              {topReferrers.length === 0
                ? '—'
                : topReferrers.map(([r, n]) => (
                    <div key={r} className="flex justify-between">
                      <span className="truncate max-w-[16rem]" title={r}>
                        {r}
                      </span>
                      <span className="tabular-nums">{n}</span>
                    </div>
                  ))}
            </div>
          </GlassCard>
          <GlassCard className="p-4">
            <div className="mb-2 text-sm font-medium">Top Countries</div>
            <div className="space-y-1 text-sm text-muted-foreground">
              {topCountries.length === 0
                ? '—'
                : topCountries.map(([c, n]) => (
                    <div key={c} className="flex justify-between">
                      <span>{c}</span>
                      <span className="tabular-nums">{n}</span>
                    </div>
                  ))}
            </div>
          </GlassCard>
        </div>
      </MotionGlassCard>
    </div>
  );
}
