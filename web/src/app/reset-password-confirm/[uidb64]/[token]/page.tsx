"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { FieldErrors, FormErrors } from "@/components/forms/ApiErrors";
import { normalizeApiErrors, type NormalizedApiErrors } from "@/lib/api/errors";
import { userService, UserApiError } from "@/lib/api/services/user";

const EMPTY_ERRORS: NormalizedApiErrors = { fieldErrors: {}, formErrors: [] };

export default function ResetPasswordConfirmPage() {
  const { uidb64, token } = useParams<{ uidb64: string; token: string }>();
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [valid, setValid] = useState(false);
  const [errors, setErrors] = useState(EMPTY_ERRORS);
  const [busy, setBusy] = useState(false);
  const [complete, setComplete] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");

  useEffect(() => {
    let active = true;
    userService.confirmPasswordReset(uidb64, token)
      .then(() => { if (active) setValid(true); })
      .catch((error: unknown) => {
        if (active) setErrors(error instanceof UserApiError ? error.errors : normalizeApiErrors({ non_field_errors: [error instanceof Error ? error.message : "This reset link is invalid or expired."] }));
      })
      .finally(() => { if (active) setChecking(false); });
    return () => { active = false; };
  }, [uidb64, token]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setErrors(EMPTY_ERRORS);
    try {
      await userService.resetPassword({ password_1: password, password_2: confirmation, uidb64, token });
      setComplete(true);
    } catch (error) {
      setErrors(error instanceof UserApiError ? error.errors : normalizeApiErrors({ non_field_errors: [error instanceof Error ? error.message : "Could not reset the password."] }));
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--color-background)] px-4 py-12">
      <section className="w-full max-w-md space-y-5 rounded-3xl border border-slate-200 bg-white p-7 shadow-lg sm:p-10">
        <div><p className="text-sm font-semibold uppercase tracking-wide text-primary-700">Account recovery</p><h1 className="mt-2 text-2xl font-bold text-slate-900">Reset your password</h1></div>
        {checking ? <p role="status" className="text-sm text-slate-600">Checking reset link...</p> : !valid ? <><FormErrors errors={errors} /><p className="text-sm text-slate-600">This password reset link is invalid or expired. Request a new link to continue.</p><Link href="/forgot-password" className="inline-flex text-sm font-semibold text-primary-700 hover:underline">Request another reset link</Link></> : complete ? <><p role="status" className="text-sm text-emerald-700">Password reset completed.</p><Button className="w-full" onClick={() => router.replace("/login")}>Continue to sign in</Button></> : (
          <form onSubmit={submit} className="space-y-4">
            <label className="block text-sm font-medium text-slate-700">New password<input required type="password" minLength={8} autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2.5" /><FieldErrors errors={errors} field="password_1" /></label>
            <label className="block text-sm font-medium text-slate-700">Confirm new password<input required type="password" minLength={8} autoComplete="new-password" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2.5" /><FieldErrors errors={errors} field="password_2" /></label>
            <FormErrors errors={errors} />
            <Button type="submit" className="w-full" isLoading={busy} disabled={busy}>Set new password</Button>
          </form>
        )}
      </section>
    </main>
  );
}
