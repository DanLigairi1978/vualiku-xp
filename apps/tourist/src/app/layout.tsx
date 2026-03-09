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
import { FeatureFlagsProvider } from '@/context/FeatureFlagsContext';
import { MaintenanceGate } from '@/components/layout/MaintenanceGate';
import { BrandingProvider as BrandingContextProvider } from '@/context/BrandingContext';
import { getAdminFirestore } from '@/lib/firebase/admin';


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

async function BrandingProvider() {
  const db = getAdminFirestore();
  let colors = {
    primary: '#2D6A4F',
    secondary: '#1B4332',
    accent: '#E8C547',
    background: '#F8F4EE',
  };

  try {
    const snap = await db.collection('platformConfig').doc('branding').get();
    if (snap.exists) {
      const data = snap.data();
      if (data?.colors) {
        colors = {
          primary: data.colors.primary || colors.primary,
          secondary: data.colors.secondary || colors.secondary,
          accent: data.colors.accent || colors.accent,
          background: data.colors.background || colors.background,
        };
      }
    }
  } catch (error) {
    console.error('Failed to fetch branding config:', error);
  }

  const cssVariables = `
    :root {
      --color-primary: ${colors.primary};
      --color-secondary: ${colors.secondary};
      --color-accent: ${colors.accent};
      --color-background: ${colors.background};
    }
  `;

  return <style dangerouslySetInnerHTML={{ __html: cssVariables }} />;
}

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
        <BrandingProvider />
      </head>
      <body className={cn('min-h-screen bg-background font-body antialiased')}>
        <FirebaseClientProvider>
          <LocaleProvider>
            <BrandingContextProvider>
              <AuthProvider>
                <BasketProvider>
                  <AIProvider>
                    <FeatureFlagsProvider>
                      <MaintenanceGate>
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
                      </MaintenanceGate>
                    </FeatureFlagsProvider>
                  </AIProvider>
                </BasketProvider>
              </AuthProvider>
            </BrandingContextProvider>
          </LocaleProvider>
        </FirebaseClientProvider>
        {GA_ID && <GoogleAnalytics gaId={GA_ID} />}
      </body>
    </html>
  );
}

