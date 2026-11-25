"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { HeartPulse, MailCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { FieldErrors, FormErrors } from "@/components/forms/ApiErrors";
import { normalizeApiErrors, type NormalizedApiErrors } from "@/lib/api/errors";
import { userService, UserApiError } from "@/lib/api/services/user";

const EMPTY_ERRORS: NormalizedApiErrors = { fieldErrors: {}, formErrors: [] };

export function VerifyEmailClient({
  role,
  email,
  phone: initialPhone,
}: {
  role: "candidate" | "employer";
  email: string;
  phone?: string;
}) {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [phone, setPhone] = useState(initialPhone ?? "");
  const [notice, setNotice] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isRequesting, setIsRequesting] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [fieldErrors, setFieldErrors] = useState(EMPTY_ERRORS);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = window.setTimeout(() => setCooldown((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearTimeout(timer);
  }, [cooldown]);

  const requestOtp = async () => {
    if (isRequesting || cooldown > 0) return;
    setIsRequesting(true);
    setNotice("");
    setErrorMessage("");
    try {
      await userService.resendOtp(email);
      setCooldown(60);
      setNotice("The server accepted the request, but its current implementation does not generate or deliver an OTP. Verification cannot complete until that backend behavior is fixed.");
    } catch (error) {
      console.error("Could not request verification OTP.", error);
      setErrorMessage(error instanceof Error ? error.message : "Could not create an OTP.");
      const retry = error instanceof UserApiError ? error.retryAfterSeconds : undefined;
      if (error instanceof UserApiError && error.status === 429) setCooldown(retry ?? 60);
      setFieldErrors(error instanceof UserApiError ? error.errors : normalizeApiErrors({ non_field_errors: [error instanceof Error ? error.message : "Could not create an OTP."] }));
    } finally {
      setIsRequesting(false);
    }
  };

  const verifyOtp = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsVerifying(true);
    setErrorMessage("");
    setNotice("");
    setFieldErrors(EMPTY_ERRORS);
    try {
      await userService.verifyEmail(phone, code);
      setIsVerified(true);
      setNotice("Email verified.");
      router.replace(`/login?role=${role}&verified=1&email=${encodeURIComponent(email)}`);
    } catch (error) {
      console.error("Could not verify account email.", error);
      setErrorMessage(error instanceof Error ? error.message : "OTP verification failed.");
      setFieldErrors(error instanceof UserApiError ? error.errors : normalizeApiErrors({ non_field_errors: [error instanceof Error ? error.message : "OTP verification failed."] }));
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col bg-[var(--color-background)]">
      <div className="brand-ribbon h-1.5 w-full" aria-hidden="true" />
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2.5" aria-label="Rohobot home">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-700 text-white"><HeartPulse className="h-5 w-5" /></span>
            <span className="text-lg font-bold text-primary-900">Rohobot</span>
          </Link>
        </div>
      </header>
      <section className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-7 shadow-lg sm:p-10">
          <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 text-primary-700"><MailCheck className="h-6 w-6" /></div>
          <p className="text-sm font-semibold uppercase tracking-wide text-primary-700">{role} email verification</p>
          <h1 className="mt-2 text-2xl font-bold text-slate-900">Verify your email address</h1>
          <p className="mt-3 text-sm text-slate-600">Email to verify: <strong>{email || "Not provided"}</strong></p>
          <div role="note" className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            The backend currently does not create or deliver verification OTPs during registration or resend. You can submit a code if you already received one, but a new code cannot be obtained until the backend is updated.
          </div>
          {!isVerified ? (
            <>
              <Button type="button" className="mt-5 w-full" isLoading={isRequesting} disabled={isRequesting || cooldown > 0 || !email} onClick={requestOtp}>
                {cooldown > 0 ? `Try again in ${cooldown}s` : "Request verification code"}
              </Button>
              <FormErrors errors={fieldErrors} />
              <form onSubmit={verifyOtp} className="mt-5 space-y-4">
                <label className="block text-sm font-medium text-slate-700">
                  Registered phone number
                  <input required type="tel" maxLength={10} value={phone} onChange={(event) => setPhone(event.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2.5" />
                  <FieldErrors errors={fieldErrors} field="phone" />
                </label>
                <label className="block text-sm font-medium text-slate-700">
                  Six-digit OTP
                  <input required inputMode="numeric" pattern="[0-9]{6}" maxLength={6} value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))} className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2.5 tracking-[0.3em]" />
                  <FieldErrors errors={fieldErrors} field="code" />
                </label>
                <Button type="submit" className="w-full" isLoading={isVerifying} disabled={isVerifying || code.length !== 6 || !phone}>
                  Verify email
                </Button>
              </form>
            </>
          ) : (
            <Link href={`/login?role=${role}`} className="mt-5 inline-flex w-full">
              <Button className="w-full">Continue to sign in</Button>
            </Link>
          )}
          {notice && <p role="status" className="mt-4 text-sm text-primary-800">{notice}</p>}
          {errorMessage && fieldErrors.formErrors.length === 0 && <p role="alert" className="mt-4 text-sm text-red-700">{errorMessage}</p>}
          <p className="mt-6 text-xs text-slate-500">OTP expires after 5 minutes and is limited to three failed attempts.</p>
        </div>
      </section>
    </main>
  );
}
