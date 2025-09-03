import JsonLd from '@/components/seo/json-ld';
import TimeZoneConverterClient from '@/components/tools/time/timezone-converter-client';
import { buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({
  title: 'Time Zone Converter • Tools Hub',
  description: 'Convert time across cities and countries with ease. Instantly compare different time zones and copy/share results.',
  path: '/tools/time/timezone',
  keywords: ['time zone converter', 'world clock', 'city time', 'convert time', 'timezone comparison', 'Tools Hub'],
});

export default function Page() {
  const site = process.env.NEXT_PUBLIC_SITE_URL;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Time Zone Converter — Tools Hub',
    url: `${site}/tools/time/timezone`,
    applicationCategory: 'UtilitiesApplication',
    operatingSystem: 'Web',
    description: 'Convert time between different cities and time zones. Easily copy and share converted times.',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    featureList: ['Search & pick cities', 'Compare multiple time zones', 'DST aware conversion', 'Copy/share results'],
    creator: {
      '@type': 'Organization',
      name: 'Tools Hub',
      url: site,
    },
  };

  return (
    <div className="space-y-4">
      <JsonLd data={jsonLd} />

      {/* Interactive client component */}
      <TimeZoneConverterClient />
    </div>
  );
}
