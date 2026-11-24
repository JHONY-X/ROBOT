import type { NextRequest } from "next/server";

export function isLocalDemoRequest(_request: NextRequest): boolean {
  return true;
}

export function isLocalDemoAdmin(request: NextRequest): boolean {
  return (
    request.cookies.get("rohobot_role")?.value === "admin" &&
    Boolean(request.cookies.get("rohobot_session")?.value)
  );
}
