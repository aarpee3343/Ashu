// components/SEO.tsx
import Head from "next/head";

interface SEOProps {
  title?: string;
  description?: string;
  canonical?: string;
  ogImage?: string;
  ogType?: string;
  twitterCard?: string;
  structuredData?: any;
}

export default function SEO({
  title = "ReviveHub | Healthcare Specialists Platform",
  description = "Connect with trusted physiotherapists, nutritionists, speech therapists, and dietitians. Book online consultations, video calls, or home visits.",
  canonical = "https://revivehub.co.in",
  ogImage = "/og-image.png",
  ogType = "website",
  twitterCard = "summary_large_image",
  structuredData,
}: SEOProps) {
  const pageTitle = title.includes("ReviveHub") ? title : `${title} | ReviveHub`;
  
  return (
    <Head>
      <title>{pageTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content="healthcare, doctors, appointments, online consultation, medical services" />
      <link rel="canonical" href={canonical} />
      
      {/* Open Graph */}
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:site_name" content="ReviveHub" />
      
      {/* Twitter */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      
      {/* Structured Data */}
      {structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      )}
    </Head>
  );
}