import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export const metadata = {
  title: 'Terms of Service — Tools Hub',
  description: 'Terms and acceptable use for Tools Hub.',
};

export default function TermsPage() {
  const lastUpdated = new Date().toISOString().slice(0, 10);

  return (
    <main className="py-10">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-2xl border bg-background/40 p-6 md:p-10">
        <div
          aria-hidden
          className="pointer-events-none absolute -inset-1 rounded-2xl bg-[radial-gradient(60%_60%_at_20%_0%,rgba(59,130,246,0.18),transparent_60%),radial-gradient(50%_50%_at_90%_20%,rgba(34,197,94,0.14),transparent_60%)]"
        />
        <div className="relative flex flex-col gap-3">
          <Badge variant="secondary" className="w-fit">
            Simple terms, clear usage
          </Badge>
          <h1 className="text-balance text-3xl font-semibold leading-tight tracking-tight md:text-4xl">Terms of Service</h1>
          <p className="max-w-2xl text-pretty text-muted-foreground">By using Tools Hub, you agree to the terms below. Please read them carefully.</p>
          <div className="mt-2 text-sm text-muted-foreground">Last updated: {lastUpdated}</div>
        </div>
      </section>

      <Separator className="my-8" />

      {/* Acceptable Use */}
      <Card className="relative mb-4 overflow-hidden bg-card/60 backdrop-blur supports-[backdrop-filter]:bg-card/40">
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-primary/40 via-primary/20 to-transparent" />
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Acceptable use</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>• Do not misuse tools for spam, phishing, malware, or illegal content.</p>
          <p>• Respect rate limits and service integrity; automated scraping is restricted.</p>
          <p>• We may throttle, block, or suspend abusive usage at our discretion.</p>
        </CardContent>
      </Card>

      {/* Accounts & Access */}
      <Card className="relative mb-4 overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-primary/40 via-primary/20 to-transparent" />
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Accounts & access</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>• Some features may require an account. You are responsible for activity under your account.</p>
          <p>• We may modify or discontinue features with notice where practical.</p>
          <p>• If you believe your account is compromised, contact us immediately.</p>
        </CardContent>
      </Card>

      {/* Intellectual Property */}
      <Card className="relative mb-4 overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-primary/40 via-primary/20 to-transparent" />
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Intellectual property</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>• The service, trademarks, and UI are protected. You retain rights to content you own and upload.</p>
          <p>• Don’t remove proprietary notices or attempt to reverse engineer restricted components.</p>
        </CardContent>
      </Card>

      {/* Warranty & Liability */}
      <Card className="relative mb-4 overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-primary/40 via-primary/20 to-transparent" />
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Disclaimer & limitation of liability</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>• The tools are provided “as is” without warranties of any kind.</p>
          <p>• We are not liable for lost data, lost profits, or any indirect or consequential damages.</p>
          <p>• Use at your own risk; always keep backups of your important files and data.</p>
        </CardContent>
      </Card>

      {/* Termination */}
      <Card className="relative mb-4 overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-primary/40 via-primary/20 to-transparent" />
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Termination</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>• We may suspend or terminate access for violations of these terms or to protect the service.</p>
          <p>• You may stop using the service at any time; some data may be retained per legal/abuse requirements.</p>
        </CardContent>
      </Card>

      {/* Governing Law & Changes */}
      <Card className="relative mb-4 overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-primary/40 via-primary/20 to-transparent" />
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Governing law & changes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>• Terms are governed by applicable local and international laws.</p>
          <p>• We may update these terms; material changes will be announced on this page.</p>
        </CardContent>
      </Card>

      {/* Contact */}
      <Card className="relative overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-primary/40 via-primary/20 to-transparent" />
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Contact</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>
            • For questions:{' '}
            <a className="underline" href="mailto:legal@your-domain.com">
              legal@your-domain.com
            </a>
          </p>
          <div className="pt-2">
            <Button asChild>
              <a href="/privacy">View Privacy Policy</a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
