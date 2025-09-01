import JsonLd from '@/components/seo/json-ld';
import CaseConverterClient from '@/components/tools/text/case-converter-client';
import { buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({
  title: 'Case Converter • Tools Hub',
  description: 'Convert text between upper, lower, title, sentence, camelCase, PascalCase, snake_case, kebab-case, CONSTANT_CASE, and more. Includes cleanup options and copy/export.',
  path: '/tools/text/case-converter',
  keywords: ['case converter', 'upper case', 'lower case', 'title case', 'sentence case', 'camelCase', 'PascalCase', 'snake_case', 'kebab-case', 'CONSTANT_CASE', 'text tools', 'Tools Hub'],
});

export default function Page() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Case Converter — Tools Hub',
    url: `${process.env.NEXT_PUBLIC_SITE_URL}/tools/text/case-converter`,
    applicationCategory: 'UtilitiesApplication',
    operatingSystem: 'Web',
    description: 'Free online case converter with presets and clean-up pipeline. Transform text to upper, lower, title, sentence, camelCase, PascalCase, snake_case, kebab-case, and more.',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    featureList: ['Upper / lower / title / sentence', 'camelCase / PascalCase', 'snake_case / kebab-case / CONSTANT_CASE', 'Whitespace & punctuation cleanup', 'Copy & download support'],
    creator: {
      '@type': 'Person',
      name: 'Tariqul Islam',
      url: 'https://tariqul.dev',
    },
  };

  return (
    <div className="space-y-4">
      {/* JSON-LD */}
      <JsonLd data={jsonLd} />

      {/* Interactive client component */}
      <CaseConverterClient />
    </div>
  );
}
