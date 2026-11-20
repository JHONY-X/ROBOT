"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/Button";
import { Building2, FileText } from "lucide-react";

const ORGANIZATION_TYPES = ["Hospital", "Clinic", "Home-Based Care", "Other"] as const;
const MAX_FILE_BYTES = 2 * 1024 * 1024;

interface EmployerProfile {
  hrFirstName: string;
  hrMiddleName: string;
  hrLastName: string;
  organizationEmail: string;
  emailVerified: boolean;
  organizationName: string;
  organizationType: string;
  city: string;
  subcity: string;
  organizationPhone: string;
  representativePhone: string;
  businessLicenseFileName: string;
  status: string;
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") resolve(reader.result);
      else reject(new Error("Could not read the business license."));
    };
    reader.onerror = () => reject(new Error("Could not read the business license."));
    reader.readAsDataURL(file);
  });
}

export default function EmployerProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<EmployerProfile | null>(null);
  const [licenseFile, setLicenseFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    let active = true;
    fetch("/api/demo/employers", { cache: "no-store" })
      .then(async (response) => {
        const result = await response.json() as { profile?: EmployerProfile; error?: string };
        if (!response.ok || !result.profile) throw new Error(result.error ?? "Could not load organization profile.");
        if (active) setProfile(result.profile);
      })
      .catch((error: unknown) => {
        if (active) setErrorMessage(error instanceof Error ? error.message : "Could not load organization profile.");
      })
      .finally(() => { if (active) setIsLoading(false); });
    return () => { active = false; };
  }, []);

  const updateField = (field: keyof EmployerProfile, value: string) => {
    setProfile((current) => current ? { ...current, [field]: value } : current);
  };

  const saveProfile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!profile) return;
    setIsSaving(true);
    setErrorMessage("");
    setSuccessMessage("");
    try {
      let businessLicenseDataUrl = "";
      if (licenseFile) {
        if (licenseFile.size > MAX_FILE_BYTES) throw new Error("The business license must be 2 MB or smaller.");
        businessLicenseDataUrl = await readFileAsDataUrl(licenseFile);
      }
      const response = await fetch("/api/demo/employers", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organizationName: profile.organizationName,
          organizationType: profile.organizationType,
          city: profile.city,
          subcity: profile.subcity,
          organizationPhone: profile.organizationPhone,
          representativePhone: profile.representativePhone,
          businessLicenseFileName: licenseFile?.name ?? "",
          businessLicenseDataUrl,
        }),
      });
      const result = await response.json() as { success?: boolean; message?: string; error?: string };
      if (!response.ok || !result.success) throw new Error(result.error ?? result.message ?? "Could not save organization profile.");
      if (profile.status === "Profile incomplete") {
        router.push("/employer/packages");
        return;
      }
      setProfile({
        ...profile,
        status: profile.status === "Profile incomplete" ? "Pending payment" : profile.status,
        businessLicenseFileName: licenseFile?.name ?? profile.businessLicenseFileName,
      });
      setLicenseFile(null);
      setSuccessMessage("Organization profile saved.");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Could not save organization profile.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <DashboardLayout role="employer">
      <div className="mx-auto max-w-4xl space-y-6">
        <header>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900">
            <Building2 className="h-6 w-6 text-primary-700" /> Organization Profile
          </h1>
          <p className="mt-1 text-sm text-slate-600">Your organization email is verified. Complete or update the company details below.</p>
        </header>

        {errorMessage && !profile && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{errorMessage}</p>}
        {isLoading ? <p className="py-8 text-sm text-slate-600">Loading organization profile...</p> : profile && (
          <form onSubmit={saveProfile} className="space-y-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
            <section className="space-y-4">
              <h2 className="border-b border-slate-100 pb-3 font-semibold text-slate-900">Verified account</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <ReadOnlyField label="HR contact" value={`${profile.hrFirstName} ${profile.hrMiddleName} ${profile.hrLastName}`} />
                <ReadOnlyField label="Verified organization email" value={profile.organizationEmail} />
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="border-b border-slate-100 pb-3 font-semibold text-slate-900">Organization details</h2>
              <label className="block text-sm font-medium text-slate-700">
                Organization name
                <input required maxLength={160} value={profile.organizationName} onChange={(event) => updateField("organizationName", event.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2.5" autoComplete="organization" />
              </label>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="text-sm font-medium text-slate-700">
                  Organization type
                  <select required value={profile.organizationType} onChange={(event) => updateField("organizationType", event.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5">
                    <option value="">Select type</option>
                    {ORGANIZATION_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}
                  </select>
                </label>
                <label className="text-sm font-medium text-slate-700">
                  City
                  <input required maxLength={100} value={profile.city} onChange={(event) => updateField("city", event.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2.5" autoComplete="address-level2" />
                </label>
                <label className="text-sm font-medium text-slate-700">
                  Subcity
                  <input required maxLength={100} value={profile.subcity} onChange={(event) => updateField("subcity", event.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2.5" />
                </label>
                <label className="text-sm font-medium text-slate-700">
                  Organization phone
                  <input required type="tel" maxLength={30} value={profile.organizationPhone} onChange={(event) => updateField("organizationPhone", event.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2.5" autoComplete="tel" />
                </label>
                <label className="text-sm font-medium text-slate-700">
                  HR contact phone
                  <input required type="tel" maxLength={30} value={profile.representativePhone} onChange={(event) => updateField("representativePhone", event.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2.5" />
                </label>
              </div>
            </section>

            <section className="space-y-3">
              <h2 className="border-b border-slate-100 pb-3 font-semibold text-slate-900">Business license</h2>
              {profile.businessLicenseFileName && (
                <p className="flex items-center gap-2 text-sm text-slate-600">
                  <FileText className="h-4 w-4" /> Current file: {profile.businessLicenseFileName}
                </p>
              )}
              <label className="block text-sm font-medium text-slate-700">
                {profile.businessLicenseFileName ? "Replace business license (optional)" : "Upload business license"}
                <input required={!profile.businessLicenseFileName} type="file" accept=".pdf,image/png,image/jpeg,image/webp" onChange={(event) => setLicenseFile(event.target.files?.[0] ?? null)} className="mt-1.5 block w-full rounded-xl border border-slate-300 p-2" />
                <span className="mt-1 block text-xs text-slate-500">PDF, PNG, JPG, or WebP up to 2 MB.</span>
              </label>
            </section>

            {errorMessage && <p role="alert" className="text-sm text-red-700">{errorMessage}</p>}
            {successMessage && <p role="status" className="text-sm text-emerald-700">{successMessage}</p>}
            <Button type="submit" className="w-full sm:w-auto" isLoading={isSaving} disabled={isSaving}>
              {profile.status === "Profile incomplete" ? "Save profile and continue to packages" : "Save profile"}
            </Button>
          </form>
        )}
      </div>
    </DashboardLayout>
  );
}

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className="mt-1 rounded-xl bg-slate-50 px-3 py-2.5 text-sm text-slate-800">{value}</p>
    </div>
  );
}
