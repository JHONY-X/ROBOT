import { firstApiError, normalizeApiErrors, type NormalizedApiErrors } from "@/lib/api/errors";

export class InvitationApiError extends Error {
  constructor(public readonly status: number, message: string, public readonly data?: unknown, public readonly errors: NormalizedApiErrors = normalizeApiErrors(data)) {
    super(message);
    this.name = "InvitationApiError";
  }
}

export type Invitation = {
  id?: number;
  full_name: string;
  email_address: string;
  token: string;
  is_sent: boolean;
  is_verified: boolean;
  expires_date: string | null;
};

export type InvitationControl = { endpoint: string; enabled: boolean };

async function request<T>(path: string, method = "GET", body?: unknown): Promise<T> {
  const response = await fetch(`/api/invite/${path}`, {
    method,
    headers: body === undefined ? undefined : { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
    cache: "no-store",
  });
  const text = await response.text();
  let data: unknown = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }
  if (!response.ok) throw new InvitationApiError(response.status, firstApiError(data, "The invitation request failed."), data);
  return data as T;
}

export const invitationService = {
  getControl: () => request<InvitationControl[]>("control/"),
  updateControl: (endpoint: string, enabled: boolean) => request<{ message: string; endpoint: string; enabled: boolean }>("control/", "PATCH", { endpoint, enabled }),
  create: (input: { full_name: string; email_address: string }) => request<{ message: string }>("create/", "POST", input),
  list: () => request<Invitation[]>("manage/"),
  get: (id: number) => request<Invitation | Invitation[]>(`manage/${id}/`),
  updateSendingState: (id: number, is_sent: boolean) => request<{ message: string }>(`manage/${id}/`, "PATCH", { is_sent }),
  delete: (id: number) => request<{ message: string }>(`manage/${id}/`, "DELETE"),
  verifyEmail: (token: string) => request<{ message: string }>("verify-email/", "POST", { token }),
};
