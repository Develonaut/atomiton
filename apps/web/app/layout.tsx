import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Providers from "@/components/Providers";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Brainwave 2",
  description: "Brainwave 2",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html className="text-[1rem]" lang="en">
      <head>
        {/* Description no longer than 155 characters */}
        <meta
          name="description"
          content="Fully coded Next.js UI kit with a complete design system, 3D visuals, dark mode, and AI-inspired components for modern web apps."
        />
        {/* Product Name */}
        <meta
          name="product-name"
          content="Brainwave 2.0 – AI-Powered 3D UI Kit"
        />
        {/* Twitter Card data */}
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:site" content="@ui8" />
        <meta
          name="twitter:title"
          content="Brainwave 2.0 – AI-Powered 3D UI Kit"
        />
        <meta
          name="twitter:description"
          content="Fully coded Next.js UI kit with a complete design system, 3D visuals, dark mode, and AI-inspired components for modern web apps."
        />
        <meta name="twitter:creator" content="@ui8" />
        <meta name="twitter:image" content="%PUBLIC_URL%/twitter-card.png" />
        {/* Open Graph data for Facebook */}
        <meta
          property="og:title"
          content="Brainwave 2.0 – AI-Powered 3D UI Kit"
        />
        <meta property="og:type" content="Article" />
        <meta
          property="og:url"
          content="https://ui8.net/ui8/products/brainwave-20-ai-powered-3d-ui-kit"
        />
        <meta property="og:image" content="%PUBLIC_URL%/fb-og-image.png" />
        <meta
          property="og:description"
          content="Fully coded Next.js UI kit with a complete design system, 3D visuals, dark mode, and AI-inspired components for modern web apps."
        />
        <meta
          property="og:site_name"
          content="Brainwave 2.0 – AI-Powered 3D UI Kit"
        />
        <meta property="fb:admins" content="132951670226590" />
        {/* Open Graph data for LinkedIn */}
        <meta
          property="og:title"
          content="Brainwave 2.0 – AI-Powered 3D UI Kit"
        />
        <meta
          property="og:url"
          content="https://ui8.net/ui8/products/brainwave-20-ai-powered-3d-ui-kit"
        />
        <meta
          property="og:image"
          content="%PUBLIC_URL%/linkedin-og-image.png"
        />
        <meta
          property="og:description"
          content="Fully coded Next.js UI kit with a complete design system, 3D visuals, dark mode, and AI-inspired components for modern web apps."
        />
        {/* Open Graph data for Pinterest */}
        <meta
          property="og:title"
          content="Brainwave 2.0 – AI-Powered 3D UI Kit"
        />
        <meta
          property="og:url"
          content="https://ui8.net/ui8/products/brainwave-20-ai-powered-3d-ui-kit"
        />
        <meta
          property="og:image"
          content="%PUBLIC_URL%/pinterest-og-image.png"
        />
        <meta
          property="og:description"
          content="Fully coded Next.js UI kit with a complete design system, 3D visuals, dark mode, and AI-inspired components for modern web apps."
        />
      </head>
      <body
        className={`${inter.variable} bg-surface-01 font-inter text-body-md text-primary antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
