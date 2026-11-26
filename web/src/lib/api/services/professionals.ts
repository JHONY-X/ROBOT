import { backendApiList, backendApiRequest, jsonBody } from "./backend-request";

export interface Qualification {
  id: number;
  professional: number;
  qualification_type: "education" | "certification" | "training" | "other";
  title: string;
  institution: string;
  field_of_study?: string | null;
  qualification_level?: "certificate" | "diploma" | "bachelor" | "master" | "phd" | "" | null;
  document_file?: string;
  created_at: string;
  updated_at: string;
}

export interface WorkExperience {
  id: number;
  professional: number;
  job_position: string;
  organization_name: string;
  employment_type: string;
  location?: string | null;
  start_date: string;
  end_date?: string | null;
  is_current: boolean;
  experience_letter?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProfessionalProfile {
  id: number;
  user: number;
  profile_picture: string;
  date_of_birth: string;
  gender: "male" | "female";
  professional_category: "nurse" | "caregiver" | "midwife" | "other";
  professional_summary: string;
  skills: string[];
  current_location: string;
  preferred_location?: string | null;
  license?: string;
  id_front?: string;
  id_back?: string;
  crime_letter?: string;
  availability_status: "available" | "unavailable" | "employed";
  employment_preference: "full_time" | "part_time" | "contract" | "temporary" | "any";
  verification_status: "pending" | "verified" | "rejected";
  consent_to_data_processing: boolean;
  full_name?: string;
  qualifications?: Qualification[];
  work_experiences?: WorkExperience[];
}

export interface Skill {
  id: number;
  name: string;
  description: string;
}

export interface ProfessionalProfileInput extends Omit<ProfessionalProfile, "id" | "user" | "verification_status" | "qualifications" | "work_experiences" | "profile_picture" | "license" | "id_front" | "id_back" | "crime_letter"> {
  profile_picture: File;
  license: File;
  id_front: File;
  id_back: File;
  crime_letter: File;
}

export interface QualificationInput extends Omit<Qualification, "id" | "professional" | "created_at" | "updated_at" | "document_file"> {
  document_file?: File;
}

export interface WorkExperienceInput extends Omit<WorkExperience, "id" | "professional" | "created_at" | "updated_at" | "experience_letter"> {
  experience_letter?: File;
}

function fileForm(input: object) {
  const form = new FormData();
  for (const [key, value] of Object.entries(input)) {
    if (value !== undefined && value !== null) {
      if (Array.isArray(value)) form.append(key, JSON.stringify(value));
      else form.append(key, value instanceof File ? value : String(value));
    }
  }
  return form;
}

const root = "/api/professionals";
const resource = (name: string, id: number | string) => `${root}/${name}/${encodeURIComponent(String(id))}/`;

export const professionalsService = {
  createProfile: (input: ProfessionalProfileInput) => backendApiRequest<ProfessionalProfile>(`${root}/profile/`, { method: "POST", body: fileForm(input) }),
  myProfile: () => backendApiRequest<ProfessionalProfile>(`${root}/profile/me/`),
  updateMyProfile: (input: Partial<ProfessionalProfileInput>) => backendApiRequest<ProfessionalProfile>(`${root}/profile/me/`, { method: "PUT", body: fileForm(input) }),
  patchMyProfile: (input: Partial<ProfessionalProfileInput>) => backendApiRequest<ProfessionalProfile>(`${root}/profile/me/`, { method: "PATCH", body: fileForm(input) }),
  candidates: async () => backendApiList(await backendApiRequest<ProfessionalProfile[] | { results?: ProfessionalProfile[] }>(`${root}/candidate/`)),
  qualifications: async () => backendApiList(await backendApiRequest<Qualification[] | { results?: Qualification[] }>(`${root}/qualifications/`)),
  createQualification: (input: QualificationInput) => backendApiRequest<Qualification>(`${root}/qualifications/`, { method: "POST", body: fileForm(input) }),
  getQualification: (id: number | string) => backendApiRequest<Qualification>(resource("qualifications", id)),
  updateQualification: (id: number | string, input: QualificationInput) => backendApiRequest<Qualification>(resource("qualifications", id), { method: "PUT", body: fileForm(input) }),
  patchQualification: (id: number | string, input: Partial<QualificationInput>) => backendApiRequest<Qualification>(resource("qualifications", id), { method: "PATCH", body: fileForm(input) }),
  deleteQualification: (id: number | string) => backendApiRequest<null>(resource("qualifications", id), { method: "DELETE" }),
  skills: async () => backendApiList(await backendApiRequest<Skill[] | { results?: Skill[] }>(`${root}/skills/`)),
  createSkill: (input: Pick<Skill, "name" | "description">) => backendApiRequest<Skill>(`${root}/skills/`, { method: "POST", ...jsonBody(input) }),
  getSkill: (id: number | string) => backendApiRequest<Skill>(resource("skills", id)),
  updateSkill: (id: number | string, input: Pick<Skill, "name" | "description">) => backendApiRequest<Skill>(resource("skills", id), { method: "PUT", ...jsonBody(input) }),
  patchSkill: (id: number | string, input: Partial<Pick<Skill, "name" | "description">>) => backendApiRequest<Skill>(resource("skills", id), { method: "PATCH", ...jsonBody(input) }),
  deleteSkill: (id: number | string) => backendApiRequest<null>(resource("skills", id), { method: "DELETE" }),
  experiences: async () => backendApiList(await backendApiRequest<WorkExperience[] | { results?: WorkExperience[] }>(`${root}/experiences/`)),
  createExperience: (input: WorkExperienceInput) => backendApiRequest<WorkExperience>(`${root}/experiences/`, { method: "POST", body: fileForm(input) }),
  getExperience: (id: number | string) => backendApiRequest<WorkExperience>(resource("experiences", id)),
  updateExperience: (id: number | string, input: WorkExperienceInput) => backendApiRequest<WorkExperience>(resource("experiences", id), { method: "PUT", body: fileForm(input) }),
  patchExperience: (id: number | string, input: Partial<WorkExperienceInput>) => backendApiRequest<WorkExperience>(resource("experiences", id), { method: "PATCH", body: fileForm(input) }),
  deleteExperience: (id: number | string) => backendApiRequest<null>(resource("experiences", id), { method: "DELETE" }),
  adminProfiles: async () => backendApiList(await backendApiRequest<ProfessionalProfile[] | { results?: ProfessionalProfile[] }>(`${root}/admin/profiles/`)),
  adminProfile: (id: number | string) => backendApiRequest<ProfessionalProfile>(`${root}/admin/profiles/${encodeURIComponent(String(id))}/`),
  verifyProfile: (id: number | string, verification_status: ProfessionalProfile["verification_status"]) => backendApiRequest<{ message: string; data: ProfessionalProfile }>(`${root}/admin/profiles/${encodeURIComponent(String(id))}/verification/`, { method: "PATCH", ...jsonBody({ verification_status }) }),
  adminQualifications: async () => backendApiList(await backendApiRequest<Qualification[] | { results?: Qualification[] }>(`${root}/admin/qualifications/`)),
  adminExperiences: async () => backendApiList(await backendApiRequest<WorkExperience[] | { results?: WorkExperience[] }>(`${root}/admin/experiences/`)),
};
