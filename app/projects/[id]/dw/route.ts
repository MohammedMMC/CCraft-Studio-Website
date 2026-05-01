import { prisma } from "@/lib/prisma";
import { getFromBlob } from "@/lib/storage";
import { notFound } from "next/navigation";
import { NextRequest } from "next/server";
import { unzipSync } from "fflate";
import { getSiteUrl } from "@/lib/site-url";

const siteUrl = getSiteUrl();

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string; }>; }) {
    const { id } = await params;
    if (!id?.trim()) notFound();

    const isTemp = id.startsWith("temp");

    const fetchedProject = isTemp ? null : await prisma.project.findFirst({
        where: {
            OR: [
                { id: id },
                { name: id },
            ],
        },
        select: { name: true, files: { select: { pathname: true } } },
    });
    if (!isTemp && !fetchedProject) notFound();

    const project = fetchedProject as NonNullable<typeof fetchedProject>;

    const projectFiles = isTemp ? await prisma.tempProjectFiles.findUnique({
        where: { id: id.slice(4) },
        select: { pathname: true },
    }) : project.files;
    if (!projectFiles) notFound();

    const file = await getFromBlob(projectFiles.pathname, "projects");
    if (!file || !file.blob || !(file.blob.contentType === "application/zip" || file.blob.contentType === "application/x-zip-compressed")) {
        notFound();
    }

    const arrayBuffer = await new Response(file.stream).arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const unzipped = unzipSync(buffer);
    const entries = Object.keys(unzipped).filter((p) => !p.endsWith("/"));

    const filesLuaEntries = entries
        .map((e) => {
            const encoded = encodeURIComponent(e).replace(/%2F/g, "/");
            const url = `${siteUrl}/projects/${encodeURIComponent(id)}/dw/${encoded}`;
            return `  { path = "${e}", url = "${url}" }`;
        })
        .join(",\n");

    const lua = `-- CCraft Studio project downloader\n-- Project: ${project.name}\nlocal projectName = "${project.name}"\nlocal files = {\n${filesLuaEntries}\n}\n\nlocal function ensureDir(path)\n  local parts = {}\n  for part in string.gmatch(path, "[^/]+") do table.insert(parts, part) end\n  table.remove(parts)\n  local cur = ""\n  for i, p in ipairs(parts) do\n    cur = (cur == "" and p or (cur .. "/" .. p))\n    if not fs.exists(cur) then fs.makeDir(cur) end\n  end\nend\n\nprint("Starting download for: " .. projectName)\nfor i, f in ipairs(files) do\n  local fullPath = projectName .. "/" .. f.path\n  ensureDir(fullPath)\n  print("Downloading: " .. f.path)\n  local ok, res = pcall(http.get, f.url)\n  if ok and res then\n    local content = res.readAll()\n    local handle = fs.open(fullPath, "w")\n    handle.write(content)\n    handle.close()\n    res.close()\n  else\n    print("Failed to download: " .. f.path)\n  end\nend\nprint("Download complete. Open /" .. projectName .. " to view files.")\n`;

    return new Response(lua, {
        headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Content-Disposition": `attachment; filename="${project.name}.lua"`,
        },
    });
}