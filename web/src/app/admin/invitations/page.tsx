"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Copy, MailPlus, RefreshCw, ShieldCheck, UserRound } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/Button";
import { invitationService, type Invitation, type InvitationControl } from "@/lib/api/services/invitation";

export default function AdminInvitationsPage() {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [controls, setControls] = useState<InvitationControl[]>([]);
  const [fullName, setFullName] = useState("");
  const [emailAddress, setEmailAddress] = useState("");
  const [manageId, setManageId] = useState("");
  const [invitationDetail, setInvitationDetail] = useState<Invitation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [busyControl, setBusyControl] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let active = true;
    Promise.all([invitationService.list(), invitationService.getControl()])
      .then(([rows, settings]) => {
        if (!active) return;
        setInvitations(rows);
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
      const [rows, settings] = await Promise.all([invitationService.list(), invitationService.getControl()]);
      setInvitations(rows);
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
      await refresh();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Could not create invitation.");
      invitationService.list().then(setInvitations).catch(() => undefined);
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

  const manageInvitation = async (id: number, action: "detail" | "send" | "disable" | "delete") => {
    setBusyId(id);
    setErrorMessage("");
    setNotice("");
    try {
      if (action === "detail") {
        const result = await invitationService.get(id);
        const detail = Array.isArray(result) ? result.find((item) => item.id === id) : result;
        if (!detail) throw new Error("The backend returned a list instead of the requested invitation detail.");
        setInvitationDetail(detail);
      } else if (action === "delete") {
        const result = await invitationService.delete(id);
        setNotice(result.message);
        setInvitations((items) => items.filter((item) => item.id !== id));
      } else {
        const result = await invitationService.updateSendingState(id, action === "send");
        setNotice(result.message);
        await refresh();
      }
    } catch (error) { setErrorMessage(error instanceof Error ? error.message : "Could not manage invitation."); }
    finally { setBusyId(null); }
  };

  const manageById = async (action: "detail" | "send" | "disable" | "delete") => {
    const id = Number(manageId);
    if (!Number.isInteger(id) || id < 1) {
      setErrorMessage("Enter a valid invitation ID.");
      return;
    }
    if (action === "delete" && !window.confirm(`Delete invitation ${id}?`)) return;
    await manageInvitation(id, action);
  };

  const copyToken = async (token: string) => {
    try {
      await navigator.clipboard.writeText(token);
      setNotice("Invitation token copied.");
    } catch { setErrorMessage("Could not copy the token automatically."); }
  };

  return (
    <DashboardLayout role="admin">
      <div className="mx-auto max-w-5xl space-y-6">
        <header className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-sm font-semibold uppercase tracking-wide text-primary-700">Admin tools</p><h1 className="mt-1 text-2xl font-bold text-slate-900">Candidate invitations</h1><p className="mt-2 text-sm text-slate-600">Create invitations, control the create endpoint, and review verification and sending status.</p></div><Button type="button" variant="outline" size="sm" className="gap-2" isLoading={isLoading} onClick={refresh}><RefreshCw className="h-4 w-4" />Refresh</Button></header>

        {errorMessage && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{errorMessage}</p>}
        {notice && <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">{notice}</p>}

        <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-700"><ShieldCheck className="h-5 w-5" /></span><div><h2 className="font-semibold text-slate-900">Invitation endpoint control</h2><p className="text-sm text-slate-500">Settings are keyed by the exact endpoint path returned by the backend.</p></div></div>
          {controls.length ? <div className="divide-y divide-slate-100">{controls.map((setting) => <div key={setting.endpoint} className="flex flex-wrap items-center justify-between gap-3 py-3"><div><p className="font-medium text-slate-900">{setting.endpoint}</p><p className="text-xs text-slate-500">Creation endpoint {setting.enabled ? "enabled" : "disabled"}</p></div><Button type="button" size="sm" variant={setting.enabled ? "outline" : "primary"} isLoading={busyControl === setting.endpoint} disabled={busyControl !== ""} onClick={() => updateControl(setting)}>{setting.enabled ? "Disable" : "Enable"}</Button></div>)}</div> : <p className="text-sm text-slate-600">No invitation endpoint settings are configured.</p>}
        </section>

        <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-700"><MailPlus className="h-5 w-5" /></span><div><h2 className="font-semibold text-slate-900">Create invitation</h2><p className="text-sm text-slate-500">The backend requires a full name and email address.</p></div></div>
          <form onSubmit={createInvitation} className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-medium text-slate-700">Full name<input required maxLength={20} value={fullName} onChange={(event) => setFullName(event.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2.5" /></label>
            <label className="text-sm font-medium text-slate-700">Email address<input required type="email" maxLength={50} value={emailAddress} onChange={(event) => setEmailAddress(event.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2.5" /></label>
            <Button type="submit" isLoading={isCreating} disabled={isCreating} className="sm:col-span-2">Create invitation</Button>
          </form>
        </section>

        <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-700"><UserRound className="h-5 w-5" /></span><div><h2 className="font-semibold text-slate-900">Invitation history</h2><p className="text-sm text-slate-500">Email verification must complete before an invitation can be sent.</p></div></div>
          {isLoading ? <p role="status" className="py-6 text-center text-sm text-slate-500">Loading invitations...</p> : invitations.length ? <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-slate-50 text-slate-600"><tr><th className="px-3 py-3">Name</th><th className="px-3 py-3">Email</th><th className="px-3 py-3">Email verified</th><th className="px-3 py-3">Invitation sent</th><th className="px-3 py-3">Expires</th><th className="px-3 py-3">Manage</th></tr></thead><tbody className="divide-y divide-slate-100">{invitations.map((invitation) => <tr key={invitation.id ?? invitation.email_address}><td className="px-3 py-3 font-medium text-slate-900">{invitation.full_name}</td><td className="px-3 py-3">{invitation.email_address}</td><td className="px-3 py-3">{invitation.is_verified ? "Verified" : "Pending"}</td><td className="px-3 py-3">{invitation.is_sent ? "Sent" : "Not sent"}</td><td className="px-3 py-3">{invitation.expires_date ? new Date(invitation.expires_date).toLocaleString() : "—"}</td><td className="px-3 py-3">{invitation.id ? <div className="flex flex-wrap gap-2"><Button type="button" size="sm" variant="outline" disabled={busyId !== null} onClick={() => manageInvitation(invitation.id!, "detail")}>Details</Button><Button type="button" size="sm" isLoading={busyId === invitation.id} disabled={busyId !== null || !invitation.is_verified} onClick={() => manageInvitation(invitation.id!, "send")}>{invitation.is_sent ? "Resend" : "Send"}</Button><Button type="button" size="sm" variant="outline" disabled={busyId !== null} onClick={() => manageInvitation(invitation.id!, "disable")}>Set unsent</Button><Button type="button" size="sm" variant="danger" disabled={busyId !== null || invitation.is_sent} onClick={() => manageInvitation(invitation.id!, "delete")}>Delete</Button></div> : <span className="text-xs text-amber-800">Backend response omits invitation ID; management actions are unavailable.</span>}</td></tr>)}</tbody></table></div> : <div className="rounded-xl border border-dashed border-slate-300 py-10 text-center"><UserRound className="mx-auto h-8 w-8 text-slate-400" /><p className="mt-2 text-sm text-slate-600">No invitations found.</p></div>}
          <div className="flex flex-wrap items-end gap-3 border-t border-slate-100 pt-4"><label className="text-sm font-medium text-slate-700">Manage by invitation ID<input type="number" min="1" value={manageId} onChange={(event) => setManageId(event.target.value)} className="mt-1.5 block w-48 rounded-xl border border-slate-300 px-3 py-2" /></label><Button type="button" variant="outline" disabled={busyId !== null} onClick={() => manageById("detail")}>Load detail</Button><Button type="button" disabled={busyId !== null} onClick={() => manageById("send")}>Send / resend</Button><Button type="button" variant="outline" disabled={busyId !== null} onClick={() => manageById("disable")}>Set unsent</Button><Button type="button" variant="danger" disabled={busyId !== null} onClick={() => manageById("delete")}>Delete</Button><p className="max-w-xl text-xs text-slate-500">The current backend list omits IDs and its detail route returns a list. These manual controls need a valid database ID and will surface backend errors.</p></div>
          {invitationDetail && <div className="rounded-xl border border-primary-100 bg-primary-50 p-4 text-sm"><div className="flex flex-wrap items-center justify-between gap-3"><div><h3 className="font-semibold text-primary-950">{invitationDetail.full_name}</h3><p>{invitationDetail.email_address}</p><p className="mt-1">{invitationDetail.is_verified ? "Email verified" : "Email verification pending"} · {invitationDetail.is_sent ? "Invitation sent" : "Not sent"}</p></div><div className="flex gap-2"><Button type="button" size="sm" variant="outline" onClick={() => copyToken(invitationDetail.token)}><Copy className="mr-1 h-4 w-4" />Copy token</Button><Button type="button" size="sm" variant="outline" onClick={() => setInvitationDetail(null)}>Close</Button></div></div></div>}
        </section>

        <p className="flex items-start gap-2 text-xs text-slate-500"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />The invitation email helpers and several manage endpoints currently have backend defects. The frontend reports their actual API errors; it does not create fake invitation success.</p>
      </div>
    </DashboardLayout>
  );
}
