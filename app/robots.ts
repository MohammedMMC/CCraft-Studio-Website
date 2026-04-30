import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site-url";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl();

  return {
    rules: [
      {
        userAgent: "Googlebot",
        allow: ["/", "/community", "/projects", "/pp", "/tos"],
        disallow: ["/dashboard", "/auth", "/api"],
        crawlDelay: 1,
      },
      {
        userAgent: "*",
        allow: ["/", "/community", "/projects", "/pp", "/tos"],
        disallow: ["/dashboard", "/dashboard/", "/auth", "/auth/", "/api", "/api/"],
        crawlDelay: 2,
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: new URL(siteUrl).host,
  };
}
