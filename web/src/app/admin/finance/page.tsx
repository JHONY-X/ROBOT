"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/Button";
import { subscriptionService, type PaymentAccount, type PaymentTransaction, type SubscriptionPlan } from "@/lib/api/services/subscription";

type PlanDraft = {
  name: SubscriptionPlan["name"];
  description: string;
  price: string;
  duration_days: string;
  hiring_limit: string;
  interview_request_limit: string;
};
type AccountDraft = {
  account_type: PaymentAccount["account_type"];
  provider_name: string;
  account_identifier: string;
  account_holder_name: string;
  instructions: string;
};

const EMPTY_PLAN: PlanDraft = { name: "basic", description: "", price: "", duration_days: "30", hiring_limit: "", interview_request_limit: "" };
const EMPTY_ACCOUNT: AccountDraft = { account_type: "bank", provider_name: "", account_identifier: "", account_holder_name: "", instructions: "" };

export default function AdminFinancePage() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [accounts, setAccounts] = useState<PaymentAccount[]>([]);
  const [pending, setPending] = useState<PaymentTransaction[]>([]);
  const [draft, setDraft] = useState<PlanDraft>(EMPTY_PLAN);
  const [accountDraft, setAccountDraft] = useState<AccountDraft>(EMPTY_ACCOUNT);
  const [editingAccountId, setEditingAccountId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const fetchData = useCallback(async () => {
    try {
      const [planRows, accountRows, payments] = await Promise.all([
      subscriptionService.listPlans(),
      subscriptionService.listAdminPaymentAccounts(),
      subscriptionService.listPendingPayments(),
      ]);
      setPlans(planRows);
      setAccounts(accountRows);
      setPending(payments);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Could not load subscription administration.");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadData = () => {
    setLoading(true);
    setErrorMessage("");
    void fetchData();
  };

  useEffect(() => {
    let active = true;
    Promise.all([
      subscriptionService.listPlans(),
      subscriptionService.listAdminPaymentAccounts(),
      subscriptionService.listPendingPayments(),
    ])
      .then(([planRows, accountRows, payments]) => {
        if (!active) return;
        setPlans(planRows);
        setAccounts(accountRows);
        setPending(payments);
      })
      .catch((error: unknown) => { if (active) setErrorMessage(error instanceof Error ? error.message : "Could not load subscription administration."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const submitPlan = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setErrorMessage("");
    setSuccessMessage("");
    try {
      const created = await subscriptionService.createPlan({
        name: draft.name,
        description: draft.description.trim(),
        price: Number(draft.price),
        duration_days: Number(draft.duration_days),
        hiring_limit: Number(draft.hiring_limit),
        interview_request_limit: Number(draft.interview_request_limit),
        is_active: true,
      });
      setPlans((rows) => [...rows, created].sort((a, b) => Number(a.price) - Number(b.price)));
      setDraft(EMPTY_PLAN);
      setSuccessMessage("Subscription plan created.");
    } catch (error) { setErrorMessage(error instanceof Error ? error.message : "Could not create plan."); }
    finally { setSaving(false); }
  };

  const editPlanField = (id: number, field: keyof SubscriptionPlan, value: string) => {
    setPlans((rows) => rows.map((plan) => plan.id !== id ? plan : {
      ...plan,
      [field]: field === "price" || field === "duration_days" || field === "hiring_limit" || field === "interview_request_limit" ? Number(value) : value,
    }));
  };

  const savePlan = async (plan: SubscriptionPlan) => {
    setBusyId(plan.id);
    setErrorMessage("");
    setSuccessMessage("");
    try {
      const updated = await subscriptionService.updatePlan(plan.id, {
        name: plan.name,
        description: plan.description,
        price: plan.price,
        duration_days: plan.duration_days,
        hiring_limit: plan.hiring_limit,
        interview_request_limit: plan.interview_request_limit,
      });
      setPlans((rows) => rows.map((item) => item.id === plan.id ? updated : item));
      setSuccessMessage(`${updated.name} plan updated.`);
    } catch (error) { setErrorMessage(error instanceof Error ? error.message : "Could not update plan."); }
    finally { setBusyId(null); }
  };

  const refreshPlan = async (id: number) => {
    setBusyId(id);
    setErrorMessage("");
    try {
      const latest = await subscriptionService.getPlan(id);
      setPlans((rows) => rows.map((item) => item.id === id ? latest : item));
    } catch (error) { setErrorMessage(error instanceof Error ? error.message : "Could not load plan details."); }
    finally { setBusyId(null); }
  };

  const deletePlan = async (plan: SubscriptionPlan) => {
    if (!window.confirm(`Delete the ${plan.name} plan?`)) return;
    setBusyId(plan.id);
    setErrorMessage("");
    try {
      await subscriptionService.deletePlan(plan.id);
      setPlans((rows) => rows.filter((item) => item.id !== plan.id));
      setSuccessMessage(`${plan.name} plan deleted.`);
    } catch (error) { setErrorMessage(error instanceof Error ? error.message : "Could not delete plan."); }
    finally { setBusyId(null); }
  };

  const editAccount = async (id: number) => {
    setBusyId(id);
    setErrorMessage("");
    try {
      const account = await subscriptionService.getAdminPaymentAccount(id);
      setAccountDraft({ account_type: account.account_type, provider_name: account.provider_name, account_identifier: account.account_identifier, account_holder_name: account.account_holder_name, instructions: account.instructions });
      setEditingAccountId(id);
    } catch (error) { setErrorMessage(error instanceof Error ? error.message : "Could not load payment account."); }
    finally { setBusyId(null); }
  };

  const submitAccount = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setErrorMessage("");
    setSuccessMessage("");
    try {
      const saved = editingAccountId === null
        ? await subscriptionService.createAdminPaymentAccount(accountDraft)
        : await subscriptionService.updateAdminPaymentAccount(editingAccountId, accountDraft);
      setAccounts((rows) => editingAccountId === null ? [...rows, saved] : rows.map((item) => item.id === saved.id ? saved : item));
      setAccountDraft(EMPTY_ACCOUNT);
      setEditingAccountId(null);
      setSuccessMessage(editingAccountId === null ? "Payment account created." : "Payment account updated.");
    } catch (error) { setErrorMessage(error instanceof Error ? error.message : "Could not save payment account."); }
    finally { setSaving(false); }
  };

  const deleteAccount = async (account: PaymentAccount) => {
    if (!window.confirm(`Delete ${account.provider_name} payment account?`)) return;
    setBusyId(account.id);
    setErrorMessage("");
    try {
      await subscriptionService.deleteAdminPaymentAccount(account.id);
      setAccounts((rows) => rows.filter((item) => item.id !== account.id));
      if (editingAccountId === account.id) { setEditingAccountId(null); setAccountDraft(EMPTY_ACCOUNT); }
      setSuccessMessage("Payment account deleted.");
    } catch (error) { setErrorMessage(error instanceof Error ? error.message : "Could not delete payment account."); }
    finally { setBusyId(null); }
  };

  const reviewPayment = async (payment: PaymentTransaction, action: "approve" | "reject") => {
    const promptResult = window.prompt(action === "approve" ? "Optional verification note (Cancel to stop):" : "Enter a reason for rejecting this payment:");
    if (promptResult === null) return;
    const note = promptResult;
    if (action === "reject" && !note.trim()) return;
    setBusyId(payment.id);
    setErrorMessage("");
    setSuccessMessage("");
    try {
      if (action === "approve") await subscriptionService.approvePayment(payment.id, note.trim());
      else await subscriptionService.rejectPayment(payment.id, note.trim());
      setPending((rows) => rows.filter((row) => row.id !== payment.id));
      setSuccessMessage(action === "approve" ? "Payment approved and subscription activated." : "Payment rejected.");
    } catch (error) { setErrorMessage(error instanceof Error ? error.message : `Could not ${action} payment.`); }
    finally { setBusyId(null); }
  };

  return (
    <DashboardLayout role="admin">
      <div className="space-y-7">
        <header className="flex flex-wrap items-start justify-between gap-3"><div><h1 className="text-2xl font-bold text-slate-900">Subscriptions & payments</h1><p className="mt-1 text-sm text-slate-600">Manage subscription plans and payment accounts, then review organization payment submissions.</p></div><Button type="button" variant="outline" onClick={loadData} isLoading={loading}>Refresh</Button></header>
        {errorMessage && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{errorMessage}</p>}
        {successMessage && <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">{successMessage}</p>}
        {loading ? <p role="status" className="py-6 text-sm text-slate-600">Loading subscription administration...</p> : <>
          <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div><h2 className="text-lg font-semibold text-slate-900">Subscription plans</h2><p className="mt-1 text-sm text-slate-500">Plan names must be unique and use one of the backend choices.</p></div>
            <form onSubmit={submitPlan} className="grid gap-3 rounded-xl bg-slate-50 p-4 sm:grid-cols-2 lg:grid-cols-6">
              <label className="text-xs font-medium text-slate-600">Plan name<select required value={draft.name} onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value as PlanDraft["name"] }))} className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm">{["basic", "silver", "gold", "premium"].map((name) => <option key={name} value={name}>{name}</option>)}</select></label>
              <label className="text-xs font-medium text-slate-600">Price<input required type="number" min="0.01" step="0.01" value={draft.price} onChange={(event) => setDraft((current) => ({ ...current, price: event.target.value }))} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" /></label>
              <label className="text-xs font-medium text-slate-600">Duration (days)<input required type="number" min="1" value={draft.duration_days} onChange={(event) => setDraft((current) => ({ ...current, duration_days: event.target.value }))} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" /></label>
              <label className="text-xs font-medium text-slate-600">Hiring limit<input required type="number" min="0" value={draft.hiring_limit} onChange={(event) => setDraft((current) => ({ ...current, hiring_limit: event.target.value }))} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" /></label>
              <label className="text-xs font-medium text-slate-600">Interview limit<input required type="number" min="0" value={draft.interview_request_limit} onChange={(event) => setDraft((current) => ({ ...current, interview_request_limit: event.target.value }))} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" /></label>
              <Button type="submit" className="self-end" isLoading={saving} disabled={saving}>Add plan</Button>
              <label className="text-xs font-medium text-slate-600 sm:col-span-2 lg:col-span-6">Description<textarea required rows={2} value={draft.description} onChange={(event) => setDraft((current) => ({ ...current, description: event.target.value }))} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" /></label>
            </form>
            {plans.map((plan) => <div key={plan.id} className="grid gap-3 border-t border-slate-100 pt-4 sm:grid-cols-2 lg:grid-cols-6">
              <label className="text-xs font-medium text-slate-600">Name<select value={plan.name} onChange={(event) => editPlanField(plan.id, "name", event.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm">{["basic", "silver", "gold", "premium"].map((name) => <option key={name} value={name}>{name}</option>)}</select></label>
              <label className="text-xs font-medium text-slate-600">Price<input type="number" min="0.01" step="0.01" value={plan.price} onChange={(event) => editPlanField(plan.id, "price", event.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" /></label>
              <label className="text-xs font-medium text-slate-600">Duration (days)<input type="number" min="1" value={plan.duration_days} onChange={(event) => editPlanField(plan.id, "duration_days", event.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" /></label>
              <label className="text-xs font-medium text-slate-600">Hiring limit<input type="number" min="0" value={plan.hiring_limit} onChange={(event) => editPlanField(plan.id, "hiring_limit", event.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" /></label>
              <label className="text-xs font-medium text-slate-600">Interview limit<input type="number" min="0" value={plan.interview_request_limit} onChange={(event) => editPlanField(plan.id, "interview_request_limit", event.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" /></label>
              <div className="flex items-end gap-2"><Button type="button" size="sm" variant="outline" isLoading={busyId === plan.id} disabled={busyId !== null || saving} onClick={() => refreshPlan(plan.id)}>Reload</Button><Button type="button" size="sm" disabled={busyId !== null || saving} onClick={() => savePlan(plan)}>Save</Button><Button type="button" size="sm" variant="danger" disabled={busyId !== null || saving} onClick={() => deletePlan(plan)}>Delete</Button></div>
              <label className="text-xs font-medium text-slate-600 sm:col-span-2 lg:col-span-6">Description<textarea rows={2} value={plan.description} onChange={(event) => editPlanField(plan.id, "description", event.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" /></label>
            </div>)}
          </section>

          <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div><h2 className="text-lg font-semibold text-slate-900">Payment accounts</h2><p className="mt-1 text-sm text-slate-500">These active accounts appear to employers during payment submission.</p></div>
            <form onSubmit={submitAccount} className="grid gap-3 rounded-xl bg-slate-50 p-4 sm:grid-cols-2">
              <label className="text-xs font-medium text-slate-600">Account type<select required value={accountDraft.account_type} onChange={(event) => setAccountDraft((current) => ({ ...current, account_type: event.target.value as AccountDraft["account_type"] }))} className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"><option value="bank">Bank</option><option value="telebirr">Telebirr</option></select></label>
              <label className="text-xs font-medium text-slate-600">Provider name<input required maxLength={100} value={accountDraft.provider_name} onChange={(event) => setAccountDraft((current) => ({ ...current, provider_name: event.target.value }))} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" /></label>
              <label className="text-xs font-medium text-slate-600">Account identifier<input required maxLength={255} value={accountDraft.account_identifier} onChange={(event) => setAccountDraft((current) => ({ ...current, account_identifier: event.target.value }))} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" /></label>
              <label className="text-xs font-medium text-slate-600">Account holder<input required maxLength={255} value={accountDraft.account_holder_name} onChange={(event) => setAccountDraft((current) => ({ ...current, account_holder_name: event.target.value }))} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" /></label>
              <label className="text-xs font-medium text-slate-600 sm:col-span-2">Payment instructions<textarea rows={2} value={accountDraft.instructions} onChange={(event) => setAccountDraft((current) => ({ ...current, instructions: event.target.value }))} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" /></label>
              <div className="flex gap-2"><Button type="submit" isLoading={saving} disabled={saving}>{editingAccountId === null ? "Add payment account" : "Save payment account"}</Button>{editingAccountId !== null && <Button type="button" variant="outline" onClick={() => { setEditingAccountId(null); setAccountDraft(EMPTY_ACCOUNT); }}>Cancel edit</Button>}</div>
            </form>
            <div className="divide-y divide-slate-100">{accounts.map((account) => <div key={account.id} className="flex flex-wrap items-center justify-between gap-3 py-3"><div><p className="font-medium text-slate-900">{account.provider_name} <span className="text-xs uppercase text-slate-500">{account.account_type}</span></p><p className="text-sm text-slate-600">{account.account_identifier} · {account.account_holder_name}</p></div><div className="flex gap-2"><Button type="button" size="sm" variant="outline" isLoading={busyId === account.id} disabled={busyId !== null} onClick={() => editAccount(account.id)}>Edit</Button><Button type="button" size="sm" variant="danger" disabled={busyId !== null} onClick={() => deleteAccount(account)}>Delete</Button></div></div>)}</div>
          </section>

          <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div><h2 className="text-lg font-semibold text-slate-900">Pending payments</h2><p className="mt-1 text-sm text-slate-500">Approval activates the associated organization subscription.</p></div>
            {pending.length ? <div className="space-y-3">{pending.map((payment) => <article key={payment.id} className="rounded-xl border border-slate-200 p-4"><div className="grid gap-2 text-sm sm:grid-cols-2"><p><strong>Reference:</strong> {payment.transaction_reference}</p><p><strong>Amount:</strong> {Number(payment.amount).toLocaleString()}</p><p><strong>Method:</strong> {payment.payment_method}</p><p><strong>Account:</strong> {payment.payment_account_name} ({payment.account_identifier_snapshot})</p><p><strong>Submitted:</strong> {new Date(payment.created_at).toLocaleString()}</p><p><a href={payment.receipt_url} target="_blank" rel="noreferrer" className="font-semibold text-primary-700 hover:underline">Open receipt</a></p></div><div className="mt-4 flex gap-2"><Button type="button" size="sm" isLoading={busyId === payment.id} disabled={busyId !== null} onClick={() => reviewPayment(payment, "approve")}>Approve</Button><Button type="button" size="sm" variant="danger" disabled={busyId !== null} onClick={() => reviewPayment(payment, "reject")}>Reject</Button></div></article>)}</div> : <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600">No pending payments.</p>}
          </section>
        </>}
      </div>
    </DashboardLayout>
  );
}
