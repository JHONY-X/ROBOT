"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, CreditCard, ReceiptText } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { SignOutButton } from "@/components/layout/SignOutButton";

const PAYMENT_METHODS = [
  "Telebirr",
  "M-Pesa",
  "Commercial Bank of Ethiopia (CBE)",
  "Dashen Bank",
  "Other Ethiopian bank",
] as const;
interface EmployerPaymentAccount {
  organizationName: string;
  packageName?: string;
}
interface SubscriptionPackage { name: string; amount: number; annualTraineeCapacity: number | null }

export default function EmployerPaymentPage() {
  const router = useRouter();
  const [account, setAccount] = useState<EmployerPaymentAccount | null>(null);
  const [method, setMethod] = useState<(typeof PAYMENT_METHODS)[number]>(PAYMENT_METHODS[0]);
  const [transactionId, setTransactionId] = useState("");
  const [receiptUrl, setReceiptUrl] = useState("");
  const [packages, setPackages] = useState<SubscriptionPackage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let active = true;
    Promise.all([
      fetch("/api/demo/employer/activation", { cache: "no-store" }),
      fetch("/api/demo/subscriptions", { cache: "no-store" }),
    ])
      .then(async ([accountResponse, packageResponse]) => {
        const result = (await accountResponse.json()) as { account?: EmployerPaymentAccount; error?: string };
        const packageResult = (await packageResponse.json()) as { packages?: SubscriptionPackage[]; error?: string };
        if (!accountResponse.ok || !packageResponse.ok || !result.account) throw new Error(result.error ?? packageResult.error ?? "Could not load employer account.");
        if (active) {
          if (!result.account.packageName) {
            router.replace("/employer/packages");
            return;
          }
          setAccount(result.account);
          setPackages(packageResult.packages ?? []);
        }
      })
      .catch((error: unknown) => {
        if (active) {
          console.error("Could not load employer payment details.", error);
          setErrorMessage(error instanceof Error ? error.message : "Could not load employer account.");
        }
      })
      .finally(() => { if (active) setIsLoading(false); });
    return () => { active = false; };
  }, [router]);

  const submitPayment = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!account?.packageName || !/^https?:\/\//i.test(receiptUrl.trim())) {
      setErrorMessage("Provide a valid public receipt link to continue.");
      return;
    }
    setIsSubmitting(true);
    setErrorMessage("");
    try {
      const response = await fetch("/api/demo/employer/payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          packageName: account.packageName,
          method,
          transactionId,
          receiptUrl: receiptUrl.trim(),
        }),
      });
      const result = (await response.json()) as { success?: boolean; message?: string; error?: string };
      if (!response.ok || !result.success) throw new Error(result.error ?? result.message ?? "Could not submit payment.");
      router.push("/employer/pending");
    } catch (error) {
      console.error("Could not submit employer payment proof.", error);
      setErrorMessage(error instanceof Error ? error.message : "Could not submit payment.");
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[var(--color-background)] px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-3xl space-y-6">
        <header>
          <p className="text-sm font-semibold uppercase tracking-wide text-primary-700">Employer subscription</p>
          <h1 className="mt-1 text-2xl font-bold text-slate-900">Submit payment</h1>
          {account && <p className="mt-2 text-sm text-slate-600">{account.organizationName}</p>}
        </header>
        {isLoading ? <p className="py-6 text-sm text-slate-600">Loading payment details...</p> : account?.packageName && (
          <form onSubmit={submitPayment} className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <section className="rounded-xl bg-primary-50 p-4">
              <p className="text-sm text-primary-800">Selected package</p>
              <p className="mt-1 text-xl font-bold text-primary-950">
                {account.packageName} · {(packages.find((pkg) => pkg.name === account.packageName)?.amount ?? 0).toLocaleString()} ETB
                {packages.find((pkg) => pkg.name === account.packageName)?.annualTraineeCapacity === null ? " / trainee / year" : " / year"}
              </p>
              <Link href="/employer/packages" className="mt-2 inline-flex text-sm font-semibold text-primary-800 hover:underline">Change package</Link>
            </section>
            <section className="space-y-4">
              <h2 className="flex items-center gap-2 font-semibold text-slate-900"><CreditCard className="h-5 w-5 text-primary-700" /> Choose a payment method</h2>
              <label className="block text-sm font-medium text-slate-700">
                Payment method
                <select required value={method} onChange={(event) => setMethod(event.target.value as (typeof PAYMENT_METHODS)[number])} className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5">
                  {PAYMENT_METHODS.map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
              </label>
              <label className="block text-sm font-medium text-slate-700">
                Transaction ID
                <input required maxLength={120} value={transactionId} onChange={(event) => setTransactionId(event.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2.5" />
              </label>
            </section>
            <section className="space-y-4">
              <h2 className="flex items-center gap-2 font-semibold text-slate-900"><ReceiptText className="h-5 w-5 text-primary-700" /> Payment receipt link</h2>
              <label className="block text-sm font-medium text-slate-700">
                Receipt URL
                <input required type="url" placeholder="https://..." value={receiptUrl} onChange={(event) => setReceiptUrl(event.target.value)} className="mt-1.5 block w-full rounded-xl border border-slate-300 px-3 py-2.5" />
                <span className="mt-1 block text-xs text-slate-500">Provide a shareable payment receipt link, not an uploaded screenshot or PDF.</span>
              </label>
            </section>
            {errorMessage && <p role="alert" className="text-sm text-red-700">{errorMessage}</p>}
            <Button type="submit" className="w-full" isLoading={isSubmitting} disabled={isSubmitting}>Submit payment for admin approval</Button>
          </form>
        )}
        <div className="flex items-center justify-between">
          <Link href="/employer/packages" className="inline-flex items-center gap-2 text-sm font-semibold text-primary-700 hover:underline"><ArrowLeft className="h-4 w-4" /> Packages</Link>
          <SignOutButton />
        </div>
      </div>
    </main>
  );
}
