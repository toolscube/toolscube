import { Link as LinkIcon, Lock, ShieldCheck, TriangleAlert } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CopyButton, LinkButton } from "@/components/shared/action-buttons";
import ContinueForm from "@/components/tools/url/continue-form";
import { Badge } from "@/components/ui/badge";
import { GlassCard } from "@/components/ui/glass-card";
import { getLink, recordClickAndRedirect } from "@/lib/actions/shortener.action";

export default async function InterstitialPage({ params }: { params: { id: string } }) {
  const { id } = await params;
  const link = await getLink(id);
  if (!link) notFound();

  async function continueAction() {
    "use server";
    await recordClickAndRedirect(id);
  }

  const target = new URL(link.targetUrl);
  const hostname = target.hostname;
  const pathAndQuery = `${target.pathname}${target.search}`;
  const isHttps = target.protocol === "https:";
  const tld = hostname.split(".").slice(-1)[0]?.toUpperCase() || "";
  const analyticsHref = `/tools/url/shortener/analytics/${id}`;
  const createdAt = new Date(link.createdAt).toLocaleString();

  return (
    <>
      {/* Top banner */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent px-6 py-4 rounded-md">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-xl border bg-background/50 backdrop-blur">
              <picture>
                <img
                  alt={`${hostname} favicon`}
                  src={`https://www.google.com/s2/favicons?domain=${hostname}&sz=64`}
                  className="h-full w-full object-cover"
                />
              </picture>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="gap-1">
                  <LinkIcon className="h-3.5 w-3.5" />
                  Destination preview
                </Badge>
                {isHttps ? (
                  <Badge className="gap-1">
                    <Lock className="h-3.5 w-3.5" />
                    HTTPS
                  </Badge>
                ) : (
                  <Badge variant="destructive" className="gap-1">
                    <TriangleAlert className="h-3.5 w-3.5" />
                    Not HTTPS
                  </Badge>
                )}
                {tld && <Badge variant="outline">{tld}</Badge>}
              </div>
              <div className="mt-1 truncate text-xl font-semibold leading-tight">{hostname}</div>
              <div className="truncate text-xs text-muted-foreground">{pathAndQuery || "/"}</div>
            </div>
          </div>

          <LinkButton variant="default" href={analyticsHref} label="View analytics" />
        </div>
      </div>

      {/* Body */}
      <div className="space-y-5 mt-4">
        {/* Full URL + actions */}
        <GlassCard className="p-4">
          <div className="text-xs text-muted-foreground">Full URL</div>
          <code className="mt-1 block max-w-[58ch] truncate rounded-md bg-muted px-2 py-1 text-sm">
            {link.targetUrl}
          </code>
          <div className="mt-3 flex flex-wrap gap-2">
            <CopyButton getText={link.targetUrl} />
            <LinkButton href={link.targetUrl} target="_blank" label="Open without tracking" />
          </div>
        </GlassCard>

        {/* Safety notes + meta */}
        <div className="grid gap-3 sm:grid-cols-2">
          <GlassCard className="p-4">
            <div className="mb-2 flex items-center gap-2 text-sm font-medium">
              <ShieldCheck className="h-4 w-4" />
              Quick safety checks
            </div>
            <ul className="list-disc space-y-1 pl-5 text-xs text-muted-foreground">
              <li>Confirm the domain matches what you expect.</li>
              <li>{isHttps ? "HTTPS is present." : "No HTTPS — avoid entering passwords."}</li>
              <li>Be careful with downloads and unfamiliar forms.</li>
            </ul>
          </GlassCard>

          <GlassCard className="p-4">
            <div className="mb-2 text-sm font-medium">Link details</div>
            <div className="text-xs text-muted-foreground">
              Short ID: <span className="font-medium">{id}</span>
              <br />
              Created: <span className="font-medium">{createdAt}</span>
            </div>
            <div className="mt-3 text-xs">
              <Link
                href="/tools/url/shortener"
                className="inline-flex items-center gap-2 underline underline-offset-4 hover:text-foreground"
              >
                Make another short link
              </Link>
            </div>
          </GlassCard>
        </div>

        {/* Continue CTA with countdown/consent */}
        <ContinueForm action={continueAction} host={hostname} />
      </div>
    </>
  );
}
