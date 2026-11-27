"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Eye, EyeOff, HeartPulse, KeyRound, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { FieldErrors, FormErrors } from "@/components/forms/ApiErrors";
import { normalizeApiErrors, type NormalizedApiErrors } from "@/lib/api/errors";

type LoginResponse = {
  error?: string;
  details?: unknown;
  role?: "candidate" | "employer" | "admin";
  destination?: string;
};

const EMPTY_ERRORS: NormalizedApiErrors = { fieldErrors: {}, formErrors: [] };

export default function LoginPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-[var(--color-background)]" />}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const searchParams = useSearchParams();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState<NormalizedApiErrors>(EMPTY_ERRORS);
  const [email, setEmail] = useState(searchParams.get("email") ?? "");
  const [password, setPassword] = useState("");
  const verifiedNotice = searchParams.get("verified") === "1"
    ? "Your email is verified. Sign in with the email and password you registered with."
    : "";

  const clearErrors = () => {
    setErrorMessage("");
    setFieldErrors(EMPTY_ERRORS);
  };

  const handleAccountSignIn = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSigningIn(true);
    clearErrors();

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const payload: unknown = await response.json().catch(() => null);
      const result = payload && typeof payload === "object" ? payload as LoginResponse : {};

      if (!response.ok) {
        setFieldErrors(normalizeApiErrors(result.details ?? result));
        setErrorMessage(result.error ?? "We couldn’t sign you in. Check your details and try again.");
        setIsSigningIn(false);
        return;
      }

      if (!result.destination || !["candidate", "employer", "admin"].includes(result.role ?? "")) {
        throw new Error("The sign-in service returned an invalid account response. Please try again.");
      }

      window.location.assign(result.destination);
    } catch (error) {
      console.error("Account sign-in failed.", error);
      setErrorMessage(error instanceof Error ? error.message : "We couldn’t connect. Please try again.");
      setFieldErrors(EMPTY_ERRORS);
      setIsSigningIn(false);
    }
  };

  const emailErrors = fieldErrors.fieldErrors.email_address ?? [];
  const passwordErrors = fieldErrors.fieldErrors.password ?? [];

  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--color-background)] px-4 py-6 sm:px-6 sm:py-10">
      <div className="brand-ribbon fixed inset-x-0 top-0 z-10 h-1.5" aria-hidden="true" />
      <section className="grid w-full max-w-6xl grid-cols-1 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl md:min-h-[680px] md:grid-cols-2">
        <div className="order-2 flex flex-col justify-between bg-gradient-to-br from-primary-800 to-primary-900 p-7 text-white sm:p-10 md:order-1 md:p-12">
          <div>
            <Link href="/" className="inline-flex items-center gap-2.5" aria-label="Rohobot home">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-600 text-white shadow-sm">
                <HeartPulse className="h-5 w-5" aria-hidden="true" />
              </span>
              <span className="text-lg font-bold tracking-tight">Rohobot</span>
            </Link>

            <span className="mt-12 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-2 text-xs font-medium text-primary-50 sm:mt-16">
              <ShieldCheck className="h-4 w-4" aria-hidden="true" />
              A trusted healthcare network
            </span>
            <h1 className="mt-7 max-w-lg text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-[2.75rem]">
              Where compassionate care meets opportunity.
            </h1>
            <p className="mt-5 max-w-lg text-base leading-7 text-primary-100 sm:text-lg sm:leading-8">
              Access healthcare career opportunities, professional development, and verified employer connections.
            </p>
          </div>

          <p className="mt-12 text-sm text-primary-100/80">Rohobot Home-Based Health Care Service PLC</p>
        </div>

        <div className="order-1 flex items-center justify-center p-7 sm:p-10 md:order-2 md:p-12 lg:p-16">
          <div className="w-full max-w-md">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-accent-700">Welcome</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-[2.15rem]">Sign in to Rohobot</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600 sm:text-base">
              Continue to your healthcare career network.
            </p>

            <form onSubmit={handleAccountSignIn} className="mt-8 space-y-5" aria-label="Sign in">
              {verifiedNotice && (
                <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
                  {verifiedNotice}
                </p>
              )}

              <div>
                <label htmlFor="login-email" className="block text-sm font-semibold text-slate-700">Email address</label>
                <input
                  id="login-email"
                  name="email"
                  type="email"
                  autoComplete="username"
                  autoCapitalize="none"
                  spellCheck={false}
                  required
                  disabled={isSigningIn}
                  value={email}
                  onChange={(event) => { setEmail(event.target.value); clearErrors(); }}
                  aria-invalid={emailErrors.length > 0}
                  aria-describedby={emailErrors.length ? "login-email-errors" : undefined}
                  className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-900 outline-none transition focus:border-primary-600 focus:ring-2 focus:ring-primary-600/20 disabled:bg-slate-50"
                  placeholder="Enter your email address"
                />
                {emailErrors.length > 0 && <div id="login-email-errors"><FieldErrors errors={fieldErrors} field="email_address" /></div>}
              </div>

              <div>
                <div className="flex items-center justify-between gap-3">
                  <label htmlFor="login-password" className="block text-sm font-semibold text-slate-700">Password</label>
                  <Link href="/forgot-password" className="text-sm font-semibold text-primary-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative mt-2">
                  <input
                    id="login-password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    disabled={isSigningIn}
                    value={password}
                    onChange={(event) => { setPassword(event.target.value); clearErrors(); }}
                    aria-invalid={passwordErrors.length > 0}
                    aria-describedby={passwordErrors.length ? "login-password-errors" : undefined}
                    className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-4 pr-12 text-base text-slate-900 outline-none transition focus:border-primary-600 focus:ring-2 focus:ring-primary-600/20 disabled:bg-slate-50"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((visible) => !visible)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    aria-pressed={showPassword}
                    className="absolute inset-y-0 right-0 flex items-center rounded-r-xl px-3 text-slate-500 hover:text-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-600 disabled:opacity-50"
                    disabled={isSigningIn}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" aria-hidden="true" /> : <Eye className="h-5 w-5" aria-hidden="true" />}
                  </button>
                </div>
                {passwordErrors.length > 0 && <div id="login-password-errors"><FieldErrors errors={fieldErrors} field="password" /></div>}
              </div>

              <FormErrors errors={fieldErrors} />
              {errorMessage && fieldErrors.formErrors.length === 0 && Object.keys(fieldErrors.fieldErrors).length === 0 && (
                <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">{errorMessage}</p>
              )}

              <Button type="submit" className="h-12 w-full text-base" isLoading={isSigningIn}>
                {!isSigningIn && <KeyRound className="mr-2 h-4 w-4" aria-hidden="true" />}
                {isSigningIn ? "Signing in…" : "Sign in"}
              </Button>
            </form>

            <p className="mt-6 text-sm text-slate-600">
              New employer? <Link href="/employer/register" className="font-semibold text-primary-700 hover:underline">Register your organization</Link>
            </p>
            <p className="mt-3 text-sm text-slate-600">
              Candidates need an official invitation to create an account.
            </p>
            <Link href="/" className="mt-8 inline-flex text-sm font-semibold text-primary-800 hover:text-primary-900 hover:underline">
              Return to Rohobot home
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
