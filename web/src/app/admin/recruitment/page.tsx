"use client";

import { FormEvent, useEffect, useState } from "react";
import { RotateCcw, Users, Wrench } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/Button";
import { professionalsService, type ProfessionalProfile, type Qualification, type Skill, type WorkExperience } from "@/lib/api/services/professionals";
import { recruitmentService } from "@/lib/api/services/recruitment";

export default function AdminRecruitmentPage() {
  const [profiles, setProfiles] = useState<ProfessionalProfile[]>([]);
  const [qualifications, setQualifications] = useState<Qualification[]>([]);
  const [experiences, setExperiences] = useState<WorkExperience[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [skillForm, setSkillForm] = useState({ name: "", description: "" });
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [selectedProfile, setSelectedProfile] = useState<ProfessionalProfile | null>(null);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<number | null>(null);
  const load = async () => {
    const [profileRows, qualificationRows, experienceRows, skillRows] = await Promise.all([professionalsService.adminProfiles(), professionalsService.adminQualifications(), professionalsService.adminExperiences(), professionalsService.skills()]);
    setProfiles(profileRows); setQualifications(qualificationRows); setExperiences(experienceRows); setSkills(skillRows);
  };
  useEffect(() => { void load().catch((reason: unknown) => setError(reason instanceof Error ? reason.message : "Could not load professional profiles.")); }, []);
  const reset = async (id: number) => {
    setBusyId(id); setError("");
    try { await recruitmentService.resetProfessionalRejections(id); await load(); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "Could not reset rejection count."); }
    finally { setBusyId(null); }
  };
  const saveSkill = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setError("");
    try {
      if (selectedSkill) await professionalsService.patchSkill(selectedSkill.id, skillForm);
      else await professionalsService.createSkill(skillForm);
      setSelectedSkill(null); setSkillForm({ name: "", description: "" }); await load();
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Could not save skill."); }
  };
  const removeSkill = async (id: number) => {
    setError("");
    try { await professionalsService.deleteSkill(id); await load(); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "Could not delete skill."); }
  };
  const verify = async (profile: ProfessionalProfile, status: ProfessionalProfile["verification_status"]) => {
    setBusyId(profile.id); setError("");
    try { await professionalsService.verifyProfile(profile.id, status); await load(); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "Could not update verification."); }
    finally { setBusyId(null); }
  };
  const showProfile = async (id: number) => {
    setError("");
    try { setSelectedProfile(await professionalsService.adminProfile(id)); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "Could not load profile details."); }
  };
  return <DashboardLayout role="admin"><div className="mx-auto max-w-5xl space-y-6">
    <header><h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900"><Users className="h-6 w-6 text-primary-700" /> Recruitment controls</h1><p className="mt-1 text-sm text-slate-600">Review profiles and reset a professional&apos;s rejection count.</p></header>
    {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white"><div className="divide-y divide-slate-100">{profiles.map((profile) => <article key={profile.id} className="flex flex-wrap items-center justify-between gap-3 p-4"><div><h2 className="font-semibold text-slate-900">{profile.full_name ?? `Professional profile #${profile.id}`}</h2><p className="text-sm text-slate-500">{profile.professional_category} · User {profile.user} · {profile.verification_status}</p><div className="mt-2 flex flex-wrap gap-2"><Button size="sm" variant="outline" onClick={() => void showProfile(profile.id)}>View details</Button><Button size="sm" variant="outline" isLoading={busyId === profile.id} onClick={() => void verify(profile, "verified")}>Verify</Button><Button size="sm" variant="outline" isLoading={busyId === profile.id} onClick={() => void verify(profile, "rejected")}>Reject</Button></div></div><Button size="sm" variant="outline" isLoading={busyId === profile.id} onClick={() => void reset(profile.id)}><RotateCcw className="mr-2 h-4 w-4" />Reset rejections</Button></article>)}</div>{profiles.length === 0 && <p className="p-6 text-sm text-slate-500">No professional profiles found.</p>}</div>
    {selectedProfile && <section className="rounded-xl border border-primary-200 bg-primary-50 p-4 text-sm"><div className="flex justify-between gap-3"><h2 className="font-semibold">Profile #{selectedProfile.id} details</h2><button className="font-semibold text-primary-800" onClick={() => setSelectedProfile(null)}>Close</button></div><pre className="mt-3 max-h-80 overflow-auto whitespace-pre-wrap break-words text-xs">{JSON.stringify(selectedProfile, null, 2)}</pre></section>}
    <section className="grid gap-5 lg:grid-cols-2">
      <div className="rounded-xl border bg-white p-5"><h2 className="mb-3 font-semibold">Professional qualifications ({qualifications.length})</h2>{qualifications.map((item) => <p key={item.id} className="border-t py-2 text-sm">{item.title} · {item.qualification_level || item.qualification_type} · Professional #{item.professional}</p>)}</div>
      <div className="rounded-xl border bg-white p-5"><h2 className="mb-3 font-semibold">Work experience records ({experiences.length})</h2>{experiences.map((item) => <p key={item.id} className="border-t py-2 text-sm">{item.job_position} at {item.organization_name} · Professional #{item.professional}</p>)}</div>
    </section>
    <section className="rounded-xl border bg-white p-5"><h2 className="mb-4 flex items-center gap-2 font-semibold"><Wrench className="h-4 w-4" />Skills catalogue</h2><form onSubmit={saveSkill} className="grid gap-2 sm:grid-cols-[1fr_2fr_auto]"><input required aria-label="Skill name" className="rounded-lg border px-3 py-2 text-sm" placeholder="Skill name" value={skillForm.name} onChange={(event) => setSkillForm({ ...skillForm, name: event.target.value })} /><input aria-label="Skill description" className="rounded-lg border px-3 py-2 text-sm" placeholder="Description" value={skillForm.description} onChange={(event) => setSkillForm({ ...skillForm, description: event.target.value })} /><Button type="submit">{selectedSkill ? "Update skill" : "Add skill"}</Button></form><div className="mt-3 divide-y">{skills.map((skill) => <div key={skill.id} className="flex items-center justify-between gap-3 py-2 text-sm"><button className="text-left" onClick={async () => { const detail = await professionalsService.getSkill(skill.id); setSelectedSkill(detail); setSkillForm({ name: detail.name, description: detail.description }); }}>{skill.name}<span className="ml-2 text-xs text-slate-500">{skill.description}</span></button><Button size="sm" variant="danger" onClick={() => void removeSkill(skill.id)}>Delete</Button></div>)}</div></section>
  </div></DashboardLayout>;
}
