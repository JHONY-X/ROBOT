import { NextRequest, NextResponse } from "next/server";
import { demoStore } from "@/lib/demo/store";
import { isLocalDemoRequest } from "@/lib/demo/request-guards";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  if (!isLocalDemoRequest(request)) return NextResponse.json({ error: "Subscription data is unavailable." }, { status: 404 });
  const packages = [...demoStore.subscriptionPackages.values()].filter((pkg) => pkg.active);
  return NextResponse.json({ packages });
}

export async function PUT(request: NextRequest) {
  if (!isLocalDemoRequest(request)) return NextResponse.json({ error: "Subscription management is unavailable." }, { status: 404 });
  if (request.cookies.get("rohobot_role")?.value !== "admin") {
    return NextResponse.json({ error: "Admin sign-in is required." }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid package data." }, { status: 400 });
  }
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const amount = Number(body.amount);
  const capacity = body.annualTraineeCapacity === null ? null : Number(body.annualTraineeCapacity);
  const discount = Number(body.discountPercent);
  const cost = Number(body.costPerTrainee);
  if (!name || !demoStore.subscriptionPackages.has(name) || !Number.isFinite(amount) || amount < 0 ||
      (capacity !== null && (!Number.isInteger(capacity) || capacity < 0)) ||
      !Number.isFinite(discount) || discount < 0 || discount > 100 ||
      !Number.isFinite(cost) || cost < 0) {
    return NextResponse.json({ error: "Enter valid package values." }, { status: 400 });
  }
  const existing = demoStore.subscriptionPackages.get(name)!;
  demoStore.subscriptionPackages.set(name, {
    ...existing,
    amount,
    annualTraineeCapacity: capacity,
    discountPercent: discount,
    costPerTrainee: cost,
  });
  return NextResponse.json({ success: true, package: demoStore.subscriptionPackages.get(name) });
}
