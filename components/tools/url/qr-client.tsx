"use client";

import {
  ArrowDownToLine,
  Image as ImageIcon,
  Key,
  RefreshCw,
  ScanLine,
  Upload,
} from "lucide-react";
import * as React from "react";
import { useForm, useWatch } from "react-hook-form";
import { ActionButton, CopyButton, ResetButton } from "@/components/shared/action-buttons";
import ColorField from "@/components/shared/color-field";
import InputField from "@/components/shared/form-fields/input-field";
import SelectField from "@/components/shared/form-fields/select-field";
import TextareaField from "@/components/shared/form-fields/textarea-field";
import { QRCodeBox } from "@/components/shared/qr-code";
import ToolPageHeader from "@/components/shared/tool-page-header";
import { Button } from "@/components/ui/button";
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { GlassCard } from "@/components/ui/glass-card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { useQrExport } from "@/hooks/use-qr-export";

/* Utility: content */
function buildPayload(f: FormState): string {
  switch (f.kind) {
    case "url": {
      const v = f.url.trim();
      return v || "https://example.com";
    }
    case "text": {
      const v = f.text.trim();
      return v || "Scan me";
    }
    case "wifi": {
      const T = f.wifiAuth;
      const S = escapeSemicolons(f.wifiSsid);
      const isNoPass = f.wifiAuth === "nopass";
      const P = isNoPass ? "" : `P:${escapeSemicolons(f.wifiPassword)};`;
      const H = `H:${f.wifiHidden ? "true" : "false"};`;
      return `WIFI:T:${T === "nopass" ? "nopass" : T};S:${S};${P}${H}`;
    }
    case "vcard": {
      const parts = [
        "BEGIN:VCARD",
        "VERSION:3.0",
        `N:${safe(f.vcLast)};${safe(f.vcFirst)};;;`,
        `FN:${[f.vcFirst, f.vcLast].filter(Boolean).join(" ").trim()}`,
        f.vcOrg ? `ORG:${safe(f.vcOrg)}` : "",
        f.vcTitle ? `TITLE:${safe(f.vcTitle)}` : "",
        f.vcPhone ? `TEL:${safe(f.vcPhone)}` : "",
        f.vcEmail ? `EMAIL:${safe(f.vcEmail)}` : "",
        f.vcUrl ? `URL:${safe(f.vcUrl)}` : "",
        "END:VCARD",
      ].filter(Boolean);
      return parts.join("\n");
    }
    case "email": {
      const to = encodeURIComponent(f.emailTo.trim() || "hello@example.com");
      const subject = encodeURIComponent(f.emailSubject || "");
      const body = encodeURIComponent(f.emailBody || "");
      const qs = new URLSearchParams();
      if (subject) qs.set("subject", subject);
      if (body) qs.set("body", body);
      return `mailto:${to}${qs.toString() ? `?${qs.toString()}` : ""}`;
    }
    case "sms": {
      const to = (f.smsTo || "").trim();
      const body = encodeURIComponent(f.smsBody || "");
      return `sms:${to}${body ? `?body=${body}` : ""}`;
    }
    case "whatsapp": {
      const to = (f.waTo || "").replace(/[^\d]/g, "");
      const text = encodeURIComponent(f.waText || "");
      const base = `https://wa.me/${to || "000"}`;
      return text ? `${base}?text=${text}` : base;
    }
    default:
      return "Scan me";
  }
}

function escapeSemicolons(v: string) {
  return v.replace(/;/g, "\\;");
}
function safe(v: string) {
  return v.replace(/\n/g, " ").trim();
}

export default function QRClient() {
  /* Controls */
  const [size, setSize] = React.useState<number>(320);
  const [margin, setMargin] = React.useState<number>(2);
  const [fg, setFg] = React.useState<string>("#0f172a");
  const [bg, setBg] = React.useState<string>("#ffffff");
  const [exportScale, setExportScale] = React.useState<number>(2);
  const [quietZone, setQuietZone] = React.useState<boolean>(true);
  const [logoEnabled, setLogoEnabled] = React.useState<boolean>(false);
  const [logoDataUrl, setLogoDataUrl] = React.useState<string | null>(null);
  const [logoSizePct, setLogoSizePct] = React.useState<number>(20);

  const [genTick, setGenTick] = React.useState<number>(0);

  /* Dynamic form (content & switches) */
  const [form, setForm] = React.useState<FormState>({
    kind: "url",
    url: "https://tariqul.dev",

    text: "Scan me",

    wifiSsid: "",
    wifiPassword: "",
    wifiAuth: "WPA",
    wifiHidden: false,

    vcFirst: "Tariqul",
    vcLast: "Islam",
    vcOrg: "Natural Sefa",
    vcTitle: "",
    vcPhone: "+8801XXXXXXXXX",
    vcEmail: "hello@tariqul.dev",
    vcUrl: "https://tariqul.dev",

    emailTo: "hello@example.com",
    emailSubject: "Hello!",
    emailBody: "This came from a QR code.",

    smsTo: "+8801XXXXXXXXX",
    smsBody: "Hi!",

    waTo: "8801XXXXXXXXX",
    waText: "Hello there 👋",
  });

  /* Selects bridge */
  const controlForm = useForm<ControlValues>({
    defaultValues: { kind: "url", ecl: "M", format: "png", wifiAuth: "WPA" },
  });

  // Watch selects and sync to local state
  const kind = useWatch({ control: controlForm.control, name: "kind" });
  const ecl = useWatch({ control: controlForm.control, name: "ecl" });
  const format = useWatch({ control: controlForm.control, name: "format" });
  const wifiAuth = useWatch({ control: controlForm.control, name: "wifiAuth" });

React.useEffect(() => {
  if (kind) {
    setForm((s) => (s.kind === kind ? s : { ...s, kind }));
  }
}, [kind]);

  React.useEffect(() => {
    if (wifiAuth) {
      setForm((s) => (s.wifiAuth === wifiAuth ? s : { ...s, wifiAuth }));
    }
  }, [wifiAuth]);


  /* Payload & export helpers */
  const payload = React.useMemo(() => buildPayload(form), [form]);

  const { downloadPNG, downloadSVG, getPngDataUrl } = useQrExport({
    value: payload || "Scan me",
    size,
    margin,
    ecl: (ecl ?? "M") as ECL,
    fg,
    bg,
    quietZone,
    logo: logoEnabled && logoDataUrl ? { src: logoDataUrl, sizePct: logoSizePct } : null,
  });

  /* Actions */
  const resetAll = () => {
    setForm((s) => ({
      ...s,
      kind: "url",
      url: "https://tariqul.dev",
      wifiAuth: "WPA",
      wifiHidden: false,
      text: "Scan me",
    }));
    setSize(320);
    setMargin(2);
    setFg("#0f172a");
    setBg("#ffffff");
    setExportScale(2);
    setLogoEnabled(false);
    setLogoDataUrl(null);
    setLogoSizePct(20);
    setQuietZone(true);

    controlForm.reset({ kind: "url", ecl: "M", format: "png", wifiAuth: "WPA" });
  };

  const runGenerate = () => setGenTick((t) => t + 1);

  return (
    <>
      {/* Header */}
      <ToolPageHeader
        title="QR Code Generator"
        description="Flowing design with dynamic content types (URL, Wi-Fi, vCard, Email, SMS, WhatsApp)."
        actions={
          <>
            <ResetButton onClick={resetAll} />
            <ActionButton variant="default" icon={Key} onClick={runGenerate} label="Generate" />
          </>
        }
      />

      {/* Content + Selects (using reusable SelectField) */}
      <GlassCard>
        <CardHeader>
          <CardTitle className="text-base">Content</CardTitle>
          <CardDescription>
            Select a type and fill the fields. Preview updates live.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <Form {...controlForm}>
            <form className="grid gap-4 sm:grid-cols-3">
              <SelectField
                name="kind"
                label="Type"
                options={[
                  { label: "URL", value: "url" },
                  { label: "Text", value: "text" },
                  { label: "Wi-Fi", value: "wifi" },
                  { label: "vCard", value: "vcard" },
                  { label: "Email", value: "email" },
                  { label: "SMS", value: "sms" },
                  { label: "WhatsApp", value: "whatsapp" },
                ]}
                placeholder="Select type"
              />

              <SelectField
                name="ecl"
                label="Error Correction"
                options={[
                  { label: "L (7%)", value: "L" },
                  { label: "M (15%)", value: "M" },
                  { label: "Q (25%)", value: "Q" },
                  { label: "H (30%)", value: "H" },
                ]}
                placeholder="ECL"
              />

              <SelectField
                name="format"
                label="Render Format"
                options={[
                  { label: "PNG (Canvas)", value: "png" },
                  { label: "SVG (Vector)", value: "svg" },
                ]}
                placeholder="Format"
              />
            </form>
          </Form>

          <DynamicFields form={form} setForm={setForm} controlForm={controlForm} />
        </CardContent>
      </GlassCard>

      {/* Appearance & Export */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <GlassCard>
          <CardHeader>
            <CardTitle className="text-base">Appearance</CardTitle>
            <CardDescription>Size, margin, colors, quiet zone, and logo.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <SettingSlider
                label={`Size: ${size}px`}
                min={128}
                max={1024}
                step={16}
                value={[size]}
                onValueChange={(v) => setSize(v[0])}
              />
              <SettingSlider
                label={`Margin: ${margin}px`}
                min={0}
                max={16}
                step={1}
                value={[margin]}
                onValueChange={(v) => setMargin(v[0])}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <ColorField id="fg" label="Foreground" value={fg} onChange={setFg} />
              <ColorField id="bg" label="Background" value={bg} onChange={setBg} />
            </div>

            <div className="flex items-center justify-between rounded-lg border p-3">
              <div className="space-y-0.5">
                <p className="text-sm font-medium leading-none">Quiet Zone</p>
                <p className="text-xs text-muted-foreground">
                  Keep border padding for better scanning.
                </p>
              </div>
              <Switch checked={quietZone} onCheckedChange={setQuietZone} />
            </div>

            <Separator />

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="text-sm font-medium leading-none">Center Logo</p>
                  <p className="text-xs text-muted-foreground">
                    Overlay your logo (use ECL Q/H for reliability).
                  </p>
                </div>
                <Switch checked={logoEnabled} onCheckedChange={setLogoEnabled} />
              </div>

              <div className="grid gap-3 sm:grid-cols-2 items-center">
                <div className="space-y-2">
                  <Label htmlFor="logo-upload">Upload Logo (PNG/SVG)</Label>
                  <div className="flex gap-2">
                    <InputField
                      accept="image/*"
                      type="file"
                      onFilesChange={async (files) => {
                        const f = files?.[0];
                        if (!f) return;
                        const reader = new FileReader();
                        reader.onload = () => {
                          setLogoDataUrl(reader.result as string);
                          setLogoEnabled(true);
                        };
                        reader.readAsDataURL(f);
                      }}
                    />
                    <ResetButton
                      onClick={() => setLogoDataUrl(null)}
                      disabled={!logoDataUrl}
                      icon={RefreshCw}
                      label="Clear"
                    />
                  </div>
                </div>
                <SettingSlider
                  label={`Logo Size: ${logoSizePct}%`}
                  min={10}
                  max={40}
                  step={1}
                  value={[logoSizePct]}
                  onValueChange={(v) => setLogoSizePct(v[0])}
                  disabled={!logoEnabled}
                />
              </div>
            </div>
          </CardContent>
        </GlassCard>

        <GlassCard>
          <CardHeader>
            <CardTitle className="text-base">Export & Utilities</CardTitle>
            <CardDescription>High-res exports and quick copy.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <SettingSlider
              label={`Export Scale: ${exportScale}x`}
              min={1}
              max={6}
              step={1}
              value={[exportScale]}
              onValueChange={(v) => setExportScale(v[0])}
            />

            <div className="grid gap-2 sm:grid-cols-2">
              <Button className="w-full" onClick={() => downloadPNG("qrcode.png", exportScale)}>
                <ArrowDownToLine className="mr-2 h-4 w-4" />
                Download PNG
              </Button>
              <Button
                className="w-full"
                variant="outline"
                onClick={() => downloadSVG("qrcode.svg")}
                disabled={(format ?? "png") !== "svg"}
              >
                <ArrowDownToLine className="mr-2 h-4 w-4" />
                Download SVG
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              <CopyButton getText={() => getPngDataUrl(exportScale)} label="Copy PNG Data URL" />
              <Button variant="ghost" onClick={runGenerate}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Regenerate
              </Button>
            </div>
          </CardContent>
        </GlassCard>
      </div>

      {/* Live Preview */}
      <GlassCard>
        <CardHeader>
          <CardTitle className="text-base">Live Preview</CardTitle>
          <CardDescription>Canvas preview (PNG). Toggle SVG to see vector markup.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <div className="flex items-center justify-center rounded-xl border bg-muted/40 p-6">
              <QRCodeBox
                key={genTick}
                value={payload}
                format={(format ?? "png") as RenderFormat}
                size={size}
                margin={margin}
                ecl={(ecl ?? "M") as ECL}
                fg={fg}
                bg={bg}
                quietZone={quietZone}
                logo={
                  logoEnabled && logoDataUrl
                    ? { src: logoDataUrl, sizePct: logoSizePct, roundedPct: 20, pad: 4 }
                    : null
                }
                className="rounded-lg bg-white p-2 shadow-sm"
              />
            </div>

            <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
              <SmallStat
                icon={<ScanLine className="h-4 w-4" />}
                label="Type"
                value={form.kind.toUpperCase()}
              />
              <SmallStat
                icon={<ImageIcon className="h-4 w-4" />}
                label="Size"
                value={`${size}px`}
              />
              <SmallStat
                icon={<Upload className="h-4 w-4" />}
                label="Logo"
                value={logoEnabled ? "On" : "Off"}
              />
            </div>
          </div>
        </CardContent>
      </GlassCard>
    </>
  );
}

/* Sub-Components */

function DynamicFields({
  form,
  setForm,
  controlForm,
}: {
  form: FormState;
  setForm: React.Dispatch<React.SetStateAction<FormState>>;
  controlForm: ReturnType<typeof useForm<ControlValues>>;
}) {
  if (form.kind === "url") {
    return (
      <div className="space-y-2">
        <InputField
          id="url"
          label="URL"
          placeholder="https://example.com"
          value={form.url}
          onChange={(e) => setForm((s) => ({ ...s, url: e.target.value }))}
        />
      </div>
    );
  }

  if (form.kind === "text") {
    return (
      <TextareaField
        id="text"
        label="Text"
        placeholder="Your message"
        value={form.text}
        onValueChange={(v) => setForm((s) => ({ ...s, text: v }))}
        rows={3}
        autoResize
        showCount
        maxLength={1000}
      />
    );
  }

  if (form.kind === "wifi") {
    return (
      <Form {...controlForm}>
        <form className="grid gap-4 sm:grid-cols-2">
          <InputField
            id="ssid"
            label="SSID"
            placeholder="MyNetwork"
            value={form.wifiSsid}
            onChange={(e) => setForm((s) => ({ ...s, wifiSsid: e.target.value }))}
          />

          <SelectField
            name="wifiAuth"
            label="Authentication"
            options={[
              { label: "WPA/WPA2", value: "WPA" },
              { label: "WEP", value: "WEP" },
              { label: "No password", value: "nopass" },
            ]}
            placeholder="Auth"
          />

          {form.wifiAuth !== "nopass" && (
            <InputField
              id="wifipw"
              label="Password"
              placeholder="supersecret"
              value={form.wifiPassword}
              onChange={(e) => setForm((s) => ({ ...s, wifiPassword: e.target.value }))}
            />
          )}

          <div className="col-span-2 flex items-center justify-between rounded-lg border p-3">
            <div className="space-y-0.5">
              <p className="text-sm font-medium leading-none">Hidden Network</p>
              <p className="text-xs text-muted-foreground">Set true if SSID is not broadcast.</p>
            </div>
            <Switch
              checked={form.wifiHidden}
              onCheckedChange={(v) => setForm((s) => ({ ...s, wifiHidden: v }))}
            />
          </div>
        </form>
      </Form>
    );
  }

  if (form.kind === "vcard") {
    return (
      <div className="grid gap-4 sm:grid-cols-2">
        <InputField
          id="vcfirst"
          label="First Name"
          value={form.vcFirst}
          onChange={(e) => setForm((s) => ({ ...s, vcFirst: e.target.value }))}
        />
        <InputField
          id="vclast"
          label="Last Name"
          value={form.vcLast}
          onChange={(e) => setForm((s) => ({ ...s, vcLast: e.target.value }))}
        />
        <InputField
          id="vcorg"
          label="Organization"
          value={form.vcOrg}
          onChange={(e) => setForm((s) => ({ ...s, vcOrg: e.target.value }))}
        />
        <InputField
          id="vctitle"
          label="Title"
          value={form.vcTitle}
          onChange={(e) => setForm((s) => ({ ...s, vcTitle: e.target.value }))}
        />
        <InputField
          id="vcphone"
          label="Phone"
          value={form.vcPhone}
          onChange={(e) => setForm((s) => ({ ...s, vcPhone: e.target.value }))}
        />
        <InputField
          id="vcemail"
          type="email"
          label="Email"
          value={form.vcEmail}
          onChange={(e) => setForm((s) => ({ ...s, vcEmail: e.target.value }))}
        />
        <div className="col-span-2">
          <InputField
            id="vcurl"
            label="Website"
            value={form.vcUrl}
            onChange={(e) => setForm((s) => ({ ...s, vcUrl: e.target.value }))}
          />
        </div>
      </div>
    );
  }

  if (form.kind === "email") {
    return (
      <div className="grid gap-4 sm:grid-cols-2">
        <InputField
          id="mailto"
          type="email"
          label="To"
          placeholder="hello@example.com"
          value={form.emailTo}
          onChange={(e) => setForm((s) => ({ ...s, emailTo: e.target.value }))}
        />
        <InputField
          id="mailsub"
          label="Subject"
          placeholder="Subject"
          value={form.emailSubject}
          onChange={(e) => setForm((s) => ({ ...s, emailSubject: e.target.value }))}
        />
        <TextareaField
          id="mailbody"
          label="Body"
          placeholder="Message..."
          value={form.emailBody}
          onValueChange={(v) => setForm((s) => ({ ...s, emailBody: v }))}
          rows={4}
          autoResize
          trimOnBlur
          showCount
          maxLength={1000}
        />
      </div>
    );
  }

  // whatsapp
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <InputField
        id="wato"
        label="Phone (no +)"
        placeholder="8801XXXXXXXXX"
        value={form.waTo}
        onChange={(e) => setForm((s) => ({ ...s, waTo: e.target.value }))}
      />
      <TextareaField
        id="watext"
        label="Text"
        placeholder="Message…"
        value={form.waText}
        onValueChange={(v) => setForm((s) => ({ ...s, waText: v }))}
        rows={3}
        autoResize
        showCount
        maxLength={1000}
      />
    </div>
  );
}

function SmallStat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
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
    <div className={disabled ? "opacity-60 pointer-events-none" : ""}>
      <Label className="mb-1 block">{label}</Label>
      <Slider value={value} onValueChange={onValueChange} min={min} max={max} step={step} />
    </div>
  );
}
