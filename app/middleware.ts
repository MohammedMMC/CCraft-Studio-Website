import { hashToken } from "@/lib/auth/userApiToken";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
    const auth = req.headers.get("authorization");

    if (!auth?.startsWith("Bearer ")) {
        return NextResponse.json({ error: "No token" }, { status: 401 });
    }

    const token = auth.slice(7);

    const user = await prisma.user.findUnique({ where: { apiToken: hashToken(token) }, select: { id: true } });
    if (!user) {
        return NextResponse.json({ error: "Invalid token" }, { status: 403 });
    }

    const requestHeaders = new Headers(req.headers);
    requestHeaders.set("x-user-id", user.id);

    return NextResponse.next({
        headers: requestHeaders,
    });
}

export const config = {
    matcher: ["/api/:path*"],
};