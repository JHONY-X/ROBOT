"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/Button";
import { FieldErrors, FormErrors } from "@/components/forms/ApiErrors";
import { normalizeApiErrors, type NormalizedApiErrors } from "@/lib/api/errors";
import { organizationApi, OrganizationApiError, type Organization, type OrganizationType } from "@/lib/api/services/organization";
import { ArrowRight, Building2 } from "lucide-react";

type OrganizationDraft = {
  organization_name: string;
  organization_type: OrganizationType;
  tin_number: string;
  website: string;
  country: string;
  region: string;
  city: string;
  address: string;
  hr_email: string;
  hr_phone: string;
};

const EMPTY_ORGANIZATION: OrganizationDraft = {
  organization_name: "",
  organization_type: "hospital",
  tin_number: "",
  website: "",
  country: "Ethiopia",
  region: "",
  city: "",
  address: "",
  hr_email: "",
  hr_phone: "",
};
const EMPTY_ERRORS: NormalizedApiErrors = { fieldErrors: {}, formErrors: [] };
function errorState(error: unknown): NormalizedApiErrors {
  return error instanceof OrganizationApiError
    ? error.errors
    : normalizeApiErrors({ non_field_errors: [error instanceof Error ? error.message : "The request could not be completed."] });
}

function appendOrganizationFields(formData: FormData, draft: OrganizationDraft) {
  Object.entries(draft).forEach(([key, value]) => {
    formData.append(key, value);
  });
}

export default function EmployerProfilePage() {
  const [profile, setProfile] = useState<Organization | null>(null);
  const [draft, setDraft] = useState<OrganizationDraft>(EMPTY_ORGANIZATION);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoInputKey, setLogoInputKey] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [profileErrors, setProfileErrors] = useState(EMPTY_ERRORS);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    let active = true;
    organizationApi.getMine()
      .then((current) => {
        if (!active) return;
        setProfile(current);
        setDraft({
          organization_name: current.organization_name,
          organization_type: current.organization_type,
          tin_number: current.tin_number,
          website: current.website ?? "",
          country: current.country,
          region: current.region,
          city: current.city,
          address: current.address,
          hr_email: current.hr_email,
          hr_phone: current.hr_phone,
        });
      })
      .catch((error: unknown) => {
        if (!active) return;
        if (error instanceof OrganizationApiError && error.status === 404) return;
        setErrorMessage(error instanceof Error ? error.message : "Could not load organization profile.");
      })
      .finally(() => { if (active) setIsLoading(false); });
    return () => { active = false; };
  }, []);

  const setField = (field: keyof OrganizationDraft, value: string) => {
    setDraft((current) => ({ ...current, [field]: value }));
  };

  const saveProfile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    setProfileErrors(EMPTY_ERRORS);
    setErrorMessage("");
    setSuccessMessage("");
    try {
      if (!profile && !logoFile) throw new Error("Select an organization logo to create the profile.");
      if (logoFile && logoFile.size > 10 * 1024 * 1024) throw new Error("The organization logo must be 10 MB or smaller.");
      const formData = new FormData();
      appendOrganizationFields(formData, draft);
      if (logoFile) formData.append("organazation_logo", logoFile);
      const saved = profile ? await organizationApi.updateMine(formData) : await organizationApi.createMine(formData);
      setProfile(saved);
      setLogoFile(null);
      setLogoInputKey((key) => key + 1);
      setDraft({
        organization_name: saved.organization_name,
        organization_type: saved.organization_type,
        tin_number: saved.tin_number,
        website: saved.website ?? "",
        country: saved.country,
        region: saved.region,
        city: saved.city,
        address: saved.address,
        hr_email: saved.hr_email,
        hr_phone: saved.hr_phone,
      });
      setSuccessMessage(profile ? "Organization profile updated." : "Organization profile created.");
    } catch (error) {
      setProfileErrors(errorState(error));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <DashboardLayout role="employer">
      <div className="mx-auto max-w-4xl space-y-6">
        <header><h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900"><Building2 className="h-6 w-6 text-primary-700" />Organization profile</h1><p className="mt-1 text-sm text-slate-600">Create or update your organization details, then continue to document verification.</p></header>
        {errorMessage && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{errorMessage}</p>}
        {successMessage && <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">{successMessage}</p>}

        {isLoading ? <p role="status" className="py-8 text-sm text-slate-600">Loading organization profile...</p> : <form onSubmit={saveProfile} className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-lg font-semibold text-slate-900">{profile ? "Organization details" : "Create organization profile"}</h2>{profile && <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold capitalize text-slate-700">Verification: {profile.verification_status}</span>}</div>
          {profile && <div className="grid gap-4 sm:grid-cols-2"><ReadOnlyField label="Organization email" value={profile.hr_email} /><ReadOnlyField label="Profile created" value={new Date(profile.created_at).toLocaleDateString()} /></div>}
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-medium text-slate-700 sm:col-span-2">Organization name<input required maxLength={255} value={draft.organization_name} onChange={(event) => setField("organization_name", event.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2.5" /><FieldErrors errors={profileErrors} field="organization_name" /></label>
            <label className="text-sm font-medium text-slate-700">Organization type<select required value={draft.organization_type} onChange={(event) => setField("organization_type", event.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5">{[["hospital", "Hospital"], ["clinic", "Clinic"], ["home_based_provider", "Home-based healthcare provider"], ["healthcare_center", "Healthcare center"], ["other", "Other"]].map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select><FieldErrors errors={profileErrors} field="organization_type" /></label>
            <label className="text-sm font-medium text-slate-700">TIN number<input required maxLength={100} value={draft.tin_number} onChange={(event) => setField("tin_number", event.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2.5" /><FieldErrors errors={profileErrors} field="tin_number" /></label>
            <label className="text-sm font-medium text-slate-700">Website (optional)<input type="url" value={draft.website} onChange={(event) => setField("website", event.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2.5" /><FieldErrors errors={profileErrors} field="website" /></label>
            <label className="text-sm font-medium text-slate-700">Country<input required maxLength={100} value={draft.country} onChange={(event) => setField("country", event.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2.5" /><FieldErrors errors={profileErrors} field="country" /></label>
            <label className="text-sm font-medium text-slate-700">Region<input required maxLength={100} value={draft.region} onChange={(event) => setField("region", event.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2.5" /><FieldErrors errors={profileErrors} field="region" /></label>
            <label className="text-sm font-medium text-slate-700">City<input required maxLength={100} value={draft.city} onChange={(event) => setField("city", event.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2.5" /><FieldErrors errors={profileErrors} field="city" /></label>
            <label className="text-sm font-medium text-slate-700">HR phone<input required type="tel" maxLength={10} value={draft.hr_phone} onChange={(event) => setField("hr_phone", event.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2.5" /><FieldErrors errors={profileErrors} field="hr_phone" /></label>
            <label className="text-sm font-medium text-slate-700 sm:col-span-2">HR email<input required type="email" maxLength={100} value={draft.hr_email} onChange={(event) => setField("hr_email", event.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2.5" /><FieldErrors errors={profileErrors} field="hr_email" /></label>
            <label className="text-sm font-medium text-slate-700 sm:col-span-2">Address<textarea required rows={3} value={draft.address} onChange={(event) => setField("address", event.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2.5" /><FieldErrors errors={profileErrors} field="address" /></label>
            <label className="text-sm font-medium text-slate-700 sm:col-span-2">Organization logo{profile?.organazation_logo && <a href={profile.organazation_logo} target="_blank" rel="noreferrer" className="ml-2 text-xs font-semibold text-primary-700 hover:underline">View current logo</a>}<input key={logoInputKey} required={!profile} type="file" accept="image/png,image/jpeg" onChange={(event) => setLogoFile(event.target.files?.[0] ?? null)} className="mt-1.5 block w-full rounded-xl border border-slate-300 p-2" /><FieldErrors errors={profileErrors} field="organazation_logo" /><span className="mt-1 block text-xs text-slate-500">PNG or JPEG, up to 10 MB.</span></label>
          </div>
          <FormErrors errors={profileErrors} />
          <Button type="submit" isLoading={isSaving} disabled={isSaving}>{profile ? "Save organization profile" : "Create organization profile"}</Button>
        </form>}

        {profile && <section className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8"><div><h2 className="text-lg font-semibold text-slate-900">Next: organization documents</h2><p className="mt-1 text-sm text-slate-600">Upload and manage the documents required for organization verification.</p></div><Link href="/employer/profile/documents" className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700">Continue to documents<ArrowRight className="h-4 w-4" /></Link></section>}
      </div>
    </DashboardLayout>
  );
}

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return <div><p className="text-xs font-medium text-slate-500">{label}</p><p className="mt-1 rounded-xl bg-slate-50 px-3 py-2.5 text-sm text-slate-800">{value}</p></div>;
}
