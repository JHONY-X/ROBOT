import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { revokeDemoSession } from "@/lib/demo/invitations";
import { backendRequest } from "@/lib/auth/backend";

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("rohobot_session")?.value;
  if (sessionId) revokeDemoSession(sessionId);

  const refresh = cookieStore.get("rohobot_refresh_token")?.value;
  const access = cookieStore.get("rohobot_access_token")?.value;
  if (refresh) {
    await backendRequest("/user/logout/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(access ? { Authorization: `Bearer ${access}` } : {}),
      },
      body: JSON.stringify({ refresh_token: refresh }),
    }).catch(() => undefined);
  }

  const response = NextResponse.json({ success: true });
  response.cookies.delete("rohobot_session");
  response.cookies.delete("rohobot_role");
  response.cookies.delete("rohobot_access");
  response.cookies.delete("rohobot_access_token");
  response.cookies.delete("rohobot_refresh_token");
  return response;
}
