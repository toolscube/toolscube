'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { GlassCard, MotionGlassCard } from '@/components/ui/glass-card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Check, ClipboardCopy, ClipboardPaste, Clock, Download as DownloadIcon, Eye, EyeOff, FileJson, FileKey2, KeyRound, Link2, RefreshCw, ShieldAlert, ShieldCheck, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

/*
  JWT Decoder & Verifier — Tools Hub
  Path: app/tools/(tools)/dev/jwt-decode/page.tsx
*/

export default function JwtDecodePage() {
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const [header, setHeader] = useState<any>(null);
  const [payload, setPayload] = useState<any>(null);
  const [signatureB64u, setSignatureB64u] = useState('');
  const [autoOnPaste, setAutoOnPaste] = useState(true);
  const [copied, setCopied] = useState<'header' | 'payload' | 'token' | null>(null);

  // Verify state
  const [secret, setSecret] = useState(''); // HS256
  const [showSecret, setShowSecret] = useState(false);
  const [publicKeyPem, setPublicKeyPem] = useState(''); // RS256 PEM
  const [verifying, setVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState<null | { ok: boolean; message: string }>(null);

  const tokenRef = useRef<HTMLTextAreaElement | null>(null);

  // Load token from URL param (?token=...)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const sp = new URLSearchParams(window.location.search);
    const t = sp.get('token');
    if (t && !token) {
      setToken(t);
      decodeToken(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Stats & status
  const status = useMemo(() => buildStatus(payload), [payload]);

  function onPaste(e: React.ClipboardEvent<HTMLTextAreaElement>) {
    if (!autoOnPaste) return;
    const text = e.clipboardData.getData('text');
    if (!text) return;
    const candidate = extractToken(text);
    if (candidate) {
      e.preventDefault();
      setToken(candidate);
      decodeToken(candidate);
    }
  }

  function extractToken(text: string) {
    // Try to extract from "Bearer <token>" or raw JWT
    const bearerMatch = text.match(/Bearer\s+([A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+)/);
    if (bearerMatch) return bearerMatch[1];
    const rawMatch = text.match(/([A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+)/);
    return rawMatch ? rawMatch[1] : null;
  }

  async function copy(text: string, which: 'header' | 'payload' | 'token') {
    await navigator.clipboard.writeText(text);
    setCopied(which);
    setTimeout(() => setCopied(null), 1200);
  }

  function clearAll() {
    setToken('');
    setHeader(null);
    setPayload(null);
    setSignatureB64u('');
    setError('');
    setVerifyResult(null);
  }

  function decodeToken(src?: string) {
    const t = (src ?? token).trim();
    setVerifyResult(null);
    if (!t) {
      setError('');
      setHeader(null);
      setPayload(null);
      setSignatureB64u('');
      return;
    }
    const parts = t.split('.');
    if (parts.length < 2) {
      setError('Token must have at least header and payload segments (two dots).');
      return;
    }
    try {
      const hdr = JSON.parse(base64urlDecodeToString(parts[0]));
      const pld = JSON.parse(base64urlDecodeToString(parts[1]));
      setHeader(hdr);
      setPayload(pld);
      setSignatureB64u(parts[2] || '');
      setError('');
    } catch (e: any) {
      setError(e?.message || 'Failed to decode token segments');
    }
  }

  // --- Verify (HS256 / RS256) ---
  async function verify() {
    if (!token || !header) return;
    setVerifying(true);
    setVerifyResult(null);
    try {
      const [h, p, s] = token.split('.');
      const alg = header.alg;
      if (!alg) throw new Error('Missing alg in header');
      if (!s) throw new Error('Token has no signature part to verify');

      const dataBytes = new TextEncoder().encode(`${h}.${p}`);
      const dataBuf = toArrayBuffer(dataBytes);
      const sigBytes = base64urlToUint8Array(s);
      const sigBuf = toArrayBuffer(sigBytes);

      if (alg === 'HS256') {
        if (!secret) throw new Error('Provide an HMAC secret to verify HS256');
        const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
        const macBuf = await crypto.subtle.sign('HMAC', key, dataBuf);
        const mac = new Uint8Array(macBuf);
        const ok = timingSafeEqual(mac, sigBytes);
        setVerifyResult({ ok, message: ok ? 'HS256 signature matches (HMAC)' : 'HS256 signature mismatch' });
      } else if (alg === 'RS256') {
        if (!publicKeyPem) throw new Error('Provide an RSA public key (PEM) to verify RS256');
        const spki = pemToArrayBuffer(publicKeyPem);
        const key = await crypto.subtle.importKey('spki', spki, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['verify']);
        const ok = await crypto.subtle.verify({ name: 'RSASSA-PKCS1-v1_5' }, key, sigBuf, dataBuf);
        setVerifyResult({ ok, message: ok ? 'RS256 signature valid' : 'RS256 signature invalid' });
      } else {
        setVerifyResult({ ok: false, message: `Unsupported alg: ${alg}. Only HS256/RS256 implemented here.` });
      }
    } catch (e: any) {
      setVerifyResult({ ok: false, message: e?.message || 'Verification failed' });
    } finally {
      setVerifying(false);
    }
  }

  // --- UI helpers ---
  const headerJson = useMemo(() => (header ? JSON.stringify(header, null, 2) : ''), [header]);
  const payloadJson = useMemo(() => (payload ? JSON.stringify(payload, null, 2) : ''), [payload]);

  return (
    <TooltipProvider>
      <MotionGlassCard>
        {/* Header */}
        <GlassCard className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between px-6">
          <div>
            <div className="flex items-center gap-2">
              <FileJson className="h-6 w-6" />
              <h1 className="text-2xl font-semibold tracking-tight">JWT Decoder & Verifier</h1>
              <Badge variant="secondary" className="rounded-full">
                Pro
              </Badge>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">Decode header/payload, check expiry, and verify HS256/RS256 tokens in-browser.</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 md:flex">
              <Badge variant="outline">alg: {header?.alg ?? '—'}</Badge>
              <Badge variant="outline">kid: {header?.kid ?? '—'}</Badge>
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="autoPaste" className="text-xs">
                Auto-decode on paste
              </Label>
              <Switch id="autoPaste" checked={autoOnPaste} onCheckedChange={setAutoOnPaste} />
            </div>
            <Button
              variant="outline"
              onClick={() => {
                const t = new URLSearchParams(window.location.search).get('token');
                if (t) {
                  setToken(t);
                  decodeToken(t);
                }
              }}
              className="gap-2">
              <Link2 className="h-4 w-4" /> Load from URL
            </Button>
            <Button variant="ghost" onClick={clearAll} className="gap-2">
              <Trash2 className="h-4 w-4" /> Clear
            </Button>
          </div>
        </GlassCard>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Left: Token input */}
          <GlassCard>
            <div className="p-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="font-semibold">Token</span>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" className="gap-1" onClick={() => tokenRef.current?.select()}>
                    <Eye className="h-4 w-4" /> Select all
                  </Button>
                  <Button variant="ghost" size="sm" className="gap-1" onClick={async () => copy(token, 'token')}>
                    {copied === 'token' ? <Check className="h-4 w-4" /> : <ClipboardCopy className="h-4 w-4" />} Copy
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1"
                    onClick={async () => {
                      try {
                        const t = await navigator.clipboard.readText();
                        if (t) {
                          const cand = extractToken(t) || t;
                          setToken(cand);
                          decodeToken(cand);
                        }
                      } catch {}
                    }}>
                    <ClipboardPaste className="h-4 w-4" /> Paste
                  </Button>
                </div>
              </div>
              <Textarea
                ref={tokenRef}
                value={token}
                onChange={(e) => setToken(e.target.value)}
                onPaste={onPaste}
                placeholder="eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM..."
                className="min-h-[180px] font-mono"
              />
              <div className="mt-3 flex flex-wrap gap-2">
                <Button onClick={() => decodeToken()} className="gap-2">
                  <RefreshCw className="h-4 w-4" /> Decode
                </Button>
              </div>
              {error && (
                <Alert variant="destructive" className="mt-3">
                  <AlertTitle>Decode error</AlertTitle>
                  <AlertDescription className="whitespace-pre-wrap break-words">{error}</AlertDescription>
                </Alert>
              )}
            </div>
          </GlassCard>

          {/* Right: Decoded */}
          <GlassCard>
            <div className="p-4">
              <Tabs defaultValue="summary" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="summary">Summary</TabsTrigger>
                  <TabsTrigger value="header">Header</TabsTrigger>
                  <TabsTrigger value="payload">Payload</TabsTrigger>
                </TabsList>

                <TabsContent value="summary" className="mt-3 space-y-3">
                  <GlassCard className="p-4">
                    <div className="flex flex-wrap items-center gap-3">
                      {status.state === 'valid' && (
                        <Badge variant="outline" className="gap-1">
                          <ShieldCheck className="h-3 w-3" /> Active
                        </Badge>
                      )}
                      {status.state === 'expired' && (
                        <Badge variant="destructive" className="gap-1">
                          <ShieldAlert className="h-3 w-3" /> Expired
                        </Badge>
                      )}
                      {status.state === 'nbf' && (
                        <Badge variant="secondary" className="gap-1">
                          <Clock className="h-3 w-3" /> Not yet valid
                        </Badge>
                      )}
                      <Separator orientation="vertical" className="h-4" />
                      <span className="text-xs text-muted-foreground">
                        alg: {header?.alg ?? '—'} • typ: {header?.typ ?? '—'} • kid: {header?.kid ?? '—'}
                      </span>
                    </div>
                    <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <Claim label="Subject (sub)" value={payload?.sub} />
                      <Claim label="Issuer (iss)" value={payload?.iss} />
                      <Claim label="Audience (aud)" value={asArray(payload?.aud)?.join(', ')} />
                      <Claim label="JWT ID (jti)" value={payload?.jti} />
                      <Claim label="Issued at (iat)" value={formatUnix(payload?.iat)} hint={rel(payload?.iat)} />
                      <Claim label="Not before (nbf)" value={formatUnix(payload?.nbf)} hint={rel(payload?.nbf)} />
                      <Claim label="Expires (exp)" value={formatUnix(payload?.exp)} hint={rel(payload?.exp)} />
                    </div>
                  </GlassCard>

                  {/* Quick actions */}
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" onClick={() => copy(headerJson, 'header')} disabled={!headerJson} className="gap-2">
                      {copied === 'header' ? <Check className="h-4 w-4" /> : <ClipboardCopy className="h-4 w-4" />} Copy header JSON
                    </Button>
                    <Button variant="outline" onClick={() => copy(payloadJson, 'payload')} disabled={!payloadJson} className="gap-2">
                      {copied === 'payload' ? <Check className="h-4 w-4" /> : <ClipboardCopy className="h-4 w-4" />} Copy payload JSON
                    </Button>
                    <Button variant="outline" onClick={() => download(payloadJson || '{}', 'payload.json')} disabled={!payloadJson} className="gap-2">
                      <DownloadIcon className="h-4 w-4" /> Download payload
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="header" className="mt-3">
                  <Textarea value={headerJson} readOnly placeholder="Decoded header JSON" className="min-h-[300px] font-mono" />
                </TabsContent>
                <TabsContent value="payload" className="mt-3">
                  <Textarea value={payloadJson} readOnly placeholder="Decoded payload JSON" className="min-h-[300px] font-mono" />
                </TabsContent>
              </Tabs>
            </div>
          </GlassCard>
        </div>

        {/* Verify */}
        <GlassCard>
          <div className="p-4">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileKey2 className="h-5 w-5" />
                <h2 className="text-base font-semibold">Verify signature</h2>
              </div>
              <span className="text-xs text-muted-foreground">Supports HS256 (HMAC) & RS256 (RSA)</span>
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {/* HS256 */}
              <GlassCard className="p-4">
                <div className="flex items-center gap-2">
                  <KeyRound className="h-4 w-4" />
                  <div className="font-medium">HS256 (HMAC secret)</div>
                </div>
                <div className="flex items-center gap-2">
                  <Input type={showSecret ? 'text' : 'password'} value={secret} onChange={(e) => setSecret(e.target.value)} placeholder="Your HMAC secret" />
                </div>
                <div className="flex gap-2">
                  <Button onClick={verify} disabled={!token || !header || header?.alg !== 'HS256' || verifying}>
                    {verifying ? 'Verifying…' : 'Verify HS256'}
                  </Button>
                  <Button variant="ghost" onClick={() => setShowSecret((s) => !s)} className="gap-2">
                    {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />} {showSecret ? 'Hide' : 'Show'}
                  </Button>
                </div>
              </GlassCard>

              {/* RS256 */}
              <GlassCard className="p-4">
                <div className="flex items-center gap-2">
                  <FileKey2 className="h-4 w-4" />
                  <div className="font-medium">RS256 (Public key PEM)</div>
                </div>
                <Textarea
                  value={publicKeyPem}
                  onChange={(e) => setPublicKeyPem(e.target.value)}
                  placeholder={`-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8A...\n-----END PUBLIC KEY-----`}
                  className="min-h-[120px] font-mono"
                />
                <div className="flex gap-2">
                  <Button onClick={verify} disabled={!token || !header || header?.alg !== 'RS256' || verifying}>
                    {verifying ? 'Verifying…' : 'Verify RS256'}
                  </Button>
                </div>
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
                    <AlertDescription className="break-words">{verifyResult.message}</AlertDescription>
                  </Alert>
                )}
              </div>
            )}
          </div>
        </GlassCard>
      </MotionGlassCard>
    </TooltipProvider>
  );
}

// ===== Helpers =====
function base64urlDecodeToString(b64u: string): string {
  return new TextDecoder().decode(base64urlToUint8Array(b64u));
}
function base64urlToUint8Array(b64u: string): Uint8Array {
  const pad = '='.repeat((4 - (b64u.length % 4)) % 4);
  const b64 = (b64u + pad).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(b64);
  const arr = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
  return arr;
}
function pemToArrayBuffer(pem: string): ArrayBuffer {
  const b64 = pem
    .replace(/-----BEGIN [^-]+-----/g, '')
    .replace(/-----END [^-]+-----/g, '')
    .replace(/\s+/g, '');
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

// Force clean ArrayBuffer for WebCrypto (handles TS 5.5 typed array generics)
function toArrayBuffer(u8: Uint8Array): ArrayBuffer {
  const buf = new ArrayBuffer(u8.byteLength);
  new Uint8Array(buf).set(u8);
  return buf;
}

// Simple file download helper
function download(text: string, filename: string) {
  const blob = new Blob([text], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function buildStatus(payload: any): { state: 'none' | 'valid' | 'expired' | 'nbf' } & Record<string, any> {
  if (!payload) return { state: 'none' };
  const now = Math.floor(Date.now() / 1000);
  const exp = num(payload?.exp);
  const iat = num(payload?.iat);
  const nbf = num(payload?.nbf);
  if (nbf && now < nbf) return { state: 'nbf', exp, iat, nbf };
  if (exp && now >= exp) return { state: 'expired', exp, iat, nbf };
  return { state: 'valid', exp, iat, nbf };
}
function num(x: any): number | undefined {
  return typeof x === 'number' ? x : x ? Number(x) : undefined;
}
function asArray(x: any): any[] | undefined {
  return x == null ? undefined : Array.isArray(x) ? x : [x];
}

function formatUnix(v?: number) {
  if (!v || Number.isNaN(v)) return '—';
  try {
    return new Date(v * 1000).toLocaleString();
  } catch {
    return String(v);
  }
}
function rel(v?: number) {
  if (!v || Number.isNaN(v)) return '';
  const now = Math.floor(Date.now() / 1000);
  const diff = (v - now) * 1000;
  return humanizeDuration(diff);
}
function humanizeDuration(ms: number) {
  const abs = Math.abs(ms);
  const sign = ms < 0 ? 'ago' : 'from now';
  const s = Math.floor(abs / 1000);
  const m = Math.floor(s / 60);
  const h = Math.floor(m / 60);
  const d = Math.floor(h / 24);
  if (d > 0) return `${d}d ${h % 24}h ${m % 60}m ${sign}`;
  if (h > 0) return `${h}h ${m % 60}m ${sign}`;
  if (m > 0) return `${m}m ${s % 60}s ${sign}`;
  return `${s}s ${sign}`;
}

function Claim({ label, value, hint }: { label: string; value?: string | number; hint?: string }) {
  return (
    <div className="rounded-lg border p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-sm font-medium break-words">{value ?? '—'}</div>
      {hint ? <div className="mt-0.5 text-[10px] text-muted-foreground">{hint}</div> : null}
    </div>
  );
}
