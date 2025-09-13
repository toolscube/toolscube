import JsonLd from "@/components/seo/json-ld";
import JwtDecoderClient from "@/components/tools/dev/jwt-decoder-client";
import { siteURL } from "@/lib/constants";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "JWT Decoder",
  description:
    "Decode and inspect JSON Web Tokens (JWT) safely. View header & payload, validate exp/iat/nbf, and optionally verify signatures with secrets, PEM, JWK, or JWKS.",
  path: "/tools/dev/jwt-decode",
  keywords: [
    "JWT decoder",
    "decode JWT",
    "JSON Web Token",
    "JWT inspector",
    "base64url decode",
    "JWT header payload signature",
    "verify JWT signature",
    "HS256 verify",
    "RS256 verify",
    "ES256 verify",
    "PS256 verify",
    "HMAC secret",
    "RSA public key PEM",
    "ECDSA public key PEM",
    "JWK",
    "JWKS URL",
    "JWT claims",
    "exp iat nbf",
    "aud iss sub",
    "scope roles",
    "kid alg typ",
    "OAuth 2.0 tokens",
    "OpenID Connect ID token",
    "invalid signature",
    "token expired",
    "clock skew",
    "malformed JWT",
    "developer tools",
    "Tools Hub",
    "online tools",
    "Bangladesh",
  ],
});

export default function Page() {
  const toolUrl = `${siteURL}/tools/dev/jwt-decode`;

  const appLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "JWT Decoder — Tools Hub",
    url: toolUrl,
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Web",
    isAccessibleForFree: true,
    inLanguage: ["en", "bn"],
    description:
      "Decode JWTs safely in your browser. Pretty-print header/payload, validate timestamps and claims, and optionally verify signatures with secrets or public keys.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    featureList: [
      "Paste a JWT and auto-decode header & payload (Base64URL)",
      "Pretty-printed JSON with syntax highlighting",
      "Claim checks: exp, iat, nbf (with optional clock skew)",
      "Audience, issuer, subject validation (optional inputs)",
      "Signature verification (optional): HS*/RS*/ES*/PS* using secret/PEM/JWK/JWKS URL",
      "kid & alg awareness; choose key by kid; cache JWKS (opt-in)",
      "Copy header/payload/claims; export JSON; print-friendly",
      "Common error hints for malformed/expired/alg mismatch",
      "Offline by default (no network); JWKS fetch only if you opt in",
      "Privacy-first: processing happens locally in your browser",
      "Dark mode, keyboard shortcuts, responsive UI",
    ],
    creator: {
      "@type": "Person",
      name: "Tariqul Islam",
      url: "https://tariqul.dev",
    },
    potentialAction: {
      "@type": "CheckAction",
      target: toolUrl,
      name: "Decode and inspect a JWT",
    },
    additionalProperty: [
      {
        "@type": "PropertyValue",
        name: "Supports",
        value: "HS256/384/512, RS256/384/512, ES256/384/512, PS256/384/512",
      },
      { "@type": "PropertyValue", name: "Inputs", value: "Secret, PEM, JWK, JWKS URL (optional)" },
    ],
  };

  const crumbsLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Tools", item: `${siteURL}/tools` },
      {
        "@type": "ListItem",
        position: 2,
        name: "Developer",
        item: `${siteURL}/tools#cat-developer`,
      },
      { "@type": "ListItem", position: 3, name: "JWT Decoder", item: toolUrl },
    ],
  };

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Is decoding the same as verifying a JWT?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "No. Decoding only reveals the header and payload. Verification checks the signature using a secret or public key to ensure the token hasn’t been tampered with.",
        },
      },
      {
        "@type": "Question",
        name: "Can this tool verify JWT signatures?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. Provide an HMAC secret (HS*), an RSA/ECDSA public key (PEM/JWK), or a JWKS URL to verify the signature. Verification is optional and runs locally.",
        },
      },
      {
        "@type": "Question",
        name: "Does it support JWKS endpoints?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. You can supply a JWKS URL to fetch keys (kid-aware). This request is only made if you opt in; otherwise everything stays offline.",
        },
      },
      {
        "@type": "Question",
        name: "Can it decode encrypted JWTs (JWE)?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Encrypted JWEs require decryption keys and are not simply base64url-decoded. The tool focuses on JWS (signed) tokens for inspection and verification.",
        },
      },
      {
        "@type": "Question",
        name: "Is my token uploaded anywhere?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "No. By default, the tool runs entirely in your browser. Data isn’t sent to a server. JWKS fetching happens only if you enable it.",
        },
      },
    ],
  };

  return (
    <div className="space-y-4">
      <JsonLd data={appLd} />
      <JsonLd data={crumbsLd} />
      <JsonLd data={faqLd} />

      <JwtDecoderClient />
    </div>
  );
}
