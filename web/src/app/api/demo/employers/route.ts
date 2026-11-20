import { NextRequest, NextResponse } from "next/server";
import {
  getDemoEmployerProfile,
  registerDemoEmployer,
  updateDemoEmployerProfile,
  type EmployerRegistrationInput,
  type EmployerProfileInput,
} from "@/lib/demo/invitations";
import { isLocalDemoRequest } from "@/lib/demo/request-guards";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  if (!isLocalDemoRequest(request)) {
    return NextResponse.json({ error: "Demo employer profile is unavailable." }, { status: 404 });
  }
  const sessionId = request.cookies.get("rohobot_session")?.value;
  if (!sessionId || request.cookies.get("rohobot_role")?.value !== "employer") {
    return NextResponse.json({ error: "Employer sign-in is required." }, { status: 401 });
  }
  const profile = getDemoEmployerProfile(sessionId);
  return profile
    ? NextResponse.json({ profile })
    : NextResponse.json({ error: "Employer session was not found." }, { status: 401 });
}

export async function POST(request: NextRequest) {
  if (!isLocalDemoRequest(request)) {
    return NextResponse.json({ error: "Demo registration is unavailable." }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid employer registration." }, { status: 400 });
  }
  if (typeof body !== "object" || body === null) {
    return NextResponse.json({ error: "Complete all employer registration fields." }, { status: 400 });
  }

  const values = body as Record<string, unknown>;
  const keys: (keyof EmployerRegistrationInput)[] = [
    "hrFirstName",
    "hrMiddleName",
    "hrLastName",
    "organizationEmail",
    "password",
  ];
  if (keys.some((key) => typeof values[key] !== "string") ||
      typeof values.confirmPassword !== "string" ||
      values.password !== values.confirmPassword) {
    return NextResponse.json({ error: "Enter the HR contact's name, organization email, and matching passwords." }, { status: 400 });
  }
  const input = Object.fromEntries(keys.map((key) => [key, values[key]])) as EmployerRegistrationInput;
  const result = registerDemoEmployer(input);
  return NextResponse.json(result, { status: result.success ? 201 : 400 });
}

export async function PATCH(request: NextRequest) {
  if (!isLocalDemoRequest(request)) {
    return NextResponse.json({ error: "Demo employer profile is unavailable." }, { status: 404 });
  }
  const sessionId = request.cookies.get("rohobot_session")?.value;
  if (!sessionId || request.cookies.get("rohobot_role")?.value !== "employer") {
    return NextResponse.json({ error: "Employer sign-in is required." }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid organization profile." }, { status: 400 });
  }
  const stringKeys: (keyof EmployerProfileInput)[] = [
    "organizationName",
    "organizationType",
    "city",
    "subcity",
    "organizationPhone",
    "representativePhone",
    "businessLicenseFileName",
    "businessLicenseDataUrl",
  ];
  if (stringKeys.some((key) => typeof body[key] !== "string")) {
    return NextResponse.json({ error: "Complete all organization profile fields." }, { status: 400 });
  }
  const input = Object.fromEntries(stringKeys.map((key) => [key, body[key]])) as EmployerProfileInput;
  const result = updateDemoEmployerProfile(sessionId, input);
  if (!result.success) return NextResponse.json({ error: result.message }, { status: 400 });

  const profile = getDemoEmployerProfile(sessionId);
  const access = profile?.status === "Approved"
    ? "active"
    : profile?.status === "Payment submitted" ? "payment-pending" : "needs-payment";
  const response = NextResponse.json(result);
  response.cookies.set("rohobot_access", access, {
    httpOnly: true,
    secure: request.nextUrl.protocol === "https:",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 4,
  });
  return response;
}
