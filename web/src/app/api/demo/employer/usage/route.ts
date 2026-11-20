import { NextRequest, NextResponse } from "next/server";
import { demoStore } from "@/lib/demo/store";
import { isLocalDemoRequest } from "@/lib/demo/request-guards";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  if (!isLocalDemoRequest(request)) return NextResponse.json({ error: "Subscription usage is unavailable." }, { status: 404 });
  const sessionId = request.cookies.get("rohobot_session")?.value;
  if (!sessionId || request.cookies.get("rohobot_role")?.value !== "employer") {
    return NextResponse.json({ error: "Employer sign-in is required." }, { status: 401 });
  }
  const session = demoStore.sessions.get(sessionId);
  const employer = session?.role === "employer" ? demoStore.employers.get(session.accountId) : undefined;
  if (!employer?.subscription || employer.status !== "Approved") {
    return NextResponse.json({ error: "An approved subscription is required." }, { status: 409 });
  }
  if (Date.parse(employer.subscription.endsAt) <= Date.now()) {
    return NextResponse.json({ error: "This subscription has expired." }, { status: 409 });
  }
  const pkg = demoStore.subscriptionPackages.get(employer.selectedPackage ?? "");
  const capacity = pkg?.annualTraineeCapacity ?? null;
  if (capacity !== null && employer.subscription.traineesUsed >= capacity) {
    return NextResponse.json({ error: "Your annual trainee capacity has been reached." }, { status: 409 });
  }
  employer.subscription.traineesUsed += 1;
  const remaining = capacity === null ? null : Math.max(0, capacity - employer.subscription.traineesUsed);
  return NextResponse.json({
    success: true,
    traineesUsed: employer.subscription.traineesUsed,
    remaining,
    endsAt: employer.subscription.endsAt,
    capacity,
  });
}
