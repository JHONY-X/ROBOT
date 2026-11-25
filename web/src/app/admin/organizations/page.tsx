"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/Button";
import { organizationApi, type AdminOrganization, type OrganizationDocument, type VerificationStatus } from "@/lib/api/services/organization";

export default function AdminOrganizationsPage() {
  const [organizations, setOrganizations] = useState<AdminOrganization[]>([]);
  const [documents, setDocuments] = useState<OrganizationDocument[]>([]);
  const [selectedOrganization, setSelectedOrganization] = useState<AdminOrganization | null>(null);
  const [loading, setLoading] = useState(true);
  const [busyKey, setBusyKey] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    let active = true;
    Promise.all([organizationApi.listAdminOrganizations(), organizationApi.listAdminDocuments()])
      .then(([orgRows, documentRows]) => {
        if (!active) return;
        setOrganizations(orgRows);
        setDocuments(documentRows);
      })
      .catch((error: unknown) => { if (active) setErrorMessage(error instanceof Error ? error.message : "Could not load organization reviews."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const refresh = async () => {
    setLoading(true);
    setErrorMessage("");
    try {
      const [orgRows, documentRows] = await Promise.all([organizationApi.listAdminOrganizations(), organizationApi.listAdminDocuments()]);
      setOrganizations(orgRows);
      setDocuments(documentRows);
    } catch (error) { setErrorMessage(error instanceof Error ? error.message : "Could not refresh organization reviews."); }
    finally { setLoading(false); }
  };

  const showOrganization = async (id: number) => {
    setBusyKey(`organization-${id}`);
    setErrorMessage("");
    try { setSelectedOrganization(await organizationApi.getAdminOrganization(id)); }
    catch (error) { setErrorMessage(error instanceof Error ? error.message : "Could not load organization details."); }
    finally { setBusyKey(""); }
  };

  const reviewOrganization = async (organization: AdminOrganization, verification_status: VerificationStatus) => {
    const action = verification_status === "verified" ? "verify" : "reject";
    if (!window.confirm(`${action === "verify" ? "Verify" : "Reject"} ${organization.organization_name}?`)) return;
    setBusyKey(`organization-${organization.id}`);
    setErrorMessage("");
    setSuccessMessage("");
    try {
      await organizationApi.verifyOrganization(organization.id, verification_status);
      setOrganizations((rows) => rows.map((item) => item.id === organization.id ? { ...item, verification_status } : item));
      setSelectedOrganization((current) => current?.id === organization.id ? { ...current, verification_status } : current);
      setSuccessMessage(`Organization ${action}ed.`);
    } catch (error) { setErrorMessage(error instanceof Error ? error.message : `Could not ${action} organization.`); }
    finally { setBusyKey(""); }
  };

  const reviewDocument = async (document: OrganizationDocument, verification_status: VerificationStatus) => {
    const action = verification_status === "verified" ? "verify" : "reject";
    if (!window.confirm(`${action === "verify" ? "Verify" : "Reject"} this ${document.document_type.replaceAll("_", " ")} document?`)) return;
    setBusyKey(`document-${document.id}`);
    setErrorMessage("");
    setSuccessMessage("");
    try {
      await organizationApi.verifyDocument(document.id, verification_status);
      setDocuments((rows) => rows.map((item) => item.id === document.id ? { ...item, verification_status } : item));
      setSelectedOrganization((current) => current ? { ...current, documents: current.documents.map((item) => item.id === document.id ? { ...item, verification_status } : item) } : current);
      setSuccessMessage(`Document ${action}ed.`);
    } catch (error) { setErrorMessage(error instanceof Error ? error.message : `Could not ${action} document.`); }
    finally { setBusyKey(""); }
  };

  return (
    <DashboardLayout role="admin">
      <div className="space-y-7">
        <header className="flex flex-wrap items-start justify-between gap-3"><div><h1 className="text-2xl font-bold text-slate-900">Organization verification</h1><p className="mt-1 text-sm text-slate-600">Review organization profiles and their uploaded documents.</p></div><Button type="button" variant="outline" isLoading={loading} onClick={refresh}>Refresh</Button></header>
        {errorMessage && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{errorMessage}</p>}
        {successMessage && <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">{successMessage}</p>}
        {loading ? <p role="status" className="py-8 text-sm text-slate-600">Loading organizations and documents...</p> : <>
          <section className="space-y-3"><h2 className="text-lg font-semibold text-slate-900">Organizations</h2>{organizations.length ? <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white"><table className="w-full text-left text-sm"><thead className="bg-slate-50 text-slate-600"><tr><th className="px-4 py-3">Organization</th><th className="px-4 py-3">Type</th><th className="px-4 py-3">City / region</th><th className="px-4 py-3">Documents</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Review</th></tr></thead><tbody className="divide-y divide-slate-100">{organizations.map((organization) => <tr key={organization.id}><td className="px-4 py-3"><p className="font-medium text-slate-900">{organization.organization_name}</p><p className="text-xs text-slate-500">{organization.hr_email}</p></td><td className="px-4 py-3 capitalize">{organization.organization_type.replaceAll("_", " ")}</td><td className="px-4 py-3">{organization.city}, {organization.region}</td><td className="px-4 py-3">{organization.documents.length}</td><td className="px-4 py-3 capitalize">{organization.verification_status}</td><td className="px-4 py-3"><div className="flex gap-2"><Button type="button" size="sm" variant="outline" isLoading={busyKey === `organization-${organization.id}`} disabled={busyKey !== ""} onClick={() => showOrganization(organization.id)}>Details</Button>{organization.verification_status === "pending" && <><Button type="button" size="sm" disabled={busyKey !== ""} onClick={() => reviewOrganization(organization, "verified")}>Verify</Button><Button type="button" size="sm" variant="danger" disabled={busyKey !== ""} onClick={() => reviewOrganization(organization, "rejected")}>Reject</Button></>}</div></td></tr>)}</tbody></table></div> : <p className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600">No organizations found.</p>}</section>

          {selectedOrganization && <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-start justify-between gap-3"><div><h2 className="text-lg font-semibold text-slate-900">{selectedOrganization.organization_name}</h2><p className="text-sm capitalize text-slate-600">{selectedOrganization.organization_type.replaceAll("_", " ")} · {selectedOrganization.verification_status}</p></div><button type="button" onClick={() => setSelectedOrganization(null)} className="text-sm font-semibold text-primary-700 underline">Close</button></div><div className="grid gap-3 text-sm sm:grid-cols-2"><Detail label="TIN" value={selectedOrganization.tin_number} /><Detail label="Website" value={selectedOrganization.website ?? "—"} /><Detail label="Country" value={selectedOrganization.country} /><Detail label="Location" value={`${selectedOrganization.address}, ${selectedOrganization.city}, ${selectedOrganization.region}`} /><Detail label="HR email" value={selectedOrganization.hr_email} /><Detail label="HR phone" value={selectedOrganization.hr_phone} /><Detail label="Submitted" value={new Date(selectedOrganization.created_at).toLocaleString()} /></div>{selectedOrganization.organazation_logo && <a href={selectedOrganization.organazation_logo} target="_blank" rel="noreferrer" className="inline-flex text-sm font-semibold text-primary-700 hover:underline">Open organization logo</a>}{selectedOrganization.verification_status === "pending" && <div className="flex gap-2"><Button type="button" size="sm" onClick={() => reviewOrganization(selectedOrganization, "verified")}>Verify organization</Button><Button type="button" size="sm" variant="danger" onClick={() => reviewOrganization(selectedOrganization, "rejected")}>Reject organization</Button></div>}</section>}

          <section className="space-y-3"><h2 className="text-lg font-semibold text-slate-900">Organization documents</h2>{documents.length ? <div className="space-y-3">{documents.map((document) => <article key={document.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4"><div><p className="font-medium capitalize text-slate-900">{document.document_type.replaceAll("_", " ")}</p><p className="mt-1 text-xs text-slate-500">{document.organization} · {new Date(document.created_at).toLocaleDateString()} · <span className="capitalize">{document.verification_status}</span></p><a href={document.document_file} target="_blank" rel="noreferrer" className="mt-1 inline-flex text-xs font-semibold text-primary-700 hover:underline">Open document</a></div>{document.verification_status === "pending" && <div className="flex gap-2"><Button type="button" size="sm" isLoading={busyKey === `document-${document.id}`} disabled={busyKey !== ""} onClick={() => reviewDocument(document, "verified")}>Verify</Button><Button type="button" size="sm" variant="danger" disabled={busyKey !== ""} onClick={() => reviewDocument(document, "rejected")}>Reject</Button></div>}</article>)}</div> : <p className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600">No organization documents found.</p>}</section>
        </>}
      </div>
    </DashboardLayout>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return <div><p className="text-xs font-medium text-slate-500">{label}</p><p className="mt-1 text-slate-800">{value}</p></div>;
}
