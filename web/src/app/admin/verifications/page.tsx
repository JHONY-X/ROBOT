"use client";

import { useCallback, useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/Button";
import { professionalsService, type ProfessionalProfile } from "@/lib/api/services/professionals";
import { Briefcase, CheckCircle2, ExternalLink, FileText, GraduationCap, MapPin, RefreshCw, ShieldCheck, UserRound, XCircle } from "lucide-react";

const candidateDocuments: { label: string; key: "profile_picture" | "license" | "id_front" | "id_back" | "crime_letter" }[] = [
  { label: "Profile photo", key: "profile_picture" },
  { label: "Professional license", key: "license" },
  { label: "ID front", key: "id_front" },
  { label: "ID back", key: "id_back" },
  { label: "Police clearance letter", key: "crime_letter" },
];

export default function AdminVerificationsPage() {
  const [candidates, setCandidates] = useState<ProfessionalProfile[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<ProfessionalProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [detailsLoadingId, setDetailsLoadingId] = useState<number | null>(null);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const loadCandidates = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage("");
    try {
      setCandidates(await professionalsService.adminProfiles());
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Could not load candidate reviews.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { void loadCandidates(); }, [loadCandidates]);

  const showCandidate = async (id: number) => {
    setDetailsLoadingId(id);
    setErrorMessage("");
    try {
      setSelectedCandidate(await professionalsService.adminProfile(id));
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Could not load candidate details.");
    } finally {
      setDetailsLoadingId(null);
    }
  };

  const reviewCandidate = async (candidate: ProfessionalProfile, status: "verified" | "rejected") => {
    setProcessingId(candidate.id);
    setErrorMessage("");
    setSuccessMessage("");
    try {
      const result = await professionalsService.verifyProfile(candidate.id, status);
      setCandidates((rows) => rows.map((row) => row.id === candidate.id ? { ...row, verification_status: status } : row));
      setSelectedCandidate((current) => current?.id === candidate.id ? { ...current, ...result.data, verification_status: status } : current);
      setSuccessMessage(`${candidate.full_name ?? "Candidate"} ${status === "verified" ? "approved" : "rejected"}.`);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : `Could not ${status === "verified" ? "approve" : "reject"} this candidate.`);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <header className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900"><ShieldCheck className="h-6 w-6 text-primary-600" />Candidate Review</h1>
            <p className="mt-1 text-sm text-slate-500">Open a candidate&apos;s details and documents before approving or rejecting their profile.</p>
          </div>
          <Button type="button" variant="outline" isLoading={isLoading} onClick={() => void loadCandidates()}><RefreshCw className="mr-2 h-4 w-4" />Refresh</Button>
        </header>

        {errorMessage && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{errorMessage}</p>}
        {successMessage && <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">{successMessage}</p>}

        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          {isLoading ? <p role="status" className="p-12 text-center text-sm text-slate-500">Loading candidates...</p> : candidates.length ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[680px] text-left text-sm">
                <thead className="border-b border-slate-200 bg-slate-50 text-slate-500"><tr><th className="px-5 py-3 font-medium">Candidate</th><th className="px-5 py-3 font-medium">Category</th><th className="px-5 py-3 font-medium">Location</th><th className="px-5 py-3 font-medium">Status</th><th className="px-5 py-3 text-right font-medium">Details</th></tr></thead>
                <tbody className="divide-y divide-slate-100">
                  {candidates.map((candidate) => <tr key={candidate.id} className={selectedCandidate?.id === candidate.id ? "bg-primary-50/50" : "hover:bg-slate-50/70"}>
                    <td className="px-5 py-4 font-medium text-slate-900">{candidate.full_name || `Candidate ${candidate.id}`}</td>
                    <td className="px-5 py-4 capitalize text-slate-600">{candidate.professional_category.replaceAll("_", " ")}</td>
                    <td className="px-5 py-4 text-slate-600">{candidate.current_location || "—"}</td>
                    <td className="px-5 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${candidate.verification_status === "verified" ? "bg-emerald-50 text-emerald-700" : candidate.verification_status === "rejected" ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-700"}`}>{candidate.verification_status}</span></td>
                    <td className="px-5 py-4 text-right"><Button type="button" size="sm" variant="outline" isLoading={detailsLoadingId === candidate.id} disabled={detailsLoadingId !== null || processingId !== null} onClick={() => void showCandidate(candidate.id)}><UserRound className="mr-1.5 h-4 w-4" />Details</Button></td>
                  </tr>)}
                </tbody>
              </table>
            </div>
          ) : <p className="p-8 text-center text-sm text-slate-500">No candidate profiles found.</p>}
        </section>

        {selectedCandidate && <section aria-labelledby="candidate-details-heading" className="space-y-5 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <header className="flex flex-wrap items-start justify-between gap-3">
            <div><h2 id="candidate-details-heading" className="text-xl font-semibold text-slate-900">{selectedCandidate.full_name || `Candidate ${selectedCandidate.id}`}</h2><p className="mt-1 text-sm capitalize text-slate-600">{selectedCandidate.professional_category.replaceAll("_", " ")} · <span className="capitalize">{selectedCandidate.verification_status}</span></p></div>
            <Button type="button" variant="ghost" size="sm" onClick={() => setSelectedCandidate(null)}>Close details</Button>
          </header>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Detail label="Candidate ID" value={String(selectedCandidate.id)} />
            <Detail label="Gender" value={selectedCandidate.gender} />
            <Detail label="Date of birth" value={selectedCandidate.date_of_birth} />
            <Detail label="Current location" value={selectedCandidate.current_location} />
            <Detail label="Preferred location" value={selectedCandidate.preferred_location || "—"} />
            <Detail label="Availability" value={selectedCandidate.availability_status} />
            <Detail label="Employment preference" value={selectedCandidate.employment_preference.replaceAll("_", " ")} />
            <Detail label="Consent to data processing" value={selectedCandidate.consent_to_data_processing ? "Given" : "Not given"} />
          </div>

          <section className="space-y-2"><h3 className="font-semibold text-slate-900">Professional summary</h3><p className="whitespace-pre-wrap rounded-lg bg-slate-50 p-3 text-sm text-slate-700">{selectedCandidate.professional_summary || "No summary provided."}</p></section>
          <section className="space-y-2"><h3 className="font-semibold text-slate-900">Skills</h3>{selectedCandidate.skills?.length ? <div className="flex flex-wrap gap-2">{selectedCandidate.skills.map((skill) => <span key={skill} className="rounded-full bg-primary-50 px-3 py-1 text-xs font-medium text-primary-800">{skill}</span>)}</div> : <p className="text-sm text-slate-500">No skills listed.</p>}</section>

          <section className="space-y-2"><h3 className="flex items-center gap-2 font-semibold text-slate-900"><FileText className="h-4 w-4" />Submitted documents</h3><div className="grid gap-2 sm:grid-cols-2">{candidateDocuments.map(({ label, key }) => {
            const url = selectedCandidate[key];
            return <div key={key} className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 p-3"><span className="text-sm text-slate-700">{label}</span>{url ? <a href={url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sm font-semibold text-primary-700 hover:underline">Open <ExternalLink className="h-3.5 w-3.5" /></a> : <span className="text-xs text-slate-400">Not provided</span>}</div>;
          })}</div></section>

          <section className="space-y-2"><h3 className="flex items-center gap-2 font-semibold text-slate-900"><GraduationCap className="h-4 w-4" />Qualifications</h3>{selectedCandidate.qualifications?.length ? <div className="divide-y divide-slate-100 rounded-lg border border-slate-200">{selectedCandidate.qualifications.map((qualification) => <article key={qualification.id} className="flex flex-wrap items-center justify-between gap-2 p-3"><div><p className="font-medium text-slate-900">{qualification.title}</p><p className="text-sm text-slate-600">{qualification.institution} · {qualification.qualification_level || "Level not specified"}</p></div>{qualification.document_file && <a href={qualification.document_file} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sm font-semibold text-primary-700 hover:underline">Open certificate <ExternalLink className="h-3.5 w-3.5" /></a>}</article>)}</div> : <p className="text-sm text-slate-500">No qualifications listed.</p>}</section>

          <section className="space-y-2"><h3 className="flex items-center gap-2 font-semibold text-slate-900"><Briefcase className="h-4 w-4" />Work experience</h3>{selectedCandidate.work_experiences?.length ? <div className="divide-y divide-slate-100 rounded-lg border border-slate-200">{selectedCandidate.work_experiences.map((experience) => <article key={experience.id} className="flex flex-wrap items-start justify-between gap-3 p-3"><div><p className="font-medium text-slate-900">{experience.job_position} · {experience.organization_name}</p><p className="text-sm capitalize text-slate-600">{experience.employment_type.replaceAll("_", " ")} · {experience.start_date} – {experience.is_current ? "Current" : experience.end_date || "—"}</p>{experience.location && <p className="mt-1 inline-flex items-center gap-1 text-xs text-slate-500"><MapPin className="h-3 w-3" />{experience.location}</p>}</div>{experience.experience_letter && <a href={experience.experience_letter} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sm font-semibold text-primary-700 hover:underline">Experience letter <ExternalLink className="h-3.5 w-3.5" /></a>}</article>)}</div> : <p className="text-sm text-slate-500">No work experience listed.</p>}</section>

          {selectedCandidate.verification_status === "pending" && <div className="flex flex-wrap justify-end gap-2 border-t border-slate-200 pt-4"><Button type="button" variant="outline" className="border-emerald-200 text-emerald-700 hover:bg-emerald-50" isLoading={processingId === selectedCandidate.id} disabled={processingId !== null} onClick={() => void reviewCandidate(selectedCandidate, "verified")}><CheckCircle2 className="mr-1.5 h-4 w-4" />Approve candidate</Button><Button type="button" variant="danger" isLoading={processingId === selectedCandidate.id} disabled={processingId !== null} onClick={() => void reviewCandidate(selectedCandidate, "rejected")}><XCircle className="mr-1.5 h-4 w-4" />Reject candidate</Button></div>}
        </section>}
      </div>
    </DashboardLayout>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return <div><p className="text-xs font-medium text-slate-500">{label}</p><p className="mt-1 text-sm capitalize text-slate-800">{value || "—"}</p></div>;
}
