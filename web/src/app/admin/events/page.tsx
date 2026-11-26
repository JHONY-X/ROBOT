"use client";

import { FormEvent, useEffect, useState } from "react";
import { CalendarDays, Trash2, Users } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/Button";
import { eventsService, type EventRecord, type EventRegistration } from "@/lib/api/services/events";

const blankForm = { title: "", description: "", location: "", start_date: "", end_date: "", registration_deadline: "" };
const inputClass = "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm";

export default function AdminEventsPage() {
  const [events, setEvents] = useState<EventRecord[]>([]);
  const [registrations, setRegistrations] = useState<Record<number, EventRegistration[]>>({});
  const [form, setForm] = useState(blankForm);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const load = async () => setEvents(await eventsService.adminList());
  useEffect(() => { void load().catch((reason: unknown) => setError(reason instanceof Error ? reason.message : "Could not load events.")); }, []);

  const create = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setBusy(true); setError("");
    try {
      await eventsService.create({ ...form, start_date: new Date(form.start_date).toISOString(), end_date: new Date(form.end_date).toISOString(), registration_deadline: form.registration_deadline ? new Date(form.registration_deadline).toISOString() : null });
      setForm(blankForm); await load();
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Could not create event."); }
    finally { setBusy(false); }
  };

  const toggleRegistrations = async (id: number) => {
    setError("");
    try {
      if (id in registrations) setRegistrations((current) => { const next = { ...current }; delete next[id]; return next; });
      else {
        const rows = await eventsService.registrations(id);
        setRegistrations((current) => ({ ...current, [id]: rows }));
      }
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Could not load registrations."); }
  };

  const cancelEvent = async (event: EventRecord) => {
    setBusy(true); setError("");
    try { await eventsService.update(event.id, { status: event.status === "cancelled" ? "published" : "cancelled" }); await load(); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "Could not update event."); }
    finally { setBusy(false); }
  };

  const clearRegistrations = async (id: number) => {
    if (!window.confirm("Clear all registrations for this event?")) return;
    setError("");
    try { await eventsService.clearRegistrations(id); setRegistrations((current) => ({ ...current, [id]: [] })); await load(); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "Could not clear registrations."); }
  };

  return <DashboardLayout role="admin"><div className="mx-auto max-w-5xl space-y-6">
    <header><h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900"><CalendarDays className="h-6 w-6 text-primary-700" /> Event Management</h1><p className="mt-1 text-sm text-slate-600">Create events, update status, and review registrations.</p></header>
    {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    <form onSubmit={create} className="grid gap-3 rounded-xl border border-slate-200 bg-white p-5 sm:grid-cols-2">
      <h2 className="font-semibold text-slate-900 sm:col-span-2">Create event</h2>
      <input className={inputClass} placeholder="Event title" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
      <input className={inputClass} placeholder="Location" required value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
      <textarea className={`${inputClass} sm:col-span-2`} placeholder="Description" required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
      <label className="text-xs text-slate-600">Starts<input className={`${inputClass} mt-1`} type="datetime-local" required value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} /></label>
      <label className="text-xs text-slate-600">Ends<input className={`${inputClass} mt-1`} type="datetime-local" required value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} /></label>
      <label className="text-xs text-slate-600">Registration deadline (optional)<input className={`${inputClass} mt-1`} type="datetime-local" value={form.registration_deadline} onChange={(e) => setForm({ ...form, registration_deadline: e.target.value })} /></label>
      <div className="flex items-end"><Button type="submit" isLoading={busy}>Create event</Button></div>
    </form>
    <div className="space-y-4">{events.map((event) => <article key={event.id} className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="font-semibold text-slate-900">{event.title}</h2><p className="mt-1 text-sm text-slate-600">{event.location} · {new Date(event.start_date).toLocaleString()}</p></div><span className="rounded-full bg-slate-100 px-3 py-1 text-xs">{event.status} · {event.total_interested} interested</span></div>
      <div className="mt-4 flex flex-wrap gap-2"><Button variant="outline" onClick={() => void toggleRegistrations(event.id)}><Users className="mr-2 h-4 w-4" />{event.id in registrations ? "Hide registrations" : "View registrations"}</Button><Button variant="outline" onClick={() => void cancelEvent(event)} isLoading={busy}>{event.status === "cancelled" ? "Republish" : "Cancel event"}</Button><Button variant="danger" onClick={() => void clearRegistrations(event.id)}><Trash2 className="mr-2 h-4 w-4" />Clear registrations</Button></div>
      {event.id in registrations && <div className="mt-4 space-y-2 border-t pt-4">{registrations[event.id].length ? registrations[event.id].map((row) => <p key={row.id} className="text-sm text-slate-700">{row.full_name} · {row.email_address} · {row.phone_number}</p>) : <p className="text-sm text-slate-500">No registrations.</p>}</div>}
    </article>)}</div>
  </div></DashboardLayout>;
}
