import JsonLd from '@/components/seo/json-ld';
import LineToolsClient from '@/components/tools/text/line-tools-client';
import { buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({
  title: 'Line Tools • Tools Hub',
  description: 'Sort, dedupe, trim, and find & replace lines of text online. A free utility to quickly clean and organize line-based text data.',
  path: '/tools/text/line-tools',
  keywords: ['line tools', 'sort lines', 'dedupe lines', 'remove duplicates', 'trim lines', 'find and replace text', 'text utilities', 'Tools Hub'],
});

export default function Page() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Line Tools — Tools Hub',
    url: `${process.env.NEXT_PUBLIC_SITE_URL}/tools/text/line-tools`,
    applicationCategory: 'UtilitiesApplication',
    operatingSystem: 'Web',
    description: 'Free online line tools to sort, dedupe, trim, and find & replace text lines. Ideal for quick data cleanup and text manipulation.',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    featureList: ['Sort lines (A–Z or Z–A)', 'Remove duplicate lines', 'Trim whitespace', 'Find & replace text', 'Clean up text data instantly'],
    creator: {
      '@type': 'Personal',
      name: 'Tariqul Islam',
      url: 'https://tariqul.dev',
    },
  };

  return (
    <div className="space-y-4">
      <JsonLd data={jsonLd} />
      <LineToolsClient />
    </div>
  );
}
