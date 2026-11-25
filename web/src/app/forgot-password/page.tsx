"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { FieldErrors, FormErrors } from "@/components/forms/ApiErrors";
import { normalizeApiErrors, type NormalizedApiErrors } from "@/lib/api/errors";
import { userService, UserApiError } from "@/lib/api/services/user";

const EMPTY_ERRORS: NormalizedApiErrors = { fieldErrors: {}, formErrors: [] };

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState(EMPTY_ERRORS);
  const [busy, setBusy] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setSubmitted(false);
    setErrors(EMPTY_ERRORS);
    try {
      await userService.requestPasswordReset(email.trim());
      setSubmitted(true);
    } catch (error) {
      setErrors(error instanceof UserApiError ? error.errors : normalizeApiErrors({ non_field_errors: [error instanceof Error ? error.message : "Could not submit the password reset request."] }));
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--color-background)] px-4 py-12">
      <section className="w-full max-w-md space-y-5 rounded-3xl border border-slate-200 bg-white p-7 shadow-lg sm:p-10">
        <div><p className="text-sm font-semibold uppercase tracking-wide text-primary-700">Account recovery</p><h1 className="mt-2 text-2xl font-bold text-slate-900">Forgot your password?</h1><p className="mt-2 text-sm text-slate-600">Enter your registered email address to request a reset link.</p></div>
        <form onSubmit={submit} className="space-y-4">
          <label className="block text-sm font-medium text-slate-700">Email address<input required type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2.5" /><FieldErrors errors={errors} field="email_address" /></label>
          <FormErrors errors={errors} />
          {submitted && <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">The request was accepted. If the account is eligible, the backend sends a reset email.</p>}
          <Button type="submit" className="w-full" isLoading={busy} disabled={busy}>Request reset link</Button>
        </form>
        <Link href="/login" className="inline-flex text-sm font-semibold text-primary-700 hover:underline">Back to sign in</Link>
      </section>
    </main>
  );
}
