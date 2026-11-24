import type { NextRequest } from "next/server";

export function isLocalDemoRequest(_request: NextRequest): boolean {
  return process.env.NEXT_PUBLIC_ENV === "demo";
}

export function isLocalDemoAdmin(request: NextRequest): boolean {
  return (
    request.cookies.get("rohobot_role")?.value === "admin" &&
    Boolean(request.cookies.get("rohobot_session")?.value)
  );
}
