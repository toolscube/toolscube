'use client';

import QRCode from 'qrcode';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GlassCard, MotionGlassCard } from '@/components/ui/glass-card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';

import { ArrowDownToLine, Copy, Image as ImageIcon, Key, QrCode, RefreshCw, ScanLine, Upload } from 'lucide-react';

/* ------------------------------- Types -------------------------------- */

type ECL = 'L' | 'M' | 'Q' | 'H';
type RenderFormat = 'png' | 'svg';
type QRKind = 'url' | 'text' | 'wifi' | 'vcard' | 'email' | 'sms' | 'whatsapp';

type WifiAuth = 'nopass' | 'WPA' | 'WEP';

type FormState = {
  kind: QRKind;

  // URL
  url: string;

  // Text
  text: string;

  // Wi-Fi
  wifiSsid: string;
  wifiPassword: string;
  wifiAuth: WifiAuth;
  wifiHidden: boolean;

  // vCard (compact)
  vcFirst: string;
  vcLast: string;
  vcOrg: string;
  vcTitle: string;
  vcPhone: string;
  vcEmail: string;
  vcUrl: string;

  // Email
  emailTo: string;
  emailSubject: string;
  emailBody: string;

  // SMS
  smsTo: string;
  smsBody: string;

  // WhatsApp
  waTo: string; // e.g. 8801XXXXXXXXX (no +)
  waText: string;
};

/* -------------------------- Utility: content --------------------------- */

function buildPayload(f: FormState): string {
  switch (f.kind) {
    case 'url': {
      const v = f.url.trim();
      return v || 'https://example.com';
    }
    case 'text': {
      const v = f.text.trim();
      return v || 'Scan me';
    }
    case 'wifi': {
      // WIFI:T:WPA;S:MySSID;P:mypass;H:false;
      const T = f.wifiAuth;
      const S = escapeSemicolons(f.wifiSsid);
      const isNoPass = f.wifiAuth === 'nopass';
      const P = isNoPass ? '' : `P:${escapeSemicolons(f.wifiPassword)};`;
      const H = `H:${f.wifiHidden ? 'true' : 'false'};`;
      return `WIFI:T:${T === 'nopass' ? 'nopass' : T};S:${S};${P}${H}`;
    }
    case 'vcard': {
      const parts = [
        'BEGIN:VCARD',
        'VERSION:3.0',
        `N:${safe(f.vcLast)};${safe(f.vcFirst)};;;`,
        `FN:${[f.vcFirst, f.vcLast].filter(Boolean).join(' ').trim()}`,
        f.vcOrg ? `ORG:${safe(f.vcOrg)}` : '',
        f.vcTitle ? `TITLE:${safe(f.vcTitle)}` : '',
        f.vcPhone ? `TEL:${safe(f.vcPhone)}` : '',
        f.vcEmail ? `EMAIL:${safe(f.vcEmail)}` : '',
        f.vcUrl ? `URL:${safe(f.vcUrl)}` : '',
        'END:VCARD',
      ].filter(Boolean);
      return parts.join('\n');
    }
    case 'email': {
      const to = encodeURIComponent(f.emailTo.trim() || 'hello@example.com');
      const subject = encodeURIComponent(f.emailSubject || '');
      const body = encodeURIComponent(f.emailBody || '');
      const qs = new URLSearchParams();
      if (subject) qs.set('subject', subject);
      if (body) qs.set('body', body);
      return `mailto:${to}${qs.toString() ? `?${qs.toString()}` : ''}`;
    }
    case 'sms': {
      // sms:+15551234?body=Hello
      const to = (f.smsTo || '').trim();
      const body = encodeURIComponent(f.smsBody || '');
      return `sms:${to}${body ? `?body=${body}` : ''}`;
    }
    case 'whatsapp': {
      // https://wa.me/<number>?text=<text>
      const to = (f.waTo || '').replace(/[^\d]/g, ''); // keep digits only
      const text = encodeURIComponent(f.waText || '');
      const base = `https://wa.me/${to || '000'}`;
      return text ? `${base}?text=${text}` : base;
    }
    default:
      return 'Scan me';
  }
}

function escapeSemicolons(v: string) {
  return v.replace(/;/g, '\\;');
}
function safe(v: string) {
  return v.replace(/\n/g, ' ').trim();
}

/* ---------------------------- Page Component --------------------------- */

export default function QRFlowingPage() {
  /* ----- Controls ----- */
  const [ecl, setEcl] = React.useState<ECL>('M');
  const [size, setSize] = React.useState<number>(320);
  const [margin, setMargin] = React.useState<number>(2);
  const [fg, setFg] = React.useState<string>('#0f172a'); // slate-900
  const [bg, setBg] = React.useState<string>('#ffffff');
  const [format, setFormat] = React.useState<RenderFormat>('png');
  const [exportScale, setExportScale] = React.useState<number>(2);
  const [quietZone, setQuietZone] = React.useState<boolean>(true);

  const [logoEnabled, setLogoEnabled] = React.useState<boolean>(false);
  const [logoDataUrl, setLogoDataUrl] = React.useState<string | null>(null);
  const [logoSizePct, setLogoSizePct] = React.useState<number>(20);

  // "Generate" button trigger (useful if user wants manual regen)
  const [genTick, setGenTick] = React.useState<number>(0);

  /* ----- Dynamic form ----- */
  const [form, setForm] = React.useState<FormState>({
    kind: 'url',
    url: 'https://naturalsefaa.com',

    text: 'Scan me',

    wifiSsid: '',
    wifiPassword: '',
    wifiAuth: 'WPA',
    wifiHidden: false,

    vcFirst: 'Tariqul',
    vcLast: 'Islam',
    vcOrg: 'Natural Sefa',
    vcTitle: '',
    vcPhone: '+8801XXXXXXXXX',
    vcEmail: 'hello@naturalsefaa.com',
    vcUrl: 'https://naturalsefaa.com',

    emailTo: 'hello@example.com',
    emailSubject: 'Hello!',
    emailBody: 'This came from a QR code.',

    smsTo: '+8801XXXXXXXXX',
    smsBody: 'Hi!',

    waTo: '8801XXXXXXXXX',
    waText: 'Hello there 👋',
  });

  /* ----- Rendering ----- */
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const [svgMarkup, setSvgMarkup] = React.useState<string>('');
  const payload = React.useMemo(() => buildPayload(form), [form]);

  const makeOptions = React.useCallback(
    (w: number) => ({
      width: w,
      margin: quietZone ? margin : 0,
      color: { dark: fg, light: bg },
      errorCorrectionLevel: ecl,
    }),
    [ecl, fg, bg, margin, quietZone],
  );

  React.useEffect(() => {
    const options = makeOptions(size);
    // canvas (PNG) preview
    if (canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, payload || 'Scan me', options).then(async () => {
        if (logoEnabled && logoDataUrl && canvasRef.current) {
          await overlayLogo(canvasRef.current, logoDataUrl, logoSizePct);
        }
      });
    }
    // SVG preview (optional)
    if (format === 'svg') {
      QRCode.toString(payload || 'Scan me', { ...options, type: 'svg' }).then((svg) => setSvgMarkup(svg));
    } else {
      setSvgMarkup('');
    }
  }, [payload, ecl, size, margin, fg, bg, format, logoEnabled, logoDataUrl, logoSizePct, makeOptions, genTick]);

  /* ----- Actions ----- */
  const resetAll = () => {
    setForm((s) => ({ ...s, kind: 'url', url: 'https://naturalsefaa.com' }));
    setEcl('M');
    setSize(320);
    setMargin(2);
    setFg('#0f172a');
    setBg('#ffffff');
    setFormat('png');
    setExportScale(2);
    setLogoEnabled(false);
    setLogoDataUrl(null);
    setLogoSizePct(20);
    setQuietZone(true);
  };

  const runGenerate = () => setGenTick((t) => t + 1);

  const copyDataUrl = async () => {
    if (!canvasRef.current) return;
    const url = canvasRef.current.toDataURL('image/png');
    await navigator.clipboard.writeText(url);
  };

  const downloadPNG = async () => {
    const exportSize = Math.max(64, Math.min(4096, size * exportScale));
    const offscreen = document.createElement('canvas');
    await QRCode.toCanvas(offscreen, payload || 'Scan me', makeOptions(exportSize));
    if (logoEnabled && logoDataUrl) {
      await overlayLogo(offscreen, logoDataUrl, logoSizePct);
    }
    const link = document.createElement('a');
    link.download = 'qrcode.png';
    link.href = offscreen.toDataURL('image/png');
    link.click();
  };

  const downloadSVG = async () => {
    const svg = await QRCode.toString(payload || 'Scan me', { ...makeOptions(size), type: 'svg' });
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = 'qrcode.svg';
    link.href = url;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
  };

  const handleLogoUpload: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      setLogoDataUrl(reader.result as string);
      setLogoEnabled(true);
    };
    reader.readAsDataURL(f);
  };

  /* ------------------------------- UI ---------------------------------- */

  return (
    <div className="mx-auto max-w-6xl p-4 sm:p-6 md:p-8">
      {/* Flowing Header */}
      <MotionGlassCard>
        <GlassCard className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-6">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
              <QrCode className="h-6 w-6" /> QR Code Generator
            </h1>
            <p className="text-sm text-muted-foreground">Flowing design with dynamic content types (URL, Wi-Fi, vCard, Email, SMS, WhatsApp).</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={resetAll} className="gap-2">
              <RefreshCw className="h-4 w-4" /> Reset
            </Button>
            <Button onClick={runGenerate} className="gap-2">
              <Key className="h-4 w-4" /> Generate
            </Button>
          </div>
        </GlassCard>

        {/* Type & Dynamic Fields */}
        <GlassCard className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Content</CardTitle>
            <CardDescription>Select a type and fill the fields. Preview updates live.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={form.kind} onValueChange={(v) => setForm((s) => ({ ...s, kind: v as QRKind }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="url">URL</SelectItem>
                    <SelectItem value="text">Text</SelectItem>
                    <SelectItem value="wifi">Wi-Fi</SelectItem>
                    <SelectItem value="vcard">vCard</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="sms">SMS</SelectItem>
                    <SelectItem value="whatsapp">WhatsApp</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* quick ECL + Format right in the same strip (handy) */}
              <div className="space-y-2">
                <Label>Error Correction</Label>
                <Select value={ecl} onValueChange={(v) => setEcl(v as ECL)}>
                  <SelectTrigger>
                    <SelectValue placeholder="ECL" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="L">L (7%)</SelectItem>
                    <SelectItem value="M">M (15%)</SelectItem>
                    <SelectItem value="Q">Q (25%)</SelectItem>
                    <SelectItem value="H">H (30%)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Render Format</Label>
                <Select value={format} onValueChange={(v) => setFormat(v as RenderFormat)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="png">PNG (Canvas)</SelectItem>
                    <SelectItem value="svg">SVG (Vector)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DynamicFields form={form} setForm={setForm} />
          </CardContent>
        </GlassCard>

        {/* Appearance & Export */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <GlassCard className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Appearance</CardTitle>
              <CardDescription>Size, margin, colors, quiet zone, and logo.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <SettingSlider label={`Size: ${size}px`} min={128} max={1024} step={16} value={[size]} onValueChange={(v) => setSize(v[0])} />
                <SettingSlider label={`Margin: ${margin}px`} min={0} max={16} step={1} value={[margin]} onValueChange={(v) => setMargin(v[0])} />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <ColorField label="Foreground" value={fg} onChange={setFg} />
                <ColorField label="Background" value={bg} onChange={setBg} />
              </div>

              <div className="flex items-center justify-between rounded-lg border p-3">
                <div className="space-y-0.5">
                  <p className="text-sm font-medium leading-none">Quiet Zone</p>
                  <p className="text-xs text-muted-foreground">Keep border padding for better scanning.</p>
                </div>
                <Switch checked={quietZone} onCheckedChange={setQuietZone} />
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium leading-none">Center Logo</p>
                    <p className="text-xs text-muted-foreground">Overlay your logo (use ECL Q/H for reliability).</p>
                  </div>
                  <Switch checked={logoEnabled} onCheckedChange={setLogoEnabled} />
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="logo-upload">Upload Logo (PNG/SVG)</Label>
                    <div className="flex gap-2">
                      <Input id="logo-upload" type="file" accept="image/*" onChange={handleLogoUpload} />
                      <Button variant="outline" onClick={() => setLogoDataUrl(null)} disabled={!logoDataUrl}>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Clear
                      </Button>
                    </div>
                  </div>
                  <SettingSlider label={`Logo Size: ${logoSizePct}%`} min={10} max={40} step={1} value={[logoSizePct]} onValueChange={(v) => setLogoSizePct(v[0])} disabled={!logoEnabled} />
                </div>
              </div>
            </CardContent>
          </GlassCard>

          <GlassCard className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Export & Utilities</CardTitle>
              <CardDescription>High-res exports and quick copy.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <SettingSlider label={`Export Scale: ${exportScale}x`} min={1} max={6} step={1} value={[exportScale]} onValueChange={(v) => setExportScale(v[0])} />

              <div className="grid gap-2 sm:grid-cols-2">
                <Button className="w-full" onClick={downloadPNG}>
                  <ArrowDownToLine className="mr-2 h-4 w-4" />
                  Download PNG
                </Button>
                <Button className="w-full" variant="outline" onClick={downloadSVG} disabled={format !== 'svg'}>
                  <ArrowDownToLine className="mr-2 h-4 w-4" />
                  Download SVG
                </Button>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button variant="secondary" onClick={copyDataUrl}>
                  <Copy className="mr-2 h-4 w-4" />
                  Copy PNG Data URL
                </Button>
                <Button variant="ghost" onClick={runGenerate}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Regenerate
                </Button>
              </div>
            </CardContent>
          </GlassCard>
        </div>

        {/* Live Preview */}
        <GlassCard className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Live Preview</CardTitle>
            <CardDescription>Canvas preview (PNG). Toggle SVG to see vector markup.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <div className="flex items-center justify-center rounded-xl border bg-muted/40 p-6">
                {format === 'svg' ? (
                  <div className="rounded-lg bg-white p-2 shadow-sm" dangerouslySetInnerHTML={{ __html: svgMarkup || '<svg />' }} />
                ) : (
                  <canvas ref={canvasRef} className="rounded-lg bg-white p-2 shadow-sm" style={{ width: size, height: size }} aria-label="QR preview" />
                )}
              </div>

              <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
                <SmallStat icon={<ScanLine className="h-4 w-4" />} label="Type" value={form.kind.toUpperCase()} />
                <SmallStat icon={<ImageIcon className="h-4 w-4" />} label="Size" value={`${size}px`} />
                <SmallStat icon={<Upload className="h-4 w-4" />} label="Logo" value={logoEnabled ? 'On' : 'Off'} />
              </div>
            </div>
          </CardContent>
        </GlassCard>
      </MotionGlassCard>
    </div>
  );
}

/* ----------------------------- Sub-Components -------------------------- */

function DynamicFields({ form, setForm }: { form: FormState; setForm: React.Dispatch<React.SetStateAction<FormState>> }) {
  if (form.kind === 'url') {
    return (
      <div className="space-y-2">
        <Label htmlFor="url">URL</Label>
        <Input id="url" placeholder="https://example.com" value={form.url} onChange={(e) => setForm((s) => ({ ...s, url: e.target.value }))} />
      </div>
    );
  }

  if (form.kind === 'text') {
    return (
      <div className="space-y-2">
        <Label htmlFor="text">Text</Label>
        <Textarea id="text" placeholder="Your message" value={form.text} onChange={(e) => setForm((s) => ({ ...s, text: e.target.value }))} />
      </div>
    );
  }

  if (form.kind === 'wifi') {
    return (
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="ssid">SSID</Label>
          <Input id="ssid" placeholder="MyNetwork" value={form.wifiSsid} onChange={(e) => setForm((s) => ({ ...s, wifiSsid: e.target.value }))} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="wifiauth">Authentication</Label>
          <Select value={form.wifiAuth} onValueChange={(v) => setForm((s) => ({ ...s, wifiAuth: v as WifiAuth }))}>
            <SelectTrigger>
              <SelectValue placeholder="Auth" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="WPA">WPA/WPA2</SelectItem>
              <SelectItem value="WEP">WEP</SelectItem>
              <SelectItem value="nopass">No password</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {form.wifiAuth !== 'nopass' && (
          <div className="space-y-2">
            <Label htmlFor="wifipw">Password</Label>
            <Input id="wifipw" placeholder="supersecret" value={form.wifiPassword} onChange={(e) => setForm((s) => ({ ...s, wifiPassword: e.target.value }))} />
          </div>
        )}

        <div className="flex items-center justify-between rounded-lg border p-3">
          <div className="space-y-0.5">
            <p className="text-sm font-medium leading-none">Hidden Network</p>
            <p className="text-xs text-muted-foreground">Set true if SSID is not broadcast.</p>
          </div>
          <Switch checked={form.wifiHidden} onCheckedChange={(v) => setForm((s) => ({ ...s, wifiHidden: v }))} />
        </div>
      </div>
    );
  }

  if (form.kind === 'vcard') {
    return (
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="vcfirst">First Name</Label>
          <Input id="vcfirst" value={form.vcFirst} onChange={(e) => setForm((s) => ({ ...s, vcFirst: e.target.value }))} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="vclast">Last Name</Label>
          <Input id="vclast" value={form.vcLast} onChange={(e) => setForm((s) => ({ ...s, vcLast: e.target.value }))} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="vcorg">Organization</Label>
          <Input id="vcorg" value={form.vcOrg} onChange={(e) => setForm((s) => ({ ...s, vcOrg: e.target.value }))} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="vctitle">Title</Label>
          <Input id="vctitle" value={form.vcTitle} onChange={(e) => setForm((s) => ({ ...s, vcTitle: e.target.value }))} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="vcphone">Phone</Label>
          <Input id="vcphone" value={form.vcPhone} onChange={(e) => setForm((s) => ({ ...s, vcPhone: e.target.value }))} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="vcemail">Email</Label>
          <Input id="vcemail" type="email" value={form.vcEmail} onChange={(e) => setForm((s) => ({ ...s, vcEmail: e.target.value }))} />
        </div>
        <div className="col-span-2 space-y-2">
          <Label htmlFor="vcurl">Website</Label>
          <Input id="vcurl" value={form.vcUrl} onChange={(e) => setForm((s) => ({ ...s, vcUrl: e.target.value }))} />
        </div>
      </div>
    );
  }

  if (form.kind === 'email') {
    return (
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="mailto">To</Label>
          <Input id="mailto" type="email" placeholder="hello@example.com" value={form.emailTo} onChange={(e) => setForm((s) => ({ ...s, emailTo: e.target.value }))} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="mailsub">Subject</Label>
          <Input id="mailsub" placeholder="Subject" value={form.emailSubject} onChange={(e) => setForm((s) => ({ ...s, emailSubject: e.target.value }))} />
        </div>
        <div className="col-span-2 space-y-2">
          <Label htmlFor="mailbody">Body</Label>
          <Textarea id="mailbody" placeholder="Message..." value={form.emailBody} onChange={(e) => setForm((s) => ({ ...s, emailBody: e.target.value }))} />
        </div>
      </div>
    );
  }

  if (form.kind === 'sms') {
    return (
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="smsto">To</Label>
          <Input id="smsto" placeholder="+8801XXXXXXXXX" value={form.smsTo} onChange={(e) => setForm((s) => ({ ...s, smsTo: e.target.value }))} />
        </div>
        <div className="col-span-2 space-y-2">
          <Label htmlFor="smsbody">Body</Label>
          <Textarea id="smsbody" placeholder="Your message…" value={form.smsBody} onChange={(e) => setForm((s) => ({ ...s, smsBody: e.target.value }))} />
        </div>
      </div>
    );
  }

  // whatsapp
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="space-y-2">
        <Label htmlFor="wato">Phone (no +)</Label>
        <Input id="wato" placeholder="8801XXXXXXXXX" value={form.waTo} onChange={(e) => setForm((s) => ({ ...s, waTo: e.target.value }))} />
      </div>
      <div className="col-span-2 space-y-2">
        <Label htmlFor="watext">Text</Label>
        <Textarea id="watext" placeholder="Message…" value={form.waText} onChange={(e) => setForm((s) => ({ ...s, waText: e.target.value }))} />
      </div>
    </div>
  );
}

function SmallStat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg border p-3">
      <div className="flex items-center gap-2 text-sm">
        {icon}
        <span className="text-muted-foreground">{label}</span>
      </div>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}

function SettingSlider({
  label,
  value,
  onValueChange,
  min,
  max,
  step,
  disabled,
}: {
  label: string;
  value: number[];
  onValueChange: (v: number[]) => void;
  min: number;
  max: number;
  step: number;
  disabled?: boolean;
}) {
  return (
    <div className={disabled ? 'opacity-60 pointer-events-none' : ''}>
      <Label className="mb-1 block">{label}</Label>
      <Slider value={value} onValueChange={onValueChange} min={min} max={max} step={step} />
    </div>
  );
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-2">
      <Label className="block">{label}</Label>
      <div className="flex items-center gap-2">
        <input type="color" className="h-10 w-10 cursor-pointer rounded-md border bg-transparent p-1" value={value} onChange={(e) => onChange(e.target.value)} aria-label={`${label} color`} />
        <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder="#000000" className="font-mono" />
      </div>
    </div>
  );
}

/* ------------------------------- Logo ---------------------------------- */

async function overlayLogo(canvas: HTMLCanvasElement, logoUrl: string, logoSizePct: number) {
  return new Promise<void>((resolve) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return resolve();
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const w = canvas.width;
      const h = canvas.height;
      const size = Math.round((Math.min(w, h) * logoSizePct) / 100);

      const x = Math.round(w / 2 - size / 2);
      const y = Math.round(h / 2 - size / 2);
      const radius = Math.round(size * 0.2);

      ctx.save();
      roundedRect(ctx, x - 4, y - 4, size + 8, size + 8, radius);
      ctx.fillStyle = 'white';
      ctx.fill();
      ctx.restore();

      ctx.drawImage(img, x, y, size, size);
      resolve();
    };
    img.onerror = () => resolve();
    img.src = logoUrl;
  });
}

function roundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  r = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
