import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

const contentSecurityPolicy = `
  default-src 'self';
  base-uri 'self';
  object-src 'none';
  frame-ancestors 'none';
  form-action 'self';
  script-src 'self' 'unsafe-inline' ${isDev ? "'unsafe-eval'" : ""} https://*.clerk.com https://clerk.ccraft.studio https://accounts.ccraft.studio https://va.vercel-scripts.com https://static.cloudflareinsights.com;
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: blob: https://*.public.blob.vercel-storage.com https://img.clerk.com https://clerk.ccraft.studio https://accounts.ccraft.studio;
  font-src 'self' data:;
  connect-src 'self' ${isDev ? "ws: wss:" : ""} https://*.clerk.com https://clerk.ccraft.studio https://accounts.ccraft.studio https://clerk-telemetry.com https://vitals.vercel-insights.com https://cloudflareinsights.com;
  frame-src 'self' https://*.clerk.com https://clerk.ccraft.studio https://accounts.ccraft.studio https://challenges.cloudflare.com;
  upgrade-insecure-requests;
`;

const securityHeaders = [
  {
    key: "Content-Security-Policy",
    value: contentSecurityPolicy.replace(/\s{2,}/g, " ").trim(),
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
];

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.1.31"],
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
      },
      {
        protocol: 'https',
        hostname: 'img.clerk.com',
      },
    ],
  },
};

export default nextConfig;
