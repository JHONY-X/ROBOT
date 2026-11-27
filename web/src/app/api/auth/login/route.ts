import { NextRequest, NextResponse } from "next/server";
import { appRoleFromJwt, backendErrorMessage, backendRequest, readBackendBody } from "@/lib/auth/backend";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const demoLoginEnabled = process.env.NODE_ENV !== "production" && process.env.NEXT_PUBLIC_ENABLE_DEMO_LOGIN === "true";
  if (!demoLoginEnabled) {
    let email: unknown;
    let password: unknown;
    let requestedRole: unknown;
    try {
      ({ email, password, role: requestedRole } = await request.json());
    } catch {
      return NextResponse.json({ error: "Enter your registered email and password." }, { status: 400 });
    }
    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      (requestedRole !== undefined && requestedRole !== "candidate" && requestedRole !== "employer" && requestedRole !== "admin")
    ) {
      return NextResponse.json({ error: "Enter your registered email and password." }, { status: 400 });
    }

    const backendResponse = await backendRequest("/user/login/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email_address: email, password }),
    });
    const backendBody = await readBackendBody(backendResponse);
    if (!backendResponse.ok || !backendBody || typeof backendBody !== "object") {
      return NextResponse.json(
        { error: backendErrorMessage(backendBody, "Email/password is incorrect.") },
        { status: backendResponse.status || 401 },
      );
    }

    const { access, refresh } = backendBody as { access?: unknown; refresh?: unknown };
    if (typeof access !== "string" || typeof refresh !== "string") {
      return NextResponse.json({ error: "The backend returned an invalid login response." }, { status: 502 });
    }

    const role = appRoleFromJwt(access);
    if (!role || (requestedRole !== undefined && role !== requestedRole)) {
      return NextResponse.json({ error: "The account role does not match the selected sign-in form." }, { status: 403 });
    }

    const response = NextResponse.json({
      success: true,
      role,
      destination: role === "admin" ? "/admin" : role === "candidate" ? "/candidate" : "/employer",
    });
    const cookieOptions = {
      httpOnly: true,
      secure: request.nextUrl.protocol === "https:",
      sameSite: "lax" as const,
      path: "/",
      maxAge: 60 * 60 * 4,
    };
    response.cookies.set("rohobot_session", "authenticated", cookieOptions);
    response.cookies.set("rohobot_role", role, cookieOptions);
    response.cookies.set("rohobot_access", "active", cookieOptions);
    response.cookies.set("rohobot_access_token", access, cookieOptions);
    response.cookies.set("rohobot_refresh_token", refresh, cookieOptions);
    return response;
  }

  let email: unknown;
  let password: unknown;
  let requestedRole: unknown;
  try {
    ({ email, password, role: requestedRole } = await request.json());
  } catch {
    return NextResponse.json({ error: "Enter your registered email and password." }, { status: 400 });
  }

  if (
    typeof email !== "string" ||
    typeof password !== "string" ||
    (requestedRole !== undefined && requestedRole !== "candidate" && requestedRole !== "employer" && requestedRole !== "admin")
  ) {
    return NextResponse.json({ error: "Enter your registered email and password." }, { status: 400 });
  }

  const { authenticateDemoAccount } = await import("@/lib/demo/invitations");
  const account = authenticateDemoAccount(email, password);
  if (!account || (requestedRole !== undefined && account.role !== requestedRole)) {
    return NextResponse.json(
      { error: "Email/password is incorrect, or the account has not completed email verification." },
      { status: 401 }
    );
  }

  const accessState =
    account.role === "admin"
      ? "active"
      : account.role === "candidate"
        ? account.status === "Approved"
          ? "active"
          : "pending-review"
        : account.status === "Approved"
          ? "active"
          : account.status === "Profile incomplete"
            ? "profile-incomplete"
            : account.status === "Payment submitted"
              ? "payment-pending"
              : "needs-payment";
  const response = NextResponse.json({
    success: true,
    role: account.role,
    name: account.name,
    status: account.status,
    destination:
      account.role === "admin"
        ? "/admin"
        : account.role === "candidate"
          ? accessState === "active" ? "/candidate" : "/candidate/status"
          : accessState === "active"
            ? "/employer"
            : accessState === "profile-incomplete"
              ? "/employer/profile"
              : accessState === "payment-pending"
                ? "/employer/pending"
                : "/employer/packages",
  });
  const cookieOptions = {
    httpOnly: true,
    secure: request.nextUrl.protocol === "https:",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 60 * 60 * 4,
  };
  response.cookies.set("rohobot_session", account.sessionId, cookieOptions);
  response.cookies.set("rohobot_role", account.role, cookieOptions);
  response.cookies.set("rohobot_access", accessState, cookieOptions);
  return response;
}
