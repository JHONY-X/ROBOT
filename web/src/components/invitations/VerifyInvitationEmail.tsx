"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { invitationService } from "@/lib/api/services/invitation";

export function VerifyInvitationEmail({ initialToken = "" }: { initialToken?: string }) {
  const [token, setToken] = useState(initialToken);
  const [busy, setBusy] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const verify = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setErrorMessage("");
    setSuccessMessage("");
    try {
      const result = await invitationService.verifyEmail(token.trim());
      setSuccessMessage(result.message);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Could not verify the invitation email.");
    } finally { setBusy(false); }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--color-background)] px-4 py-12">
      <section className="w-full max-w-lg space-y-5 rounded-3xl border border-slate-200 bg-white p-7 shadow-lg sm:p-10">
        <div><p className="text-sm font-semibold uppercase tracking-wide text-primary-700">Candidate invitation</p><h1 className="mt-2 text-2xl font-bold text-slate-900">Verify invitation email</h1><p className="mt-2 text-sm text-slate-600">Submit the verification token from the invitation email. This confirms the email before an administrator sends the registration invitation.</p></div>
        <form onSubmit={verify} className="space-y-4">
          <label className="block text-sm font-medium text-slate-700">Verification token<input required value={token} onChange={(event) => setToken(event.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2.5 font-mono text-sm" /></label>
          {errorMessage && <p role="alert" className="text-sm text-red-700">{errorMessage}</p>}
          {successMessage && <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">{successMessage} The invitation sender must then send the registration link.</p>}
          <Button type="submit" className="w-full" isLoading={busy} disabled={busy}>Verify email</Button>
        </form>
        <Link href="/login" className="inline-flex text-sm font-semibold text-primary-700 hover:underline">Back to sign in</Link>
      </section>
    </main>
  );
}
