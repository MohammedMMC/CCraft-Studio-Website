import { prisma } from "@/lib/prisma";
import { getFromBlob } from "@/lib/storage";
import { notFound } from "next/navigation";
import { NextRequest } from "next/server";
import { unzipSync } from "fflate";
import { getSiteUrl } from "@/lib/site-url";

const siteUrl = getSiteUrl();

export async function GET(req: NextRequest, { params }: { params: Promise<{ version: string; }>; }) {
    const { version } = await params;
    if (!version || version.trim() === "") notFound();

    const versionData = await prisma.componentsVersions.findUnique({
        where: { version },
        select: { pathname: true, version: true },
    });
    if (!versionData) notFound();

    const file = await getFromBlob(versionData.pathname, "projects");
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
            const url = `${siteUrl}/componentsVersion/${version}/${encoded}`;
            return `  { path = "${e}", url = "${url}" }`;
        })
        .join(",\n");

    const luaArray = [
        "-- CCraft Studio Components Downloader",
        `-- Components Version: ${versionData.version}`,
        `local version = "${versionData.version}"`,
        "local files = {",
        filesLuaEntries,
        "}",
        "\nlocal function ensureDir(path)",
        "  local parts = {}",
        "  for part in string.gmatch(path, \"[^/]+\") do table.insert(parts, part) end",
        "  table.remove(parts)",
        "  local cur = \"\"",
        "  for i, p in ipairs(parts) do",
        "    cur = (cur == \"\" and p or (cur .. \"/\" .. p))",
        "    if not fs.exists(cur) then fs.makeDir(cur) end",
        "  end",
        "end",
        "\nprint(\"Starting download for: \" .. version)",
        "for i, f in ipairs(files) do",
        "  local fullPath = version .. \"/\" .. f.path",
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
        "print(\"Components Download complete.\")",
        ""
    ];

    return new Response(luaArray.join("\n"), {
        headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Content-Disposition": `attachment; filename="${versionData.version}.lua"`,
        },
    });
}
