export class BackendApiError extends Error {
  constructor(public readonly status: number, message: string, public readonly data?: unknown) {
    super(message);
    this.name = "BackendApiError";
  }
}

export async function backendApiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(path, { ...init, cache: "no-store" });
  const text = await response.text();
  let payload: unknown = null;
  try {
    payload = text ? JSON.parse(text) : null;
  } catch {
    payload = text;
  }

  if (!response.ok) {
    const data = payload && typeof payload === "object" ? payload as Record<string, unknown> : {};
    const message = [data.error, data.detail, data.message]
      .find((value): value is string => typeof value === "string" && value.length > 0)
      ?? (typeof payload === "string" && payload ? payload : `Request failed (${response.status}).`);
    throw new BackendApiError(response.status, message, payload);
  }
  return payload as T;
}

export function backendApiList<T>(payload: T[] | { results?: T[] }): T[] {
  return Array.isArray(payload) ? payload : payload.results ?? [];
}

export function jsonBody(data: unknown): RequestInit {
  return { headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) };
}
