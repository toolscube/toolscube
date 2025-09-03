import JsonLd from '@/components/seo/json-ld';
import AgeCalculatorClient from '@/components/tools/time/age-calculator-client';
import { buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({
  title: 'Age Calculator • Tools Hub',
  description: 'Instantly calculate exact age from date of birth — years, months, days, next birthday, and more. Copy-friendly and timezone-safe.',
  path: '/tools/time/age',
  keywords: ['age calculator', 'date of birth', 'DOB to age', 'years months days', 'next birthday', 'Tools Hub'],
});

export default function Page() {
  const site = process.env.NEXT_PUBLIC_SITE_URL;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Age Calculator — Tools Hub',
    url: `${site}/tools/time/age`,
    applicationCategory: 'UtilitiesApplication',
    operatingSystem: 'Web',
    description: 'Calculate precise age from date of birth with years, months, days, and next birthday details. Copy/share results easily.',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    featureList: ['DOB picker & Today shortcut', 'Exact years, months, days', 'Next birthday & weekday', 'Copy & share results'],
    creator: {
      '@type': 'Personal',
      name: 'Tariqul Islam',
      url: 'https://tariqul.dev',
    },
  };

  return (
    <div className="space-y-4">
      <JsonLd data={jsonLd} />

      {/* Interactive client component */}
      <AgeCalculatorClient />
    </div>
  );
}
