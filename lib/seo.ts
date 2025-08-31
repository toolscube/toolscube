import type { Metadata } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://naturalsefaa.com';
const SITE_NAME = 'Tools Hub • Natural Sefa';
const SITE_TWITTER = '@toolshub';
const DEFAULT_IMAGE = `${SITE_URL}/og/tools-hub-og.png`;

type BuildMetaInput = {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
  image?: string;
};

export function buildMetadata(input: BuildMetaInput): Metadata {
  const url = new URL(input.path, SITE_URL).toString();
  const image = input.image ?? DEFAULT_IMAGE;

  return {
    title: {
      default: input.title,
      template: `%s • Tools Hub`,
    },
    description: input.description,
    keywords: input.keywords ?? ['url shortener', 'online tools', 'developer tools', 'text utilities', 'pdf tools', 'image converters', 'calculators', 'free tools', 'privacy friendly'],
    category: 'Utilities',

    alternates: { canonical: url },

    robots: {
      index: true,
      follow: true,
      nocache: false,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
        'max-snippet': -1,
        'max-video-preview': -1,
      },
    },

    openGraph: {
      type: 'website',
      url,
      siteName: SITE_NAME,
      title: input.title,
      description: input.description,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: input.title,
        },
      ],
    },

    twitter: {
      card: 'summary_large_image',
      site: SITE_TWITTER,
      creator: SITE_TWITTER,
      title: input.title,
      description: input.description,
      images: [image],
    },

    icons: {
      icon: '/favicon.ico',
      shortcut: '/favicon.ico',
      apple: '/apple-touch-icon.png',
    },

    themeColor: '#ffffff',
    applicationName: 'Tools Hub',
    other: {
      'og:locale': 'en_US',
    },
  };
}
