import JsonLd from "@/components/seo/json-ld";
import HashGeneratorClient from "@/components/tools/dev/hash-generator-client";
import { siteURL } from "@/lib/constants";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Hash Generator",
  description:
    "Generate cryptographic hashes like MD5, SHA1, SHA256, SHA512, and more. Supports text, files, HMAC keys, and batch processing. Free, fast, secure.",
  path: "/tools/dev/hash-generator",
  keywords: [
    "hash generator",
    "MD5 generator",
    "SHA1 generator",
    "SHA256 generator",
    "SHA512 generator",
    "hash online",
    "hash function",
    "hash string",
    "hash file",
    "calculate checksum",
    "file hash",
    "verify file checksum",
    "MD5 checksum",
    "SHA256 checksum",
    "hash file integrity",
    "download verification",
    "HMAC generator",
    "hash with secret",
    "bcrypt",
    "argon2",
    "PBKDF2",
    "crypto hash",
    "password hash",
    "developer tools",
    "Tools Hub",
    "online tools",
    "Bangladesh",
  ],
});

export default function Page() {
  const toolUrl = `${siteURL}/tools/dev/hash-generator`;

  const appLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Hash Generator — Tools Hub",
    url: toolUrl,
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Web",
    isAccessibleForFree: true,
    inLanguage: ["en", "bn"],
    description:
      "Generate hashes like MD5, SHA1, SHA256, and more. Paste text, upload files, or compute HMACs with secrets. Validate file integrity and export results instantly.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    featureList: [
      "Generate MD5, SHA1, SHA224, SHA256, SHA384, SHA512",
      "Support for text and file hashing",
      "HMAC generation with custom secret",
      "Batch process multiple inputs",
      "Copy or export hash results (CSV, JSON, TXT)",
      "Drag & drop file upload with instant hash output",
      "Compare expected vs generated hash for verification",
      "Large file support (tens of MBs+)",
      "Privacy-first: all processing in your browser",
      "Mobile-friendly and responsive design",
      "Dark mode, keyboard shortcuts",
    ],
    creator: {
      "@type": "Person",
      name: "Tariqul Islam",
      url: "https://tariqul.dev",
    },
    potentialAction: {
      "@type": "CreateAction",
      target: toolUrl,
      name: "Generate a hash from text or file",
    },
    additionalProperty: [
      {
        "@type": "PropertyValue",
        name: "Supported algorithms",
        value: "MD5, SHA1, SHA224, SHA256, SHA384, SHA512, HMAC",
      },
      { "@type": "PropertyValue", name: "Inputs", value: "Plain text, files, or batch entries" },
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
      { "@type": "ListItem", position: 3, name: "Hash Generator", item: toolUrl },
    ],
  };

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What is a hash generator?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "A hash generator computes fixed-length cryptographic digests (like MD5, SHA256) from text or files. Hashes are commonly used for integrity checks and secure storage.",
        },
      },
      {
        "@type": "Question",
        name: "Can I use this to verify file downloads?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. Upload the file and compare the computed hash with the expected checksum provided by the source to confirm integrity.",
        },
      },
      {
        "@type": "Question",
        name: "Does this tool store my data?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "No. All hashing is done locally in your browser for privacy. Files and text never leave your device.",
        },
      },
      {
        "@type": "Question",
        name: "Does it support HMAC?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. You can provide a secret key to generate HMACs using supported hash algorithms like SHA256 and SHA512.",
        },
      },
    ],
  };

  return (
    <div className="space-y-4">
      <JsonLd data={appLd} />
      <JsonLd data={crumbsLd} />
      <JsonLd data={faqLd} />

      <HashGeneratorClient />
    </div>
  );
}
