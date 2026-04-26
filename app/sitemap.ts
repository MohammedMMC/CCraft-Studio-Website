import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { getSiteUrl } from "@/lib/site-url";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${siteUrl}/`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${siteUrl}/community`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/pp`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${siteUrl}/tos`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3,
    },
  ];

  const projectRoutes = await (async () => {
    try {
      const projects = await prisma.project.findMany({
        where: {
          reviewed: true,
        },
        select: {
          id: true,
          projectUpdatedAt: true,
          updatedAt: true,
        },
        orderBy: {
          projectUpdatedAt: "desc",
        },
      });

      return projects.map((project) => ({
        url: `${siteUrl}/projects/${project.id}`,
        lastModified: project.projectUpdatedAt ?? project.updatedAt,
        changeFrequency: "weekly" as const,
        priority: 0.8,
      }));
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("sitemap project route generation failed", error);
      }
      return [];
    }
  })();

  return [...staticRoutes, ...projectRoutes];
}
