import type { Metadata } from "next";
import ProjectCard from "@/components/ProjectCard";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { isMissingProjectTablesError } from "@/lib/projects/db-guards";
import ScreenLayout from "../../components/ScreenLayout";
import TagSelectDropdown from "@/components/TagSelectDropdown";
import Button from "@/components/Button";

export const metadata: Metadata = {
  title: "Community",
  description:
    "Explore community-made CC: Tweaked projects, filter by tags, and discover the most liked and downloaded builds.",
  openGraph: {
    title: "Community Projects | CCraft Studio",
    description:
      "Explore community-made CC: Tweaked projects, filter by tags, and discover the most liked and downloaded builds.",
    url: "/community",
    images: ["/images/preview2.png"],
  },
};

type CommunitySearchParams = {
  sortBy?: string | string[];
  sortOrder?: string | string[];
  limit?: string | string[];
  tag?: string | string[];
  q?: string | string[];
};

type SortBy = "date" | "likes" | "downloads";
type SortOrder = "asc" | "desc";

const PAGE_SIZE = 6;

export default async function CommunityPage({
  searchParams,
}: {
  searchParams: Promise<CommunitySearchParams>;
}) {
  const resolvedSearchParams = await searchParams;

  const sortByParam = Array.isArray(resolvedSearchParams.sortBy) ? resolvedSearchParams.sortBy[0] : resolvedSearchParams.sortBy;
  const sortOrderParam = Array.isArray(resolvedSearchParams.sortOrder) ? resolvedSearchParams.sortOrder[0] : resolvedSearchParams.sortOrder;
  const limitParam = Array.isArray(resolvedSearchParams.limit) ? resolvedSearchParams.limit[0] : resolvedSearchParams.limit;
  const tagParams = Array.isArray((resolvedSearchParams.tag || [])) ? (resolvedSearchParams.tag as string[] || []) : [resolvedSearchParams.tag as string | undefined];
  const queryParam = Array.isArray(resolvedSearchParams.q) ? resolvedSearchParams.q[0] : resolvedSearchParams.q;

  const sortOrder: SortOrder = sortOrderParam === "asc" || sortOrderParam === "desc" ? sortOrderParam : "desc";
  const limit = Math.max(PAGE_SIZE, Number.parseInt(limitParam || String(PAGE_SIZE), 10));
  const selectedTags = [...new Set(tagParams.map((tag) => tag?.trim()).filter(v => typeof v === "string").filter(Boolean))];
  const query = (queryParam ?? "").trim();
  const sortBy: SortBy = ["likes", "downloads", "date"].includes(sortByParam || "") ? sortByParam as SortBy : "date";

  const orderBy: Prisma.ProjectOrderByWithRelationInput =
    sortBy === "likes" ? { likes: sortOrder }
      : sortBy === "downloads"
        ? { downloads: sortOrder } : { publishDate: sortOrder };

  const acceptedWhere: Prisma.ProjectWhereInput = {
    reviewed: true,
    reviewLog: { some: { rejected: false } }
  };

  const where: Prisma.ProjectWhereInput = {
    ...acceptedWhere,
    ...(selectedTags.length > 0 ? { tags: { hasSome: selectedTags, } } : {}),
    ...(query ? {
      OR: [
        { name: { contains: query, mode: "insensitive", }, },
        { shortDescription: { contains: query, mode: "insensitive", }, },
      ],
    } : {}),
  };

  const projects = await (async () => {
    try {
      return await prisma.project.findMany({
        where: { ...where },
        orderBy,
        take: limit + 1,
        include: { images: { orderBy: [{ isMain: "desc" }, { createdAt: "asc" }] } }
      });
    } catch (error) {
      if (!isMissingProjectTablesError(error)) {
        throw error;
      }
      return [];
    }
  })();

  const tags = await (async () => {
    try {
      const projectTags = await prisma.project.findMany({
        where: acceptedWhere,
        select: { tags: true }
      });
      return [...new Set(projectTags.flatMap((project) => project.tags.map((tag) => tag.trim()).filter(Boolean)))].sort(
        (a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }),
      );
    } catch (error) {
      if (!isMissingProjectTablesError(error)) {
        throw error;
      }
      return [];
    }
  })();

  const hasMore = projects.length > limit;
  const visibleProjects = hasMore ? projects.slice(0, limit) : projects;

  const nextParams = new URLSearchParams();
  nextParams.set("sortBy", sortBy);
  nextParams.set("sortOrder", sortOrder);
  nextParams.set("limit", String(limit + PAGE_SIZE));

  for (const tag of selectedTags) {
    if (!tag) continue;
    nextParams.append("tag", tag);
  }

  if (query) {
    nextParams.set("q", query);
  }

  const nextQuery = nextParams.toString();

  return (
    <ScreenLayout>
      <section>
        <div className="mb-6 flex flex-wrap items-end gap-4">
          <div className="grow">
            <h1 className="text-lg font-semibold">Community Feed</h1>
            <p className="text-sm text-neutral-600">Discover projects from the community.</p>
          </div>

          <form method="get" action="/community" className="flex flex-wrap items-end gap-2 w-full">
            <label className="flex flex-col gap-1 text-xs font-semibold">
              Sort by
              <select
                name="sortBy"
                defaultValue={sortBy}
                className="px-2 py-1.5 text-sm"
              >
                <option value="date">Date</option>
                <option value="likes">Likes</option>
                <option value="downloads">Downloads</option>
              </select>
            </label>

            <label className="flex flex-col gap-1 text-xs font-semibold">
              Order
              <select
                name="sortOrder"
                defaultValue={sortOrder}
                className="px-2 py-1.5 text-sm"
              >
                <option value="desc">Descending</option>
                <option value="asc">Ascending</option>
              </select>
            </label>

            <TagSelectDropdown tags={tags} initialSelectedTags={selectedTags} />

            <label className="w-full max-w-2xs flex flex-col gap-1 text-xs font-semibold">
              Search
              <input
                name="q"
                defaultValue={query}
                className="h-11 px-2 py-1.5 text-sm"
                placeholder="Name or short description"
              />
            </label>

            <input type="hidden" name="limit" value={String(PAGE_SIZE)} />

            <Button
              type="submit"
              className="cursor-pointer bg-lime px-3! py-2! text-sm font-semibold text-white hover:bg-lime/85"
            >
              Search
            </Button>
          </form>
        </div>

        {visibleProjects.length === 0 ? (
          <div className="cardcb p-4 text-sm text-white/90">
            No projects uploaded yet.
          </div>
        ) : (
          <>
            <div className="grid gap-4 lg:grid-cols-3 sm:grid-cols-2 grid-cols-1">
              {visibleProjects.map((project) => (
                <ProjectCard key={project.id} project={project} view="user" />
              ))}
            </div>

            {hasMore ? (
              <div className="mt-6 flex justify-center">
                <Button
                  href={`/community?${nextQuery}`}
                  className="text-xs px-3! py-2! justify-center"
                >
                  Show More
                </Button>
              </div>
            ) : null}
          </>
        )}
      </section>
    </ScreenLayout>
  );
}