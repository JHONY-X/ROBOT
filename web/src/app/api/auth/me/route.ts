import { NextRequest, NextResponse } from "next/server";
import { appRoleFromJwt, readJwtClaims } from "@/lib/auth/backend";
import { isLocalDemoRequest } from "@/lib/demo/request-guards";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  if (!isLocalDemoRequest(request)) {
    // ----- Real session path -----
    const sessionId = request.cookies.get('rohobot_session')?.value;
    if (!sessionId) {
      return NextResponse.json({ error: 'Sign-in is required.' }, { status: 401 });
    }
    const accessToken = request.cookies.get("rohobot_access_token")?.value;
    const claims = accessToken ? readJwtClaims(accessToken) : null;
    const role = accessToken ? appRoleFromJwt(accessToken) : null;
    if (!claims || !role || claims.user_id === undefined) {
      return NextResponse.json({ error: "Session not found or expired." }, { status: 401 });
    }
    return NextResponse.json({
      account: {
        id: claims.user_id,
        role,
        name: claims.full_name ?? claims.email_address ?? "Account",
        email: claims.email_address ?? "",
      },
    });
  }

  const sessionId = request.cookies.get("rohobot_session")?.value;
  const role = request.cookies.get("rohobot_role")?.value;
  if (!sessionId || (role !== "candidate" && role !== "employer" && role !== "admin")) {
    return NextResponse.json({ error: "Sign-in is required." }, { status: 401 });
  }

  const { getDemoSessionIdentity } = await import("@/lib/demo/invitations");
  const account = getDemoSessionIdentity(sessionId);
  if (!account || account.role !== role) {
    return NextResponse.json({ error: "Demo session has expired or was lost." }, { status: 401 });
  }

  return NextResponse.json({ account });
}
