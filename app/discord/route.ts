import { NextResponse } from "next/server";

const DISCORD_INVITE_URL = "https://discord.gg/pxUFCxUu5h";

export function GET() {
  return NextResponse.redirect(DISCORD_INVITE_URL, { status: 308 });
}

export function HEAD() {
  return NextResponse.redirect(DISCORD_INVITE_URL, { status: 308 });
}
