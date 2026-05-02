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

    const isTemp = id.startsWith("temp_");

    const fetchedProject = isTemp ? null : await prisma.project.findFirst({
        where: {
            OR: [
                { id: id },
                { name: id },
            ],
        },
        select: { name: true, files: { select: { pathname: true, componentsVersion: true } } },
    });
    if (!isTemp && !fetchedProject) notFound();

    const project = fetchedProject as NonNullable<typeof fetchedProject>;

    const projectFiles = isTemp ? await prisma.tempProjectFiles.findUnique({
        where: { id: id.slice(5) },
        select: { pathname: true, componentsVersion: true },
    }) : project.files;
    if (!projectFiles) notFound();

    const componentsVersionUrl = `${siteUrl}/componentsVersion/${encodeURIComponent(projectFiles.componentsVersion)}`;

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

    const luaArray = [
        "-- CCraft Studio Project Downloader",
        `-- Project: ${isTemp ? "Temporary Project" : project.name}`,
        `local projectName = "${isTemp ? "Temporary Project" : project.name}"`,
        `local componentsVersion = "${projectFiles.componentsVersion}"`,
        "local files = {",
        filesLuaEntries,
        "}",
        "local function ensureDir(path)",
        "  local parts = {}",
        "  for part in string.gmatch(path, \"[^/]+\") do table.insert(parts, part) end",
        "  table.remove(parts)",
        "  local cur = \"\"",
        "  for i, p in ipairs(parts) do",
        "    cur = (cur == \"\" and p or (cur .. \"/\" .. p))",
        "    if not fs.exists(cur) then fs.makeDir(cur) end",
        "  end",
        "end",
        "",
        "print(\"Starting download for: \" .. projectName)",
        "for i, f in ipairs(files) do",
        "  local fullPath = projectName .. \"/\" .. f.path",
        "  ensureDir(fullPath)",
        "  print(\"Downloading: \" .. f.path)",
        "  local ok, res = pcall(http.get, f.url)",
        "  if ok and res then",
        "    local content = res.readAll()",
        "    local handle = fs.open(fullPath, \"w\")",
        "    handle.write(content)",
        "    handle.close()",
        "    res.close()",
        "  else",
        "    print(\"Failed to download: \" .. f.path)",
        "  end",
        "end",
        "",
        `shell.run("wget run ${componentsVersionUrl}")`,
        `shell.run("mv \"" .. componentsVersion .. "/*\"" .. " " .. projectName)`,
        `shell.run("rm \"" .. componentsVersion .. "\"")`,
        "",
        "print(\"Project Download complete. Open /\" .. projectName .. \" to view files.\")",
    ];

    return new Response(luaArray.join("\n"), {
        headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Content-Disposition": `attachment; filename="${isTemp ? "Temporary Project" : project.name}.lua"`,
        },
    });
}