const BACKEND_API_URL = (
  process.env.BACKEND_API_URL ??
  process.env.NEXT_PUBLIC_BACKEND_API_URL ??
  "http://localhost:8000/api/v1"
).replace(/\/$/, "");

export type BackendErrorBody = {
  detail?: string;
  message?: string;
  msg?: string;
  error?: string;
  [key: string]: unknown;
};

export async function backendRequest(path: string, init: RequestInit = {}) {
  return fetch(`${BACKEND_API_URL}${path}`, {
    ...init,
    cache: "no-store",
  });
}

export async function readBackendBody(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

export function backendErrorMessage(body: unknown, fallback: string): string {
  if (typeof body === "string" && body.trim()) return body;
  if (!body || typeof body !== "object") return fallback;

  const data = body as BackendErrorBody;
  for (const value of [data.detail, data.message, data.msg, data.error]) {
    if (typeof value === "string" && value.trim()) return value;
  }

  const firstValue = Object.values(data).find((value) =>
    typeof value === "string" || (Array.isArray(value) && typeof value[0] === "string")
  );
  if (typeof firstValue === "string") return firstValue;
  if (Array.isArray(firstValue) && typeof firstValue[0] === "string") return firstValue[0];
  return fallback;
}

export type JwtClaims = {
  role?: string;
  email_address?: string;
  full_name?: string;
  user_id?: number | string;
};

export function readJwtClaims(token: string): JwtClaims | null {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    return JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as JwtClaims;
  } catch {
    return null;
  }
}

export function appRoleFromJwt(token: string): "candidate" | "employer" | "admin" | null {
  const role = readJwtClaims(token)?.role;
  if (role === "Professionals") return "candidate";
  if (role === "Organizations") return "employer";
  if (role === "staff") return "admin";
  return null;
}
