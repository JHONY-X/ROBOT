import { NextRequest, NextResponse } from "next/server";
import { backendErrorMessage, backendRequest, readBackendBody } from "@/lib/auth/backend";

export const runtime = "nodejs";

type RouteRule = { pattern: RegExp; methods: string[]; public?: boolean };
const ROUTES: RouteRule[] = [
  { pattern: /^control\/$/, methods: ["GET", "PATCH"] },
  { pattern: /^create\/$/, methods: ["POST"] },
  { pattern: /^manage\/$/, methods: ["GET"] },
  { pattern: /^manage\/\d+\/$/, methods: ["GET", "PATCH", "DELETE"] },
  { pattern: /^verify-email\/$/, methods: ["POST"], public: true },
];

function cookieOptions(request: NextRequest) {
  return { httpOnly: true, secure: request.nextUrl.protocol === "https:", sameSite: "lax" as const, path: "/" };
}

async function refreshAccessToken(refresh: string) {
  const response = await backendRequest("/user/refresh/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh }),
  });
  const body = await readBackendBody(response);
  if (!response.ok || !body || typeof body !== "object" || typeof (body as { access?: unknown }).access !== "string") return null;
  return {
    access: (body as { access: string }).access,
    refresh: typeof (body as { refresh?: unknown }).refresh === "string" ? (body as { refresh: string }).refresh : undefined,
  };
}

async function handle(request: NextRequest, context: { params: Promise<{ path?: string[] }> }) {
  const { path = [] } = await context.params;
  const endpoint = path.length ? `${path.join("/")}/` : "";
  const rule = ROUTES.find((item) => item.pattern.test(endpoint));
  if (!rule || !rule.methods.includes(request.method)) {
    return NextResponse.json({ error: "Unsupported invitation API endpoint." }, { status: 404 });
  }

  let access = request.cookies.get("rohobot_access_token")?.value;
  const refresh = request.cookies.get("rohobot_refresh_token")?.value;
  if (!rule.public && !access) return NextResponse.json({ error: "Sign-in is required." }, { status: 401 });

  const body = request.method === "GET" || request.method === "DELETE" ? undefined : await request.text();
  const send = (token?: string) => backendRequest(`/invite/${endpoint}`, {
    method: request.method,
    headers: {
      ...(body ? { "Content-Type": request.headers.get("content-type") ?? "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body || undefined,
  });

  let response = await send(access);
  let refreshed: { access: string; refresh?: string } | null = null;
  if (response.status === 401 && refresh && !rule.public) {
    refreshed = await refreshAccessToken(refresh);
    if (refreshed) {
      access = refreshed.access;
      response = await send(access);
    }
  }

  const payload = await readBackendBody(response);
  const result = response.ok
    ? response.status === 204 ? new NextResponse(null, { status: response.status }) : NextResponse.json(payload, { status: response.status })
    : NextResponse.json({ error: backendErrorMessage(payload, "The invitation request failed."), details: payload }, { status: response.status });
  const retryAfter = response.headers.get("retry-after");
  if (retryAfter) result.headers.set("Retry-After", retryAfter);
  if (refreshed) {
    result.cookies.set("rohobot_access_token", refreshed.access, cookieOptions(request));
    if (refreshed.refresh) result.cookies.set("rohobot_refresh_token", refreshed.refresh, cookieOptions(request));
  }
  return result;
}

export const GET = handle;
export const POST = handle;
export const PATCH = handle;
export const DELETE = handle;
