"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { History, MailPlus, RefreshCw, ShieldCheck } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/Button";
import { invitationService, type InvitationControl } from "@/lib/api/services/invitation";

export default function AdminInvitationsPage() {
  const [controls, setControls] = useState<InvitationControl[]>([]);
  const [fullName, setFullName] = useState("");
  const [emailAddress, setEmailAddress] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [busyControl, setBusyControl] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [notice, setNotice] = useState("");

  const isCreateEndpoint = (endpoint: string) =>
    endpoint.trim().replace(/\/+$/, "").toLowerCase().endsWith("api/v1/invite/create");
  useEffect(() => {
    let active = true;
    invitationService.getControl()
      .then((settings) => {
        if (!active) return;
        setControls(settings);
      })
      .catch((error: unknown) => { if (active) setErrorMessage(error instanceof Error ? error.message : "Could not load invitations."); })
      .finally(() => { if (active) setIsLoading(false); });
    return () => { active = false; };
  }, []);

  const refresh = async () => {
    setIsLoading(true);
    setErrorMessage("");
    try {
      const settings = await invitationService.getControl();
      setControls(settings);
    } catch (error) { setErrorMessage(error instanceof Error ? error.message : "Could not refresh invitations."); }
    finally { setIsLoading(false); }
  };

  const createInvitation = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsCreating(true);
    setErrorMessage("");
    setNotice("");
    try {
      const result = await invitationService.create({ full_name: fullName.trim(), email_address: emailAddress.trim().toLowerCase() });
      setNotice(result.message);
      setFullName("");
      setEmailAddress("");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Could not create invitation.");
    } finally { setIsCreating(false); }
  };

  const updateControl = async (setting: InvitationControl) => {
    setBusyControl(setting.endpoint);
    setErrorMessage("");
    setNotice("");
    try {
      const result = await invitationService.updateControl(setting.endpoint, !setting.enabled);
      setControls((items) => items.map((item) => item.endpoint === result.endpoint ? { ...item, enabled: result.enabled } : item));
      setNotice(result.message);
    } catch (error) { setErrorMessage(error instanceof Error ? error.message : "Could not update invitation settings."); }
    finally { setBusyControl(""); }
  };

  return (
    <DashboardLayout role="admin">
      <div className="mx-auto max-w-5xl space-y-6">
        <header className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-sm font-semibold uppercase tracking-wide text-primary-700">Admin tools</p><h1 className="mt-1 text-2xl font-bold text-slate-900">Candidate invitations</h1><p className="mt-2 text-sm text-slate-600">Create invitations and manage invitation creation settings.</p><Link href="/admin/invitations/history" className="mt-4 inline-flex items-center gap-2 rounded-lg border border-primary-200 bg-white px-4 py-2 text-sm font-semibold text-primary-800 shadow-sm hover:bg-primary-50"><History className="h-4 w-4" />View invitation history</Link></div><Button type="button" variant="outline" size="sm" className="gap-2" isLoading={isLoading} onClick={refresh}><RefreshCw className="h-4 w-4" />Refresh settings</Button></header>

        {errorMessage && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{errorMessage}</p>}
        {notice && <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">{notice}</p>}

        <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-700"><ShieldCheck className="h-5 w-5" /></span><div><h2 className="font-semibold text-slate-900">Invitation endpoint control</h2><p className="text-sm text-slate-500">Settings are keyed by the exact endpoint path returned by the backend.</p></div></div>
          {controls.length ? <div className="divide-y divide-slate-100">{controls.map((setting) => <div key={setting.endpoint} className="flex flex-wrap items-center justify-between gap-3 py-3"><div>{!isCreateEndpoint(setting.endpoint) && <p className="font-medium text-slate-900">{setting.endpoint}</p>}<p className="text-xs font-bold text-slate-500">Creation endpoint {setting.enabled ? "enabled" : "disabled"}</p></div><Button type="button" size="sm" variant={setting.enabled ? "outline" : "primary"} isLoading={busyControl === setting.endpoint} disabled={busyControl !== ""} onClick={() => updateControl(setting)}>{setting.enabled ? "Disable" : "Enable"}</Button></div>)}</div> : <p className="text-sm text-slate-600">No invitation endpoint settings are configured.</p>}
        </section>

        <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-700"><MailPlus className="h-5 w-5" /></span><div><h2 className="font-semibold text-slate-900">Create invitation</h2><p className="text-sm text-slate-500">The backend requires a full name and email address.</p></div></div>
          <form onSubmit={createInvitation} className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-medium text-slate-700">Full name<input required maxLength={20} value={fullName} onChange={(event) => setFullName(event.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2.5" /></label>
            <label className="text-sm font-medium text-slate-700">Email address<input required type="email" maxLength={50} value={emailAddress} onChange={(event) => setEmailAddress(event.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2.5" /></label>
            <Button type="submit" isLoading={isCreating} disabled={isCreating} className="sm:col-span-2">Create invitation</Button>
          </form>
        </section>

      </div>
    </DashboardLayout>
  );
}
