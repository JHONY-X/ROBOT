"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { SignOutButton } from "@/components/layout/SignOutButton";
import { subscriptionService, type SubscriptionPlan } from "@/lib/api/services/subscription";

export default function EmployerPackagesPage() {
  const router = useRouter();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isContinuing, setIsContinuing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let active = true;
    subscriptionService.listPlans()
      .then((data) => { if (active) setPlans(data); })
      .catch((error: unknown) => { if (active) setErrorMessage(error instanceof Error ? error.message : "Could not load plans."); })
      .finally(() => { if (active) setIsLoading(false); });
    return () => { active = false; };
  }, []);

  const continueToPayment = () => {
    if (!selectedPlanId) {
      setErrorMessage("Choose a plan to continue.");
      return;
    }
    setIsContinuing(true);
    setErrorMessage("");
    router.push(`/employer/payment?plan_id=${selectedPlanId}`);
  };

  return (
    <main className="min-h-screen bg-[var(--color-background)] px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-5xl space-y-6">
        <header className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-100 text-primary-700"><Building2 className="h-6 w-6" /></span>
          <div><p className="text-sm font-semibold uppercase tracking-wide text-primary-700">Employer subscription</p><h1 className="text-2xl font-bold text-slate-900">Choose a plan</h1></div>
        </header>
        <p className="rounded-xl border border-primary-100 bg-primary-50 p-4 text-sm text-primary-900">Select a plan, then submit your bank transfer or Telebirr reference and public receipt link. Your subscription remains pending until an administrator reviews the payment.</p>
        {errorMessage && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{errorMessage}</p>}
        {isLoading ? <p role="status" className="py-8 text-sm text-slate-600">Loading available plans...</p> : plans.length ? (
          <>
            <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-label="Available subscription plans">
              {plans.map((plan) => (
                <label key={plan.id} className={`cursor-pointer rounded-2xl border bg-white p-5 shadow-sm transition ${selectedPlanId === plan.id ? "border-primary-600 ring-2 ring-primary-100" : "border-slate-200"}`}>
                  <input type="radio" name="plan" value={plan.id} checked={selectedPlanId === plan.id} onChange={() => { setSelectedPlanId(plan.id); setErrorMessage(""); }} className="sr-only" />
                  <div className="flex items-start justify-between"><span className="text-lg font-bold capitalize text-slate-900">{plan.name}</span>{selectedPlanId === plan.id && <CheckCircle2 className="h-5 w-5 text-primary-700" aria-label="Selected" />}</div>
                  <p className="mt-2 text-2xl font-bold text-primary-800">{Number(plan.price).toLocaleString()} ETB</p>
                  <p className="mt-1 text-sm text-slate-600">{plan.duration_days} days</p>
                  <p className="mt-4 text-sm text-slate-700">{plan.description}</p>
                  <ul className="mt-4 space-y-1 text-sm text-slate-600"><li>{plan.hiring_limit} hiring slots</li><li>{plan.interview_request_limit} interview requests</li></ul>
                </label>
              ))}
            </section>
            <Button type="button" className="w-full sm:w-auto" disabled={!selectedPlanId || isContinuing} isLoading={isContinuing} onClick={continueToPayment}>Continue to payment</Button>
          </>
        ) : <p className="rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-600">There are no active subscription plans available right now.</p>}
        <div className="flex justify-end"><SignOutButton /></div>
      </div>
    </main>
  );
}
