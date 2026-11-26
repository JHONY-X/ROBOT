import { backendApiList, backendApiRequest, jsonBody } from "./backend-request";

export interface BackendFeedback {
  id: number;
  feedback_type: "organization" | "professional";
  submitted_by: number | null;
  submitted_by_email?: string;
  professional: number | string | null;
  subject: string;
  message: string;
  status: "pending" | "reviewed" | "resolved" | "archived";
  admin_response: string;
  reviewed_by: number | null;
  reviewed_by_email?: string;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
}

const root = "/api/feedback";
export const feedbackApi = {
  submit: (input: { feedback_type: BackendFeedback["feedback_type"]; professional?: number | null; subject: string; message: string }) =>
    backendApiRequest<BackendFeedback>(`${root}/submit/`, { method: "POST", ...jsonBody(input) }),
  adminList: async () => backendApiList(await backendApiRequest<BackendFeedback[] | { results?: BackendFeedback[] }>(`${root}/admin/`)),
  adminGet: (id: number | string) => backendApiRequest<BackendFeedback>(`${root}/admin/${encodeURIComponent(String(id))}/`),
  adminUpdate: (id: number | string, input: { status?: BackendFeedback["status"]; admin_response?: string }) =>
    backendApiRequest<BackendFeedback>(`${root}/admin/${encodeURIComponent(String(id))}/`, { method: "PATCH", ...jsonBody(input) }),
};
