import { NextRequest } from "next/server";
import { proxyBackendEndpoint, type BackendRouteRule } from "@/lib/api/backend-proxy";

export const runtime = "nodejs";

const ROUTES: BackendRouteRule[] = [
  { pattern: /^submit\/$/, methods: ["POST"] },
  { pattern: /^admin\/$/, methods: ["GET"] },
  { pattern: /^admin\/\d+\/$/, methods: ["GET", "PATCH"] },
];

type Context = { params: Promise<{ path?: string[] }> };
const handle = (request: NextRequest, context: Context) => proxyBackendEndpoint(request, context, "feedback", ROUTES);

export const GET = handle;
export const POST = handle;
export const PATCH = handle;
