import "./globals.css";
import { Inter } from "next/font/google";
import { Providers } from "@/components/providers/Providers";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";
import type { Metadata, Viewport } from "next";

const inter = Inter({ subsets: ["latin"] });

const baseUrl = "https://moktab.vercel.app";

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Mokta'b | مكتئب",
  alternateName: "مكتئب",
  description: "منصة تعليمية متطورة لإنشاء وإجراء الاختبارات عبر الإنترنت",
  url: baseUrl,
  logo: `${baseUrl}/Images/Logo1.png`,
  sameAs: [],
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer service",
    availableLanguage: ["Arabic", "English"],
  },
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Mokta'b | مكتئب",
  alternateName: "مكتئب",
  description:
    "منصة تعليمية متطورة لإنشاء وإجراء الاختبارات عبر الإنترنت مع أدوات تحليل متقدمة",
  url: baseUrl,
  potentialAction: {
    "@type": "SearchAction",
    target: `${baseUrl}/search?q={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
};

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "Mokta'b | مكتئب - منصة الاختبارات التعليمية عبر الإنترنت",
    template: "%s | Mokta'b | مكتئب",
  },
  description:
    "منصة تعليمية متطورة لإنشاء وإجراء الاختبارات عبر الإنترنت. أدوات تحليل متقدمة، تقارير تفصيلية، وتجربة تعليمية فريدة للمعلمين والطلاب.",
  keywords: [
    "اختبارات تعليمية",
    "منصة تعليمية",
    "امتحانات عبر الإنترنت",
    "تحليل النتائج",
    "تعليم إلكتروني",
    "Moktab",
    "مكتئب",
    "online quizzes",
    "educational platform",
    "exam platform",
    "learning analytics",
  ],
  authors: [{ name: "Mokta'b Team" }],
  creator: "Mokta'b",
  publisher: "Mokta'b",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  category: "education",
  classification: "Educational Technology",

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  openGraph: {
    type: "website",
    locale: "ar_EG",
    alternateLocale: ["en_US"],
    title: "Mokta'b | مكتئب - منصة الاختبارات التعليمية",
    description:
      "منصة تعليمية متطورة لإنشاء وإجراء الاختبارات عبر الإنترنت مع أدوات تحليل متقدمة وتقارير تفصيلية.",
    url: baseUrl,
    siteName: "Mokta'b",
    images: [
      {
        url: "/Images/Logo1.png",
        width: 1200,
        height: 630,
        alt: "Mokta'b - منصة الاختبارات التعليمية",
        type: "image/png",
      },
      {
        url: "/Images/Logo1.png",
        width: 600,
        height: 315,
        alt: "Mokta'b - منصة الاختبارات التعليمية",
        type: "image/png",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Mokta'b | مكتئب - منصة الاختبارات التعليمية",
    description:
      "منصة تعليمية متطورة لإنشاء وإجراء الاختبارات عبر الإنترنت مع أدوات تحليل متقدمة.",
    images: ["/Images/Logo1.png"],
    creator: "@moktab",
    site: "@moktab",
  },

  other: {
    "google-site-verification": "XmY_2KMylvB5fL9pedfQYmV4Pqj1NmhwVvt07VIVzG4", 
    "msapplication-TileColor": "#2563eb",
    "msapplication-config": "/browserconfig.xml",
    "theme-color": "#2563eb",
    "color-scheme": "light dark",
    "application-name": "Mokta'b",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
    "apple-mobile-web-app-title": "Mokta'b",
    "mobile-web-app-capable": "yes",
    "msapplication-TileImage": "/Images/Logo1.png",
    "msapplication-square70x70logo": "/Images/Logo1.png",
    "msapplication-square150x150logo": "/Images/Logo1.png",
    "msapplication-wide310x150logo": "/Images/Logo1.png",
    "msapplication-square310x310logo": "/Images/Logo1.png",
  },

  alternates: {
    canonical: baseUrl,
    languages: {
      ar: baseUrl,
      en: `${baseUrl}/en`,
    },
  },

  appLinks: {
    web: {
      url: baseUrl,
      should_fallback: true,
    },
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#1f2937" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema),
          }}
        />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(websiteSchema),
          }}
        />

        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />

        <link rel="dns-prefetch" href="//www.google-analytics.com" />
        <link rel="dns-prefetch" href="//www.googletagmanager.com" />

        {/* Favicon - Multiple sizes */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon.ico" type="image/x-icon" />
        <link
          rel="icon"
          href="/favicon-16x16.png"
          sizes="16x16"
          type="image/png"
        />
        <link
          rel="icon"
          href="/favicon-32x32.png"
          sizes="32x32"
          type="image/png"
        />

        {/* Apple Touch Icons */}
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link
          rel="apple-touch-icon"
          href="/apple-touch-icon-57x57.png"
          sizes="57x57"
        />
        <link
          rel="apple-touch-icon"
          href="/apple-touch-icon-60x60.png"
          sizes="60x60"
        />
        <link
          rel="apple-touch-icon"
          href="/apple-touch-icon-72x72.png"
          sizes="72x72"
        />
        <link
          rel="apple-touch-icon"
          href="/apple-touch-icon-76x76.png"
          sizes="76x76"
        />
        <link
          rel="apple-touch-icon"
          href="/apple-touch-icon-114x114.png"
          sizes="114x114"
        />
        <link
          rel="apple-touch-icon"
          href="/apple-touch-icon-120x120.png"
          sizes="120x120"
        />
        <link
          rel="apple-touch-icon"
          href="/apple-touch-icon-144x144.png"
          sizes="144x144"
        />
        <link
          rel="apple-touch-icon"
          href="/apple-touch-icon-152x152.png"
          sizes="152x152"
        />
        <link
          rel="apple-touch-icon"
          href="/apple-touch-icon-180x180.png"
          sizes="180x180"
        />

        {/* Android/Chrome Icons */}
        <link
          rel="icon"
          href="/android-chrome-192x192.png"
          sizes="192x192"
          type="image/png"
        />
        <link
          rel="icon"
          href="/android-chrome-512x512.png"
          sizes="512x512"
          type="image/png"
        />

        {/* Microsoft Tiles */}
        <meta name="msapplication-TileImage" content="/mstile-144x144.png" />
        <meta
          name="msapplication-square70x70logo"
          content="/mstile-70x70.png"
        />
        <meta
          name="msapplication-square150x150logo"
          content="/mstile-150x150.png"
        />
        <meta
          name="msapplication-wide310x150logo"
          content="/mstile-310x150.png"
        />
        <meta
          name="msapplication-square310x310logo"
          content="/mstile-310x310.png"
        />

        <link rel="manifest" href="/manifest.json" />
        <meta
          name="google-site-verification"
          content="XmY_2KMylvB5fL9pedfQYmV4Pqj1NmhwVvt07VIVzG4"
        />
      </head>
      <body className={inter.className}>
        <Providers>
          <Navbar />
          {children}
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
