import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { GlassCard, MotionGlassCard } from '@/components/ui/glass-card';
import { getLink, recordClickAndRedirect } from '@/lib/actions/shortener';
import { ExternalLink, Link as LinkIcon, ShieldCheck } from 'lucide-react';
import { notFound } from 'next/navigation';

export default async function InterstitialPage({ params }: { params: { id: string } }) {
  const { id } = await params;
  const link = await getLink(id);
  if (!link) notFound();

  async function continueAction() {
    'use server';
    await recordClickAndRedirect(params.id);
  }

  const target = new URL(link.targetUrl);
  const hostname = target.hostname;
  const pathAndQuery = `${target.pathname}${target.search}`;

  const analyticsHref = `/tools/url/shortener/analytics/${params.id}`;

  return (
    <div className="container mx-auto max-w-3xl px-4 py-10">
      <MotionGlassCard className="p-6">
        {/* Header: Domain preview */}
        <div className="flex items-start gap-4">
          {/* Favicon */}
          <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-xl border bg-background/50 backdrop-blur">
            {/* simple, privacy-friendly favicon proxy */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img alt={`${hostname} favicon`} src={`https://www.google.com/s2/favicons?domain=${hostname}&sz=64`} className="h-full w-full object-cover" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="gap-1">
                <LinkIcon className="h-3.5 w-3.5" />
                Destination preview
              </Badge>
              <span className="text-xs text-muted-foreground">via interstitial</span>
            </div>
            <div className="mt-1 truncate text-2xl font-semibold">{hostname}</div>
            <div className="truncate text-xs text-muted-foreground">{pathAndQuery || '/'}</div>
          </div>
        </div>

        {/* Full URL */}
        <GlassCard className="mt-5 p-4">
          <div className="text-xs text-muted-foreground">Full URL</div>
          <code className="mt-1 block truncate rounded-md bg-muted px-2 py-1 text-sm">{link.targetUrl}</code>
        </GlassCard>

        {/* Safety notes */}
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <GlassCard className="p-4">
            <div className="mb-2 flex items-center gap-2 text-sm font-medium">
              <ShieldCheck className="h-4 w-4" />
              Safety tips
            </div>
            <ul className="list-disc space-y-1 pl-5 text-xs text-muted-foreground">
              <li>Check the domain matches what you expect.</li>
              <li>Look for HTTPS and avoid entering passwords on unfamiliar sites.</li>
              <li>When in doubt, return and verify the link source.</li>
            </ul>
          </GlassCard>

          <GlassCard className="p-4">
            <div className="mb-2 text-sm font-medium">Link details</div>
            <div className="text-xs text-muted-foreground">
              Short ID: <span className="font-medium">{params.id}</span>
              <br />
              Created: <span className="font-medium">{link.createdAt.toDateString()}</span>
            </div>
            <a href={analyticsHref} className="mt-3 inline-flex items-center gap-2 text-xs text-foreground/80 underline underline-offset-4 hover:text-foreground">
              <ExternalLink className="h-3.5 w-3.5" />
              View analytics
            </a>
          </GlassCard>
        </div>

        {/* Actions */}
        <form action={continueAction} className="mt-6 flex flex-wrap items-center gap-2">
          <Button type="submit">Continue</Button>
          <a href="/tools/url/shortener" className="inline-flex items-center rounded-md border px-3 py-2 text-sm hover:bg-primary/10">
            Make another
          </a>
        </form>
      </MotionGlassCard>
    </div>
  );
}
