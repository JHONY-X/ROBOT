import { NextRequest, NextResponse } from "next/server";
import { backendErrorMessage, backendRequest, readBackendBody } from "@/lib/auth/backend";

export const runtime = "nodejs";

type RouteConfig = { method: string; authenticated?: boolean };

const ROUTES: Record<string, RouteConfig> = {
  "login/": { method: "POST" },
  "register/": { method: "POST" },
  "logout/": { method: "POST", authenticated: true },
  "refresh/": { method: "POST" },
  "change-profile/": { method: "PUT", authenticated: true },
  "change-password/": { method: "PATCH", authenticated: true },
  "forget-password/": { method: "POST" },
  "reset-password/": { method: "PUT" },
  "verify-email/": { method: "POST" },
  "resend-otp/": { method: "POST" },
};

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
  return response.ok && body && typeof body === "object" && typeof (body as { access?: unknown }).access === "string"
    ? {
        access: (body as { access: string }).access,
        refresh: typeof (body as { refresh?: unknown }).refresh === "string"
          ? (body as { refresh: string }).refresh
          : undefined,
      }
    : null;
}

async function handle(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  const endpoint = `${path.join("/")}/`;
  const config = ROUTES[endpoint];
  const resetMatch = path.length === 3 && path[0] === "reset-password-confirm";

  if ((!config && !resetMatch) || (config && request.method !== config.method) || (resetMatch && request.method !== "GET")) {
    return NextResponse.json({ error: "Unsupported user API endpoint." }, { status: 404 });
  }

  const access = request.cookies.get("rohobot_access_token")?.value;
  const refresh = request.cookies.get("rohobot_refresh_token")?.value;
  if (config?.authenticated && !access) {
    return NextResponse.json({ error: "Sign-in is required." }, { status: 401 });
  }

  const requestBody = request.method === "GET" ? undefined : await request.text();
  const body = endpoint === "refresh/" && !requestBody && refresh
    ? JSON.stringify({ refresh })
    : requestBody;
  const callBackend = (token?: string) => backendRequest(`/user/${endpoint}`, {
    method: request.method,
    headers: {
      ...(body ? { "Content-Type": request.headers.get("content-type") ?? "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body || undefined,
  });

  let response = await callBackend(access);
  let refreshedTokens: { access: string; refresh?: string } | null = null;
  if (response.status === 401 && config?.authenticated && refresh) {
    refreshedTokens = await refreshAccessToken(refresh);
    if (refreshedTokens) response = await callBackend(refreshedTokens.access);
  }

  const data = await readBackendBody(response);
  const result = response.ok
    ? response.status === 204 || response.status === 205
      ? new NextResponse(null, { status: response.status })
      : NextResponse.json(data, { status: response.status })
    : NextResponse.json({ error: backendErrorMessage(data, "The backend request failed."), details: data }, { status: response.status });

  if (endpoint === "refresh/" && response.ok && data && typeof data === "object" && typeof (data as { access?: unknown }).access === "string") {
    result.cookies.set("rohobot_access_token", (data as { access: string }).access, cookieOptions(request));
    if (typeof (data as { refresh?: unknown }).refresh === "string") {
      result.cookies.set("rohobot_refresh_token", (data as { refresh: string }).refresh, cookieOptions(request));
    }
  }
  if (refreshedTokens) {
    result.cookies.set("rohobot_access_token", refreshedTokens.access, cookieOptions(request));
    if (refreshedTokens.refresh) result.cookies.set("rohobot_refresh_token", refreshedTokens.refresh, cookieOptions(request));
  }
  if (endpoint === "logout/") {
    result.cookies.delete("rohobot_session");
    result.cookies.delete("rohobot_role");
    result.cookies.delete("rohobot_access");
    result.cookies.delete("rohobot_access_token");
    result.cookies.delete("rohobot_refresh_token");
  }
  return result;
}

export const GET = handle;
export const POST = handle;
export const PUT = handle;
export const PATCH = handle;
