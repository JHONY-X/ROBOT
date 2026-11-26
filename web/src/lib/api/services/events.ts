import { backendApiList, backendApiRequest, jsonBody } from "./backend-request";

export interface EventRecord {
  id: number;
  title: string;
  description: string;
  location: string;
  start_date: string;
  end_date: string;
  registration_deadline: string | null;
  status: "published" | "cancelled" | "completed";
  is_interested?: boolean;
  total_interested: number;
  created_at: string;
  updated_at?: string;
}

export interface EventRegistration {
  id: number;
  event: number;
  professional: number;
  full_name: string;
  phone_number: string;
  email_address: string;
  registered_at: string;
}

export type EventInput = Pick<EventRecord, "title" | "description" | "location" | "start_date" | "end_date"> & {
  registration_deadline?: string | null;
  status?: EventRecord["status"];
};

const root = "/api/events";
const idPath = (id: number | string) => encodeURIComponent(String(id));

export const eventsService = {
  list: async () => backendApiList(await backendApiRequest<EventRecord[] | { results?: EventRecord[] }>(`${root}/`)),
  get: (id: number | string) => backendApiRequest<EventRecord>(`${root}/${idPath(id)}/`),
  expressInterest: (id: number | string) => backendApiRequest<{ detail: string; is_interested: boolean }>(`${root}/${idPath(id)}/interest/`, { method: "POST" }),
  removeInterest: (id: number | string) => backendApiRequest<{ detail: string; is_interested: boolean }>(`${root}/${idPath(id)}/interest/`, { method: "DELETE" }),
  adminList: async () => backendApiList(await backendApiRequest<EventRecord[] | { results?: EventRecord[] }>(`${root}/admin/`)),
  create: (input: EventInput) => backendApiRequest<EventRecord>(`${root}/admin/`, { method: "POST", ...jsonBody(input) }),
  adminGet: (id: number | string) => backendApiRequest<EventRecord>(`${root}/admin/${idPath(id)}/`),
  update: (id: number | string, input: Partial<EventInput>) => backendApiRequest<EventRecord>(`${root}/admin/${idPath(id)}/`, { method: "PATCH", ...jsonBody(input) }),
  registrations: async (eventId: number | string) => backendApiList(await backendApiRequest<EventRegistration[] | { results?: EventRegistration[] }>(`${root}/admin/${idPath(eventId)}/registrations/`)),
  clearRegistrations: (eventId: number | string) => backendApiRequest<{ detail: string; deleted_count: number }>(`${root}/admin/${idPath(eventId)}/registrations/clear/`, { method: "DELETE" }),
};
