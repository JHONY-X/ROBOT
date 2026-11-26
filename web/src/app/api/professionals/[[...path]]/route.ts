import { NextRequest } from "next/server";
import { proxyBackendEndpoint, type BackendRouteRule } from "@/lib/api/backend-proxy";

export const runtime = "nodejs";

const ROUTES: BackendRouteRule[] = [
  { pattern: /^profile\/$/, methods: ["POST"] },
  { pattern: /^profile\/me\/$/, methods: ["GET", "PUT", "PATCH"] },
  { pattern: /^candidate\/$/, methods: ["GET"] },
  { pattern: /^qualifications\/$/, methods: ["GET", "POST"] },
  { pattern: /^qualifications\/\d+\/$/, methods: ["GET", "PUT", "PATCH", "DELETE"] },
  { pattern: /^skills\/$/, methods: ["GET", "POST"] },
  { pattern: /^skills\/\d+\/$/, methods: ["GET", "PUT", "PATCH", "DELETE"] },
  { pattern: /^experiences\/$/, methods: ["GET", "POST"] },
  { pattern: /^experiences\/\d+\/$/, methods: ["GET", "PUT", "PATCH", "DELETE"] },
  { pattern: /^admin\/profiles\/$/, methods: ["GET"] },
  { pattern: /^admin\/profiles\/\d+\/$/, methods: ["GET"] },
  { pattern: /^admin\/profiles\/\d+\/verification\/$/, methods: ["PATCH"] },
  { pattern: /^admin\/qualifications\/$/, methods: ["GET"] },
  { pattern: /^admin\/experiences\/$/, methods: ["GET"] },
];

type Context = { params: Promise<{ path?: string[] }> };
const handle = (request: NextRequest, context: Context) => proxyBackendEndpoint(request, context, "professionals", ROUTES);

export const GET = handle;
export const POST = handle;
export const PUT = handle;
export const PATCH = handle;
export const DELETE = handle;
