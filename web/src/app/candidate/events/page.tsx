"use client";

import { useEffect, useState } from "react";
import { CalendarDays, MapPin, Users } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/Button";
import { eventsService, type EventRecord } from "@/lib/api/services/events";

export default function CandidateEventsPage() {
  const [events, setEvents] = useState<EventRecord[]>([]);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [error, setError] = useState("");

  const load = async () => {
    setError("");
    try { setEvents(await eventsService.list()); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "Could not load events."); }
  };
  useEffect(() => { void load(); }, []);

  const toggleInterest = async (event: EventRecord) => {
    setBusyId(event.id);
    setError("");
    try {
      if (event.is_interested) await eventsService.removeInterest(event.id);
      else await eventsService.expressInterest(event.id);
      await load();
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Could not update event interest."); }
    finally { setBusyId(null); }
  };

  return <DashboardLayout role="candidate"><div className="mx-auto max-w-5xl space-y-6">
    <header><h1 className="text-2xl font-bold text-slate-900">Events</h1><p className="mt-1 text-sm text-slate-600">Browse published events and manage your interest.</p></header>
    {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    {events.length === 0 && !error ? <p className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-slate-500">No published events are available.</p> : <div className="grid gap-4 md:grid-cols-2">
      {events.map((event) => <article key={event.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-start justify-between gap-3"><h2 className="text-lg font-semibold text-slate-900">{event.title}</h2><span className="rounded-full bg-primary-50 px-2.5 py-1 text-xs font-medium text-primary-800">{event.status}</span></div>
        <p className="mt-3 whitespace-pre-wrap text-sm text-slate-600">{event.description}</p>
        <div className="mt-4 space-y-2 text-sm text-slate-500"><p className="flex gap-2"><MapPin className="h-4 w-4" />{event.location}</p><p className="flex gap-2"><CalendarDays className="h-4 w-4" />{new Date(event.start_date).toLocaleString()} – {new Date(event.end_date).toLocaleString()}</p><p className="flex gap-2"><Users className="h-4 w-4" />{event.total_interested} interested</p></div>
        <Button className="mt-5 w-full" variant={event.is_interested ? "outline" : "primary"} isLoading={busyId === event.id} onClick={() => void toggleInterest(event)}>{event.is_interested ? "Remove interest" : "I'm interested"}</Button>
      </article>)}
    </div>}
  </div></DashboardLayout>;
}
