import JsonLd from '@/components/seo/json-ld';
import WeekNumberClient from '@/components/tools/time/week-number-client';
import { buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({
  title: 'ISO Week Number • Tools Hub',
  description: 'Find the ISO week number, ISO week-year, and the Monday–Sunday date range for any date. DST-safe, fast, and copy-friendly.',
  path: '/tools/time/weekno',
  keywords: ['ISO week', 'week number', 'week of year', 'date range', 'calendar', 'Tools Hub'],
});

export default function Page() {
  const site = process.env.NEXT_PUBLIC_SITE_URL;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'ISO Week Number — Tools Hub',
    url: `${site}/tools/time/weekno`,
    applicationCategory: 'UtilitiesApplication',
    operatingSystem: 'Web',
    description: 'Calculate ISO week number, ISO week-year, and the Monday–Sunday range for any date with copy/share tools.',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    featureList: ['Today/Reset controls', 'Copy results', 'ISO week-year', 'Date range (Mon–Sun)'],
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
      <WeekNumberClient />
    </div>
  );
}
