"use client";

import { useEffect, useState, type FormEvent } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/Button";
import {
  feedbackService,
  type CandidateFeedback,
  type CandidateFeedbackCategory,
} from "@/lib/api/services/feedback";
import { MessageSquareText, Send, Star } from "lucide-react";

const CATEGORIES: CandidateFeedbackCategory[] = [
  "Platform experience",
  "Job matching",
  "Employer interactions",
  "Other",
];

interface CandidateIdentity {
  id: string;
  name: string;
  role: string;
}

export default function CandidateFeedbackPage() {
  const [identity, setIdentity] = useState<CandidateIdentity | null>(null);
  const [feedbacks, setFeedbacks] = useState<CandidateFeedback[]>([]);
  const [category, setCategory] = useState<CandidateFeedbackCategory>(CATEGORIES[0]);
  const [rating, setRating] = useState(0);
  const [comments, setComments] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    let active = true;
    fetch("/api/auth/me", { cache: "no-store" })
      .then(async (response) => {
        const result = await response.json() as { account?: CandidateIdentity; error?: string };
        if (!response.ok || result.account?.role !== "candidate") {
          throw new Error(result.error ?? "Candidate sign-in is required.");
        }
        const submissions = await feedbackService.getCandidateFeedback(result.account.id);
        if (active) {
          setIdentity(result.account);
          setFeedbacks(submissions);
        }
      })
      .catch((error: unknown) => {
        if (active) setErrorMessage(error instanceof Error ? error.message : "Could not load feedback.");
      })
      .finally(() => { if (active) setIsLoading(false); });
    return () => { active = false; };
  }, []);

  const submitFeedback = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!identity) {
      setErrorMessage("Candidate sign-in is required.");
      return;
    }
    if (!rating || !comments.trim()) {
      setErrorMessage("Select a rating and write your feedback.");
      return;
    }
    setIsSubmitting(true);
    setErrorMessage("");
    setSuccessMessage("");
    try {
      const submitted = await feedbackService.submitCandidateFeedback({
        candidateId: identity.id,
        candidateName: identity.name,
        category,
        rating,
        comments,
      });
      setFeedbacks((current) => [submitted, ...current]);
      setRating(0);
      setComments("");
      setSuccessMessage("Thank you. Your feedback has been submitted.");
    } catch (error) {
      console.error("Could not submit candidate feedback.", error);
      setErrorMessage(error instanceof Error ? error.message : "Could not submit feedback.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout role="candidate">
      <div className="mx-auto max-w-3xl space-y-6">
        <header>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900">
            <MessageSquareText className="h-6 w-6 text-primary-700" /> Candidate Feedback
          </h1>
          <p className="mt-1 text-sm text-slate-600">Share your experience to help us improve the platform and candidate support.</p>
        </header>

        <form onSubmit={submitFeedback} className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <div role="note" className="rounded-xl border border-primary-100 bg-primary-50 p-4 text-sm text-primary-900">
            Your feedback is associated with your candidate account and is shared with the Rohobot team.
          </div>
          <label className="block text-sm font-medium text-slate-700">
            Feedback topic
            <select value={category} onChange={(event) => setCategory(event.target.value as CandidateFeedbackCategory)} className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5">
              {CATEGORIES.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </label>

          <fieldset>
            <legend className="text-sm font-medium text-slate-700">Overall experience rating *</legend>
            <div className="mt-2 flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  aria-label={`${value} out of 5 stars`}
                  aria-pressed={rating === value}
                  onClick={() => setRating(value)}
                  className={`rounded p-1 ${value <= rating ? "text-amber-400" : "text-slate-300 hover:text-amber-300"}`}
                >
                  <Star className="h-7 w-7 fill-current" />
                </button>
              ))}
              <span className="ml-2 text-sm text-slate-500">{rating ? `${rating} of 5` : "Select a rating"}</span>
            </div>
          </fieldset>

          <label className="block text-sm font-medium text-slate-700">
            Your feedback *
            <textarea
              required
              minLength={1}
              maxLength={2000}
              rows={6}
              value={comments}
              onChange={(event) => setComments(event.target.value)}
              placeholder="Tell us what worked well or what we can improve."
              className="mt-1.5 w-full resize-y rounded-xl border border-slate-300 px-3 py-2.5"
            />
            <span className="mt-1 block text-right text-xs text-slate-500">{comments.length}/2,000</span>
          </label>

          {errorMessage && <p role="alert" className="text-sm text-red-700">{errorMessage}</p>}
          {successMessage && <p role="status" className="text-sm text-emerald-700">{successMessage}</p>}
          <Button type="submit" className="gap-2" isLoading={isSubmitting} disabled={isLoading || isSubmitting || !identity}>
            <Send className="h-4 w-4" /> Submit feedback
          </Button>
        </form>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-slate-900">Your previous feedback</h2>
          {isLoading ? <p className="text-sm text-slate-500">Loading your feedback...</p> : feedbacks.length ? (
            feedbacks.map((entry) => (
              <article key={entry.id} className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-sm font-semibold text-slate-900">{entry.category}</span>
                  <span className="text-xs text-slate-500">{entry.submittedAt}</span>
                </div>
                <p className="mt-1 text-sm text-slate-600">Rating: {entry.rating}/5</p>
                <p className="mt-3 whitespace-pre-wrap text-sm text-slate-700">{entry.comments}</p>
              </article>
            ))
          ) : <p className="rounded-xl border border-dashed border-slate-300 p-5 text-sm text-slate-500">You haven’t submitted feedback yet.</p>}
        </section>
      </div>
    </DashboardLayout>
  );
}
