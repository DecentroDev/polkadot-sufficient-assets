import './globals.css';

import clsx from 'clsx';
import type { Metadata, Viewport } from 'next';

import { fontMono, fontSans } from '@/config/fonts';
import { APP_URL, siteConfig } from '@/config/site';

import { Providers } from './providers';

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: siteConfig.name,
  description: siteConfig.description,
  generator: 'Next.js',
  applicationName: siteConfig.name,
  referrer: 'origin-when-cross-origin',
  keywords: [],
  authors: [{ name: siteConfig.name }],
  creator: siteConfig.name,
  publisher: siteConfig.name,
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    images: [siteConfig.ogImage],
    description: siteConfig.description,
    title: {
      default: siteConfig.name,
      template: `${siteConfig.name} - %s`,
    },
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.name,
    description: siteConfig.description,
    images: [siteConfig.ogImage],
    creator: `@${siteConfig.name}`,
  },
};

export const viewport: Viewport = {
  width: 1,
  themeColor: [
    // { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='en' suppressHydrationWarning>
      <head />
      <body
        suppressHydrationWarning
        className={clsx(
          'min-h-screen bg-background font-sans text-foreground antialiased',
          fontSans.variable,
          fontMono.variable
        )}
      >
        <Providers attribute='class' defaultTheme='dark'>
          {children}
        </Providers>
      </body>
    </html>
  );
}
