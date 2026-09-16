import type { Metadata } from "next";
import "./globals.css";
import { SmoothScrollProvider, SpringMouseProvider } from "@/components/providers";

export const metadata: Metadata = {
  title: "Shader Development Studio",
  description:
    "Empowering Your Business with Next-Generation Interactive 3D and AI Solutions. Based in Sweden and Working with Brands and Agencies Worldwide.",
  metadataBase: new URL("https://www.shader.se"),
  openGraph: {
    title: "Shader Development Studio",
    description:
      "Empowering Your Business with Next-Generation Interactive 3D and AI Solutions. Based in Sweden and Working with Brands and Agencies Worldwide.",
    url: "https://www.shader.se",
    siteName: "Shader Development Studio",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "Shader Studio",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Shader Development Studio",
    description:
      "Empowering Your Business with Next-Generation Interactive 3D and AI Solutions. Based in Sweden and Working with Brands and Agencies Worldwide.",
    images: ["/og.png"],
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Shader Development Studio",
    description:
      "Empowering Your Business with Next-Generation Interactive 3D and AI Solutions. Based in Sweden and Working with Brands and Agencies Worldwide.",
    email: "hello@shader.se",
    legalName: "Shader Sweden AB",
    taxID: "5593233140",
    url: "https://www.shader.se",
    logo: {
      "@type": "ImageObject",
      url: "https://www.shader.se/logo.png",
    },
    address: {
      "@type": "PostalAddress",
      streetAddress: "Laxholmstorget 3",
      addressLocality: "Norrköping",
      postalCode: "602 21",
      addressCountry: "SE",
    },
  };

  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=STIX+Two+Text:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600&family=JetBrains+Mono:wght@400;500&family=VT323&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="bg-black text-foreground antialiased selection:bg-gold-400 selection:text-black">
        <SmoothScrollProvider>
          <SpringMouseProvider>
            {children}
          </SpringMouseProvider>
        </SmoothScrollProvider>
      </body>
    </html>
  );
}
