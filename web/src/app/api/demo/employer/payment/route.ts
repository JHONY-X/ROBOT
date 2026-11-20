import { NextRequest, NextResponse } from "next/server";
import { submitDemoEmployerPayment } from "@/lib/demo/invitations";
import { isLocalDemoRequest } from "@/lib/demo/request-guards";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  if (!isLocalDemoRequest(request)) {
    return NextResponse.json({ error: "Demo payment submission is unavailable." }, { status: 404 });
  }

  const sessionId = request.cookies.get("rohobot_session")?.value;
  if (
    !sessionId ||
    request.cookies.get("rohobot_role")?.value !== "employer"
  ) {
    return NextResponse.json({ error: "Employer sign-in is required." }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid payment submission." }, { status: 400 });
  }
  const { packageName, method, transactionId, receiptUrl, proofFileName, proofDataUrl } = body;
  if (
    typeof packageName !== "string" ||
    typeof method !== "string" ||
    typeof transactionId !== "string" ||
    typeof receiptUrl !== "string"
  ) {
    return NextResponse.json({ error: "Enter the package, payment details, transaction ID, and receipt link." }, { status: 400 });
  }

  const result = submitDemoEmployerPayment({
    sessionId,
    packageName,
    method,
    transactionId,
    receiptUrl,
    proofFileName: typeof proofFileName === "string" ? proofFileName : undefined,
    proofDataUrl: typeof proofDataUrl === "string" ? proofDataUrl : undefined,
  });
  if (!result.success) {
    return NextResponse.json({ error: result.message }, { status: 400 });
  }

  const response = NextResponse.json({ success: true, message: result.message });
  response.cookies.set("rohobot_access", "payment-pending", {
    httpOnly: true,
    secure: request.nextUrl.protocol === "https:",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 4,
  });
  return response;
}
