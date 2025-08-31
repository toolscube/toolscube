import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

// app/layout.tsx

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
    <html lang="en" suppressHydrationWarning className="dark">
      <body className="min-h-screen bg-background text-foreground antialiased">
        <div className="mx-auto px-4">{children}</div>
        <Toaster toastOptions={{ style: darkTheme.style, iconTheme: darkTheme.iconTheme }} position="top-right" />
      </body>
    </html>
  );
}
