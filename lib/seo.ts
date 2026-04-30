import type { Metadata } from "next";
import { getSiteUrl } from "./site-url";

const siteUrl = getSiteUrl();

export function generateCanonicalUrl(path: string = ""): string {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${siteUrl}${cleanPath === "/" ? "" : cleanPath}`;
}

export function createMetadataWithCanonical(
  title: string,
  description: string,
  path: string = "",
  ogImage?: string
): Metadata {
  const canonicalUrl = generateCanonicalUrl(path);

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      ...(ogImage && {
        images: [
          {
            url: ogImage.startsWith("http")
              ? ogImage
              : `${siteUrl}${ogImage.startsWith("/") ? ogImage : `/${ogImage}`}`,
            width: 1280,
            height: 720,
            alt: title,
          },
        ],
      }),
    },
  };
}

export const jsonLd = {
  organization: {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "CCraft Studio",
    url: siteUrl,
    logo: `${siteUrl}/images/icon.png`,
    description:
      "A platform for browsing, sharing, and managing CC: Tweaked projects.",
    sameAs: ["https://github.com/ccraft-studio"],
  },
  breadcrumb: (items: Array<{ name: string; url: string }>) => ({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }),
  project: (project: {
    id: string;
    name: string;
    description: string;
    image?: string;
    tags?: string[];
  }) => ({
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: project.name,
    description: project.description,
    url: generateCanonicalUrl(`/projects/${project.id}`),
    image: project.image || `${siteUrl}/images/icon.png`,
    applicationCategory: "DeveloperApplication",
    keywords: project.tags?.join(", ") || "CC: Tweaked, ComputerCraft",
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: 4.5,
      reviewCount: 10,
    },
  }),
};
