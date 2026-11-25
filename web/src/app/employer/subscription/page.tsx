"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/Button";
import { CreditCard, FileText, RefreshCw } from "lucide-react";
import { subscriptionService, type PaymentTransaction, type Subscription } from "@/lib/api/services/subscription";

export default function EmployerSubscriptionPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [payments, setPayments] = useState<PaymentTransaction[]>([]);
  const [selectedDetails, setSelectedDetails] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const fetchData = useCallback(async () => {
    try {
      const [rows, transactions] = await Promise.all([subscriptionService.currentSubscriptions(), subscriptionService.listPayments()]);
      setSubscriptions(rows);
      setPayments(transactions);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Could not load subscription history.");
    } finally {
      setLoading(false);
    }
  }, []);

  const reload = () => { setLoading(true); setErrorMessage(""); void fetchData(); };

  useEffect(() => {
    let active = true;
    Promise.all([subscriptionService.currentSubscriptions(), subscriptionService.listPayments()])
      .then(([rows, transactions]) => {
        if (!active) return;
        setSubscriptions(rows);
        setPayments(transactions);
      })
      .catch((error: unknown) => { if (active) setErrorMessage(error instanceof Error ? error.message : "Could not load subscription history."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const showDetails = async (id: number) => {
    setDetailsLoading(true);
    setErrorMessage("");
    try { setSelectedDetails(await subscriptionService.getSubscription(id)); }
    catch (error) { setErrorMessage(error instanceof Error ? error.message : "Could not load subscription details."); }
    finally { setDetailsLoading(false); }
  };

  const currentSubscription = subscriptions.find((item) => item.status === "active") ?? subscriptions[0];

  return (
    <DashboardLayout role="employer">
      <div className="mx-auto max-w-5xl space-y-6">
        <header className="flex flex-wrap items-start justify-between gap-3"><div><h1 className="text-2xl font-bold text-slate-900">Subscription & billing</h1><p className="mt-1 text-sm text-slate-600">Review your subscription status and submitted payments.</p></div><Button type="button" variant="outline" onClick={reload} isLoading={loading}><RefreshCw className="mr-2 h-4 w-4" />Refresh</Button></header>
        {errorMessage && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{errorMessage}</p>}
        {loading ? <p role="status" className="py-8 text-sm text-slate-600">Loading subscription data...</p> : (
          <>
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-start gap-4"><span className="rounded-xl bg-primary-50 p-3 text-primary-700"><FileText className="h-6 w-6" /></span><div><h2 className="font-semibold text-slate-900">{currentSubscription ? currentSubscription.plan_name : "No subscription yet"}</h2><p className="mt-1 text-sm capitalize text-slate-600">{currentSubscription ? `Status: ${currentSubscription.status}` : "Choose a plan and submit payment to start a subscription."}</p>{currentSubscription && <p className="mt-2 text-sm text-slate-600">Price at purchase: {Number(currentSubscription.price_snapshot).toLocaleString()} · {currentSubscription.duration_days_snapshot} days</p>}</div></div>
              {!currentSubscription || currentSubscription.status === "rejected" || currentSubscription.status === "expired" ? <Link href="/employer/packages" className="mt-4 inline-flex text-sm font-semibold text-primary-700 hover:underline">Browse subscription plans</Link> : null}
            </section>

            {subscriptions.length > 0 && <section className="space-y-3"><h2 className="text-lg font-semibold text-slate-900">Subscriptions</h2><div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white"><table className="w-full text-left text-sm"><thead className="bg-slate-50 text-slate-600"><tr><th className="px-4 py-3">Plan</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Start</th><th className="px-4 py-3">End</th><th className="px-4 py-3">Details</th></tr></thead><tbody className="divide-y divide-slate-100">{subscriptions.map((item) => <tr key={item.id}><td className="px-4 py-3 capitalize font-medium">{item.plan_name}</td><td className="px-4 py-3 capitalize">{item.status}</td><td className="px-4 py-3">{item.start_date ? new Date(item.start_date).toLocaleDateString() : "—"}</td><td className="px-4 py-3">{item.end_date ? new Date(item.end_date).toLocaleDateString() : "—"}</td><td className="px-4 py-3"><Button type="button" size="sm" variant="outline" onClick={() => showDetails(item.id)} isLoading={detailsLoading && selectedDetails?.id === item.id}>View</Button></td></tr>)}</tbody></table></div></section>}

            {selectedDetails && <section className="rounded-2xl border border-slate-200 bg-white p-5"><h2 className="font-semibold text-slate-900">{selectedDetails.plan_name} history</h2>{selectedDetails.history.length ? <ul className="mt-3 space-y-2 text-sm text-slate-600">{selectedDetails.history.map((entry) => <li key={entry.id}>{new Date(entry.created_at).toLocaleString()} · {entry.action.replaceAll("_", " ")}{entry.description ? ` — ${entry.description}` : ""}</li>)}</ul> : <p className="mt-2 text-sm text-slate-500">No subscription history entries.</p>}</section>}

            <section className="space-y-3"><h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900"><CreditCard className="h-5 w-5" />Payment history</h2>{payments.length ? <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white"><table className="w-full text-left text-sm"><thead className="bg-slate-50 text-slate-600"><tr><th className="px-4 py-3">Reference</th><th className="px-4 py-3">Plan</th><th className="px-4 py-3">Method</th><th className="px-4 py-3">Amount</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Receipt</th></tr></thead><tbody className="divide-y divide-slate-100">{payments.map((payment) => <tr key={payment.id}><td className="px-4 py-3 font-mono text-xs">{payment.transaction_reference}</td><td className="px-4 py-3">{subscriptions.find((item) => item.id === payment.subscription)?.plan_name ?? `Subscription #${payment.subscription}`}</td><td className="px-4 py-3">{payment.payment_method.replaceAll("_", " ")}</td><td className="px-4 py-3">{Number(payment.amount).toLocaleString()}</td><td className="px-4 py-3 capitalize">{payment.status}</td><td className="px-4 py-3"><a href={payment.receipt_url} target="_blank" rel="noreferrer" className="font-semibold text-primary-700 hover:underline">Open</a></td></tr>)}</tbody></table></div> : <p className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600">No payments have been submitted yet.</p>}</section>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
