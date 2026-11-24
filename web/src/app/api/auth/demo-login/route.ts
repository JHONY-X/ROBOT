import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { error: "Demo sign-in has been disabled. Please sign in with your account credentials." },
    { status: 404 }
  );
}
