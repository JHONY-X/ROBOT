"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, Copy, History, RefreshCw, UserRound } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/Button";
import { invitationService, type Invitation } from "@/lib/api/services/invitation";

type InvitationFilter = "all" | "verified" | "unverified" | "sent" | "not-sent";

const FILTERS: { value: InvitationFilter; label: string }[] = [
  { value: "all", label: "All invitations" },
  { value: "verified", label: "Email verified" },
  { value: "unverified", label: "Email unverified" },
  { value: "sent", label: "Sent" },
  { value: "not-sent", label: "Not sent" },
];

export default function AdminInvitationHistoryPage() {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [filter, setFilter] = useState<InvitationFilter>("all");
  const [invitationDetail, setInvitationDetail] = useState<Invitation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [notice, setNotice] = useState("");

  const filteredInvitations = invitations.filter((invitation) => {
    if (filter === "verified") return invitation.is_verified;
    if (filter === "unverified") return !invitation.is_verified;
    if (filter === "sent") return invitation.is_sent;
    if (filter === "not-sent") return !invitation.is_sent;
    return true;
  });

  const refresh = async () => {
    setIsLoading(true);
    setErrorMessage("");
    try {
      setInvitations(await invitationService.list());
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Could not load invitations.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    invitationService.list()
      .then((rows) => { if (active) setInvitations(rows); })
      .catch((error: unknown) => { if (active) setErrorMessage(error instanceof Error ? error.message : "Could not load invitations."); })
      .finally(() => { if (active) setIsLoading(false); });
    return () => { active = false; };
  }, []);

  const manageInvitation = async (id: number, action: "detail" | "send" | "delete") => {
    setBusyId(id);
    setErrorMessage("");
    setNotice("");
    try {
      if (action === "detail") {
        const result = await invitationService.get(id);
        const detail = Array.isArray(result) ? result.find((item) => item.id === id) : result;
        if (!detail) throw new Error("The backend did not return details for this invitation.");
        setInvitationDetail(detail);
      } else if (action === "delete") {
        const result = await invitationService.delete(id);
        setNotice(result.message);
        setInvitations((items) => items.filter((item) => item.id !== id));
      } else {
        const result = await invitationService.updateSendingState(id, true);
        setNotice(result.message);
        await refresh();
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Could not manage invitation.");
    } finally {
      setBusyId(null);
    }
  };

  const copyToken = async (token: string) => {
    try {
      await navigator.clipboard.writeText(token);
      setNotice("Invitation token copied.");
    } catch {
      setErrorMessage("Could not copy the token automatically.");
    }
  };

  return (
    <DashboardLayout role="admin">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <Link href="/admin/invitations" className="inline-flex items-center gap-2 text-sm font-semibold text-primary-700 hover:underline">
              <ArrowLeft className="h-4 w-4" /> Candidate invitations
            </Link>
            <h1 className="mt-3 flex items-center gap-2 text-2xl font-bold text-slate-900">
              <History className="h-6 w-6 text-primary-700" /> Invitation history
            </h1>
            <p className="mt-2 text-sm text-slate-600">Filter invitations by email verification and sending status.</p>
          </div>
          <Button type="button" variant="outline" size="sm" className="gap-2" isLoading={isLoading} onClick={refresh}>
            <RefreshCw className="h-4 w-4" /> Refresh
          </Button>
        </header>

        {errorMessage && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{errorMessage}</p>}
        {notice && <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">{notice}</p>}

        <section className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-700"><UserRound className="h-5 w-5" /></span>
            <div>
              <h2 className="font-semibold text-slate-900">Candidate invitations</h2>
              <p className="text-sm text-slate-500">{filteredInvitations.length} {filteredInvitations.length === 1 ? "invitation" : "invitations"}</p>
            </div>
          </div>

          <div className="flex gap-2 overflow-x-auto border-b border-slate-200" role="tablist" aria-label="Filter invitations">
            {FILTERS.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                role="tab"
                id={`invitation-filter-${value}`}
                aria-controls="invitation-history-panel"
                aria-selected={filter === value}
                onClick={() => setFilter(value)}
                className={`whitespace-nowrap border-b-2 px-3 py-2 text-sm font-medium ${filter === value ? "border-primary-600 text-primary-800" : "border-transparent text-slate-500 hover:text-slate-800"}`}
              >
                {label}
              </button>
            ))}
          </div>

          <div role="tabpanel" id="invitation-history-panel" aria-labelledby={`invitation-filter-${filter}`}>
            {isLoading ? (
              <p role="status" className="py-12 text-center text-sm text-slate-500">Loading invitations...</p>
            ) : filteredInvitations.length ? (
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full min-w-[760px] text-left text-sm">
                  <thead className="bg-slate-50 text-slate-600">
                    <tr>
                      <th className="px-4 py-3">ID</th>
                      <th className="px-4 py-3">Name</th>
                      <th className="px-4 py-3">Email</th>
                      <th className="px-4 py-3">Email verified</th>
                      <th className="px-4 py-3">Invitation sent</th>
                      <th className="px-4 py-3">Expires</th>
                      <th className="px-4 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredInvitations.map((invitation) => (
                      <tr key={invitation.id ?? invitation.email_address}>
                        <td className="px-4 py-3 font-mono text-slate-600">{invitation.id ?? "—"}</td>
                        <td className="px-4 py-3 font-medium text-slate-900">{invitation.full_name}</td>
                        <td className="px-4 py-3">{invitation.email_address}</td>
                        <td className="px-4 py-3">{invitation.is_verified ? "Verified" : "Unverified"}</td>
                        <td className="px-4 py-3">{invitation.is_sent ? "Sent" : "Not sent"}</td>
                        <td className="px-4 py-3">{invitation.expires_date ? new Date(invitation.expires_date).toLocaleString() : "—"}</td>
                        <td className="px-4 py-3">
                          {invitation.id ? (
                            <div className="flex flex-wrap gap-2">
                              <Button type="button" size="sm" variant="outline" disabled={busyId !== null} onClick={() => manageInvitation(invitation.id!, "detail")}>Details</Button>
                              <Button type="button" size="sm" isLoading={busyId === invitation.id} disabled={busyId !== null || !invitation.is_verified} onClick={() => manageInvitation(invitation.id!, "send")}>{invitation.is_sent ? "Resend" : "Send"}</Button>
                              <Button type="button" size="sm" variant="danger" disabled={busyId !== null || invitation.is_sent} onClick={() => manageInvitation(invitation.id!, "delete")}>Delete</Button>
                            </div>
                          ) : <span className="text-xs text-amber-800">ID unavailable</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-slate-300 py-14 text-center">
                <UserRound className="mx-auto h-8 w-8 text-slate-400" />
                <p className="mt-2 text-sm text-slate-600">No invitations match this filter.</p>
              </div>
            )}
          </div>

          {invitationDetail && (
            <div className="rounded-xl border border-primary-100 bg-primary-50 p-4 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-primary-950">{invitationDetail.full_name}</h3>
                  <p>{invitationDetail.email_address}</p>
                  <p className="mt-1">ID: {invitationDetail.id ?? "—"} · {invitationDetail.is_verified ? "Email verified" : "Email unverified"} · {invitationDetail.is_sent ? "Invitation sent" : "Not sent"}</p>
                </div>
                <div className="flex gap-2">
                  <Button type="button" size="sm" variant="outline" onClick={() => copyToken(invitationDetail.token)}><Copy className="mr-1 h-4 w-4" />Copy token</Button>
                  <Button type="button" size="sm" variant="outline" onClick={() => setInvitationDetail(null)}>Close</Button>
                </div>
              </div>
            </div>
          )}
        </section>

        <p className="text-xs text-slate-500">The invitation list may omit IDs depending on the backend response; row actions require an ID.</p>
      </div>
    </DashboardLayout>
  );
}
