import type { Metadata } from 'next';
import './globals.css';
import { cn } from '@/lib/utils';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { Toaster } from '@/components/ui/toaster';
import { FirebaseClientProvider } from '@/firebase';
import { AuthProvider } from '@/context/AuthContext';
import { BasketProvider } from '@/context/BasketContext';
import { TravelAssistant } from '@/components/ai/travel-assistant';
import { DynamicBackground } from '@/components/layout/dynamic-background';
import { GoogleAnalytics } from '@next/third-parties/google';
import { generateSiteJsonLd } from '@/lib/seo/json-ld';
import { LocaleProvider } from '@/lib/i18n/locale-provider';
import { BookingDrawer } from '@/components/booking/BookingDrawer';
import { StickyBasketBar } from '@/components/booking/StickyBasketBar';
import { AIProvider } from '@/context/AIContext';


export const metadata: Metadata = {
  title: {
    default: 'Vualiku XP — Authentic Fijian Eco-Tourism Adventures',
    template: '%s | Vualiku XP',
  },
  description:
    'Community-led eco-tourism booking platform for authentic adventure experiences in Vanua Levu, Fiji. River rafting, cultural villages, coastal kayaking & more.',
  keywords: [
    'Fiji tours',
    'eco-tourism Fiji',
    'Vanua Levu adventures',
    'Pacific Islands booking',
    'Fijian cultural tours',
    'adventure tourism Fiji',
    'community-led tourism',
    'Vualiku XP',
  ],
  authors: [{ name: 'Vualiku XP' }],
  creator: 'Vualiku XP',
  openGraph: {
    type: 'website',
    locale: 'en_FJ',
    url: 'https://vualiku-xp.web.app',
    siteName: 'Vualiku XP',
    title: 'Vualiku XP — Authentic Fijian Eco-Tourism Adventures',
    description:
      'Community-led eco-tourism booking platform for authentic adventure experiences in Vanua Levu, Fiji.',
    images: [
      {
        url: 'https://vualiku-xp.web.app/icons/icon-512x512.png',
        width: 512,
        height: 512,
        alt: 'Vualiku XP',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Vualiku XP — Authentic Fijian Eco-Tourism',
    description: 'Community-led adventure booking in Fiji.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

const GA_ID = process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const siteJsonLd = generateSiteJsonLd();

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans&display=swap" rel="stylesheet" />
        <link rel="manifest" href="/manifest.json" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(siteJsonLd) }}
        />
      </head>
      <body className={cn('min-h-screen bg-background font-body antialiased')}>
        <FirebaseClientProvider>
          <LocaleProvider>
            <AuthProvider>
              <BasketProvider>
                <AIProvider>
                  <DynamicBackground />
                  <div className="relative flex min-h-dvh flex-col">
                    <Header />
                    <main className="flex-1">{children}</main>
                    <Footer />
                  </div>
                  <BookingDrawer />
                  <StickyBasketBar />
                  <TravelAssistant />
                  <Toaster />
                </AIProvider>
              </BasketProvider>
            </AuthProvider>
          </LocaleProvider>
        </FirebaseClientProvider>
        {GA_ID && <GoogleAnalytics gaId={GA_ID} />}
      </body>
    </html>
  );
}

