import { NextRequest, NextResponse } from "next/server";
import { backendRequest, readBackendBody } from "@/lib/auth/backend";

export type BackendRouteRule = {
  pattern: RegExp;
  methods: string[];
};

type ProxyContext = { params: Promise<{ path?: string[] }> };

function cookieOptions(request: NextRequest) {
  return {
    httpOnly: true,
    secure: request.nextUrl.protocol === "https:",
    sameSite: "lax" as const,
    path: "/",
  };
}

async function refreshAccessToken(refresh: string) {
  const response = await backendRequest("/user/refresh/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh }),
  });
  const payload = await readBackendBody(response);
  if (!response.ok || !payload || typeof payload !== "object" || typeof (payload as { access?: unknown }).access !== "string") return null;
  return {
    access: (payload as { access: string }).access,
    refresh: typeof (payload as { refresh?: unknown }).refresh === "string" ? (payload as { refresh: string }).refresh : undefined,
  };
}

export async function proxyBackendEndpoint(
  request: NextRequest,
  context: ProxyContext,
  prefix: string,
  routes: BackendRouteRule[],
) {
  const { path = [] } = await context.params;
  const endpoint = path.length ? `${path.join("/")}/` : "";
  const rule = routes.find((candidate) => candidate.pattern.test(endpoint));
  if (!rule || !rule.methods.includes(request.method)) {
    return NextResponse.json({ error: "Unsupported API endpoint." }, { status: 404 });
  }

  const access = request.cookies.get("rohobot_access_token")?.value;
  const refresh = request.cookies.get("rohobot_refresh_token")?.value;
  const hasBody = !["GET", "HEAD", "DELETE"].includes(request.method);
  const body = hasBody ? await request.arrayBuffer() : undefined;
  const query = request.nextUrl.search;
  const backendPath = `/${prefix}/${endpoint}${query}`;
  const send = (token?: string) => backendRequest(backendPath, {
    method: request.method,
    headers: {
      ...(body?.byteLength ? { "Content-Type": request.headers.get("content-type") ?? "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body?.byteLength ? body : undefined,
  });

  try {
    let response = await send(access);
    let refreshed: Awaited<ReturnType<typeof refreshAccessToken>> = null;
    if (response.status === 401 && refresh) {
      refreshed = await refreshAccessToken(refresh);
      if (refreshed) response = await send(refreshed.access);
    }

    const responseBody = response.status === 204 || response.status === 205
      ? null
      : await response.arrayBuffer();
    const result = new NextResponse(responseBody, { status: response.status });
    const contentType = response.headers.get("content-type");
    if (contentType) result.headers.set("Content-Type", contentType);
    const retryAfter = response.headers.get("retry-after");
    if (retryAfter) result.headers.set("Retry-After", retryAfter);

    if (refreshed) {
      result.cookies.set("rohobot_access_token", refreshed.access, cookieOptions(request));
      if (refreshed.refresh) result.cookies.set("rohobot_refresh_token", refreshed.refresh, cookieOptions(request));
    }
    return result;
  } catch (error) {
    console.error(`Backend proxy failed for ${request.method} ${backendPath}`, error);
    return NextResponse.json(
      { error: "The API backend could not be reached." },
      { status: 502 },
    );
  }
}
