import { NextRequest, NextResponse } from "next/server";
import { authenticateDemoAccount } from "@/lib/demo/invitations";
import { isLocalDemoRequest } from "@/lib/demo/request-guards";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  if (!isLocalDemoRequest(request)) {
    // ----- Real authentication path -----
    // Parse request body
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
      (requestedRole !== "candidate" && requestedRole !== "employer" && requestedRole !== "admin")
    ) {
      return NextResponse.json({ error: "Enter your registered email and password." }, { status: 400 });
    }

    // Simple in‑memory user lookup
    const { realAccounts, createSession } = await import("@/lib/auth/real");
    const account = realAccounts.find((a) => a.email === email && a.password === password && a.role === requestedRole);
    if (!account) {
      return NextResponse.json({ error: "Email/password is incorrect." }, { status: 401 });
    }
    const sessionId = createSession(account);
    const accessState = "active"; // simplistic for demo
    const response = NextResponse.json({
      success: true,
      role: account.role,
      name: account.name,
      status: account.status,
      destination: account.role === "admin" ? "/admin" : account.role === "candidate" ? "/candidate" : "/employer",
    });
    const cookieOptions = {
      httpOnly: true,
      secure: request.nextUrl.protocol === "https:",
      sameSite: "lax" as const,
      path: "/",
      maxAge: 60 * 60 * 4,
    };
    response.cookies.set("rohobot_session", sessionId, cookieOptions);
    response.cookies.set("rohobot_role", account.role, cookieOptions);
    response.cookies.set("rohobot_access", accessState, cookieOptions);
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
    (requestedRole !== "candidate" && requestedRole !== "employer" && requestedRole !== "admin")
  ) {
    return NextResponse.json({ error: "Enter your registered email and password." }, { status: 400 });
  }

  const account = authenticateDemoAccount(email, password);
  if (!account || account.role !== requestedRole) {
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
