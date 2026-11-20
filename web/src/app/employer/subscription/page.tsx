"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/Button";
import { CheckCircle2, ShieldCheck, CreditCard } from "lucide-react";

export default function EmployerSubscriptionPage() {
  const router = useRouter();
  const [subscription, setSubscription] = useState<{ startsAt: string; endsAt: string; traineesUsed: number } | undefined>();
  const [packageName, setPackageName] = useState("No active package");
  const [capacity, setCapacity] = useState<number | null>(null);
  const [dynamicPackages, setDynamicPackages] = useState<{ name: string; amount: number; annualTraineeCapacity: number | null; discountPercent: number; costPerTrainee: number }[]>([]);

  useEffect(() => {
    Promise.all([
      fetch("/api/demo/employer/activation", { cache: "no-store" }),
      fetch("/api/demo/subscriptions", { cache: "no-store" }),
    ]).then(async ([accountResponse, packageResponse]) => {
      const accountResult = await accountResponse.json();
      const packageResult = await packageResponse.json();
      setDynamicPackages(packageResult.packages ?? []);
      const account = accountResult.account;
      if (account?.packageName) setPackageName(account.packageName);
      setSubscription(account?.subscription);
      setCapacity(packageResult.packages?.find((pkg: { name: string }) => pkg.name === account?.packageName)?.annualTraineeCapacity ?? null);
    }).catch((error) => console.error("Could not load subscription status.", error));
  }, []);

  // This function simulates the redirect to the payment gateway and the webhook return
  const handleSubscribe = () => {
    router.push("/employer/packages");
  };

  return (
    <DashboardLayout role="employer">
      <div className="max-w-6xl mx-auto space-y-8">
        
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900">Subscription & Billing</h1>
          <p className="text-slate-500 text-sm mt-1">Manage your recruitment package and view transaction history.</p>
        </div>

        {/* Current Status Banner */}
        <div className={`${subscription ? "bg-emerald-50 border-emerald-200" : "bg-slate-50 border-slate-200"} border rounded-xl p-4 flex items-start gap-4`}>
          <ShieldCheck className="w-6 h-6 text-emerald-600 mt-0.5" />
          <div>
            <h3 className="font-semibold text-emerald-900">Active Subscription: {packageName}</h3>
            <p className="text-sm text-emerald-700 mt-1">
              {subscription
                ? `Valid ${new Date(subscription.startsAt).toLocaleDateString()} – ${new Date(subscription.endsAt).toLocaleDateString()}. ${capacity === null ? "Unlimited" : `${Math.max(0, capacity - subscription.traineesUsed)} of ${capacity}`} trainees remaining.`
                : "Choose a package and submit your payment receipt for approval."}
            </p>
          </div>
        </div>

        {/* Packages Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {dynamicPackages.map((pkg) => (
            <div
              key={pkg.name}
              className="relative bg-white border border-slate-200 rounded-2xl p-6 flex flex-col shadow-sm hover:border-primary-200 transition-all"
            >
              {pkg.name === "Gold" && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-amber-400 to-amber-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                  Most Popular
                </div>
              )}
              
              <div className="mb-6">
                <h3 className="text-lg font-bold text-slate-900">{pkg.name}</h3>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold text-slate-900">{pkg.amount.toLocaleString()}</span>
                  <span className="text-sm text-slate-500">
                    ETB {pkg.annualTraineeCapacity === null ? "/ trainee / year" : "/ year"}
                  </span>
                </div>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {[
                  pkg.annualTraineeCapacity === null ? "Unlimited annual training capacity" : `${pkg.annualTraineeCapacity} trainees per year`,
                  `${pkg.discountPercent}% discount on hospital share`,
                  `${pkg.costPerTrainee.toLocaleString()} ETB per trainee`,
                ].map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm text-slate-600">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>

              <Button
                variant={pkg.name === "Gold" ? "primary" : "outline"}
                className="w-full"
                onClick={handleSubscribe}
              >
                <CreditCard className="w-4 h-4 mr-2" />
                Select {pkg.name}
              </Button>
            </div>
          ))}
        </div>

      </div>
    </DashboardLayout>
  );
}