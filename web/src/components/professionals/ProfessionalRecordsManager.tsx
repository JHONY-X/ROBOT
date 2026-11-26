"use client";

import { FormEvent, useEffect, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { professionalsService, type Qualification, type QualificationInput, type WorkExperience, type WorkExperienceInput } from "@/lib/api/services/professionals";

const fieldClass = "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm";
const emptyQualification: QualificationInput = { qualification_type: "education", title: "", institution: "", field_of_study: "", qualification_level: "bachelor" };
const emptyExperience: WorkExperienceInput = { job_position: "", organization_name: "", employment_type: "full_time", location: "", start_date: "", end_date: "", is_current: false };

export function ProfessionalRecordsManager() {
  const [qualifications, setQualifications] = useState<Qualification[]>([]);
  const [experiences, setExperiences] = useState<WorkExperience[]>([]);
  const [qualificationForm, setQualificationForm] = useState<QualificationInput>(emptyQualification);
  const [experienceForm, setExperienceForm] = useState<WorkExperienceInput>(emptyExperience);
  const [editingQualification, setEditingQualification] = useState<number | null>(null);
  const [editingExperience, setEditingExperience] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const load = async () => {
    const [qualificationRows, experienceRows] = await Promise.all([professionalsService.qualifications(), professionalsService.experiences()]);
    setQualifications(qualificationRows); setExperiences(experienceRows);
  };
  useEffect(() => { void load().catch((reason: unknown) => setError(reason instanceof Error ? reason.message : "Could not load professional records.")); }, []);

  const saveQualification = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setLoading(true); setError("");
    try {
      if (editingQualification) await professionalsService.patchQualification(editingQualification, qualificationForm);
      else await professionalsService.createQualification(qualificationForm);
      setQualificationForm(emptyQualification); setEditingQualification(null); await load();
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Could not save qualification."); }
    finally { setLoading(false); }
  };
  const editQualification = async (id: number) => {
    setError("");
    try {
      const row = await professionalsService.getQualification(id);
      setEditingQualification(id);
      setQualificationForm({ qualification_type: row.qualification_type, title: row.title, institution: row.institution, field_of_study: row.field_of_study ?? "", qualification_level: row.qualification_level ?? "", });
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Could not load qualification."); }
  };
  const deleteQualification = async (id: number) => {
    setError("");
    try { await professionalsService.deleteQualification(id); await load(); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "Could not delete qualification."); }
  };

  const saveExperience = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setLoading(true); setError("");
    const input = { ...experienceForm, end_date: experienceForm.is_current ? null : experienceForm.end_date };
    try {
      if (editingExperience) await professionalsService.patchExperience(editingExperience, input);
      else await professionalsService.createExperience(input);
      setExperienceForm(emptyExperience); setEditingExperience(null); await load();
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Could not save work experience."); }
    finally { setLoading(false); }
  };
  const editExperience = async (id: number) => {
    setError("");
    try {
      const row = await professionalsService.getExperience(id);
      setEditingExperience(id);
      setExperienceForm({ job_position: row.job_position, organization_name: row.organization_name, employment_type: row.employment_type, location: row.location ?? "", start_date: row.start_date, end_date: row.end_date ?? "", is_current: row.is_current });
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Could not load work experience."); }
  };
  const deleteExperience = async (id: number) => {
    setError("");
    try { await professionalsService.deleteExperience(id); await load(); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "Could not delete work experience."); }
  };

  return <section className="space-y-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
    <div><h2 className="text-lg font-semibold text-slate-900">Qualifications & work experience</h2><p className="mt-1 text-sm text-slate-600">Manage the records used for verification and matching.</p></div>
    {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-3"><h3 className="font-medium">Qualifications</h3>{qualifications.map((row) => <article key={row.id} className="flex items-start justify-between gap-3 rounded-lg border p-3"><div><p className="font-medium">{row.title}</p><p className="text-sm text-slate-600">{row.institution} · {row.qualification_level}</p><a className="text-xs text-primary-700 underline" href={row.document_file} target="_blank" rel="noreferrer">Open document</a></div><div className="flex gap-1"><Button aria-label="Edit qualification" size="sm" variant="outline" onClick={() => void editQualification(row.id)}><Pencil className="h-4 w-4" /></Button><Button aria-label="Delete qualification" size="sm" variant="danger" onClick={() => void deleteQualification(row.id)}><Trash2 className="h-4 w-4" /></Button></div></article>)}
        <form onSubmit={saveQualification} className="space-y-2 rounded-lg border border-dashed p-3"><h4 className="text-sm font-semibold">{editingQualification ? "Update qualification" : "Add qualification"}</h4><select className={fieldClass} value={qualificationForm.qualification_type} onChange={(e) => setQualificationForm({ ...qualificationForm, qualification_type: e.target.value as QualificationInput["qualification_type"] })}><option value="education">Education</option><option value="certification">Certification</option><option value="training">Training</option><option value="other">Other</option></select><input required className={fieldClass} placeholder="Title" value={qualificationForm.title} onChange={(e) => setQualificationForm({ ...qualificationForm, title: e.target.value })} /><input required className={fieldClass} placeholder="Institution" value={qualificationForm.institution} onChange={(e) => setQualificationForm({ ...qualificationForm, institution: e.target.value })} /><input className={fieldClass} placeholder="Field of study" value={qualificationForm.field_of_study ?? ""} onChange={(e) => setQualificationForm({ ...qualificationForm, field_of_study: e.target.value })} /><select required className={fieldClass} value={qualificationForm.qualification_level ?? ""} onChange={(e) => setQualificationForm({ ...qualificationForm, qualification_level: e.target.value as QualificationInput["qualification_level"] })}><option value="">Qualification level</option><option value="certificate">Certificate</option><option value="diploma">Diploma</option><option value="bachelor">Bachelor&apos;s degree</option><option value="master">Master&apos;s degree</option><option value="phd">PhD</option></select><label className="block text-xs text-slate-600">Certificate file {editingQualification ? "(choose to replace)" : "*"}<input required={!editingQualification} type="file" accept=".pdf,.jpg,.jpeg,.png" className="mt-1 block w-full text-sm" onChange={(e) => setQualificationForm({ ...qualificationForm, document_file: e.target.files?.[0] })} /></label><div className="flex gap-2"><Button type="submit" isLoading={loading}>{editingQualification ? "Save changes" : "Add qualification"}</Button>{editingQualification && <Button type="button" variant="outline" onClick={() => { setEditingQualification(null); setQualificationForm(emptyQualification); }}>Cancel</Button>}</div></form>
      </div>
      <div className="space-y-3"><h3 className="font-medium">Work experience</h3>{experiences.map((row) => <article key={row.id} className="flex items-start justify-between gap-3 rounded-lg border p-3"><div><p className="font-medium">{row.job_position} · {row.organization_name}</p><p className="text-sm text-slate-600">{row.start_date} – {row.is_current ? "Current" : row.end_date}</p></div><div className="flex gap-1"><Button aria-label="Edit experience" size="sm" variant="outline" onClick={() => void editExperience(row.id)}><Pencil className="h-4 w-4" /></Button><Button aria-label="Delete experience" size="sm" variant="danger" onClick={() => void deleteExperience(row.id)}><Trash2 className="h-4 w-4" /></Button></div></article>)}
        <form onSubmit={saveExperience} className="space-y-2 rounded-lg border border-dashed p-3"><h4 className="text-sm font-semibold">{editingExperience ? "Update work experience" : "Add work experience"}</h4><input required className={fieldClass} placeholder="Job position" value={experienceForm.job_position} onChange={(e) => setExperienceForm({ ...experienceForm, job_position: e.target.value })} /><input required className={fieldClass} placeholder="Organization" value={experienceForm.organization_name} onChange={(e) => setExperienceForm({ ...experienceForm, organization_name: e.target.value })} /><select className={fieldClass} value={experienceForm.employment_type} onChange={(e) => setExperienceForm({ ...experienceForm, employment_type: e.target.value })}><option value="full_time">Full-time</option><option value="part_time">Part-time</option><option value="contract">Contract</option><option value="temporary">Temporary</option><option value="volunteer">Volunteer</option><option value="internship">Internship</option><option value="other">Other</option></select><input className={fieldClass} placeholder="Location" value={experienceForm.location ?? ""} onChange={(e) => setExperienceForm({ ...experienceForm, location: e.target.value })} /><div className="grid grid-cols-2 gap-2"><label className="text-xs">Start date<input required type="date" className={`${fieldClass} mt-1`} value={experienceForm.start_date} onChange={(e) => setExperienceForm({ ...experienceForm, start_date: e.target.value })} /></label><label className="text-xs">End date<input required={!experienceForm.is_current} disabled={experienceForm.is_current} type="date" className={`${fieldClass} mt-1`} value={experienceForm.end_date ?? ""} onChange={(e) => setExperienceForm({ ...experienceForm, end_date: e.target.value })} /></label></div><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={experienceForm.is_current} onChange={(e) => setExperienceForm({ ...experienceForm, is_current: e.target.checked, end_date: e.target.checked ? null : "" })} />Currently work here</label><label className="block text-xs text-slate-600">Experience letter (optional)<input type="file" accept=".pdf,.jpg,.jpeg,.png" className="mt-1 block w-full text-sm" onChange={(e) => setExperienceForm({ ...experienceForm, experience_letter: e.target.files?.[0] })} /></label><div className="flex gap-2"><Button type="submit" isLoading={loading}>{editingExperience ? "Save changes" : "Add experience"}</Button>{editingExperience && <Button type="button" variant="outline" onClick={() => { setEditingExperience(null); setExperienceForm(emptyExperience); }}>Cancel</Button>}</div></form>
      </div>
    </div>
  </section>;
}
