import JsonLd from '@/components/seo/json-ld';
import TextCleanerClient from '@/components/tools/text/text-cleaner-client';
import { buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({
  title: 'Text Cleaner • Tools Hub',
  description: 'Remove extra spaces, emojis, HTML, punctuation, diacritics, or unwanted characters from your text. Normalize, clean, and format text instantly with this free online text cleaner.',
  path: '/tools/text/cleaner',
  keywords: ['text cleaner', 'remove spaces', 'remove emojis', 'strip HTML', 'remove punctuation', 'remove diacritics', 'ascii only', 'clean text online', 'Tools Hub'],
});

export default function Page() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Text Cleaner — Tools Hub',
    url: `${process.env.NEXT_PUBLIC_SITE_URL}/tools/text/cleaner`,
    applicationCategory: 'UtilitiesApplication',
    operatingSystem: 'Web',
    description: 'Free online text cleaner tool to remove spaces, emojis, HTML tags, punctuation, diacritics, and more. Quickly normalize and format text for clean results.',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    featureList: [
      'Remove extra spaces & newlines',
      'Trim lines and remove empty lines',
      'Remove emojis, URLs, emails',
      'Strip HTML tags & decode entities',
      'Remove punctuation & diacritics',
      'Convert case: lowercase, uppercase, sentence, title',
    ],
    creator: {
      '@type': 'Personal',
      name: 'Tariqul Islam',
      url: 'https://tariqul.dev',
    },
  };

  return (
    <div className="space-y-4">
      <JsonLd data={jsonLd} />
      <TextCleanerClient />
    </div>
  );
}
