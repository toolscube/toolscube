import JsonLd from '@/components/seo/json-ld';
import Base64Client from '@/components/tools/text/base64-client';
import { buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({
  title: 'Base64 Encode/Decode • Tools Hub',
  description: 'Easily encode text or files to Base64 or decode Base64 back to its original form. Supports text, files, images, and copy/download features.',
  path: '/tools/text/base64',
  keywords: ['Base64 encode', 'Base64 decode', 'text to Base64', 'file to Base64', 'image to Base64', 'decode Base64', 'encode online', 'Base64 converter', 'Tools Hub'],
});

export default function Page() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Base64 Encode/Decode — Tools Hub',
    url: `${process.env.NEXT_PUBLIC_SITE_URL}/tools/text/base64`,
    applicationCategory: 'UtilitiesApplication',
    operatingSystem: 'Web',
    description: 'Convert text, images, or files to Base64 encoding or decode Base64 back to its original format. Free, fast, and secure.',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    featureList: ['Text to Base64', 'Base64 to Text', 'File to Base64', 'Image preview', 'Copy & download support'],
    creator: {
      '@type': 'Personal',
      name: 'Tariqul Islam',
      url: 'https://tariqul.dev',
    },
  };

  return (
    <div className="space-y-4">
      {/* JSON-LD */}
      <JsonLd data={jsonLd} />

      {/* Interactive client component */}
      <Base64Client />
    </div>
  );
}
