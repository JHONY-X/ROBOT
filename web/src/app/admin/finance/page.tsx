"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/Button";
import { adminService, Transaction } from "@/lib/api/services/admin";
import { CreditCard, TrendingUp, RotateCcw, CheckCircle2, AlertCircle } from "lucide-react";

interface SubscriptionPackage {
  name: string;
  amount: number;
  annualTraineeCapacity: number | null;
  discountPercent: number;
  costPerTrainee: number;
}

export default function AdminFinancePage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [packages, setPackages] = useState<SubscriptionPackage[]>([]);
  const [savingPackage, setSavingPackage] = useState<string | null>(null);

  const fetchTransactions = async () => {
    setIsLoading(true);
    const data = await adminService.getTransactions();
    setTransactions(data);
    setIsLoading(false);
  };

  useEffect(() => {
    let active = true;
    adminService.getTransactions().then((data) => {
      if (!active) return;
      setTransactions(data);
      setIsLoading(false);
    }).catch((error: unknown) => {
      if (!active) return;
      console.error("Failed to load transactions.", error);
      setIsLoading(false);
    });
    fetch("/api/demo/subscriptions", { cache: "no-store" })
      .then((response) => response.json())
      .then((result: { packages?: SubscriptionPackage[] }) => setPackages(result.packages ?? []))
      .catch((error: unknown) => console.error("Failed to load subscription packages.", error));

    return () => {
      active = false;
    };
  }, []);

  const handleRefund = async (id: string) => {
    if (!confirm("Are you sure you want to refund this transaction?")) return;
    setProcessingId(id);
    await adminService.refundTransaction(id);
    await fetchTransactions();
    setProcessingId(null);
  };

  const handleManualActivate = async (id: string) => {
    if (!confirm("Manually verify this pending payment? This will activate the employer's account.")) return;
    setProcessingId(id);
    await adminService.approvePendingPayment(id);
    await fetchTransactions();
    setProcessingId(null);
  };

  const updatePackageField = (name: string, field: keyof SubscriptionPackage, value: string) => {
    setPackages((current) => current.map((pkg) => {
      if (pkg.name !== name) return pkg;
      if (field === "annualTraineeCapacity") {
        return { ...pkg, annualTraineeCapacity: value === "" ? null : Number(value) };
      }
      return { ...pkg, [field]: Number(value) } as SubscriptionPackage;
    }));
  };

  const savePackage = async (pkg: SubscriptionPackage) => {
    setSavingPackage(pkg.name);
    try {
      const response = await fetch("/api/demo/subscriptions", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pkg),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Could not update package.");
    } catch (error) {
      alert(error instanceof Error ? error.message : "Could not update package.");
    } finally {
      setSavingPackage(null);
    }
  };

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Financial Dashboard</h1>
          <p className="text-slate-500 text-sm mt-1">Monitor revenue and manage transactions.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg"><TrendingUp className="w-6 h-6" /></div>
            <div>
              <p className="text-sm text-slate-500">Total Revenue</p>
              <p className="text-2xl font-bold text-slate-900">
                {transactions.filter(t => t.status === "Successful").reduce((sum, t) => sum + t.amount, 0)} ETB
              </p>
            </div>
          </div>
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-primary-50 text-primary-600 rounded-lg"><CreditCard className="w-6 h-6" /></div>
            <div>
              <p className="text-sm text-slate-500">Successful Transactions</p>
              <p className="text-2xl font-bold text-slate-900">{transactions.filter(t => t.status === "Successful").length}</p>
            </div>
          </div>
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-lg"><AlertCircle className="w-6 h-6" /></div>
            <div>
              <p className="text-sm text-slate-500">Pending Payments</p>
              <p className="text-2xl font-bold text-slate-900">{transactions.filter(t => t.status === "Pending").length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
          <div className="mb-4">
            <h2 className="font-semibold text-slate-900">Subscription packages</h2>
            <p className="mt-1 text-sm text-slate-500">Admin-configurable annual amounts, trainee capacity, discounts, and trainee cost.</p>
          </div>
          <div className="grid gap-3 lg:grid-cols-2">
            {packages.map((pkg) => (
              <div key={pkg.name} className="rounded-xl border border-slate-200 p-4">
                <p className="mb-3 font-semibold text-slate-900">{pkg.name}</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="text-xs font-medium text-slate-600">Annual amount or per-trainee rate (ETB)
                    <input type="number" min="0" step="0.01" value={pkg.amount} onChange={(event) => updatePackageField(pkg.name, "amount", event.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
                  </label>
                  <label className="text-xs font-medium text-slate-600">Trainee capacity (blank = unlimited)
                    <input type="number" min="0" value={pkg.annualTraineeCapacity ?? ""} onChange={(event) => updatePackageField(pkg.name, "annualTraineeCapacity", event.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
                  </label>
                  <label className="text-xs font-medium text-slate-600">Discount (%)
                    <input type="number" min="0" max="100" step="0.01" value={pkg.discountPercent} onChange={(event) => updatePackageField(pkg.name, "discountPercent", event.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
                  </label>
                  <label className="text-xs font-medium text-slate-600">Cost per trainee (ETB)
                    <input type="number" min="0" step="0.01" value={pkg.costPerTrainee} onChange={(event) => updatePackageField(pkg.name, "costPerTrainee", event.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
                  </label>
                </div>
                <Button type="button" size="sm" className="mt-3" isLoading={savingPackage === pkg.name} disabled={savingPackage !== null} onClick={() => savePackage(pkg)}>Save {pkg.name}</Button>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50">
            <h2 className="font-semibold text-slate-900">Transaction History</h2>
          </div>
          
          {isLoading ? (
            <div className="p-12 text-center text-slate-500">Loading...</div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-white border-b border-slate-200 text-slate-500">
                <tr>
                  <th className="px-6 py-3 font-medium">Reference</th>
                  <th className="px-6 py-3 font-medium">Employer</th>
                  <th className="px-6 py-3 font-medium">Package</th>
                  <th className="px-6 py-3 font-medium">Amount</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transactions.map((txn) => (
                  <tr key={txn.id} className="hover:bg-slate-50/50">
                    <td className="px-6 py-4 font-mono text-xs text-slate-500">{txn.referenceNumber}</td>
                    <td className="px-6 py-4 font-medium text-slate-900">{txn.employerName}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${txn.packageTier === "Gold" ? "bg-amber-50 text-amber-700" : "bg-slate-100 text-slate-700"}`}>
                        {txn.packageTier}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-700">{txn.amount} ETB</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        txn.status === "Successful" ? "bg-emerald-50 text-emerald-700" :
                        txn.status === "Pending" ? "bg-amber-50 text-amber-700" :
                        txn.status === "Refunded" ? "bg-slate-100 text-slate-700" : "bg-red-50 text-red-700"
                      }`}>
                        {txn.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {txn.status === "Successful" && (
                        <Button 
                          variant="outline" size="sm" 
                          className="h-8 text-red-600 border-red-200 hover:bg-red-50"
                          onClick={() => handleRefund(txn.id)}
                          isLoading={processingId === txn.id}
                        >
                          <RotateCcw className="w-3 h-3 mr-1" /> Refund
                        </Button>
                      )}
                      {txn.status === "Pending" && (
                        <Button 
                          variant="outline" size="sm" 
                          className="h-8 text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                          onClick={() => handleManualActivate(txn.id)}
                          isLoading={processingId === txn.id}
                        >
                          <CheckCircle2 className="w-3 h-3 mr-1" /> Verify
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}