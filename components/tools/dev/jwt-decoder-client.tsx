"use client";

import {
  Check,
  ClipboardCopy,
  Clock,
  Download as DownloadIcon,
  Eye,
  EyeOff,
  FileJson,
  FileKey2,
  KeyRound,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ActionButton,
  CopyButton,
  ExportTextButton,
  PasteButton,
  ResetButton,
} from "@/components/shared/action-buttons";
import InputField from "@/components/shared/form-fields/input-field";
import SwitchRow from "@/components/shared/form-fields/switch-row";
import TextareaField from "@/components/shared/form-fields/textarea-field";
import Stat from "@/components/shared/stat";
import ToolPageHeader from "@/components/shared/tool-page-header";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GlassCard } from "@/components/ui/glass-card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TooltipProvider } from "@/components/ui/tooltip";

/* Types */
type CopyWhich = "header" | "payload" | "token";

type JwtHeader = {
  alg?: string;
  kid?: string;
  typ?: string;
  [k: string]: unknown;
};

type JwtPayloadStd = {
  iss?: string;
  sub?: string;
  aud?: string | string[];
  exp?: number;
  nbf?: number;
  iat?: number;
  jti?: string;
  [k: string]: unknown;
};

type Status =
  | { state: "none" }
  | { state: "valid" | "expired" | "nbf"; exp?: number; iat?: number; nbf?: number };

export default function JwtDecoderClient() {
  const [token, setToken] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [header, setHeader] = useState<JwtHeader | null>(null);
  const [payload, setPayload] = useState<JwtPayloadStd | null>(null);
  const [signatureB64u, setSignatureB64u] = useState<string>("");

  const [autoOnPaste, setAutoOnPaste] = useState<boolean>(true);
  const [copied, setCopied] = useState<CopyWhich | null>(null);

  // Verify
  const [secret, setSecret] = useState<string>("");
  const [showSecret, setShowSecret] = useState<boolean>(false);
  const [publicKeyPem, setPublicKeyPem] = useState<string>("");
  const [verifying, setVerifying] = useState<boolean>(false);
  const [verifyResult, setVerifyResult] = useState<null | { ok: boolean; message: string }>(null);

  const tokenRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const sp = new URLSearchParams(window.location.search);
    const t = sp.get("token");
    if (t) {
      setToken(t);
      try {
        const parts = t.split(".");
        if (parts.length >= 2) {
          const hdr = JSON.parse(base64urlDecodeToString(parts[0])) as JwtHeader;
          const pld = JSON.parse(base64urlDecodeToString(parts[1])) as JwtPayloadStd;
          setHeader(hdr);
          setPayload(pld);
          setSignatureB64u(parts[2] || "");
          setError("");
        } else {
          setError("Token must have at least header and payload segments (two dots).");
        }
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Failed to decode token segments");
      }
    }
  }, []);

  // Derived
  const status: Status = useMemo(() => buildStatus(payload), [payload]);
  const headerJson = useMemo(() => (header ? JSON.stringify(header, null, 2) : ""), [header]);
  const payloadJson = useMemo(() => (payload ? JSON.stringify(payload, null, 2) : ""), [payload]);

  /* Handlers */
  function onPaste(e: React.ClipboardEvent<HTMLTextAreaElement>) {
    if (!autoOnPaste) return;
    const text = e.clipboardData.getData("text");
    if (!text) return;
    const candidate = extractToken(text);
    if (candidate) {
      e.preventDefault();
      setToken(candidate);
      decodeToken(candidate);
    }
  }

  function extractToken(text: string): string | null {
    const bearerMatch = text.match(/Bearer\s+([A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+)/);
    if (bearerMatch) return bearerMatch[1];
    const rawMatch = text.match(/([A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+)/);
    return rawMatch ? rawMatch[1] : null;
  }

  async function copy(text: string, which: CopyWhich) {
    await navigator.clipboard.writeText(text);
    setCopied(which);
    setTimeout(() => setCopied(null), 1200);
  }

  function clearAll() {
    setToken("");
    setHeader(null);
    setPayload(null);
    setSignatureB64u("");
    setError("");
    setVerifyResult(null);
  }

  function decodeToken(src?: string) {
    const t = (src ?? token).trim();
    setVerifyResult(null);
    if (!t) {
      setError("");
      setHeader(null);
      setPayload(null);
      setSignatureB64u("");
      return;
    }
    const parts = t.split(".");
    if (parts.length < 2) {
      setError("Token must have at least header and payload segments (two dots).");
      return;
    }
    try {
      const hdr = JSON.parse(base64urlDecodeToString(parts[0])) as JwtHeader;
      const pld = JSON.parse(base64urlDecodeToString(parts[1])) as JwtPayloadStd;
      setHeader(hdr);
      setPayload(pld);
      setSignatureB64u(parts[2] || "");
      setError("");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to decode token segments");
    }
  }

  // Verify HS256 / RS256
  async function verify() {
    if (!token || !header) return;
    setVerifying(true);
    setVerifyResult(null);
    try {
      const [h, p, s] = token.split(".");
      const alg = header.alg;
      if (!alg) throw new Error("Missing alg in header");
      if (!s) throw new Error("Token has no signature part to verify");

      const dataBytes = new TextEncoder().encode(`${h}.${p}`);
      const dataBuf = toArrayBuffer(dataBytes);
      const sigBytes = base64urlToUint8Array(s);
      const sigBuf = toArrayBuffer(sigBytes);

      if (alg === "HS256") {
        if (!secret) throw new Error("Provide an HMAC secret to verify HS256");
        const key = await crypto.subtle.importKey(
          "raw",
          new TextEncoder().encode(secret),
          { name: "HMAC", hash: "SHA-256" },
          false,
          ["sign"],
        );
        const macBuf = await crypto.subtle.sign("HMAC", key, dataBuf);
        const mac = new Uint8Array(macBuf);
        const ok = timingSafeEqual(mac, sigBytes);
        setVerifyResult({
          ok,
          message: ok ? "HS256 signature matches (HMAC)" : "HS256 signature mismatch",
        });
      } else if (alg === "RS256") {
        if (!publicKeyPem) throw new Error("Provide an RSA public key (PEM) to verify RS256");
        const spki = pemToArrayBuffer(publicKeyPem);
        const key = await crypto.subtle.importKey(
          "spki",
          spki,
          { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
          false,
          ["verify"],
        );
        const ok = await crypto.subtle.verify({ name: "RSASSA-PKCS1-v1_5" }, key, sigBuf, dataBuf);
        setVerifyResult({ ok, message: ok ? "RS256 signature valid" : "RS256 signature invalid" });
      } else {
        setVerifyResult({
          ok: false,
          message: `Unsupported alg: ${alg}. Only HS256/RS256 implemented here.`,
        });
      }
    } catch (e: unknown) {
      setVerifyResult({
        ok: false,
        message: e instanceof Error ? e.message : "Verification failed",
      });
    } finally {
      setVerifying(false);
    }
  }

  return (
    <TooltipProvider>
      <ToolPageHeader
        icon={FileJson}
        title="JWT Decoder & Verifier"
        description="Decode and inspect JWT tokens safely."
        actions={
          <>
            <ExportTextButton
              filename="jwt-token.txt"
              getText={() => token}
              label="Export token"
              disabled={!token}
            />
            <ResetButton onClick={clearAll} />
            <CopyButton
              variant="default"
              getText={() => token}
              disabled={!token}
              label="Copy token"
            />
          </>
        }
      />

      {/* Options */}
      <GlassCard className="px-6 py-3 mb-4">
        <div className="flex flex-wrap items-center gap-3 justify-between">
          <div className="hidden md:flex items-center gap-2">
            <Badge>alg: {header?.alg ?? "—"}</Badge>
            <Badge>kid: {header?.kid ?? "—"}</Badge>
          </div>
          <SwitchRow
            disabled
            label="Auto-decode on paste"
            checked={autoOnPaste}
            onCheckedChange={(v) => setAutoOnPaste(Boolean(v))}
          />
        </div>
      </GlassCard>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Left: Token input */}
        <GlassCard>
          <CardHeader className="flex items-center justify-between">
            <span className="font-semibold">Token</span>

            <div className="flex gap-4">
              <Badge variant="secondary">
                parts: {token.split(".").length >= 2 ? (signatureB64u ? 3 : 2) : 0}
              </Badge>
              <PasteButton
                size="sm"
                mode="replace"
                smartNewline={false}
                getExisting={() => token}
                setValue={(next) => {
                  const cand = extractToken(next) || next;
                  setToken(cand);
                  decodeToken(cand);
                }}
                onText={(text) => {
                  if (!autoOnPaste) return;
                  const cand = extractToken(text) || text;
                  setToken(cand);
                  decodeToken(cand);
                }}
              />
            </div>
          </CardHeader>

          <CardContent>
            <TextareaField
              ref={tokenRef}
              value={token}
              onValueChange={setToken}
              onPaste={onPaste}
              placeholder="eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM..."
              textareaClassName="min-h-[200px] font-mono"
            />

            {error && (
              <Alert variant="destructive" className="mt-3">
                <AlertTitle>Decode error</AlertTitle>
                <AlertDescription className="whitespace-pre-wrap break-words">
                  {error}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </GlassCard>

        {/* Right: Summary / Header / Payload */}
        <GlassCard>
          <CardContent>
            {/* Quick status stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
              <Stat
                label="Status"
                value={
                  status.state === "valid"
                    ? "Active"
                    : status.state === "expired"
                      ? "Expired"
                      : status.state === "nbf"
                        ? "Not yet valid"
                        : "—"
                }
                hint={
                  status.state === "valid"
                    ? "Signature not verified yet"
                    : status.state === "expired"
                      ? "Token passed exp"
                      : status.state === "nbf"
                        ? "Before nbf"
                        : undefined
                }
              />
              <Stat label="Issued at" value={formatUnix(payload?.iat)} hint={rel(payload?.iat)} />
              <Stat label="Expires" value={formatUnix(payload?.exp)} hint={rel(payload?.exp)} />
            </div>

            <Tabs defaultValue="summary" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="summary">Summary</TabsTrigger>
                <TabsTrigger value="header">Header</TabsTrigger>
                <TabsTrigger value="payload">Payload</TabsTrigger>
              </TabsList>

              {/* Summary */}
              <TabsContent value="summary" className="mt-3 space-y-3">
                <GlassCard className="p-4">
                  <div className="flex flex-wrap items-center gap-3">
                    {status.state === "valid" && (
                      <Badge className="gap-1">
                        <ShieldCheck className="h-3 w-3" /> Active
                      </Badge>
                    )}
                    {status.state === "expired" && (
                      <Badge variant="destructive" className="gap-1">
                        <ShieldAlert className="h-3 w-3" /> Expired
                      </Badge>
                    )}
                    {status.state === "nbf" && (
                      <Badge variant="secondary" className="gap-1">
                        <Clock className="h-3 w-3" /> Not yet valid
                      </Badge>
                    )}
                    <Separator orientation="vertical" className="h-4" />
                    <span className="text-xs text-muted-foreground">
                      alg: {header?.alg ?? "—"} • typ: {header?.typ ?? "—"} • kid:{" "}
                      {header?.kid ?? "—"}
                    </span>
                  </div>

                  <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <Claim label="Subject (sub)" value={payload?.sub} />
                    <Claim label="Issuer (iss)" value={payload?.iss} />
                    <Claim label="Audience (aud)" value={asArray(payload?.aud)?.join(", ")} />
                    <Claim label="JWT ID (jti)" value={payload?.jti} />
                    <Claim
                      label="Issued at (iat)"
                      value={formatUnix(payload?.iat)}
                      hint={rel(payload?.iat)}
                    />
                    <Claim
                      label="Not before (nbf)"
                      value={formatUnix(payload?.nbf)}
                      hint={rel(payload?.nbf)}
                    />
                    <Claim
                      label="Expires (exp)"
                      value={formatUnix(payload?.exp)}
                      hint={rel(payload?.exp)}
                    />
                  </div>

                  {/* Quick actions */}
                  <div className="mt-3 flex flex-wrap gap-2">
                    <ActionButton
                      onClick={() => copy(headerJson, "header")}
                      disabled={!headerJson}
                      label={copied === "header" ? "Copied" : "Copy header JSON"}
                      icon={copied === "header" ? Check : ClipboardCopy}
                    />
                    <ActionButton
                      onClick={() => copy(payloadJson, "payload")}
                      disabled={!payloadJson}
                      label={copied === "payload" ? "Copied" : "Copy payload JSON"}
                      icon={copied === "payload" ? Check : ClipboardCopy}
                    />
                    <ExportTextButton
                      filename="payload.json"
                      getText={() => payloadJson || "{}"}
                      label="Download payload"
                      disabled={!payloadJson}
                      icon={DownloadIcon}
                    />
                  </div>
                </GlassCard>
              </TabsContent>

              {/* Header */}
              <TabsContent value="header" className="mt-3">
                <TextareaField
                  readOnly
                  value={headerJson}
                  onValueChange={() => {}}
                  placeholder="Decoded header JSON"
                  textareaClassName="min-h-[300px] font-mono"
                />
              </TabsContent>

              {/* Payload */}
              <TabsContent value="payload" className="mt-3">
                <TextareaField
                  readOnly
                  value={payloadJson}
                  onValueChange={() => {}}
                  placeholder="Decoded payload JSON"
                  textareaClassName="min-h-[300px] font-mono"
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </GlassCard>
      </div>

      <Separator className="my-4" />

      {/* Verify */}
      <GlassCard>
        <CardHeader className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileKey2 className="h-5 w-5" />
            <h2 className="text-base font-semibold">Verify signature</h2>
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Supports HS256 (HMAC) & RS256 (RSA)
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {/* HS256 */}
            <GlassCard>
              <CardHeader className="flex items-center gap-2">
                <KeyRound className="h-4 w-4" />
                <div className="font-medium">HS256 (HMAC secret)</div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-2">
                  <InputField
                    type={showSecret ? "text" : "password"}
                    value={secret}
                    onChange={(e) => setSecret(e.target.value)}
                    placeholder="Your HMAC secret"
                  />
                  <div className="flex gap-2">
                    <ActionButton
                      onClick={verify}
                      disabled={!token || !header || header?.alg !== "HS256" || verifying}
                      label={verifying ? "Verifying…" : "Verify HS256"}
                    />
                    <ActionButton
                      variant="ghost"
                      onClick={() => setShowSecret((s) => !s)}
                      label={showSecret ? "Hide" : "Show"}
                      icon={showSecret ? EyeOff : Eye}
                    />
                  </div>
                </div>
              </CardContent>
            </GlassCard>

            {/* RS256 */}
            <GlassCard>
              <CardHeader className="flex items-center gap-2">
                <FileKey2 className="h-4 w-4" />
                <div className="font-medium">RS256 (Public key PEM)</div>
              </CardHeader>
              <CardContent>
                <TextareaField
                  value={publicKeyPem}
                  onValueChange={setPublicKeyPem}
                  placeholder={`-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8A...\n-----END PUBLIC KEY-----`}
                  textareaClassName="min-h-[120px] font-mono"
                />
                <div className="flex gap-2 mt-2">
                  <ActionButton
                    onClick={verify}
                    disabled={!token || !header || header?.alg !== "RS256" || verifying}
                    label={verifying ? "Verifying…" : "Verify RS256"}
                  />
                </div>
              </CardContent>
            </GlassCard>
          </div>

          {verifyResult && (
            <div className="mt-4">
              {verifyResult.ok ? (
                <Alert>
                  <ShieldCheck className="h-4 w-4" />
                  <AlertTitle>Signature OK</AlertTitle>
                  <AlertDescription>{verifyResult.message}</AlertDescription>
                </Alert>
              ) : (
                <Alert variant="destructive">
                  <ShieldAlert className="h-4 w-4" />
                  <AlertTitle>Verification failed</AlertTitle>
                  <AlertDescription className="break-words">
                    {verifyResult.message}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </CardContent>
      </GlassCard>
    </TooltipProvider>
  );
}

/* Helpers */
function base64urlDecodeToString(b64u: string): string {
  return new TextDecoder().decode(base64urlToUint8Array(b64u));
}
function base64urlToUint8Array(b64u: string): Uint8Array {
  const pad = "=".repeat((4 - (b64u.length % 4)) % 4);
  const b64 = (b64u + pad).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(b64);
  const arr = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
  return arr;
}
function pemToArrayBuffer(pem: string): ArrayBuffer {
  const b64 = pem
    .replace(/-----BEGIN [^-]+-----/g, "")
    .replace(/-----END [^-]+-----/g, "")
    .replace(/\s+/g, "");
  const raw = atob(b64);
  const arr = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
  return arr.buffer;
}
function timingSafeEqual(a: Uint8Array, b: Uint8Array) {
  if (a.length !== b.length) return false;
  let out = 0;
  for (let i = 0; i < a.length; i++) out |= a[i] ^ b[i];
  return out === 0;
}
// Force clean ArrayBuffer for WebCrypto
function toArrayBuffer(u8: Uint8Array): ArrayBuffer {
  const buf = new ArrayBuffer(u8.byteLength);
  new Uint8Array(buf).set(u8);
  return buf;
}

function buildStatus(payload: JwtPayloadStd | null): Status {
  if (!payload) return { state: "none" };
  const now = Math.floor(Date.now() / 1000);
  const exp = num(payload.exp);
  const iat = num(payload.iat);
  const nbf = num(payload.nbf);
  if (nbf && now < nbf) return { state: "nbf", exp, iat, nbf };
  if (exp && now >= exp) return { state: "expired", exp, iat, nbf };
  return { state: "valid", exp, iat, nbf };
}
function num(x: unknown): number | undefined {
  return typeof x === "number" ? x : x ? Number(x) : undefined;
}
function asArray<T>(x: T | T[] | undefined | null): T[] | undefined {
  return x == null ? undefined : Array.isArray(x) ? x : [x];
}
function formatUnix(v?: number) {
  if (!v || Number.isNaN(v)) return "—";
  try {
    return new Date(v * 1000).toLocaleString();
  } catch {
    return String(v);
  }
}
function rel(v?: number) {
  if (!v || Number.isNaN(v)) return "";
  const now = Math.floor(Date.now() / 1000);
  const diff = (v - now) * 1000;
  return humanizeDuration(diff);
}
function humanizeDuration(ms: number) {
  const abs = Math.abs(ms);
  const sign = ms < 0 ? "ago" : "from now";
  const s = Math.floor(abs / 1000);
  const m = Math.floor(s / 60);
  const h = Math.floor(m / 60);
  const d = Math.floor(h / 24);
  if (d > 0) return `${d}d ${h % 24}h ${m % 60}m ${sign}`;
  if (h > 0) return `${h}h ${m % 60}m ${sign}`;
  if (m > 0) return `${m}m ${s % 60}s ${sign}`;
  return `${s}s ${sign}`;
}

/* Small claim card */
function Claim({ label, value, hint }: { label: string; value?: string | number; hint?: string }) {
  return (
    <div className="rounded-lg border p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-sm font-medium break-words">{value ?? "—"}</div>
      {hint ? <div className="mt-0.5 text-[10px] text-muted-foreground">{hint}</div> : null}
    </div>
  );
}
