"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Building2, HeartPulse } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function EmployerRegistrationPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [hrFirstName, setHrFirstName] = useState("");
  const [hrMiddleName, setHrMiddleName] = useState("");
  const [hrLastName, setHrLastName] = useState("");
  const [organizationEmail, setOrganizationEmail] = useState("");
  const [organizationPhone, setOrganizationPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");
    if (password !== confirmPassword) {
      setErrorMessage("The passwords do not match.");
      return;
    }
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/demo/employers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hrFirstName,
          hrMiddleName,
          hrLastName,
          organizationEmail: organizationEmail.trim().toLowerCase(),
          organizationPhone: organizationPhone.trim(),
          password,
          confirmPassword,
        }),
      });
      const result = (await response.json()) as { success?: boolean; message?: string; error?: string };
      if (!response.ok || !result.success) {
        throw new Error(result.message ?? result.error ?? "Could not register the organization.");
      }

      router.push(`/verify-email?role=employer&email=${encodeURIComponent(organizationEmail.trim().toLowerCase())}`);
    } catch (error) {
      console.error("Employer demo registration failed.", error);
      setErrorMessage(error instanceof Error ? error.message : "Could not register the organization.");
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[var(--color-background)]">
      <div className="brand-ribbon h-1.5 w-full" aria-hidden="true" />
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-700 text-white"><HeartPulse className="h-5 w-5" /></span>
            <span className="text-lg font-bold text-primary-900">Rohobot</span>
          </Link>
          <Link href="/login" className="ml-auto text-sm font-semibold text-primary-700 hover:underline">Sign in</Link>
        </div>
      </header>

      <section className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <div className="mb-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-100 text-primary-700"><Building2 className="h-6 w-6" /></div>
          <h1 className="mt-4 text-3xl font-bold text-slate-900">Register your organization</h1>
          <p className="mt-2 text-sm text-slate-600">First verify the organization email. After signing in, complete and update your organization profile.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
          <section className="space-y-4">
            <h2 className="border-b border-slate-100 pb-3 font-semibold text-slate-900">Verify organization email</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-medium text-slate-700">
                HR First name
                <input required type="text" maxLength={100} value={hrFirstName} onChange={(event) => setHrFirstName(event.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2.5" />
              </label>

              <label className="text-sm font-medium text-slate-700">
                HR Middle name
                <input required type="text" maxLength={100} value={hrMiddleName} onChange={(event) => setHrMiddleName(event.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2.5" />
              </label>
              <label className="text-sm font-medium text-slate-700">
                HR Last name
                <input required type="text" maxLength={100} value={hrLastName} onChange={(event) => setHrLastName(event.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2.5" />
              </label>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="border-b border-slate-100 pb-3 font-semibold text-slate-900">Organization account</h2>
            <label className="block text-sm font-medium text-slate-700">
              Organization email (used to sign in and verify the account)
              <input required type="email" maxLength={254} value={organizationEmail} onChange={(event) => setOrganizationEmail(event.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2.5" autoComplete="email" />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Organization Phone
              <input required type="tel" maxLength={30} value={organizationPhone} onChange={(event) => setOrganizationPhone(event.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2.5" autoComplete="tel" />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-medium text-slate-700">
                Password
                <input required type="password" minLength={12} maxLength={128} autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2.5" />
              </label>
              <label className="text-sm font-medium text-slate-700">
                Confirm password
                <input required type="password" minLength={12} maxLength={128} autoComplete="new-password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2.5" />
              </label>
            </div>
          </section>

          {errorMessage && <p role="alert" className="text-sm text-red-700">{errorMessage}</p>}
          <Button type="submit" className="w-full" isLoading={isSubmitting} disabled={isSubmitting}>
            Create account and verify organization email
          </Button>
        </form>
      </section>
    </main>
  );
}
