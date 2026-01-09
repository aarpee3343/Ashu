// app/layout.tsx
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Providers from "./providers";
import { Toaster } from "react-hot-toast";
import Script from "next/script";

const inter = Inter({ subsets: ["latin"] });

// SEO Metadata
export const metadata = {
  title: "ReviveHub | Find Healthcare Specialists & Book Appointments",
  description: "Connect with trusted physiotherapists, nutritionists, speech therapists, and dietitians. Book online consultations, video calls, or home visits. Your health, revived.",
  keywords: "healthcare, physiotherapist, nutritionist, speech therapist, dietitian, doctor appointment, online consultation, medical services, health platform",
  authors: [{ name: "ReviveHub" }],
  creator: "ReviveHub",
  publisher: "ReviveHub",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://revivehub.com',
    title: 'ReviveHub | Healthcare Specialists Platform',
    description: 'Connect with trusted healthcare specialists for online consultations and appointments.',
    siteName: 'ReviveHub',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'ReviveHub - Healthcare Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ReviveHub | Healthcare Specialists Platform',
    description: 'Connect with trusted healthcare specialists for online consultations.',
    images: ['/og-image.png'],
    creator: '@revivehub',
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
  },
  themeColor: '#3b82f6',
  category: 'healthcare',
  verification: {
    google: 'your-google-verification-code', // Add when you have it
    yandex: 'your-yandex-verification-code',
    yahoo: 'your-yahoo-verification-code',
    other: {
      me: ['your-email@revivehub.com'],
    },
  },
};

// JSON-LD Structured Data for better SEO
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'MedicalOrganization',
  name: 'ReviveHub',
  url: 'https://revivehub.com',
  logo: 'https://revivehub.com/logo.png',
  description: 'Healthcare platform connecting patients with specialists',
  medicalSpecialty: ['Physiotherapy', 'Nutrition', 'Speech Therapy', 'Dietetics'],
  address: {
    '@type': 'PostalAddress',
    addressCountry: 'IN',
  },
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: '+91-XXXXXXXXXX',
    contactType: 'customer service',
  },
  sameAs: [
    'https://facebook.com/revivehub',
    'https://twitter.com/revivehub',
    'https://instagram.com/revivehub',
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        {/* Favicons */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.png" type="image/png" sizes="32x32" />
        <link rel="apple-touch-icon" href="/apple-icon.png" />
        
        {/* Preload critical assets */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        
        {/* Mobile specific meta tags */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#3b82f6" />
      </head>
      <body className={`${inter.className} bg-gray-50`}>
        {/* Google Analytics Script (add your ID) */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-XXXXXXXXXX');
          `}
        </Script>
        
        <Providers>
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1 w-full pt-0">
              {children}
            </main>
            <Toaster 
              position="top-right"
              toastOptions={{
                duration: 3000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
                success: {
                  duration: 3000,
                  theme: {
                    primary: 'green',
                    secondary: 'black',
                  },
                },
              }}
            />
          </div>
        </Providers>
      </body>
    </html>
  );
}