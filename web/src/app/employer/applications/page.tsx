"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { BriefcaseBusiness, XCircle } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/Button";
import { recruitmentService, type CandidateRejection, type JobApplication, type RecruitmentUsage, type RecruitmentUsageHistory } from "@/lib/api/services/recruitment";

const inputClass = "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm";
export default function EmployerApplicationsPage() {
  const [items, setItems] = useState<JobApplication[]>([]);
  const [usage, setUsage] = useState<RecruitmentUsage | null>(null);
  const [usageHistory, setUsageHistory] = useState<RecruitmentUsageHistory[]>([]);
  const [rejections, setRejections] = useState<CandidateRejection[]>([]);
  const [form, setForm] = useState({ professional_id: "", request_type: "interview" as "interview" | "hiring", description: "", deadline: "", address: "", meeting_link: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const load = async () => {
    const [applications, currentUsage, history, rejectionRows] = await Promise.all([recruitmentService.organizationApplications(), recruitmentService.usage(), recruitmentService.usageHistory(), recruitmentService.organizationRejections()]);
    setItems(applications); setUsage(currentUsage); setUsageHistory(history); setRejections(rejectionRows);
  };
  useEffect(() => {
    void Promise.all([recruitmentService.organizationApplications(), recruitmentService.usage(), recruitmentService.usageHistory(), recruitmentService.organizationRejections()])
      .then(([applications, currentUsage, history, rejectionRows]) => {
        setItems(applications); setUsage(currentUsage); setUsageHistory(history); setRejections(rejectionRows);
      })
      .catch((reason: unknown) => setError(reason instanceof Error ? reason.message : "Could not load recruitment data."));
  }, []);

  const create = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setBusy(true); setError("");
    try {
      await recruitmentService.createApplication({ ...form, professional_id: Number(form.professional_id), deadline: new Date(form.deadline).toISOString(), address: form.address || undefined, meeting_link: form.meeting_link || undefined });
      setForm({ professional_id: "", request_type: "interview", description: "", deadline: "", address: "", meeting_link: "" }); await load();
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Could not create application."); }
    finally { setBusy(false); }
  };
  const cancel = async (id: number) => {
    setError("");
    try { await recruitmentService.cancel(id); await load(); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "Could not cancel request."); }
  };

  return <DashboardLayout role="employer"><div className="mx-auto max-w-5xl space-y-6">
    <header><h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900"><BriefcaseBusiness className="h-6 w-6 text-primary-700" /> Recruitment requests</h1><p className="mt-1 text-sm text-slate-600">Send and manage hiring or interview requests.</p></header>
    {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    {usage && <section className="grid gap-3 sm:grid-cols-2"><div className="rounded-xl border bg-white p-4 text-sm">Hiring requests: {usage.hiring.used} used · {usage.hiring.remaining} remaining</div><div className="rounded-xl border bg-white p-4 text-sm">Interview requests: {usage.interview.used} used · {usage.interview.remaining} remaining</div></section>}
    <form onSubmit={create} className="grid gap-3 rounded-xl border border-slate-200 bg-white p-5 sm:grid-cols-2">
      <h2 className="font-semibold sm:col-span-2">New request</h2>
      <label className="text-xs text-slate-600">Professional profile ID<input className={`${inputClass} mt-1`} type="number" min="1" required value={form.professional_id} onChange={(e) => setForm({ ...form, professional_id: e.target.value })} /></label>
      <label className="text-xs text-slate-600">Request type<select className={`${inputClass} mt-1`} value={form.request_type} onChange={(e) => setForm({ ...form, request_type: e.target.value as typeof form.request_type })}><option value="interview">Interview</option><option value="hiring">Hiring</option></select></label>
      <label className="text-xs text-slate-600 sm:col-span-2">Details<textarea className={`${inputClass} mt-1`} required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></label>
      <label className="text-xs text-slate-600">Deadline<input className={`${inputClass} mt-1`} type="datetime-local" required value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} /></label>
      <label className="text-xs text-slate-600">Address<input className={`${inputClass} mt-1`} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></label>
      <label className="text-xs text-slate-600 sm:col-span-2">Meeting link (optional)<input className={`${inputClass} mt-1`} type="url" value={form.meeting_link} onChange={(e) => setForm({ ...form, meeting_link: e.target.value })} /></label>
      <p className="text-xs text-slate-500 sm:col-span-2">Provide an address or a meeting link. Find a profile ID from the candidate profile list.</p>
      <div className="sm:col-span-2"><Button type="submit" isLoading={busy}>Send request</Button></div>
    </form>
    <section className="space-y-3"><h2 className="font-semibold">Your requests</h2>{items.length === 0 ? <p className="rounded-xl border border-dashed p-6 text-sm text-slate-500">No recruitment requests yet.</p> : items.map((item) => <article key={item.id} className="flex flex-wrap items-start justify-between gap-3 rounded-xl border bg-white p-4"><div><h3 className="font-semibold">{item.request_type} · {item.professional_name}</h3><p className="text-sm text-slate-600">{item.description}</p><p className="mt-1 text-xs text-slate-500">Status: {item.status} · Deadline: {new Date(item.deadline).toLocaleString()}</p></div>{item.status === "pending" && <Button size="sm" variant="outline" onClick={() => void cancel(item.id)}><XCircle className="mr-1 h-4 w-4" />Cancel</Button>}</article>)}</section>
    <section className="space-y-3"><h2 className="font-semibold">Recruitment usage history</h2>{usageHistory.length ? usageHistory.map((row) => <p key={row.id} className="rounded-lg border bg-white p-3 text-sm text-slate-700">{row.professional_name ?? "Professional"} · {row.hiring_count} hires · {row.interview_count} interviews · {new Date(row.request_date).toLocaleDateString()}</p>) : <p className="text-sm text-slate-500">No usage records.</p>}</section>
    <section className="space-y-3"><h2 className="font-semibold">Candidate rejections</h2>{rejections.length ? rejections.map((row) => <article key={row.id} className="rounded-lg border bg-white p-3 text-sm"><p className="font-medium">{row.professional_name} · {row.reject_type} {row.request_type}</p><p className="mt-1 text-slate-600">{row.reason || "No reason provided."}</p></article>) : <p className="text-sm text-slate-500">No rejection records.</p>}</section>
    <Link className="text-sm font-semibold text-primary-700 hover:underline" href="/employer/search">Search professionals</Link>
  </div></DashboardLayout>;
}
