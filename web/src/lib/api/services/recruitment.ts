import { backendApiList, backendApiRequest, jsonBody } from "./backend-request";

export interface JobApplication {
  id: number;
  organization: number;
  organization_name: string;
  professional: number;
  professional_name: string;
  request_type: "hiring" | "interview";
  description: string;
  status: "pending" | "accepted" | "declined" | "expired";
  request_date: string;
  deadline: string;
  address?: string | null;
  meeting_link?: string | null;
  created_at: string;
}

export interface RecruitmentUsage {
  subscription_id: number;
  hiring: { used: number; limit: number; remaining: number };
  interview: { used: number; limit: number; remaining: number };
}

export interface RecruitmentUsageHistory {
  id: number;
  subscription: number;
  professional: number | null;
  professional_name: string | null;
  hiring_count: number;
  interview_count: number;
  request_date: string;
  created_at: string;
}

export interface CandidateRejection {
  id: number;
  organization: number | null;
  professional: number;
  professional_name: string;
  request_type: "hiring" | "interview";
  reject_type: "declined" | "expired";
  reason: string | null;
  request_date: string;
  rejection_date: string;
  reject_count_after: number;
}

const root = "/api/recruitment";
export const recruitmentService = {
  createApplication: (input: { professional_id: number; request_type: "hiring" | "interview"; description: string; deadline: string; address?: string; meeting_link?: string }) => backendApiRequest<JobApplication>(`${root}/applications/create/`, { method: "POST", ...jsonBody(input) }),
  organizationApplications: async () => backendApiList(await backendApiRequest<JobApplication[] | { results?: JobApplication[] }>(`${root}/applications/organization/`)),
  professionalApplications: async () => backendApiList(await backendApiRequest<JobApplication[] | { results?: JobApplication[] }>(`${root}/applications/professional/`)),
  respond: (id: number | string, input: { action: "accepted" | "declined"; reason?: string }) => backendApiRequest<{ detail?: string }>(`${root}/applications/${encodeURIComponent(String(id))}/respond/`, { method: "POST", ...jsonBody(input) }),
  cancel: (id: number | string) => backendApiRequest<{ detail?: string }>(`${root}/applications/${encodeURIComponent(String(id))}/cancel/`, { method: "DELETE" }),
  organizationRejections: async () => backendApiList(await backendApiRequest<CandidateRejection[] | { results?: CandidateRejection[] }>(`${root}/rejections/organization/`)),
  professionalRejections: async () => backendApiList(await backendApiRequest<CandidateRejection[] | { results?: CandidateRejection[] }>(`${root}/rejections/professional/`)),
  usage: () => backendApiRequest<RecruitmentUsage>(`${root}/usage/`),
  usageHistory: async () => backendApiList(await backendApiRequest<RecruitmentUsageHistory[] | { results?: RecruitmentUsageHistory[] }>(`${root}/usage/history/`)),
  resetProfessionalRejections: (id: number | string) => backendApiRequest<{ message: string; professional_id: number; rejection_count: number; is_active: boolean }>(`${root}/admin/professionals/${encodeURIComponent(String(id))}/reset-rejections/`, { method: "POST" }),
};
