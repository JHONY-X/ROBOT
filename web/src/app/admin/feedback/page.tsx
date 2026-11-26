"use client";

import { useEffect, useState } from "react";
import { Lock, MessageSquareText, Save } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/Button";
import { feedbackApi, type BackendFeedback } from "@/lib/api/services/feedback-api";

const statuses: BackendFeedback["status"][] = ["pending", "reviewed", "resolved", "archived"];
export default function AdminFeedbackPage() {
  const [items, setItems] = useState<BackendFeedback[]>([]);
  const [drafts, setDrafts] = useState<Record<number, { status: BackendFeedback["status"]; admin_response: string }>>({});
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const load = async () => {
    const rows = await feedbackApi.adminList(); setItems(rows);
    setDrafts(Object.fromEntries(rows.map((item) => [item.id, { status: item.status, admin_response: item.admin_response ?? "" }])));
  };
  useEffect(() => { void load().catch((reason: unknown) => setError(reason instanceof Error ? reason.message : "Could not load feedback.")).finally(() => setLoading(false)); }, []);
  const save = async (id: number) => {
    const draft = drafts[id]; if (!draft) return;
    setBusyId(id); setError("");
    try { await feedbackApi.adminUpdate(id, draft); await load(); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "Could not update feedback."); }
    finally { setBusyId(null); }
  };

  return <DashboardLayout role="admin"><div className="mx-auto max-w-5xl space-y-6">
    <header><h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900"><MessageSquareText className="h-6 w-6 text-primary-700" /> Feedback review</h1><p className="mt-1 flex items-center gap-2 text-sm text-slate-600"><Lock className="h-4 w-4" /> Admin-only feedback submitted by professionals and organizations.</p></header>
    {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    {loading ? <p className="text-sm text-slate-500">Loading feedback...</p> : items.length ? <div className="space-y-4">{items.map((item) => <article key={item.id} className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-3"><div><span className="text-xs uppercase tracking-wide text-slate-500">{item.feedback_type} · #{item.id}</span><h2 className="mt-1 text-lg font-semibold text-slate-900">{item.subject}</h2><p className="mt-1 text-xs text-slate-500">From {item.submitted_by_email ?? `user ${item.submitted_by ?? "unknown"}`} · {new Date(item.created_at).toLocaleString()}</p></div><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium">{item.status}</span></div>
      <p className="mt-4 whitespace-pre-wrap text-sm text-slate-700">{item.message}</p>
      <div className="mt-5 grid gap-3 border-t border-slate-100 pt-4 sm:grid-cols-[200px_1fr_auto]">
        <label className="text-xs font-medium text-slate-600">Status<select className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm" value={drafts[item.id]?.status ?? item.status} onChange={(event) => setDrafts((current) => ({ ...current, [item.id]: { ...current[item.id], status: event.target.value as BackendFeedback["status"] } }))}>{statuses.map((status) => <option value={status} key={status}>{status}</option>)}</select></label>
        <label className="text-xs font-medium text-slate-600">Admin response<textarea rows={2} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" value={drafts[item.id]?.admin_response ?? ""} onChange={(event) => setDrafts((current) => ({ ...current, [item.id]: { ...current[item.id], admin_response: event.target.value } }))} /></label>
        <div className="flex items-end"><Button isLoading={busyId === item.id} onClick={() => void save(item.id)}><Save className="mr-2 h-4 w-4" />Save</Button></div>
      </div>
    </article>)}</div> : <p className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">No feedback submissions.</p>}
  </div></DashboardLayout>;
}
