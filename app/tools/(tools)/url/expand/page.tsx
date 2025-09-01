import JsonLd from '@/components/seo/json-ld';
import LinkExpandClient from '@/components/tools/url/link-expand-client';
import { buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({
  title: 'Link Expander • Tools Hub',
  description: 'Unshorten links, inspect the full redirect chain, and safely preview the final destination. Works with t.co, bit.ly, and more.',
  path: '/tools/url/expand',
  keywords: ['link expander', 'unshorten URL', 'redirect chain', 'safe link preview', 't.co', 'bit.ly', 'URL inspection', 'Bangladesh', 'Tools Hub'],
});

export default function Page() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Link Expander — Tools Hub',
    url: `${process.env.NEXT_PUBLIC_SITE_URL}/tools/url/expand`,
    applicationCategory: 'UtilitiesApplication',
    operatingSystem: 'Web',
    description: 'Expand shortened links, see the full redirect chain, and preview Open Graph data. Fast, secure, and free.',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    featureList: ['Redirect chain', 'Detect known shorteners', 'OG title/description/image', 'CSV export of history'],
    creator: {
      '@type': 'Person',
      name: 'Tariqul Islam',
      url: 'https://tariqul.dev',
    },
  };

  return (
    <div className="space-y-4">
      <JsonLd data={jsonLd} />
      <LinkExpandClient />
    </div>
  );
}
