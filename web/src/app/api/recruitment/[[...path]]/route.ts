import { NextRequest } from "next/server";
import { proxyBackendEndpoint, type BackendRouteRule } from "@/lib/api/backend-proxy";

export const runtime = "nodejs";

const ROUTES: BackendRouteRule[] = [
  { pattern: /^applications\/create\/$/, methods: ["POST"] },
  { pattern: /^applications\/organization\/$/, methods: ["GET"] },
  { pattern: /^applications\/professional\/$/, methods: ["GET"] },
  { pattern: /^applications\/\d+\/respond\/$/, methods: ["POST"] },
  { pattern: /^applications\/\d+\/cancel\/$/, methods: ["DELETE"] },
  { pattern: /^rejections\/organization\/$/, methods: ["GET"] },
  { pattern: /^rejections\/professional\/$/, methods: ["GET"] },
  { pattern: /^usage\/$/, methods: ["GET"] },
  { pattern: /^usage\/history\/$/, methods: ["GET"] },
  { pattern: /^admin\/professionals\/\d+\/reset-rejections\/$/, methods: ["POST"] },
];

type Context = { params: Promise<{ path?: string[] }> };
const handle = (request: NextRequest, context: Context) => proxyBackendEndpoint(request, context, "recruitment", ROUTES);

export const GET = handle;
export const POST = handle;
export const DELETE = handle;
