"use client";

import { useEffect, useState } from "react";
import { BriefcaseBusiness } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/Button";
import { recruitmentService, type CandidateRejection, type JobApplication } from "@/lib/api/services/recruitment";

export default function CandidateApplicationsPage() {
  const [items, setItems] = useState<JobApplication[]>([]);
  const [rejections, setRejections] = useState<CandidateRejection[]>([]);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<number | null>(null);
  const load = async () => {
    const [applications, rejectionRows] = await Promise.all([recruitmentService.professionalApplications(), recruitmentService.professionalRejections()]);
    setItems(applications); setRejections(rejectionRows);
  };
  useEffect(() => { void load().catch((reason: unknown) => setError(reason instanceof Error ? reason.message : "Could not load requests.")); }, []);
  const respond = async (id: number, action: "accepted" | "declined") => {
    setBusyId(id); setError("");
    try { await recruitmentService.respond(id, { action }); await load(); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "Could not respond to request."); }
    finally { setBusyId(null); }
  };
  return <DashboardLayout role="candidate"><div className="mx-auto max-w-4xl space-y-6">
    <header><h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900"><BriefcaseBusiness className="h-6 w-6 text-primary-700" /> Recruitment requests</h1><p className="mt-1 text-sm text-slate-600">Review interview and hiring requests from organizations.</p></header>
    {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    {items.length === 0 ? <p className="rounded-xl border border-dashed p-8 text-center text-sm text-slate-500">There are no pending requests.</p> : <div className="space-y-3">{items.map((item) => <article key={item.id} className="rounded-xl border bg-white p-5"><div className="flex flex-wrap justify-between gap-3"><div><p className="text-xs uppercase text-slate-500">{item.request_type}</p><h2 className="mt-1 font-semibold text-slate-900">{item.organization_name}</h2><p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">{item.description}</p><p className="mt-2 text-xs text-slate-500">Deadline: {new Date(item.deadline).toLocaleString()}</p>{item.address && <p className="mt-1 text-xs text-slate-500">Location: {item.address}</p>}{item.meeting_link && <a className="mt-1 block text-xs text-primary-700 underline" href={item.meeting_link} target="_blank" rel="noreferrer">Open meeting link</a>}</div><div className="flex gap-2"><Button size="sm" isLoading={busyId === item.id} onClick={() => void respond(item.id, "accepted")}>Accept</Button><Button size="sm" variant="outline" isLoading={busyId === item.id} onClick={() => void respond(item.id, "declined")}>Decline</Button></div></div></article>)}</div>}
    <section className="space-y-3"><h2 className="font-semibold text-slate-900">Past rejections</h2>{rejections.length ? rejections.map((row) => <article key={row.id} className="rounded-lg border bg-white p-4 text-sm"><p className="font-medium">{row.request_type} · {row.reject_type}</p><p className="mt-1 text-slate-600">{row.reason || "No reason provided."}</p><p className="mt-1 text-xs text-slate-500">{new Date(row.rejection_date).toLocaleString()}</p></article>) : <p className="text-sm text-slate-500">No rejection records.</p>}</section>
  </div></DashboardLayout>;
}
