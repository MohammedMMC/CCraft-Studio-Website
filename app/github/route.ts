import { LINKS } from "@/lib/links";
import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.redirect(LINKS.GITHUB, { status: 308 });
}

export function HEAD() {
  return NextResponse.redirect(LINKS.GITHUB, { status: 308 });
}
