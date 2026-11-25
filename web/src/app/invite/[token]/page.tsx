"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { HeartPulse, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { FieldErrors, FormErrors } from "@/components/forms/ApiErrors";
import { normalizeApiErrors, type NormalizedApiErrors } from "@/lib/api/errors";
import { userService, UserApiError } from "@/lib/api/services/user";

interface InvitationInspection {
  valid: boolean;
  message: string;
}

export default function CandidateInvitationPage() {
  const { token } = useParams<{ token: string }>();
  const router = useRouter();
  const [invitation] = useState<InvitationInspection>({
    valid: true,
    message: "The invitation will be validated when you submit registration.",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [secondName, setSecondName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState<NormalizedApiErrors>({ fieldErrors: {}, formErrors: [] });

  const handleRegister = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");
    setFieldErrors({ fieldErrors: {}, formErrors: [] });
    if (password !== confirmPassword) {
      setErrorMessage("The passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    try {
      await userService.register({
        first_name: firstName.trim(),
        middle_name: middleName.trim(),
        last_name: secondName.trim(),
        email_address: email.trim().toLowerCase(),
        phone_number: phone.trim(),
        password,
        password2: confirmPassword,
        invitation_link: token,
      });

      router.replace(`/login?role=candidate&verified=1&email=${encodeURIComponent(email.trim().toLowerCase())}`);
    } catch (error) {
      console.error("Candidate registration failed.", error);
      setErrorMessage(error instanceof Error ? error.message : "Registration failed. Try again.");
      setFieldErrors(error instanceof UserApiError ? error.errors : normalizeApiErrors({ non_field_errors: [error instanceof Error ? error.message : "Registration failed. Try again."] }));
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col bg-[var(--color-background)]">
      <div className="brand-ribbon h-1.5 w-full" aria-hidden="true" />
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2.5" aria-label="Rohobot home">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-700 text-white">
              <HeartPulse className="h-5 w-5" />
            </span>
            <span className="text-lg font-bold text-primary-900">Rohobot</span>
          </Link>
        </div>
      </header>

      <section className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-7 shadow-lg sm:p-10">
          <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 text-primary-700">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <p className="text-sm font-semibold uppercase tracking-wide text-primary-700">Official candidate invitation</p>
          <h1 className="mt-2 text-2xl font-bold text-slate-900">Create your candidate account</h1>

          {!invitation.valid ? (
            <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
              <p role="alert" className="text-sm text-amber-900">{invitation?.message}</p>
              <Link href="/login" className="mt-4 inline-flex text-sm font-semibold text-primary-700 hover:underline">
                Go to candidate sign in
              </Link>
            </div>
          ) : (
            <form onSubmit={handleRegister} className="mt-6 space-y-4">
              <p role="status" className="rounded-xl border border-primary-200 bg-primary-50 p-4 text-sm text-primary-900">
                {invitation.message}
              </p>
              <div className="grid gap-4 sm:grid-cols-3">
                <label className="text-sm font-medium text-slate-700">
                  First name
                  <input required maxLength={20} autoComplete="given-name" value={firstName} onChange={(event) => setFirstName(event.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2.5" />
                  <FieldErrors errors={fieldErrors} field="first_name" />
                </label>
                <label className="text-sm font-medium text-slate-700">
                  Middle name
                  <input required maxLength={20} autoComplete="additional-name" value={middleName} onChange={(event) => setMiddleName(event.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2.5" />
                  <FieldErrors errors={fieldErrors} field="middle_name" />
                </label>
                <label className="text-sm font-medium text-slate-700">
                  Last name
                  <input required maxLength={20} autoComplete="family-name" value={secondName} onChange={(event) => setSecondName(event.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2.5" />
                  <FieldErrors errors={fieldErrors} field="last_name" />
                </label>
              </div>
              <label className="block text-sm font-medium text-slate-700">
                Email address
                <input required type="email" maxLength={254} autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2.5" />
                <FieldErrors errors={fieldErrors} field="email_address" />
              </label>
              <label className="block text-sm font-medium text-slate-700">
                Phone number
                <input required type="tel" maxLength={10} autoComplete="tel" value={phone} onChange={(event) => setPhone(event.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2.5" />
                <FieldErrors errors={fieldErrors} field="phone_number" />
              </label>
              <label className="block text-sm font-medium text-slate-700">
                Password
                <input required type="password" minLength={12} maxLength={128} autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2.5" />
                <FieldErrors errors={fieldErrors} field="password" />
              </label>
              <label className="block text-sm font-medium text-slate-700">
                Confirm password
                <input required type="password" minLength={12} maxLength={128} autoComplete="new-password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2.5" />
                <FieldErrors errors={fieldErrors} field="password2" />
              </label>
              <FormErrors errors={fieldErrors} />
              {errorMessage && fieldErrors.formErrors.length === 0 && <p role="alert" className="text-sm text-red-700">{errorMessage}</p>}
              <Button type="submit" className="w-full" isLoading={isSubmitting} disabled={isSubmitting}>
                Register and verify email
              </Button>
            </form>
          )}
        </div>
      </section>
    </main>
  );
}
