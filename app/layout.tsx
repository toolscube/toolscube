import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Tools Hub — Fast, Free, Privacy-Friendly Online Tools',
  description: 'URL shortener, PDF tools, image converters, text utilities, developer helpers, and calculators — all in one place.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  openGraph: {
    title: 'Tools Hub',
    description: 'Fast, free, privacy-friendly online tools. Shorten links, convert files, optimize images, and more.',
    type: 'website',
    url: '/',
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <body className="min-h-screen bg-background text-foreground antialiased">
        <div className="mx-auto px-4">{children}</div>
      </body>
    </html>
  );
}
