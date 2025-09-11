import Link from "next/link";
import { notFound } from "next/navigation";
import { LinkButton } from "@/components/shared/action-buttons";
import Stat from "@/components/shared/stat";
import ClicksByDayChart from "@/components/tools/url/clicks-by-day-chart";
import TopTable from "@/components/tools/url/top-table";
import { Card } from "@/components/ui/card";
import { GlassCard } from "@/components/ui/glass-card";
import { getAnalytics } from "@/lib/actions/shortener.action";

export default async function AnalyticsPage({ params }: { params: { id: string } }) {
  const { id } = await params;
  const data = await getAnalytics(id);
  if (!data) notFound();

  const { link, total, first, last, byDay, topReferrers, topCountries } = data;

  const createdStr = new Date(first).toLocaleString();
  const lastStr = last ? new Date(last).toLocaleString() : "—";
  const shortPath = `/${link.short}`;

  return (
    <GlassCard className="p-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="text-xs text-muted-foreground">Short</div>
          <div className="flex items-center gap-2">
            <div className="truncate text-2xl font-semibold">{shortPath}</div>
            <Link
              href={`/tools/url/shortener/interstitial/${link.short}`}
              className="text-xs underline underline-offset-4"
            >
              Interstitial
            </Link>
          </div>
          <div className="mt-1 truncate text-sm">→ {link.targetUrl}</div>
        </div>

        <div className="flex flex-wrap gap-2">
          <LinkButton href={link.targetUrl} label="Open target" target="_blank" />
          <LinkButton variant="default" href="/tools/url/shortener" label="Make another" />
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label="Total Clicks" value={total.toLocaleString()} />
        <Stat label="Created" value={createdStr} />
        <Stat label="Last Click" value={lastStr} />
      </div>

      {/* Clicks chart + referrers */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="p-4 border bg-transparent">
          <div className="mb-3 text-sm font-medium">Clicks by Day</div>
          {byDay.length === 0 ? (
            <p className="text-xs text-muted-foreground">— No clicks yet —</p>
          ) : (
            <ClicksByDayChart data={byDay.map(([date, n]) => ({ date, clicks: n }))} height={220} />
          )}
        </Card>

        <Card className="p-4 border bg-transparent">
          <div className="mb-3 text-sm font-medium">Top Referrers</div>
          {topReferrers.length === 0 ? (
            <p className="text-xs text-muted-foreground">—</p>
          ) : (
            <TopTable
              rows={topReferrers.map(([label, n]) => ({ label, value: n }))}
              labelClassName="truncate max-w-[18rem]"
            />
          )}
        </Card>

        <Card className="p-4 md:col-span-2 border bg-transparent">
          <div className="mb-3 text-sm font-medium">Top Countries</div>
          {topCountries.length === 0 ? (
            <p className="text-xs text-muted-foreground">—</p>
          ) : (
            <TopTable rows={topCountries.map(([label, n]) => ({ label, value: n }))} />
          )}
        </Card>
      </div>
    </GlassCard>
  );
}
