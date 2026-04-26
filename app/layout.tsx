import type { Metadata } from "next";
import localFont from "next/font/local";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";

function getSiteUrl() {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.NEXT_PUBLIC_APP_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

  return raw.endsWith("/") ? raw.slice(0, -1) : raw;
}

const minecraftia = localFont({
  src: "../public/fonts/Minecraftia.ttf",
  variable: "--font-minecraftia",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: "CCraft Studio",
    template: "%s | CCraft Studio",
  },
  description: "CCraft Studio is a platform for browsing, sharing, and managing CC: Tweaked projects.",
  applicationName: "CCraft Studio",
  keywords: [
    "CCraft Studio",
    "CC: Tweaked",
    "Minecraft mod",
    "CC: Tweaked projects",
    ".ccproj",
    "Lua",
  ],
  authors: [{ name: "CCraft Studio" }],
  creator: "CCraft Studio",
  publisher: "CCraft Studio",
  icons: {
    icon: "/images/icon.png",
    shortcut: "/images/icon.png",
    apple: "/images/icon.png",
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    siteName: "CCraft Studio",
    title: "CCraft Studio",
    description: "Browse, share, and manage CC: Tweaked projects.",
    url: "/",
    images: [
      {
        url: "/images/icon.png",
        width: 512,
        height: 512,
        alt: "CCraft Studio logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CCraft Studio",
    description: "Browse, share, and manage CC: Tweaked projects.",
    images: ["/images/icon.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${minecraftia.variable} h-full antialiased`}
    >
      <SpeedInsights />
      <Analytics />
      
      <body className="min-h-full flex flex-col">
        <ClerkProvider>{children}</ClerkProvider>
      </body>
    </html>
  );
}
