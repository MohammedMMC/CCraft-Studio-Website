import type { Metadata } from "next";
import localFont from "next/font/local";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next"

const minecraftia = localFont({
  src: "../public/fonts/Minecraftia.ttf",
  variable: "--font-minecraftia",
  display: "swap",
});

export const metadata: Metadata = {
  title: "CCraft Studio",
  description: "Design and Build apps with ease for CC: Tweaked Minecraft mod.",
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
