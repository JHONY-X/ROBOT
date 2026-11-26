import { NextRequest } from "next/server";
import { proxyBackendEndpoint, type BackendRouteRule } from "@/lib/api/backend-proxy";

export const runtime = "nodejs";

const ROUTES: BackendRouteRule[] = [
  { pattern: /^$/, methods: ["GET"] },
  { pattern: /^\d+\/$/, methods: ["GET"] },
  { pattern: /^\d+\/interest\/$/, methods: ["POST", "DELETE"] },
  { pattern: /^admin\/$/, methods: ["GET", "POST"] },
  { pattern: /^admin\/\d+\/$/, methods: ["GET", "PATCH"] },
  { pattern: /^admin\/\d+\/registrations\/$/, methods: ["GET"] },
  { pattern: /^admin\/\d+\/registrations\/clear\/$/, methods: ["DELETE"] },
];

type Context = { params: Promise<{ path?: string[] }> };
const handle = (request: NextRequest, context: Context) => proxyBackendEndpoint(request, context, "events", ROUTES);

export const GET = handle;
export const POST = handle;
export const PATCH = handle;
export const DELETE = handle;
