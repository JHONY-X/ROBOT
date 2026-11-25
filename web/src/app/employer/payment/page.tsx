"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, CreditCard, ReceiptText } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { SignOutButton } from "@/components/layout/SignOutButton";
import { subscriptionService, SubscriptionApiError, type PaymentAccount, type SubscriptionPlan } from "@/lib/api/services/subscription";

export default function EmployerPaymentPage() {
  const router = useRouter();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [accounts, setAccounts] = useState<PaymentAccount[]>([]);
  const [planId, setPlanId] = useState<number | null>(null);
  const [accountId, setAccountId] = useState<number | null>(null);
  const [transactionReference, setTransactionReference] = useState("");
  const [receiptUrl, setReceiptUrl] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let active = true;
    const queryPlanId = Number(new URLSearchParams(window.location.search).get("plan_id"));
    Promise.all([subscriptionService.listPlans(), subscriptionService.listPaymentAccounts()])
      .then(([availablePlans, availableAccounts]) => {
        if (!active) return;
        setPlans(availablePlans);
        setAccounts(availableAccounts);
        const selected = availablePlans.find((plan) => plan.id === queryPlanId) ?? availablePlans[0];
        setPlanId(selected?.id ?? null);
        setAccountId(availableAccounts[0]?.id ?? null);
      })
      .catch((error: unknown) => { if (active) setErrorMessage(error instanceof Error ? error.message : "Could not load payment details."); })
      .finally(() => { if (active) setIsLoading(false); });
    return () => { active = false; };
  }, []);

  const selectedPlan = plans.find((plan) => plan.id === planId);
  const selectedAccount = accounts.find((account) => account.id === accountId);

  const submitPayment = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedPlan || !selectedAccount) {
      setErrorMessage("Choose an available plan and payment account.");
      return;
    }
    setIsSubmitting(true);
    setErrorMessage("");
    try {
      await subscriptionService.submitPayment({
        plan_id: selectedPlan.id,
        payment_account: selectedAccount.id,
        payment_method: selectedAccount.account_type === "telebirr" ? "telebirr" : "bank_transfer",
        transaction_reference: transactionReference.trim(),
        receipt_url: receiptUrl.trim(),
      });
      router.replace("/employer/pending");
    } catch (error) {
      console.error("Could not submit subscription payment.", error);
      setErrorMessage(error instanceof SubscriptionApiError ? error.message : error instanceof Error ? error.message : "Could not submit payment.");
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[var(--color-background)] px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-3xl space-y-6">
        <header><p className="text-sm font-semibold uppercase tracking-wide text-primary-700">Employer subscription</p><h1 className="mt-1 text-2xl font-bold text-slate-900">Submit payment</h1></header>
        {errorMessage && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{errorMessage}</p>}
        {isLoading ? <p role="status" className="py-6 text-sm text-slate-600">Loading plans and payment accounts...</p> : !plans.length || !accounts.length ? (
          <p className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">Payment cannot be submitted because no active plan or payment account is available. Contact an administrator.</p>
        ) : (
          <form onSubmit={submitPayment} className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <section className="rounded-xl bg-primary-50 p-4">
              <label className="block text-sm font-medium text-primary-900">Subscription plan
                <select required value={planId ?? ""} onChange={(event) => setPlanId(Number(event.target.value))} className="mt-1.5 w-full rounded-xl border border-primary-200 bg-white px-3 py-2.5">
                  {plans.map((plan) => <option key={plan.id} value={plan.id}>{plan.name} · {Number(plan.price).toLocaleString()} ETB / {plan.duration_days} days</option>)}
                </select>
              </label>
              {selectedPlan && <p className="mt-3 text-sm text-primary-800">{selectedPlan.description}</p>}
              <Link href="/employer/packages" className="mt-2 inline-flex text-sm font-semibold text-primary-800 hover:underline">View all plan details</Link>
            </section>
            <section className="space-y-4">
              <h2 className="flex items-center gap-2 font-semibold text-slate-900"><CreditCard className="h-5 w-5 text-primary-700" /> Payment account</h2>
              <label className="block text-sm font-medium text-slate-700">Send payment to
                <select required value={accountId ?? ""} onChange={(event) => setAccountId(Number(event.target.value))} className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5">
                  {accounts.map((account) => <option key={account.id} value={account.id}>{account.provider_name} ({account.account_type}) · {account.account_identifier}</option>)}
                </select>
              </label>
              {selectedAccount && <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm"><p><strong>Account holder:</strong> {selectedAccount.account_holder_name}</p>{selectedAccount.instructions && <p className="mt-2 whitespace-pre-wrap">{selectedAccount.instructions}</p>}</div>}
              <label className="block text-sm font-medium text-slate-700">Transaction reference
                <input required maxLength={255} value={transactionReference} onChange={(event) => setTransactionReference(event.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2.5" />
              </label>
            </section>
            <section className="space-y-4">
              <h2 className="flex items-center gap-2 font-semibold text-slate-900"><ReceiptText className="h-5 w-5 text-primary-700" /> Receipt</h2>
              <label className="block text-sm font-medium text-slate-700">Public receipt URL
                <input required type="url" maxLength={1000} placeholder="https://..." value={receiptUrl} onChange={(event) => setReceiptUrl(event.target.value)} className="mt-1.5 block w-full rounded-xl border border-slate-300 px-3 py-2.5" />
                <span className="mt-1 block text-xs text-slate-500">The backend accepts a URL; it does not accept receipt file uploads.</span>
              </label>
            </section>
            {selectedPlan && <p className="text-sm font-semibold text-slate-800">Amount due: {Number(selectedPlan.price).toLocaleString()} ETB</p>}
            <Button type="submit" className="w-full" isLoading={isSubmitting} disabled={isSubmitting || !selectedPlan || !selectedAccount}>Submit payment for admin review</Button>
          </form>
        )}
        <div className="flex items-center justify-between"><Link href="/employer/packages" className="inline-flex items-center gap-2 text-sm font-semibold text-primary-700 hover:underline"><ArrowLeft className="h-4 w-4" /> Plans</Link><SignOutButton /></div>
      </div>
    </main>
  );
}
