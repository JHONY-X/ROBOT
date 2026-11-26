"use client";

import { useState, type FormEvent } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/Button";
import { feedbackApi } from "@/lib/api/services/feedback-api";
import { MessageSquareText, Send } from "lucide-react";

export default function CandidateFeedbackPage() {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setIsSubmitting(true); setError(""); setSuccess("");
    try {
      await feedbackApi.submit({ feedback_type: "professional", subject: subject.trim(), message: message.trim() });
      setSubject(""); setMessage(""); setSuccess("Your feedback was submitted to Rohobot.");
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Could not submit feedback."); }
    finally { setIsSubmitting(false); }
  };

  return <DashboardLayout role="candidate"><div className="mx-auto max-w-3xl space-y-6">
    <header><h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900"><MessageSquareText className="h-6 w-6 text-primary-700" /> Feedback</h1><p className="mt-1 text-sm text-slate-600">Send feedback about your experience with Rohobot.</p></header>
    <form onSubmit={submit} className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
      <label className="block text-sm font-medium text-slate-700">Subject<input required maxLength={255} value={subject} onChange={(event) => setSubject(event.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2.5" /></label>
      <label className="block text-sm font-medium text-slate-700">Message<textarea required rows={6} value={message} onChange={(event) => setMessage(event.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2.5" /></label>
      {error && <p role="alert" className="text-sm text-red-700">{error}</p>}{success && <p role="status" className="text-sm text-emerald-700">{success}</p>}
      <Button type="submit" isLoading={isSubmitting}><Send className="mr-2 h-4 w-4" />Submit feedback</Button>
    </form>
  </div></DashboardLayout>;
}
