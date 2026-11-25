import { normalizeApiErrors, firstApiError, type NormalizedApiErrors } from "@/lib/api/errors";

export class OrganizationApiError extends Error {
  constructor(public readonly status: number, message: string, public readonly data?: unknown, public readonly errors: NormalizedApiErrors = normalizeApiErrors(data)) {
    super(message);
    this.name = "OrganizationApiError";
  }
}

export type OrganizationType = "hospital" | "clinic" | "home_based_provider" | "healthcare_center" | "other";
export type VerificationStatus = "pending" | "verified" | "rejected";
export type OrganizationDocumentType = "business_license" | "registration_certificate" | "tax_certificate" | "healthcare_license" | "other";

export type OrganizationDocument = {
  id: number;
  organization: string;
  document_type: OrganizationDocumentType;
  document_file: string;
  verification_status: VerificationStatus;
  verified_by: number | null;
  created_at: string;
  updated_at: string;
};

export type Organization = {
  id: number;
  user: number;
  organazation_logo: string;
  organization_name: string;
  organization_type: OrganizationType;
  tin_number: string;
  website: string | null;
  country: string;
  region: string;
  city: string;
  address: string;
  hr_email: string;
  hr_phone: string;
  verification_status: VerificationStatus;
  verified_by: number | null;
  created_at: string;
  updated_at: string;
  documents: OrganizationDocument[];
};

export type AdminOrganization = Organization & {
  documents: OrganizationDocument[];
};

async function request<T>(path: string, method = "GET", body?: object | FormData): Promise<T> {
  const isForm = typeof FormData !== "undefined" && body instanceof FormData;
  const response = await fetch(`/api/organizations/${path}`, {
    method,
    headers: body === undefined || isForm ? undefined : { "Content-Type": "application/json" },
    body: body === undefined ? undefined : isForm ? body : JSON.stringify(body),
    cache: "no-store",
  });
  const text = await response.text();
  let data: unknown = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }
  if (!response.ok) throw new OrganizationApiError(response.status, firstApiError(data, "The organizations request failed."), data);
  return data as T;
}

export const organizationApi = {
  getMine: () => request<Organization>("organization/me/"),
  createMine: (body: FormData) => request<Organization>("organization/me/", "POST", body),
  updateMine: (body: FormData) => request<Organization>("organization/me/", "PATCH", body),
  listDocuments: () => request<OrganizationDocument[]>("documents/"),
  createDocument: (body: FormData) => request<OrganizationDocument>("documents/", "POST", body),
  getDocument: (id: number) => request<OrganizationDocument>(`documents/${id}/`),
  updateDocument: (id: number, body: FormData) => request<OrganizationDocument>(`documents/${id}/`, "PATCH", body),
  deleteDocument: (id: number) => request<{ detail?: string }>(`documents/${id}/`, "DELETE"),
  listAdminOrganizations: () => request<AdminOrganization[]>("admin/organizations/"),
  getAdminOrganization: (id: number) => request<AdminOrganization>(`admin/organizations/${id}/`),
  verifyOrganization: (id: number, verification_status: VerificationStatus) => request<{ detail: string; organization_id: number; organization_name: string; verified_by: number | null }>(`admin/organizations/${id}/verification/`, "PATCH", { verification_status }),
  listAdminDocuments: () => request<OrganizationDocument[]>("admin/documents/"),
  verifyDocument: (id: number, verification_status: VerificationStatus) => request<{ detail: string; document_id: number; verification_status: VerificationStatus; verified_by: number | null }>(`admin/documents/${id}/verification/`, "PATCH", { verification_status }),
};
