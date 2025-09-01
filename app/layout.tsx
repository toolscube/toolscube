import type { Metadata } from 'next';
import { Toaster } from 'react-hot-toast';
import './globals.css';

import { Inter, JetBrains_Mono, Space_Grotesk } from 'next/font/google';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-space-grotesk' });
const jetbrains = JetBrains_Mono({ subsets: ['latin'], variable: '--font-jetbrains' });

export const metadata: Metadata = {
  title: {
    default: 'Tools Hub — Fast, Free, Privacy-Friendly Online Tools',
    template: '%s • Tools Hub',
  },
  description: 'URL shortener, PDF tools, image converters, text utilities, developer helpers, and calculators — all in one place.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://naturalsefaa.com'),
  keywords: ['online tools', 'url shortener', 'pdf tools', 'image converter', 'text utilities', 'developer tools', 'calculators', 'free tools', 'privacy friendly', 'natural sefa'],
  authors: [{ name: 'Tariqul Islam', url: 'https://tariqul.dev' }],
  creator: 'Tariqul Islam',
  publisher: 'Tariqul Islam',
  category: 'Utilities',

  openGraph: {
    title: 'Tools Hub — Fast, Free, Privacy-Friendly Online Tools',
    description: 'Fast, free, privacy-friendly online tools. Shorten links, convert files, optimize images, and more.',
    type: 'website',
    url: 'https://naturalsefaa.com/tools',
    siteName: 'Tools Hub',
    images: [
      {
        url: 'https://naturalsefaa.com/og/tools-hub-og.png',
        width: 1200,
        height: 630,
        alt: 'Tools Hub',
      },
    ],
  },

  twitter: {
    card: 'summary_large_image',
    site: '@toolshub',
    creator: '@toolshub',
    title: 'Tools Hub — Fast, Free, Privacy-Friendly Online Tools',
    description: 'Shorten links, convert files, optimize images, and more. 100% free and privacy-first.',
    images: ['https://naturalsefaa.com/og/tools-hub-og.png'],
  },

  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      'max-snippet': -1,
      'max-image-preview': 'large',
      'max-video-preview': -1,
    },
  },

  alternates: {
    canonical: 'https://toolshub.com/tools',
  },

  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },

  themeColor: '#ffffff',
  applicationName: 'Tools Hub',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const darkTheme = {
    style: {
      backgroundColor: '#333',
      color: '#fff',
    },
    iconTheme: {
      primary: '#fff',
      secondary: '#333',
    },
  };

  return (
    <html lang="en" suppressHydrationWarning className={`dark ${inter.variable} ${spaceGrotesk.variable} ${jetbrains.variable}`}>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <main className="mx-auto px-4">{children}</main>
        <Toaster toastOptions={{ style: darkTheme.style, iconTheme: darkTheme.iconTheme }} position="top-right" />
      </body>
    </html>
  );
}
