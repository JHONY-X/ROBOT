"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { FieldErrors, FormErrors } from "@/components/forms/ApiErrors";
import { normalizeApiErrors, type NormalizedApiErrors } from "@/lib/api/errors";
import { userService, UserApiError } from "@/lib/api/services/user";

const EMPTY_ERRORS: NormalizedApiErrors = { fieldErrors: {}, formErrors: [] };

export function AccountSettings() {
  const [profile, setProfile] = useState({ first_name: "", last_name: "", phone_number: "" });
  const [password, setPassword] = useState({ current_password: "", password_1: "", password_2: "" });
  const [profileErrors, setProfileErrors] = useState(EMPTY_ERRORS);
  const [passwordErrors, setPasswordErrors] = useState(EMPTY_ERRORS);
  const [profileBusy, setProfileBusy] = useState(false);
  const [passwordBusy, setPasswordBusy] = useState(false);
  const [profileNotice, setProfileNotice] = useState("");
  const [passwordNotice, setPasswordNotice] = useState("");

  const saveProfile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setProfileBusy(true);
    setProfileErrors(EMPTY_ERRORS);
    setProfileNotice("");
    try {
      const result = await userService.changeProfile(profile);
      setProfile((current) => ({ ...current, ...((result as { data?: Partial<typeof current> } | null)?.data ?? {}) }));
      setProfileNotice("Account profile updated.");
      window.dispatchEvent(new CustomEvent("rohobot:profile-updated", { detail: profile }));
    } catch (error) {
      setProfileErrors(error instanceof UserApiError ? error.errors : normalizeApiErrors({ non_field_errors: [error instanceof Error ? error.message : "Could not update profile."] }));
    } finally {
      setProfileBusy(false);
    }
  };

  const changePassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPasswordBusy(true);
    setPasswordErrors(EMPTY_ERRORS);
    setPasswordNotice("");
    try {
      await userService.changePassword(password);
      setPassword({ current_password: "", password_1: "", password_2: "" });
      setPasswordNotice("Password changed. You can continue using this session.");
    } catch (error) {
      setPasswordErrors(error instanceof UserApiError ? error.errors : normalizeApiErrors({ non_field_errors: [error instanceof Error ? error.message : "Could not change password."] }));
    } finally {
      setPasswordBusy(false);
    }
  };

  return (
    <section className="space-y-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">Account settings</h2>
        <p className="mt-1 text-sm text-slate-600">The account API does not currently expose a profile-read route, so enter the account details you want to update.</p>
      </div>
      <form onSubmit={saveProfile} className="space-y-4">
        <h3 className="font-semibold text-slate-800">Basic account profile</h3>
        <div className="grid gap-4 sm:grid-cols-3">
          {(["first_name", "last_name", "phone_number"] as const).map((field) => (
            <label key={field} className="block text-sm font-medium text-slate-700">
              {field === "first_name" ? "First name" : field === "last_name" ? "Last name" : "Phone number"}
              <input required maxLength={field === "phone_number" ? 10 : 20} type="text" value={profile[field]} onChange={(event) => setProfile((current) => ({ ...current, [field]: event.target.value }))} className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2.5" />
              <FieldErrors errors={profileErrors} field={field} />
            </label>
          ))}
        </div>
        <FormErrors errors={profileErrors} />
        {profileNotice && <p role="status" className="text-sm text-emerald-700">{profileNotice}</p>}
        <Button type="submit" isLoading={profileBusy} disabled={profileBusy}>Save account profile</Button>
      </form>

      <form onSubmit={changePassword} className="space-y-4 border-t border-slate-100 pt-6">
        <h3 className="font-semibold text-slate-800">Change password</h3>
        {(["current_password", "password_1", "password_2"] as const).map((field) => (
          <label key={field} className="block text-sm font-medium text-slate-700">
            {field === "current_password" ? "Current password" : field === "password_1" ? "New password" : "Confirm new password"}
            <input required type="password" autoComplete={field === "current_password" ? "current-password" : "new-password"} value={password[field]} onChange={(event) => setPassword((current) => ({ ...current, [field]: event.target.value }))} className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2.5" />
            <FieldErrors errors={passwordErrors} field={field} />
          </label>
        ))}
        <FormErrors errors={passwordErrors} />
        {passwordNotice && <p role="status" className="text-sm text-emerald-700">{passwordNotice}</p>}
        <Button type="submit" isLoading={passwordBusy} disabled={passwordBusy}>Change password</Button>
      </form>
    </section>
  );
}
